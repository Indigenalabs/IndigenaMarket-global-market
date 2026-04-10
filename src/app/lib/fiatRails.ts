import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import { getComplianceProfile, type ComplianceProfileRecord } from '@/app/lib/complianceGovernance';

export type FiatPayoutDestinationType = 'bank_account' | 'payid' | 'debit_card' | 'manual_review';
export type FiatPayoutDestinationStatus = 'draft' | 'ready' | 'review_required' | 'disabled';

export interface FiatPayoutDestinationRecord {
  id: string;
  actorId: string;
  profileSlug: string;
  label: string;
  destinationType: FiatPayoutDestinationType;
  accountName: string;
  institutionName: string;
  last4: string;
  currency: string;
  countryCode: string;
  isDefault: boolean;
  status: FiatPayoutDestinationStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FiatRailsSnapshot {
  complianceProfile: ComplianceProfileRecord | null;
  destinations: FiatPayoutDestinationRecord[];
  readiness: {
    kycApproved: boolean;
    amlApproved: boolean;
    payoutEnabled: boolean;
    instantPayoutReady: boolean;
  };
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'fiat-payout-destinations.json');

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
  assertRuntimePersistenceAllowed('fiat payout destinations');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<FiatPayoutDestinationRecord[]> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FiatPayoutDestinationRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(rows: FiatPayoutDestinationRecord[]) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), 'utf8');
}

function fromRow(row: Record<string, unknown>): FiatPayoutDestinationRecord {
  return {
    id: text(row.id),
    actorId: text(row.actor_id || row.actorId),
    profileSlug: text(row.profile_slug || row.profileSlug),
    label: text(row.label),
    destinationType: text(row.destination_type || row.destinationType, 'manual_review') as FiatPayoutDestinationType,
    accountName: text(row.account_name || row.accountName),
    institutionName: text(row.institution_name || row.institutionName),
    last4: text(row.last4),
    currency: text(row.currency, 'USD'),
    countryCode: text(row.country_code || row.countryCode, 'AU'),
    isDefault: Boolean(row.is_default ?? row.isDefault),
    status: text(row.status, 'draft') as FiatPayoutDestinationStatus,
    metadata: asMap(row.metadata),
    createdAt: text(row.created_at || row.createdAt),
    updatedAt: text(row.updated_at || row.updatedAt)
  };
}

export async function listFiatPayoutDestinations(input: { actorId: string; profileSlug?: string }) {
  const actorId = (input.actorId || '').trim().toLowerCase();
  const profileSlug = (input.profileSlug || '').trim();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const filters = [actorId && `actor_id.eq.${actorId}`, profileSlug && `profile_slug.eq.${profileSlug}`].filter(Boolean).join(',');
    const query = supabase.from('fiat_payout_destinations').select('*').order('updated_at', { ascending: false }).limit(50);
    const { data, error } = filters ? await query.or(filters) : await query;
    if (!error && data) return data.map((row) => fromRow(row as Record<string, unknown>));
    if (error && !shouldFallback(error)) throw error;
  }
  const runtime = await readRuntime();
  return runtime.filter((row) => row.actorId === actorId || (!!profileSlug && row.profileSlug === profileSlug));
}

export async function upsertFiatPayoutDestination(input: {
  id?: string;
  actorId: string;
  profileSlug?: string;
  label: string;
  destinationType: FiatPayoutDestinationType;
  accountName?: string;
  institutionName?: string;
  last4?: string;
  currency?: string;
  countryCode?: string;
  isDefault?: boolean;
  status?: FiatPayoutDestinationStatus;
  metadata?: Record<string, unknown>;
}) {
  const actorId = input.actorId.trim().toLowerCase();
  const profileSlug = (input.profileSlug || '').trim();
  const existing = input.id ? (await listFiatPayoutDestinations({ actorId, profileSlug })).find((row) => row.id === input.id) : null;
  const record: FiatPayoutDestinationRecord = {
    id: existing?.id || input.id || `fiat-destination-${randomUUID()}`,
    actorId,
    profileSlug,
    label: input.label.trim() || 'Payout destination',
    destinationType: input.destinationType,
    accountName: text(input.accountName),
    institutionName: text(input.institutionName),
    last4: text(input.last4),
    currency: text(input.currency, 'USD'),
    countryCode: text(input.countryCode, 'AU').toUpperCase(),
    isDefault: input.isDefault ?? existing?.isDefault ?? false,
    status: input.status || existing?.status || 'draft',
    metadata: input.metadata || existing?.metadata || {},
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('fiat_payout_destinations')
      .upsert({
        id: record.id,
        actor_id: record.actorId,
        profile_slug: record.profileSlug || null,
        label: record.label,
        destination_type: record.destinationType,
        account_name: record.accountName || null,
        institution_name: record.institutionName || null,
        last4: record.last4 || null,
        currency: record.currency,
        country_code: record.countryCode,
        is_default: record.isDefault,
        status: record.status,
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
  const normalized = runtime
    .filter((row) => row.id !== record.id)
    .map((row) =>
      row.actorId === record.actorId && row.profileSlug === record.profileSlug && record.isDefault
        ? { ...row, isDefault: false, updatedAt: record.updatedAt }
        : row
    );
  normalized.unshift(record);
  await writeRuntime(normalized);
  return record;
}

export async function getFiatRailsSnapshot(input: { actorId: string; walletAddress?: string; profileSlug?: string }): Promise<FiatRailsSnapshot> {
  const complianceProfile = await getComplianceProfile(input.actorId, input.walletAddress || '');
  const destinations = await listFiatPayoutDestinations({ actorId: input.actorId, profileSlug: input.profileSlug || '' });
  const readiness = {
    kycApproved: complianceProfile?.kycStatus === 'approved',
    amlApproved: complianceProfile?.amlStatus === 'approved',
    payoutEnabled: Boolean(complianceProfile?.payoutEnabled),
    instantPayoutReady:
      complianceProfile?.kycStatus === 'approved' &&
      complianceProfile?.amlStatus === 'approved' &&
      Boolean(complianceProfile?.payoutEnabled) &&
      destinations.some((destination) => destination.status === 'ready')
  };
  return { complianceProfile, destinations, readiness };
}
