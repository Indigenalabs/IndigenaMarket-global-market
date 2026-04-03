import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import { listFinanceLedgerEntries, type FinanceLedgerEntry } from '@/app/lib/financeLedger';

export type IndiLedgerEntryType =
  | 'deposit'
  | 'earning'
  | 'spend'
  | 'hold'
  | 'release'
  | 'refund'
  | 'withdrawal_request'
  | 'withdrawal_complete'
  | 'withdrawal_reversal'
  | 'adjustment';

export type IndiLedgerDirection = 'credit' | 'debit';
export type IndiLedgerStatus = 'pending' | 'completed' | 'cancelled' | 'failed';

export interface IndiLedgerEntry {
  id: string;
  actorId: string;
  profileSlug: string;
  userProfileId: string;
  walletAccountId: string;
  type: IndiLedgerEntryType;
  direction: IndiLedgerDirection;
  status: IndiLedgerStatus;
  amount: number;
  referenceType: string;
  referenceId: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  effectiveAt: string;
}

export interface IndiBalanceSnapshot {
  id: string;
  actorId: string;
  profileSlug: string;
  userProfileId: string;
  walletAccountId: string;
  currency: 'INDI';
  availableBalance: number;
  pendingBalance: number;
  lifetimeCreditAmount: number;
  lifetimeDebitAmount: number;
  estimatedFiatValueUsd: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const BALANCE_FILE = path.join(RUNTIME_DIR, 'indi-balance-accounts.json');
const LEDGER_FILE = path.join(RUNTIME_DIR, 'indi-ledger-entries.json');

function nowIso() {
  return new Date().toISOString();
}

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asJsonMap(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value || fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function shouldFallbackToRuntime(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const code = asText((error as Record<string, unknown>).code);
  const message = asText((error as Record<string, unknown>).message).toLowerCase();
  const hint = asText((error as Record<string, unknown>).hint).toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('relation') ||
    message.includes('schema cache') ||
    hint.includes('perhaps you meant the table')
  );
}

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('INDI balance ledger');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntimeJson<T>(filePath: string): Promise<T[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntimeJson<T>(filePath: string, rows: T[]) {
  await ensureRuntimeDir();
  await fs.writeFile(filePath, JSON.stringify(rows, null, 2), 'utf8');
}

function normalizeLedgerRow(row: Record<string, unknown>): IndiLedgerEntry {
  return {
    id: asText(row.id),
    actorId: asText(row.actor_id || row.actorId),
    profileSlug: asText(row.profile_slug || row.profileSlug),
    userProfileId: asText(row.user_profile_id || row.userProfileId),
    walletAccountId: asText(row.wallet_account_id || row.walletAccountId),
    type: asText(row.entry_type || row.type, 'adjustment') as IndiLedgerEntryType,
    direction: asText(row.direction, 'credit') as IndiLedgerDirection,
    status: asText(row.status, 'completed') as IndiLedgerStatus,
    amount: asNumber(row.amount),
    referenceType: asText(row.reference_type || row.referenceType),
    referenceId: asText(row.reference_id || row.referenceId),
    description: asText(row.description),
    metadata: asJsonMap(row.metadata),
    createdAt: asText(row.created_at || row.createdAt),
    effectiveAt: asText(row.effective_at || row.effectiveAt || row.created_at || row.createdAt)
  };
}

function normalizeBalanceRow(row: Record<string, unknown>): IndiBalanceSnapshot {
  return {
    id: asText(row.id),
    actorId: asText(row.actor_id || row.actorId),
    profileSlug: asText(row.profile_slug || row.profileSlug),
    userProfileId: asText(row.user_profile_id || row.userProfileId),
    walletAccountId: asText(row.wallet_account_id || row.walletAccountId),
    currency: 'INDI',
    availableBalance: asNumber(row.available_balance || row.availableBalance),
    pendingBalance: asNumber(row.pending_balance || row.pendingBalance),
    lifetimeCreditAmount: asNumber(row.lifetime_credit_amount || row.lifetimeCreditAmount),
    lifetimeDebitAmount: asNumber(row.lifetime_debit_amount || row.lifetimeDebitAmount),
    estimatedFiatValueUsd: asNumber(row.estimated_fiat_value_usd || row.estimatedFiatValueUsd),
    metadata: asJsonMap(row.metadata),
    createdAt: asText(row.created_at || row.createdAt),
    updatedAt: asText(row.updated_at || row.updatedAt)
  };
}

function summarizeIndiEntries(input: { actorId: string; profileSlug?: string; entries: IndiLedgerEntry[] }): IndiBalanceSnapshot {
  const now = nowIso();
  let availableBalance = 0;
  let pendingBalance = 0;
  let lifetimeCreditAmount = 0;
  let lifetimeDebitAmount = 0;

  for (const entry of input.entries) {
    const amount = Math.max(0, Number(entry.amount || 0));
    if (entry.status === 'completed') {
      if (entry.direction === 'credit') {
        availableBalance += amount;
        lifetimeCreditAmount += amount;
      } else {
        availableBalance -= amount;
        lifetimeDebitAmount += amount;
      }
    } else if (entry.status === 'pending') {
      pendingBalance += amount;
    }
  }

  return {
    id: `iba-${input.actorId || input.profileSlug || randomUUID()}`,
    actorId: input.actorId,
    profileSlug: input.profileSlug || '',
    userProfileId: '',
    walletAccountId: '',
    currency: 'INDI',
    availableBalance: Number(availableBalance.toFixed(2)),
    pendingBalance: Number(pendingBalance.toFixed(2)),
    lifetimeCreditAmount: Number(lifetimeCreditAmount.toFixed(2)),
    lifetimeDebitAmount: Number(lifetimeDebitAmount.toFixed(2)),
    estimatedFiatValueUsd: Number(availableBalance.toFixed(2)),
    metadata: {},
    createdAt: now,
    updatedAt: now
  };
}

function mapLegacyFinanceEntry(entry: FinanceLedgerEntry): IndiLedgerEntry | null {
  const createdAt = entry.createdAt || nowIso();
  if (entry.type === 'sale' && entry.creatorNetAmount > 0) {
    return {
      id: `indi-fin-${entry.id}`,
      actorId: entry.actorId,
      profileSlug: entry.profileSlug,
      userProfileId: '',
      walletAccountId: '',
      type: 'earning',
      direction: 'credit',
      status: entry.status === 'pending_payout' ? 'pending' : 'completed',
      amount: Number(entry.creatorNetAmount || 0),
      referenceType: 'finance_ledger',
      referenceId: entry.id,
      description: entry.item || 'Marketplace earning',
      metadata: { sourceType: entry.type, pillar: entry.pillar },
      createdAt,
      effectiveAt: createdAt
    };
  }

  if (entry.type === 'payout' && (entry.creatorNetAmount > 0 || entry.grossAmount > 0)) {
    const amount = Number(entry.creatorNetAmount || entry.grossAmount || 0);
    return {
      id: `indi-fin-${entry.id}`,
      actorId: entry.actorId,
      profileSlug: entry.profileSlug,
      userProfileId: '',
      walletAccountId: '',
      type: 'withdrawal_complete',
      direction: 'debit',
      status: entry.status === 'pending_payout' ? 'pending' : 'completed',
      amount,
      referenceType: 'finance_ledger',
      referenceId: entry.id,
      description: entry.item || 'Withdrawal',
      metadata: { sourceType: entry.type, pillar: entry.pillar },
      createdAt,
      effectiveAt: createdAt
    };
  }

  if (entry.type === 'refund' && entry.refundAmount > 0) {
    return {
      id: `indi-fin-${entry.id}`,
      actorId: entry.actorId,
      profileSlug: entry.profileSlug,
      userProfileId: '',
      walletAccountId: '',
      type: 'refund',
      direction: 'debit',
      status: 'completed',
      amount: Number(entry.refundAmount || 0),
      referenceType: 'finance_ledger',
      referenceId: entry.id,
      description: entry.item || 'Refund',
      metadata: { sourceType: entry.type, pillar: entry.pillar },
      createdAt,
      effectiveAt: createdAt
    };
  }

  if (entry.type === 'dispute' && entry.disputeAmount > 0) {
    return {
      id: `indi-fin-${entry.id}`,
      actorId: entry.actorId,
      profileSlug: entry.profileSlug,
      userProfileId: '',
      walletAccountId: '',
      type: 'adjustment',
      direction: 'debit',
      status: 'completed',
      amount: Number(entry.disputeAmount || 0),
      referenceType: 'finance_ledger',
      referenceId: entry.id,
      description: entry.item || 'Dispute adjustment',
      metadata: { sourceType: entry.type, pillar: entry.pillar, disputeReason: entry.disputeReason },
      createdAt,
      effectiveAt: createdAt
    };
  }

  return null;
}

async function deriveLegacyIndiEntries(input: { actorId: string; profileSlug?: string; limit?: number }) {
  const finance = await listFinanceLedgerEntries(input.profileSlug || '', input.actorId, []);
  const derived = finance
    .map(mapLegacyFinanceEntry)
    .filter((entry): entry is IndiLedgerEntry => Boolean(entry))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  return derived.slice(0, input.limit || 200);
}

async function findProfileContext(actorId: string, profileSlug = '') {
  if (!isSupabaseServerConfigured()) {
    return { userProfileId: '', walletAccountId: '', profileSlug };
  }

  const supabase = createSupabaseServerClient();
  const [profileResult, walletResult] = await Promise.all([
    supabase.from('user_profiles').select('id').or(`user_uid.eq.${actorId},wallet_address.eq.${actorId},email.eq.${actorId}`).maybeSingle(),
    profileSlug ? supabase.from('creator_profiles').select('slug').eq('slug', profileSlug).maybeSingle() : Promise.resolve({ data: null, error: null })
  ]);

  const userProfileId = asText((profileResult.data as Record<string, unknown> | null)?.id);
  let walletAccountId = '';
  if (userProfileId) {
    const walletLookup = await supabase.from('wallet_accounts').select('id').eq('user_profile_id', userProfileId).order('is_primary', { ascending: false }).limit(1).maybeSingle();
    walletAccountId = asText((walletLookup.data as Record<string, unknown> | null)?.id);
  }

  return {
    userProfileId,
    walletAccountId,
    profileSlug: profileSlug || asText((walletResult.data as Record<string, unknown> | null)?.slug)
  };
}

export async function listIndiLedgerEntries(input: { actorId: string; profileSlug?: string; limit?: number }) {
  const actorId = (input.actorId || '').trim().toLowerCase();
  const profileSlug = (input.profileSlug || '').trim();
  const limit = input.limit || 200;

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const filters = [actorId && `actor_id.eq.${actorId}`, profileSlug && `profile_slug.eq.${profileSlug}`].filter(Boolean).join(',');
    if (filters) {
      const { data, error } = await supabase
        .from('indi_ledger_entries')
        .select('*')
        .or(filters)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data && data.length > 0) {
        return data.map((row) => normalizeLedgerRow(row as Record<string, unknown>));
      }
      if (error && !shouldFallbackToRuntime(error)) {
        throw error;
      }
    }
  }

  const runtime = await readRuntimeJson<IndiLedgerEntry>(LEDGER_FILE);
  const runtimeMatches = runtime
    .filter((entry) => entry.actorId === actorId || (!!profileSlug && entry.profileSlug === profileSlug))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  if (runtimeMatches.length > 0) return runtimeMatches.slice(0, limit);

  return deriveLegacyIndiEntries({ actorId, profileSlug, limit });
}

export async function getIndiBalanceSnapshot(input: { actorId: string; profileSlug?: string }) {
  const actorId = (input.actorId || '').trim().toLowerCase();
  const profileSlug = (input.profileSlug || '').trim();

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const filters = [actorId && `actor_id.eq.${actorId}`, profileSlug && `profile_slug.eq.${profileSlug}`].filter(Boolean).join(',');
    if (filters) {
      const { data, error } = await supabase
        .from('indi_balance_accounts')
        .select('*')
        .or(filters)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        return normalizeBalanceRow(data as Record<string, unknown>);
      }
      if (error && !shouldFallbackToRuntime(error)) {
        throw error;
      }
    }
  }

  const runtime = await readRuntimeJson<IndiBalanceSnapshot>(BALANCE_FILE);
  const runtimeMatch = runtime.find((entry) => entry.actorId === actorId || (!!profileSlug && entry.profileSlug === profileSlug));
  if (runtimeMatch) return runtimeMatch;

  const entries = await listIndiLedgerEntries({ actorId, profileSlug, limit: 300 });
  return summarizeIndiEntries({ actorId, profileSlug, entries });
}

async function persistBalanceSnapshot(snapshot: IndiBalanceSnapshot) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const profileContext = await findProfileContext(snapshot.actorId, snapshot.profileSlug);
    const { data, error } = await supabase
      .from('indi_balance_accounts')
      .upsert(
        {
          actor_id: snapshot.actorId,
          profile_slug: profileContext.profileSlug || snapshot.profileSlug || '',
          user_profile_id: profileContext.userProfileId || null,
          wallet_account_id: profileContext.walletAccountId || null,
          currency: 'INDI',
          available_balance: snapshot.availableBalance,
          pending_balance: snapshot.pendingBalance,
          lifetime_credit_amount: snapshot.lifetimeCreditAmount,
          lifetime_debit_amount: snapshot.lifetimeDebitAmount,
          estimated_fiat_value_usd: snapshot.estimatedFiatValueUsd,
          metadata: snapshot.metadata,
          updated_at: nowIso()
        },
        { onConflict: 'actor_id' }
      )
      .select('*')
      .single();
    if (!error && data) {
      return normalizeBalanceRow(data as Record<string, unknown>);
    }
    if (error && !shouldFallbackToRuntime(error)) {
      throw error;
    }
  }

  const runtime = await readRuntimeJson<IndiBalanceSnapshot>(BALANCE_FILE);
  const next = { ...snapshot, updatedAt: nowIso() };
  const index = runtime.findIndex((entry) => entry.actorId === snapshot.actorId);
  if (index >= 0) runtime[index] = next; else runtime.unshift(next);
  await writeRuntimeJson(BALANCE_FILE, runtime);
  return next;
}

export async function appendIndiLedgerEntry(input: {
  actorId: string;
  profileSlug?: string;
  userProfileId?: string;
  walletAccountId?: string;
  type: IndiLedgerEntryType;
  direction: IndiLedgerDirection;
  status?: IndiLedgerStatus;
  amount: number;
  referenceType?: string;
  referenceId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  effectiveAt?: string;
}) {
  const actorId = input.actorId.trim().toLowerCase();
  const profileSlug = (input.profileSlug || '').trim();
  const amount = Number(input.amount || 0);
  const createdAt = nowIso();
  const profileContext = await findProfileContext(actorId, profileSlug);
  const entry: IndiLedgerEntry = {
    id: `indi-ledger-${randomUUID()}`,
    actorId,
    profileSlug: profileContext.profileSlug || profileSlug,
    userProfileId: input.userProfileId || profileContext.userProfileId,
    walletAccountId: input.walletAccountId || profileContext.walletAccountId,
    type: input.type,
    direction: input.direction,
    status: input.status || 'completed',
    amount: Number.isFinite(amount) ? Math.max(0, amount) : 0,
    referenceType: (input.referenceType || '').trim(),
    referenceId: (input.referenceId || '').trim(),
    description: input.description.trim(),
    metadata: input.metadata || {},
    createdAt,
    effectiveAt: input.effectiveAt || createdAt
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('indi_ledger_entries').insert({
      id: entry.id,
      actor_id: entry.actorId,
      profile_slug: entry.profileSlug,
      user_profile_id: entry.userProfileId || null,
      wallet_account_id: entry.walletAccountId || null,
      entry_type: entry.type,
      direction: entry.direction,
      status: entry.status,
      amount: entry.amount,
      reference_type: entry.referenceType,
      reference_id: entry.referenceId,
      description: entry.description,
      metadata: entry.metadata,
      created_at: entry.createdAt,
      effective_at: entry.effectiveAt
    });
    if (error && !shouldFallbackToRuntime(error)) throw error;
    if (!error) {
      const entries = await listIndiLedgerEntries({ actorId: entry.actorId, profileSlug: entry.profileSlug, limit: 300 });
      const snapshot = summarizeIndiEntries({ actorId: entry.actorId, profileSlug: entry.profileSlug, entries });
      const persisted = await persistBalanceSnapshot(snapshot);
      return { entry, balance: persisted };
    }
  }

  {
    const runtime = await readRuntimeJson<IndiLedgerEntry>(LEDGER_FILE);
    runtime.unshift(entry);
    await writeRuntimeJson(LEDGER_FILE, runtime);
  }

  const entries = await listIndiLedgerEntries({ actorId: entry.actorId, profileSlug: entry.profileSlug, limit: 300 });
  const snapshot = summarizeIndiEntries({ actorId: entry.actorId, profileSlug: entry.profileSlug, entries });
  const persisted = await persistBalanceSnapshot(snapshot);
  return { entry, balance: persisted };
}
