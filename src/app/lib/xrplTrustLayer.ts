import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export type XrplTrustAssetType = 'digital_art' | 'physical_item' | 'course_certificate' | 'community_certificate';
export type XrplTrustType = 'provenance' | 'authenticity' | 'certificate';
export type XrplTrustStatus = 'draft' | 'anchored' | 'verified' | 'revoked';

export interface XrplTrustRecord {
  id: string;
  actorId: string;
  profileSlug: string;
  assetType: XrplTrustAssetType;
  assetId: string;
  assetTitle: string;
  trustType: XrplTrustType;
  status: XrplTrustStatus;
  xrplTransactionHash: string;
  xrplTokenId: string;
  xrplLedgerIndex: string;
  anchorUri: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

const STATUS_RANK: Record<XrplTrustStatus, number> = {
  draft: 0,
  anchored: 1,
  verified: 2,
  revoked: 3
};

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'xrpl-trust-layer.json');

function nowIso() {
  return new Date().toISOString();
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asMap(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function shouldFallback(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const code = text((error as Record<string, unknown>).code);
  const message = text((error as Record<string, unknown>).message).toLowerCase();
  return code === '42P01' || code === 'PGRST205' || message.includes('schema cache') || message.includes('does not exist');
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('xrpl trust layer');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<XrplTrustRecord[]> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as XrplTrustRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(rows: XrplTrustRecord[]) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), 'utf8');
}

function fromRow(row: Record<string, unknown>): XrplTrustRecord {
  return {
    id: text(row.id),
    actorId: text(row.actor_id || row.actorId),
    profileSlug: text(row.profile_slug || row.profileSlug),
    assetType: text(row.asset_type || row.assetType, 'digital_art') as XrplTrustAssetType,
    assetId: text(row.asset_id || row.assetId),
    assetTitle: text(row.asset_title || row.assetTitle),
    trustType: text(row.trust_type || row.trustType, 'provenance') as XrplTrustType,
    status: text(row.status, 'draft') as XrplTrustStatus,
    xrplTransactionHash: text(row.xrpl_transaction_hash || row.xrplTransactionHash),
    xrplTokenId: text(row.xrpl_token_id || row.xrplTokenId),
    xrplLedgerIndex: text(row.xrpl_ledger_index || row.xrplLedgerIndex),
    anchorUri: text(row.anchor_uri || row.anchorUri),
    metadata: asMap(row.metadata),
    createdAt: text(row.created_at || row.createdAt),
    updatedAt: text(row.updated_at || row.updatedAt)
  };
}

function sortTrustRecords(records: XrplTrustRecord[]) {
  return [...records].sort((a, b) => {
    const statusDelta = STATUS_RANK[b.status] - STATUS_RANK[a.status];
    if (statusDelta !== 0) return statusDelta;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function listXrplTrustRecords(input: { actorId: string; profileSlug?: string }) {
  const actorId = (input.actorId || '').trim().toLowerCase();
  const profileSlug = (input.profileSlug || '').trim();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const filters = [actorId && `actor_id.eq.${actorId}`, profileSlug && `profile_slug.eq.${profileSlug}`].filter(Boolean).join(',');
    const query = supabase.from('xrpl_trust_records').select('*').order('updated_at', { ascending: false }).limit(100);
    const { data, error } = filters ? await query.or(filters) : await query;
    if (!error && data) return data.map((row) => fromRow(row as Record<string, unknown>));
    if (error && !shouldFallback(error)) throw error;
  }
  const runtime = await readRuntime();
  return sortTrustRecords(runtime.filter((row) => row.actorId === actorId || (!!profileSlug && row.profileSlug === profileSlug)));
}

export async function listXrplTrustRecordsByAsset(input: {
  assetType: XrplTrustAssetType;
  assetId: string;
  trustType?: XrplTrustType;
}) {
  const assetId = input.assetId.trim();
  if (!assetId) return [];

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('xrpl_trust_records')
      .select('*')
      .eq('asset_type', input.assetType)
      .eq('asset_id', assetId)
      .order('updated_at', { ascending: false })
      .limit(50);
    if (input.trustType) query = query.eq('trust_type', input.trustType);
    const { data, error } = await query;
    if (!error && data) return sortTrustRecords(data.map((row) => fromRow(row as Record<string, unknown>)));
    if (error && !shouldFallback(error)) throw error;
  }

  const runtime = await readRuntime();
  return sortTrustRecords(
    runtime.filter(
      (row) =>
        row.assetType === input.assetType &&
        row.assetId === assetId &&
        (!input.trustType || row.trustType === input.trustType)
    )
  );
}

export async function findXrplTrustRecordByAsset(input: {
  assetType: XrplTrustAssetType;
  assetId: string;
  trustType?: XrplTrustType;
}) {
  const matches = await listXrplTrustRecordsByAsset(input);
  return matches[0] || null;
}

export async function createXrplTrustRecord(input: {
  actorId: string;
  profileSlug?: string;
  assetType: XrplTrustAssetType;
  assetId: string;
  assetTitle: string;
  trustType: XrplTrustType;
  status?: XrplTrustStatus;
  xrplTransactionHash?: string;
  xrplTokenId?: string;
  xrplLedgerIndex?: string;
  anchorUri?: string;
  metadata?: Record<string, unknown>;
}) {
  const record: XrplTrustRecord = {
    id: `xrpl-trust-${randomUUID()}`,
    actorId: input.actorId.trim().toLowerCase(),
    profileSlug: (input.profileSlug || '').trim(),
    assetType: input.assetType,
    assetId: input.assetId.trim(),
    assetTitle: input.assetTitle.trim() || 'Untitled asset',
    trustType: input.trustType,
    status: input.status || 'draft',
    xrplTransactionHash: text(input.xrplTransactionHash),
    xrplTokenId: text(input.xrplTokenId),
    xrplLedgerIndex: text(input.xrplLedgerIndex),
    anchorUri: text(input.anchorUri),
    metadata: input.metadata || {},
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('xrpl_trust_records')
      .insert({
        id: record.id,
        actor_id: record.actorId,
        profile_slug: record.profileSlug || null,
        asset_type: record.assetType,
        asset_id: record.assetId,
        asset_title: record.assetTitle,
        trust_type: record.trustType,
        status: record.status,
        xrpl_transaction_hash: record.xrplTransactionHash || null,
        xrpl_token_id: record.xrplTokenId || null,
        xrpl_ledger_index: record.xrplLedgerIndex || null,
        anchor_uri: record.anchorUri || null,
        metadata: record.metadata,
        created_at: record.createdAt,
        updated_at: record.updatedAt
      })
      .select('*')
      .single();
    if (!error && data) return fromRow(data as Record<string, unknown>);
    if (error && !shouldFallback(error)) throw error;
  }

  const runtime = await readRuntime();
  runtime.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function updateXrplTrustRecord(input: {
  id: string;
  status?: XrplTrustStatus;
  xrplTransactionHash?: string;
  xrplTokenId?: string;
  xrplLedgerIndex?: string;
  anchorUri?: string;
  metadata?: Record<string, unknown>;
}) {
  const id = input.id.trim();
  if (!id) return null;

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const payload: Record<string, unknown> = {
      updated_at: nowIso()
    };
    if (input.status) payload.status = input.status;
    if (input.xrplTransactionHash !== undefined) payload.xrpl_transaction_hash = input.xrplTransactionHash || null;
    if (input.xrplTokenId !== undefined) payload.xrpl_token_id = input.xrplTokenId || null;
    if (input.xrplLedgerIndex !== undefined) payload.xrpl_ledger_index = input.xrplLedgerIndex || null;
    if (input.anchorUri !== undefined) payload.anchor_uri = input.anchorUri || null;
    if (input.metadata) payload.metadata = input.metadata;
    const { data, error } = await supabase.from('xrpl_trust_records').update(payload).eq('id', id).select('*').maybeSingle();
    if (!error && data) return fromRow(data as Record<string, unknown>);
    if (error && !shouldFallback(error)) throw error;
  }

  const runtime = await readRuntime();
  let updated: XrplTrustRecord | null = null;
  const next = runtime.map((row) => {
    if (row.id !== id) return row;
    updated = {
      ...row,
      status: input.status || row.status,
      xrplTransactionHash: input.xrplTransactionHash !== undefined ? text(input.xrplTransactionHash) : row.xrplTransactionHash,
      xrplTokenId: input.xrplTokenId !== undefined ? text(input.xrplTokenId) : row.xrplTokenId,
      xrplLedgerIndex: input.xrplLedgerIndex !== undefined ? text(input.xrplLedgerIndex) : row.xrplLedgerIndex,
      anchorUri: input.anchorUri !== undefined ? text(input.anchorUri) : row.anchorUri,
      metadata: input.metadata ? input.metadata : row.metadata,
      updatedAt: nowIso()
    };
    return updated;
  });
  if (!updated) return null;
  await writeRuntime(next);
  return updated;
}

export async function ensureXrplTrustRecordForAsset(input: {
  actorId: string;
  profileSlug?: string;
  assetType: XrplTrustAssetType;
  assetId: string;
  assetTitle: string;
  trustType: XrplTrustType;
  status?: XrplTrustStatus;
  xrplTransactionHash?: string;
  xrplTokenId?: string;
  xrplLedgerIndex?: string;
  anchorUri?: string;
  metadata?: Record<string, unknown>;
}) {
  const existing = await findXrplTrustRecordByAsset({
    assetType: input.assetType,
    assetId: input.assetId,
    trustType: input.trustType
  });
  if (!existing) {
    return createXrplTrustRecord(input);
  }

  return (await updateXrplTrustRecord({
    id: existing.id,
    status: input.status || existing.status,
    xrplTransactionHash: input.xrplTransactionHash ?? existing.xrplTransactionHash,
    xrplTokenId: input.xrplTokenId ?? existing.xrplTokenId,
    xrplLedgerIndex: input.xrplLedgerIndex ?? existing.xrplLedgerIndex,
    anchorUri: input.anchorUri ?? existing.anchorUri,
    metadata: {
      ...existing.metadata,
      ...(input.metadata || {})
    }
  })) || existing;
}
