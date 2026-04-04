import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import type { CreatorTransaction, ProfilePillarId } from '@/app/profile/data/profileShowcase';
import { listPlatformAccountDashboard } from '@/app/lib/platformAccounts';
import { executeRevenueSplitExecution } from '@/app/lib/splitTreasuryEngine';

export type FinanceLedgerEntryType = 'sale' | 'royalty' | 'payout' | 'refund' | 'fee' | 'dispute';
export type FinanceLedgerStatus = 'paid' | 'pending_payout' | 'settled' | 'refunded' | 'disputed';

export interface FinanceLedgerEntry {
  id: string;
  actorId: string;
  profileSlug: string;
  pillar: ProfilePillarId;
  type: FinanceLedgerEntryType;
  status: FinanceLedgerStatus;
  item: string;
  grossAmount: number;
  platformFeeAmount: number;
  processorFeeAmount: number;
  escrowFeeAmount: number;
  refundAmount: number;
  disputeAmount: number;
  creatorNetAmount: number;
  disputeReason: string;
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface FinancePillarRevenue {
  pillar: ProfilePillarId;
  grossAmount: number;
  platformFeeAmount: number;
  refundAmount: number;
  disputeAmount: number;
  creatorNetAmount: number;
}

export interface FinanceSummary {
  availablePayoutAmount: number;
  pendingPayoutAmount: number;
  lifetimeGrossAmount: number;
  lifetimeNetAmount: number;
  platformFeeRevenueAmount: number;
  processorFeeAmount: number;
  refundAmount: number;
  disputeAmount: number;
  pendingRefundCount: number;
  openDisputeCount: number;
  byPillar: FinancePillarRevenue[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'finance-ledger.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('finance ledger');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<FinanceLedgerEntry[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FinanceLedgerEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(entries: FinanceLedgerEntry[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

export function parseCurrencyAmount(value: string) {
  const parsed = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function transactionToLedgerEntry(input: {
  actorId: string;
  profileSlug: string;
  transaction: CreatorTransaction;
}): FinanceLedgerEntry {
  const amount = parseCurrencyAmount(input.transaction.amount);
  const isRefund = input.transaction.type === 'refund' || input.transaction.status === 'Refunded';
  const isPayout = input.transaction.type === 'payout';
  const net = isRefund ? 0 : isPayout ? amount : amount;
  return {
    id: `txn-${input.transaction.id}`,
    actorId: input.actorId,
    profileSlug: input.profileSlug,
    pillar: input.transaction.pillar,
    type: isRefund ? 'refund' : isPayout ? 'payout' : 'sale',
    status:
      input.transaction.status === 'Pending payout'
        ? 'pending_payout'
        : input.transaction.status === 'Settled'
          ? 'settled'
          : input.transaction.status === 'Refunded'
            ? 'refunded'
            : 'paid',
    item: input.transaction.item,
    grossAmount: isRefund ? 0 : isPayout ? 0 : amount,
    platformFeeAmount: 0,
    processorFeeAmount: 0,
    escrowFeeAmount: 0,
    refundAmount: isRefund ? amount : 0,
    disputeAmount: 0,
    creatorNetAmount: net,
    disputeReason: '',
    createdAt: input.transaction.date
  };
}

function normalizeDbRow(row: Record<string, unknown>): FinanceLedgerEntry {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    profileSlug: String(row.profile_slug || ''),
    pillar: String(row.pillar || 'digital-arts') as ProfilePillarId,
    type: String(row.entry_type || 'sale') as FinanceLedgerEntryType,
    status: String(row.status || 'paid') as FinanceLedgerStatus,
    item: String(row.item || ''),
    grossAmount: Number(row.gross_amount || 0),
    platformFeeAmount: Number(row.platform_fee_amount || 0),
    processorFeeAmount: Number(row.processor_fee_amount || 0),
    escrowFeeAmount: Number(row.escrow_fee_amount || 0),
      refundAmount: Number(row.refund_amount || 0),
      disputeAmount: Number(row.dispute_amount || 0),
      creatorNetAmount: Number(row.creator_net_amount || 0),
      disputeReason: String(row.dispute_reason || ''),
      sourceType: String(row.source_type || ''),
      sourceId: String(row.source_id || ''),
      metadata: row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? (row.metadata as Record<string, unknown>) : {},
      createdAt: String(row.created_at || '')
    };
}

function normalizeValue(value: string) {
  return String(value || '').trim().toLowerCase();
}

function shouldRetryLegacyLedgerWrite(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const code = String((error as Record<string, unknown>).code || '');
  const message = String((error as Record<string, unknown>).message || '').toLowerCase();
  return code === 'PGRST204' || message.includes('could not find the') || message.includes('column');
}

async function maybeExecuteSplitForLedgerEntry(entry: FinanceLedgerEntry) {
  if (!['sale', 'royalty'].includes(entry.type)) return;
  if (Number(entry.grossAmount || 0) <= 0) return;
  const dashboard = await listPlatformAccountDashboard();
  const match = dashboard.revenueSplitRules.find((rule) => {
    if (rule.status !== 'active') return false;
    if (rule.pillar !== entry.pillar) return false;
    if (entry.sourceId && normalizeValue(rule.offeringId) === normalizeValue(entry.sourceId)) return true;
    return normalizeValue(rule.offeringLabel) === normalizeValue(entry.item);
  });
  if (!match) return;
  const eventSourceId = String(
    entry.metadata?.orderId ||
      entry.metadata?.receiptId ||
      entry.metadata?.bookingId ||
      entry.metadata?.referenceId ||
      entry.id
  );
  await executeRevenueSplitExecution({
    splitRuleId: match.id,
    sourceType: entry.type === 'royalty' ? 'royalty' : 'sale',
    sourceId: eventSourceId,
    grossAmount: Number(entry.grossAmount || 0),
    currency: String(entry.metadata?.currency || 'INDI'),
    sourceReference: `finance-ledger:${entry.id}:${entry.sourceId || eventSourceId}`
  });
}

export async function listFinanceLedgerEntries(profileSlug: string, actorId: string, fallbackTransactions: CreatorTransaction[] = []) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const result = await supabase
      .from('creator_finance_ledger')
      .select('*')
      .or(`profile_slug.eq.${profileSlug},actor_id.eq.${actorId}`)
      .order('created_at', { ascending: false })
      .limit(300);
    if (!result.error && result.data && result.data.length > 0) {
      return result.data.map((row) => normalizeDbRow(row as Record<string, unknown>));
    }
  }

  const runtime = await readRuntime();
  const matching = runtime.filter((entry) => entry.profileSlug === profileSlug || entry.actorId === actorId);
  if (matching.length > 0) return matching;
  return fallbackTransactions.map((transaction) => transactionToLedgerEntry({ actorId, profileSlug, transaction }));
}

export async function appendFinanceLedgerEntry(entry: FinanceLedgerEntry) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const upsertPayload = {
      id: entry.id,
      actor_id: entry.actorId,
      profile_slug: entry.profileSlug,
      pillar: entry.pillar,
      entry_type: entry.type,
      status: entry.status,
      item: entry.item,
      gross_amount: entry.grossAmount,
      platform_fee_amount: entry.platformFeeAmount,
      processor_fee_amount: entry.processorFeeAmount,
      escrow_fee_amount: entry.escrowFeeAmount,
      refund_amount: entry.refundAmount,
      dispute_amount: entry.disputeAmount,
      creator_net_amount: entry.creatorNetAmount,
      dispute_reason: entry.disputeReason,
      source_type: entry.sourceType || null,
      source_id: entry.sourceId || null,
      metadata: entry.metadata || {},
      created_at: entry.createdAt
    };
    const { error } = await supabase.from('creator_finance_ledger').upsert(
      upsertPayload,
      { onConflict: 'id' }
    );
    if (error && shouldRetryLegacyLedgerWrite(error)) {
      const { error: legacyError } = await supabase.from('creator_finance_ledger').upsert(
        {
          id: entry.id,
          actor_id: entry.actorId,
          profile_slug: entry.profileSlug,
          pillar: entry.pillar,
          entry_type: entry.type,
          status: entry.status,
          item: entry.item,
          gross_amount: entry.grossAmount,
          platform_fee_amount: entry.platformFeeAmount,
          processor_fee_amount: entry.processorFeeAmount,
          escrow_fee_amount: entry.escrowFeeAmount,
          refund_amount: entry.refundAmount,
          dispute_amount: entry.disputeAmount,
          creator_net_amount: entry.creatorNetAmount,
          dispute_reason: entry.disputeReason,
          created_at: entry.createdAt
        },
        { onConflict: 'id' }
      );
      if (legacyError) throw legacyError;
    } else if (error) {
      throw error;
    }
    await maybeExecuteSplitForLedgerEntry(entry).catch(() => null);
    return entry;
  }

  const runtime = await readRuntime();
  const next = [entry, ...runtime.filter((current) => current.id !== entry.id)];
  await writeRuntime(next);
  await maybeExecuteSplitForLedgerEntry(entry).catch(() => null);
  return entry;
}

export async function listFinanceLedgerEntriesByOrderId(orderId: string) {
  const target = String(orderId || '').trim();
  if (!target) return [] as FinanceLedgerEntry[];

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const result = await supabase
      .from('creator_finance_ledger')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (!result.error && result.data) {
      return result.data
        .map((row) => normalizeDbRow(row as Record<string, unknown>))
        .filter((entry) => String(entry.metadata?.orderId || '').trim() === target);
    }
  }

  const runtime = await readRuntime();
  return runtime.filter((entry) => String(entry.metadata?.orderId || '').trim() === target);
}

export async function updateFinanceLedgerEntryStatus(input: {
  id: string;
  status: FinanceLedgerStatus;
  metadata?: Record<string, unknown>;
}) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const currentResult = await supabase.from('creator_finance_ledger').select('*').eq('id', input.id).maybeSingle();
    const current = currentResult.data ? normalizeDbRow(currentResult.data as Record<string, unknown>) : null;
    if (current) {
      const nextMetadata = { ...(current.metadata || {}), ...(input.metadata || {}) };
      const { error } = await supabase
        .from('creator_finance_ledger')
        .update({
          status: input.status,
          metadata: nextMetadata
        })
        .eq('id', input.id);
      if (error && shouldRetryLegacyLedgerWrite(error)) {
        const { error: legacyError } = await supabase
          .from('creator_finance_ledger')
          .update({
            status: input.status
          })
          .eq('id', input.id);
        if (legacyError) throw legacyError;
        return { ...current, status: input.status };
      }
      if (error) throw error;
      return { ...current, status: input.status, metadata: nextMetadata };
    }
  }

  const runtime = await readRuntime();
  const index = runtime.findIndex((entry) => entry.id === input.id);
  if (index < 0) throw new Error('Finance ledger entry not found.');
  runtime[index] = {
    ...runtime[index],
    status: input.status,
    metadata: { ...(runtime[index].metadata || {}), ...(input.metadata || {}) }
  };
  await writeRuntime(runtime);
  return runtime[index];
}

export function summarizeFinanceLedger(entries: FinanceLedgerEntry[]): FinanceSummary {
  const byPillar = new Map<ProfilePillarId, FinancePillarRevenue>();

  for (const entry of entries) {
    const current = byPillar.get(entry.pillar) || {
      pillar: entry.pillar,
      grossAmount: 0,
      platformFeeAmount: 0,
      refundAmount: 0,
      disputeAmount: 0,
      creatorNetAmount: 0
    };
    current.grossAmount += entry.grossAmount;
    current.platformFeeAmount += entry.platformFeeAmount;
    current.refundAmount += entry.refundAmount;
    current.disputeAmount += entry.disputeAmount;
    current.creatorNetAmount += entry.creatorNetAmount;
    byPillar.set(entry.pillar, current);
  }

  return {
    availablePayoutAmount: entries.filter((entry) => entry.status === 'paid').reduce((sum, entry) => sum + entry.creatorNetAmount, 0),
    pendingPayoutAmount: entries.filter((entry) => entry.status === 'pending_payout').reduce((sum, entry) => sum + entry.creatorNetAmount, 0),
    lifetimeGrossAmount: entries.reduce((sum, entry) => sum + entry.grossAmount, 0),
    lifetimeNetAmount: entries.reduce((sum, entry) => sum + entry.creatorNetAmount, 0),
    platformFeeRevenueAmount: entries.reduce((sum, entry) => sum + entry.platformFeeAmount, 0),
    processorFeeAmount: entries.reduce((sum, entry) => sum + entry.processorFeeAmount, 0),
    refundAmount: entries.reduce((sum, entry) => sum + entry.refundAmount, 0),
    disputeAmount: entries.reduce((sum, entry) => sum + entry.disputeAmount, 0),
    pendingRefundCount: entries.filter((entry) => entry.type === 'refund' && entry.status !== 'refunded').length,
    openDisputeCount: entries.filter((entry) => entry.status === 'disputed' || entry.type === 'dispute').length,
    byPillar: Array.from(byPillar.values()).sort((a, b) => b.grossAmount - a.grossAmount)
  };
}
