import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import { updateIndiLedgerEntryStatus } from '@/app/lib/indiBalanceLedger';

export type IndiWithdrawalDestinationType = 'bank_account' | 'payid' | 'debit_card' | 'manual_review';
export type IndiWithdrawalStatus = 'requested' | 'queued' | 'reviewing' | 'processing' | 'paid' | 'failed' | 'cancelled';

export interface IndiWithdrawalRequest {
  id: string;
  actorId: string;
  profileSlug: string;
  userProfileId: string;
  walletAccountId: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  currency: 'INDI';
  destinationType: IndiWithdrawalDestinationType;
  destinationLabel: string;
  destinationDetails: Record<string, unknown>;
  status: IndiWithdrawalStatus;
  note: string;
  ledgerEntryId: string;
  referenceId: string;
  requestedAt: string;
  updatedAt: string;
  completedAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'indi-withdrawal-requests.json');

function nowIso() {
  return new Date().toISOString();
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function amount(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value || fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
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
  assertRuntimePersistenceAllowed('INDI withdrawal requests');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<IndiWithdrawalRequest[]> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as IndiWithdrawalRequest[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(rows: IndiWithdrawalRequest[]) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), 'utf8');
}

function fromRow(row: Record<string, unknown>): IndiWithdrawalRequest {
  return {
    id: text(row.id),
    actorId: text(row.actor_id || row.actorId),
    profileSlug: text(row.profile_slug || row.profileSlug),
    userProfileId: text(row.user_profile_id || row.userProfileId),
    walletAccountId: text(row.wallet_account_id || row.walletAccountId),
    amount: amount(row.amount),
    feeAmount: amount(row.fee_amount || row.feeAmount),
    netAmount: amount(row.net_amount || row.netAmount),
    currency: 'INDI',
    destinationType: text(row.destination_type || row.destinationType, 'manual_review') as IndiWithdrawalDestinationType,
    destinationLabel: text(row.destination_label || row.destinationLabel),
    destinationDetails: asMap(row.destination_details || row.destinationDetails),
    status: text(row.status, 'requested') as IndiWithdrawalStatus,
    note: text(row.note),
    ledgerEntryId: text(row.ledger_entry_id || row.ledgerEntryId),
    referenceId: text(row.reference_id || row.referenceId),
    requestedAt: text(row.requested_at || row.requestedAt),
    updatedAt: text(row.updated_at || row.updatedAt),
    completedAt: text(row.completed_at || row.completedAt)
  };
}

async function findProfileContext(actorId: string, profileSlug = '') {
  if (!isSupabaseServerConfigured()) {
    return { userProfileId: '', walletAccountId: '', profileSlug };
  }
  const supabase = createSupabaseServerClient();
  const profileResult = await supabase
    .from('user_profiles')
    .select('id')
    .or(`user_uid.eq.${actorId},wallet_address.eq.${actorId},email.eq.${actorId}`)
    .maybeSingle();
  const userProfileId = text((profileResult.data as Record<string, unknown> | null)?.id);
  let walletAccountId = '';
  if (userProfileId) {
    const walletLookup = await supabase
      .from('wallet_accounts')
      .select('id')
      .eq('user_profile_id', userProfileId)
      .order('is_primary', { ascending: false })
      .limit(1)
      .maybeSingle();
    walletAccountId = text((walletLookup.data as Record<string, unknown> | null)?.id);
  }
  return { userProfileId, walletAccountId, profileSlug };
}

export async function listIndiWithdrawalRequests(input: { actorId: string; profileSlug?: string }) {
  const actorId = (input.actorId || '').trim().toLowerCase();
  const profileSlug = (input.profileSlug || '').trim();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const filters = [actorId && `actor_id.eq.${actorId}`, profileSlug && `profile_slug.eq.${profileSlug}`].filter(Boolean).join(',');
    if (filters) {
      const { data, error } = await supabase
        .from('indi_withdrawal_requests')
        .select('*')
        .or(filters)
        .order('requested_at', { ascending: false })
        .limit(100);
      if (!error && data) {
        return data.map((row) => fromRow(row as Record<string, unknown>));
      }
      if (error && !shouldFallback(error)) throw error;
    } else {
      const { data, error } = await supabase
        .from('indi_withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(100);
      if (!error && data) {
        return data.map((row) => fromRow(row as Record<string, unknown>));
      }
      if (error && !shouldFallback(error)) throw error;
    }
  }
  const runtime = await readRuntime();
  if (!actorId && !profileSlug) return runtime;
  return runtime.filter((row) => row.actorId === actorId || (!!profileSlug && row.profileSlug === profileSlug));
}

export async function createIndiWithdrawalRequest(input: {
  actorId: string;
  profileSlug?: string;
  amount: number;
  feeAmount?: number;
  destinationType?: IndiWithdrawalDestinationType;
  destinationLabel?: string;
  destinationDetails?: Record<string, unknown>;
  note?: string;
  ledgerEntryId?: string;
  referenceId?: string;
}) {
  const actorId = (input.actorId || '').trim().toLowerCase();
  const profileSlug = (input.profileSlug || '').trim();
  const feeAmount = amount(input.feeAmount, 0);
  const requestedAt = nowIso();
  const profileContext = await findProfileContext(actorId, profileSlug);
  const record: IndiWithdrawalRequest = {
    id: `indi-withdrawal-${randomUUID()}`,
    actorId,
    profileSlug: profileContext.profileSlug || profileSlug,
    userProfileId: profileContext.userProfileId,
    walletAccountId: profileContext.walletAccountId,
    amount: amount(input.amount),
    feeAmount,
    netAmount: Math.max(amount(input.amount) - feeAmount, 0),
    currency: 'INDI',
    destinationType: input.destinationType || 'manual_review',
    destinationLabel: text(input.destinationLabel, 'Fiat payout destination'),
    destinationDetails: input.destinationDetails || {},
    status: 'requested',
    note: text(input.note),
    ledgerEntryId: text(input.ledgerEntryId),
    referenceId: text(input.referenceId, `withdrawal-${Date.now()}`),
    requestedAt,
    updatedAt: requestedAt,
    completedAt: ''
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('indi_withdrawal_requests')
      .insert({
        id: record.id,
        actor_id: record.actorId,
        profile_slug: record.profileSlug,
        user_profile_id: record.userProfileId || null,
        wallet_account_id: record.walletAccountId || null,
        amount: record.amount,
        fee_amount: record.feeAmount,
        net_amount: record.netAmount,
        currency: record.currency,
        destination_type: record.destinationType,
        destination_label: record.destinationLabel,
        destination_details: record.destinationDetails,
        status: record.status,
        note: record.note,
        ledger_entry_id: record.ledgerEntryId || null,
        reference_id: record.referenceId,
        requested_at: record.requestedAt,
        updated_at: record.updatedAt,
        completed_at: null
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

export async function updateIndiWithdrawalRequestStatus(input: {
  id: string;
  status: IndiWithdrawalStatus;
  note?: string;
}) {
  const nextUpdatedAt = nowIso();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('indi_withdrawal_requests')
      .update({
        status: input.status,
        note: input.note || undefined,
        updated_at: nextUpdatedAt,
        completed_at: ['paid', 'failed', 'cancelled'].includes(input.status) ? nextUpdatedAt : null
      })
      .eq('id', input.id)
      .select('*')
      .single();
    if (!error && data) {
      const record = fromRow(data as Record<string, unknown>);
      if (record.ledgerEntryId) {
        const ledgerStatus =
          input.status === 'paid'
            ? 'completed'
            : input.status === 'failed'
              ? 'failed'
              : input.status === 'cancelled'
                ? 'cancelled'
                : 'pending';
        await updateIndiLedgerEntryStatus({
          id: record.ledgerEntryId,
          status: ledgerStatus,
          metadata: {
            payoutStatus: input.status,
            payoutNote: input.note || record.note,
            payoutUpdatedAt: nextUpdatedAt
          }
        }).catch(() => null);
      }
      return record;
    }
    if (error && !shouldFallback(error)) throw error;
  }

  const runtime = await readRuntime();
  const index = runtime.findIndex((row) => row.id === input.id);
  if (index < 0) throw new Error('Withdrawal request not found.');
  runtime[index] = {
    ...runtime[index],
    status: input.status,
    note: input.note ?? runtime[index].note,
    updatedAt: nextUpdatedAt,
    completedAt: ['paid', 'failed', 'cancelled'].includes(input.status) ? nextUpdatedAt : ''
  };
  await writeRuntime(runtime);
  if (runtime[index].ledgerEntryId) {
    const ledgerStatus =
      input.status === 'paid'
        ? 'completed'
        : input.status === 'failed'
          ? 'failed'
          : input.status === 'cancelled'
            ? 'cancelled'
            : 'pending';
    await updateIndiLedgerEntryStatus({
      id: runtime[index].ledgerEntryId,
      status: ledgerStatus,
      metadata: {
        payoutStatus: input.status,
        payoutNote: input.note ?? runtime[index].note,
        payoutUpdatedAt: nextUpdatedAt
      }
    }).catch(() => null);
  }
  return runtime[index];
}
