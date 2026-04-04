import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import { listIndiWithdrawalRequests, updateIndiWithdrawalRequestStatus, type IndiWithdrawalRequest, type IndiWithdrawalStatus } from '@/app/lib/indiWithdrawalRequests';
import { listAllFinanceLedgerEntries, listFinanceLedgerEntriesByOrderId, updateFinanceLedgerEntryStatus, type FinanceLedgerEntry, type FinanceLedgerStatus } from '@/app/lib/financeLedger';
import { listDigitalArtOrders, updateDigitalArtOrderStatus, type DigitalArtOrderRecord, type DigitalArtOrderStatus } from '@/app/lib/digitalArtOrders';

export interface InstantPayoutRequest {
  id: string;
  actorId: string;
  walletAddress: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  status: 'requested' | 'processing' | 'paid' | 'failed';
  createdAt: string;
}

export interface BnplApplication {
  id: string;
  actorId: string;
  orderId: string;
  amount: number;
  partner: string;
  feeAmount: number;
  status: 'submitted' | 'approved' | 'declined';
  createdAt: string;
}

export interface TaxReportPurchase {
  id: string;
  actorId: string;
  taxYear: number;
  feeAmount: number;
  status: 'purchased' | 'generated';
  createdAt: string;
}

export interface FinancialServicesDashboard {
  payouts: InstantPayoutRequest[];
  bnplApplications: BnplApplication[];
  taxReports: TaxReportPurchase[];
  indiWithdrawals: IndiWithdrawalRequest[];
  royalties: FinanceLedgerEntry[];
  marketplaceOrders: DigitalArtOrderRecord[];
  orderReconciliation: FinancialOrderReconciliation[];
}

export interface FinancialReconciliationReportRow {
  pillar: string;
  caseCount: number;
  grossAmount: number;
  royaltyAmount: number;
  platformFeeAmount: number;
  sellerNetAmount: number;
  pendingCount: number;
  settledCount: number;
  disputedCount: number;
}

export interface FinancialAuditHistoryEntry {
  id: string;
  entity: 'payout' | 'indi-withdrawal' | 'royalty' | 'marketplace-order' | 'settlement-case' | 'bnpl' | 'tax-report';
  entityId: string;
  pillar: string;
  title: string;
  status: string;
  actorId: string;
  sourceReference: string;
  amount: number;
  currency: string;
  note: string;
  occurredAt: string;
}

export interface FinancialOrderReconciliation {
  settlementId: string;
  settlementEntity: 'marketplace-order' | 'settlement-case';
  orderId: string;
  listingId: string;
  title: string;
  pillar: string;
  sourceType: string;
  sourceLabel: string;
  sourceReference: string;
  orderKind: 'primary' | 'resale';
  orderStatus: DigitalArtOrderStatus;
  amountPaid: number;
  currency: string;
  sellerActorId: string;
  creatorActorId: string;
  royaltyAmount: number;
  platformFeeAmount: number;
  sellerNetAmount: number;
  saleLedgerStatuses: FinanceLedgerStatus[];
  royaltyLedgerStatuses: FinanceLedgerStatus[];
  withdrawalStatuses: IndiWithdrawalStatus[];
  linkedLedgerEntryIds: string[];
  createdAt: string;
}

function toSourceLabel(sourceType: string) {
  if (sourceType === 'orderId') return 'Order';
  if (sourceType === 'receiptId') return 'Receipt';
  if (sourceType === 'bookingId') return 'Booking';
  if (sourceType === 'referenceId') return 'Reference';
  return 'Settlement';
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'financial-services.json');

async function ensureDir() { assertRuntimePersistenceAllowed('financial services'); await fs.mkdir(RUNTIME_DIR, { recursive: true }); }
async function readRuntime(): Promise<FinancialServicesDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) return { payouts: [], bnplApplications: [], taxReports: [], indiWithdrawals: [], royalties: [], marketplaceOrders: [], orderReconciliation: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<FinancialServicesDashboard>;
    return {
      payouts: Array.isArray(parsed.payouts) ? parsed.payouts : [],
      bnplApplications: Array.isArray(parsed.bnplApplications) ? parsed.bnplApplications : [],
      taxReports: Array.isArray(parsed.taxReports) ? parsed.taxReports : [],
      indiWithdrawals: Array.isArray(parsed.indiWithdrawals) ? parsed.indiWithdrawals : [],
      royalties: Array.isArray(parsed.royalties) ? parsed.royalties : [],
      marketplaceOrders: Array.isArray(parsed.marketplaceOrders) ? parsed.marketplaceOrders : [],
      orderReconciliation: Array.isArray(parsed.orderReconciliation) ? parsed.orderReconciliation : []
    };
  } catch { return { payouts: [], bnplApplications: [], taxReports: [], indiWithdrawals: [], royalties: [], marketplaceOrders: [], orderReconciliation: [] }; }
}
async function writeRuntime(data: FinancialServicesDashboard) { await ensureDir(); await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8'); }

function buildOrderReconciliation(input: {
  orders: DigitalArtOrderRecord[];
  royalties: FinanceLedgerEntry[];
  withdrawals: IndiWithdrawalRequest[];
}) {
  const knownOrderIds = new Set(input.orders.map((order) => order.id));
  const orderRows = input.orders.map((order) => {
    const linkedLedger = input.royalties.filter((entry) => String(entry.metadata?.orderId || '').trim() === order.id);
    const linkedWithdrawals = input.withdrawals.filter((entry) => [order.sellerActorId, order.creatorActorId].includes(entry.actorId));
    return {
      settlementId: order.id,
      settlementEntity: 'marketplace-order',
      orderId: order.id,
      listingId: order.listingId,
      title: order.title,
      pillar: 'digital-arts',
      sourceType: 'orderId',
      sourceLabel: toSourceLabel('orderId'),
      sourceReference: order.id,
      orderKind: order.orderKind,
      orderStatus: order.status,
      amountPaid: order.amountPaid,
      currency: order.currency,
      sellerActorId: order.sellerActorId,
      creatorActorId: order.creatorActorId,
      royaltyAmount: order.royaltyAmount,
      platformFeeAmount: order.platformFeeAmount,
      sellerNetAmount: order.sellerNetAmount,
      saleLedgerStatuses: linkedLedger.filter((entry) => entry.type === 'sale').map((entry) => entry.status),
      royaltyLedgerStatuses: linkedLedger.filter((entry) => entry.type === 'royalty').map((entry) => entry.status),
      withdrawalStatuses: linkedWithdrawals.map((entry) => entry.status),
      linkedLedgerEntryIds: linkedLedger.map((entry) => entry.id),
      createdAt: order.createdAt
    } satisfies FinancialOrderReconciliation;
  });

  const grouped = new Map<string, { key: string; sourceType: string; entries: FinanceLedgerEntry[] }>();
  for (const entry of input.royalties) {
    const reference =
      String(entry.metadata?.orderId || '').trim() ||
      String(entry.metadata?.receiptId || '').trim() ||
      String(entry.metadata?.bookingId || '').trim() ||
      String(entry.metadata?.referenceId || '').trim();
    if (!reference) continue;
    const sourceType = String(entry.metadata?.orderId ? 'orderId' : entry.metadata?.receiptId ? 'receiptId' : entry.metadata?.bookingId ? 'bookingId' : 'referenceId');
    if (sourceType === 'orderId' && knownOrderIds.has(reference)) continue;
    const groupKey = `${sourceType}:${reference}`;
    const current = grouped.get(groupKey);
    if (current) {
      current.entries.push(entry);
    } else {
      grouped.set(groupKey, { key: reference, sourceType, entries: [entry] });
    }
  }

  const derivedRows = Array.from(grouped.values()).map((group) => {
    const entries = [...group.entries].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
    const saleEntries = entries.filter((entry) => entry.type === 'sale');
    const royaltyEntries = entries.filter((entry) => entry.type === 'royalty');
    const actorIds = Array.from(new Set(entries.map((entry) => entry.actorId).filter(Boolean)));
    const linkedWithdrawals = input.withdrawals.filter((entry) => actorIds.includes(entry.actorId));
    const allStatuses = entries.map((entry) => entry.status);
    const orderStatus: DigitalArtOrderStatus =
      allStatuses.includes('disputed')
        ? 'disputed'
        : allStatuses.includes('refunded')
          ? 'refunded'
          : allStatuses.length > 0 && allStatuses.every((status) => status === 'settled')
            ? 'settled'
            : allStatuses.includes('pending_payout')
              ? 'pending_settlement'
              : 'captured';
    const primaryEntry = saleEntries[0] || royaltyEntries[0] || entries[0];
    return {
      settlementId: group.key,
      settlementEntity: 'settlement-case',
      orderId: group.key,
      listingId: String(primaryEntry.sourceId || group.key),
      title: primaryEntry.item || `${primaryEntry.pillar} settlement`,
      pillar: primaryEntry.pillar,
      sourceType: group.sourceType,
      sourceLabel: toSourceLabel(group.sourceType),
      sourceReference: group.key,
      orderKind: 'primary',
      orderStatus,
      amountPaid: saleEntries.length > 0 ? saleEntries.reduce((sum, entry) => sum + entry.grossAmount, 0) : entries.reduce((sum, entry) => sum + entry.grossAmount, 0),
      currency: String(primaryEntry.metadata?.currency || 'INDI'),
      sellerActorId: saleEntries[0]?.actorId || primaryEntry.actorId,
      creatorActorId: royaltyEntries[0]?.actorId || saleEntries[0]?.actorId || primaryEntry.actorId,
      royaltyAmount: royaltyEntries.reduce((sum, entry) => sum + entry.creatorNetAmount, 0),
      platformFeeAmount: entries.reduce((sum, entry) => sum + entry.platformFeeAmount, 0),
      sellerNetAmount: saleEntries.reduce((sum, entry) => sum + entry.creatorNetAmount, 0),
      saleLedgerStatuses: saleEntries.map((entry) => entry.status),
      royaltyLedgerStatuses: royaltyEntries.map((entry) => entry.status),
      withdrawalStatuses: linkedWithdrawals.map((entry) => entry.status),
      linkedLedgerEntryIds: entries.map((entry) => entry.id),
      createdAt: primaryEntry.createdAt
    } satisfies FinancialOrderReconciliation;
  });

  return [...orderRows, ...derivedRows].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

export async function listFinancialServices() {
  const fallbackRoyalties = await listAllFinanceLedgerEntries();
  const fallbackWithdrawals = await listIndiWithdrawalRequests({ actorId: '', profileSlug: '' });
  const fallbackMarketplaceOrders = await listDigitalArtOrders({ includeAll: true });
  if (!isSupabaseServerConfigured()) {
    const runtime = await readRuntime();
    const royalties = fallbackRoyalties.filter((entry) => ['sale', 'royalty'].includes(entry.type));
    const indiWithdrawals = fallbackWithdrawals;
    const marketplaceOrders = fallbackMarketplaceOrders;
    return {
      payouts: runtime.payouts,
      bnplApplications: runtime.bnplApplications,
      taxReports: runtime.taxReports,
      indiWithdrawals,
      royalties,
      marketplaceOrders,
      orderReconciliation: buildOrderReconciliation({
        orders: marketplaceOrders,
        royalties,
        withdrawals: indiWithdrawals
      })
    };
  }
  const supabase = createSupabaseServerClient();
  const [payouts, bnplApplications, taxReports, indiWithdrawals, royalties, marketplaceOrders] = await Promise.all([
    supabase.from('finance_instant_payout_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('finance_bnpl_applications').select('*').order('created_at', { ascending: false }),
    supabase.from('finance_tax_report_purchases').select('*').order('created_at', { ascending: false }),
    supabase.from('indi_withdrawal_requests').select('*').order('requested_at', { ascending: false }),
    supabase.from('creator_finance_ledger').select('*').in('entry_type', ['sale', 'royalty']).order('created_at', { ascending: false }),
    supabase.from('digital_art_orders').select('*').order('created_at', { ascending: false }).limit(100)
  ]);
  const mappedWithdrawals = !indiWithdrawals.error && indiWithdrawals.data
    ? indiWithdrawals.data.map((row: any) => ({
        id: String(row.id || ''),
        actorId: String(row.actor_id || ''),
        profileSlug: String(row.profile_slug || ''),
        userProfileId: String(row.user_profile_id || ''),
        walletAccountId: String(row.wallet_account_id || ''),
        amount: Number(row.amount || 0),
        feeAmount: Number(row.fee_amount || 0),
        netAmount: Number(row.net_amount || 0),
        currency: 'INDI' as const,
        destinationType: (row.destination_type || 'manual_review') as IndiWithdrawalRequest['destinationType'],
        destinationLabel: String(row.destination_label || ''),
        destinationDetails: row.destination_details || {},
        status: row.status || 'requested',
        note: String(row.note || ''),
        ledgerEntryId: String(row.ledger_entry_id || ''),
        referenceId: String(row.reference_id || ''),
        requestedAt: String(row.requested_at || ''),
        updatedAt: String(row.updated_at || ''),
        completedAt: String(row.completed_at || '')
      }))
    : fallbackWithdrawals;
  const mappedRoyalties = !royalties.error && royalties.data && royalties.data.length > 0
    ? royalties.data.map((row: any) => ({
        id: String(row.id || ''),
        actorId: String(row.actor_id || ''),
        profileSlug: String(row.profile_slug || ''),
        pillar: String(row.pillar || 'digital-arts') as FinanceLedgerEntry['pillar'],
        type: String(row.entry_type || 'sale') as FinanceLedgerEntry['type'],
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
        metadata: row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {},
        createdAt: String(row.created_at || '')
      }))
    : fallbackRoyalties.filter((entry) => ['sale', 'royalty'].includes(entry.type));
  const mappedMarketplaceOrders = !marketplaceOrders.error && marketplaceOrders.data
    ? marketplaceOrders.data.map((row: any) => ({
        id: String(row.id || ''),
        listingId: String(row.listing_id || ''),
        buyerActorId: String(row.buyer_actor_id || ''),
        buyerWalletAddress: String(row.buyer_wallet_address || ''),
        creatorActorId: String(row.creator_actor_id || ''),
        sellerActorId: String(row.payment_breakdown?.sellerActorId || row.creator_actor_id || ''),
        title: String(row.title || ''),
        amountPaid: Number(row.amount_paid || 0),
        currency: String(row.currency || 'INDI'),
        status: String(row.status || 'captured') as DigitalArtOrderStatus,
        receiptId: String(row.receipt_id || ''),
        orderKind: String(row.payment_breakdown?.orderKind || 'primary') as DigitalArtOrderRecord['orderKind'],
        royaltyRate: Number(row.payment_breakdown?.royaltyRate || 0),
        royaltyAmount: Number(row.payment_breakdown?.royaltyAmount || 0),
        sellerNetAmount: Number(row.payment_breakdown?.sellerNet || row.payment_breakdown?.creatorNet || 0),
        platformFeeAmount: Number(row.payment_breakdown?.platformFee || 0),
        buyerServiceFeeAmount: Number(row.payment_breakdown?.buyerServiceFee || 0),
        subtotalAmount: Number(row.payment_breakdown?.subtotal || row.amount_paid || 0),
        buyerTotalAmount: Number(row.payment_breakdown?.buyerTotal || row.amount_paid || 0),
        parentOrderId: String(row.payment_breakdown?.parentOrderId || ''),
        createdAt: String(row.created_at || '')
      }))
    : fallbackMarketplaceOrders;
  return {
    payouts: (payouts.data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, walletAddress: row.wallet_address, amount: Number(row.amount || 0), feeAmount: Number(row.fee_amount || 0), netAmount: Number(row.net_amount || 0), status: row.status, createdAt: row.created_at })),
    bnplApplications: (bnplApplications.data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, orderId: row.order_id, amount: Number(row.amount || 0), partner: row.partner, feeAmount: Number(row.fee_amount || 0), status: row.status, createdAt: row.created_at })),
    taxReports: (taxReports.data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, taxYear: Number(row.tax_year || new Date().getUTCFullYear()), feeAmount: Number(row.fee_amount || 25), status: row.status, createdAt: row.created_at })),
    indiWithdrawals: mappedWithdrawals,
    royalties: mappedRoyalties,
    marketplaceOrders: mappedMarketplaceOrders,
    orderReconciliation: buildOrderReconciliation({
      orders: mappedMarketplaceOrders,
      royalties: mappedRoyalties,
      withdrawals: mappedWithdrawals
    })
  };
}

export async function requestInstantPayout(input: { actorId: string; walletAddress: string; amount: number; }) {
  const feeAmount = Math.round(Number(input.amount || 0) * 0.01 * 100) / 100;
  const record: InstantPayoutRequest = { id: `po-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, actorId: input.actorId, walletAddress: input.walletAddress, amount: Number(input.amount || 0), feeAmount, netAmount: Math.max(Number(input.amount || 0) - feeAmount, 0), status: 'requested', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('finance_instant_payout_requests').insert({ id: record.id, actor_id: record.actorId, wallet_address: record.walletAddress, amount: record.amount, fee_amount: record.feeAmount, net_amount: record.netAmount, status: record.status, created_at: record.createdAt });
    return record;
  }
  const state = await readRuntime(); state.payouts.unshift(record); await writeRuntime(state); return record;
}

export async function createBnplApplication(input: { actorId: string; orderId: string; amount: number; }) {
  const record: BnplApplication = { id: `bnpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, actorId: input.actorId, orderId: input.orderId, amount: Number(input.amount || 0), partner: 'Indigena FlexPay', feeAmount: Math.round(Number(input.amount || 0) * 0.04 * 100) / 100, status: 'submitted', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('finance_bnpl_applications').insert({ id: record.id, actor_id: record.actorId, order_id: record.orderId, amount: record.amount, partner: record.partner, fee_amount: record.feeAmount, status: record.status, created_at: record.createdAt });
    return record;
  }
  const state = await readRuntime(); state.bnplApplications.unshift(record); await writeRuntime(state); return record;
}

export async function purchaseTaxReport(input: { actorId: string; taxYear: number; }) {
  const record: TaxReportPurchase = { id: `tax-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, actorId: input.actorId, taxYear: input.taxYear, feeAmount: 25, status: 'purchased', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('finance_tax_report_purchases').insert({ id: record.id, actor_id: record.actorId, tax_year: record.taxYear, fee_amount: record.feeAmount, status: record.status, created_at: record.createdAt });
    return record;
  }
  const state = await readRuntime(); state.taxReports.unshift(record); await writeRuntime(state); return record;
}

export async function updateInstantPayoutStatus(id: string, status: InstantPayoutRequest['status']) {
  const state = await listFinancialServices();
  const current = state.payouts.find((entry) => entry.id === id);
  if (!current) throw new Error('Instant payout request not found.');
  const updated = { ...current, status };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('finance_instant_payout_requests').update({ status }).eq('id', id);
    return updated;
  }
  const runtime = await readRuntime(); runtime.payouts = runtime.payouts.map((entry) => entry.id === id ? updated : entry); await writeRuntime(runtime); return updated;
}

export async function updateBnplStatus(id: string, status: BnplApplication['status']) {
  const state = await listFinancialServices();
  const current = state.bnplApplications.find((entry) => entry.id === id);
  if (!current) throw new Error('BNPL application not found.');
  const updated = { ...current, status };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('finance_bnpl_applications').update({ status }).eq('id', id);
    return updated;
  }
  const runtime = await readRuntime(); runtime.bnplApplications = runtime.bnplApplications.map((entry) => entry.id === id ? updated : entry); await writeRuntime(runtime); return updated;
}

export async function updateTaxReportStatus(id: string, status: TaxReportPurchase['status']) {
  const state = await listFinancialServices();
  const current = state.taxReports.find((entry) => entry.id === id);
  if (!current) throw new Error('Tax report purchase not found.');
  const updated = { ...current, status };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('finance_tax_report_purchases').update({ status }).eq('id', id);
    return updated;
  }
  const runtime = await readRuntime(); runtime.taxReports = runtime.taxReports.map((entry) => entry.id === id ? updated : entry); await writeRuntime(runtime); return updated;
}

export async function updateIndiWithdrawalOpsStatus(id: string, status: IndiWithdrawalStatus, note = '') {
  return updateIndiWithdrawalRequestStatus({ id, status, note });
}

export async function updateRoyaltyLedgerStatus(id: string, status: FinanceLedgerStatus) {
  return updateFinanceLedgerEntryStatus({
    id,
    status,
    metadata: {
      royaltyStatusUpdatedAt: new Date().toISOString()
    }
  });
}

function mapOrderStatusToFinanceStatus(status: DigitalArtOrderStatus): FinanceLedgerStatus {
  if (status === 'settled') return 'settled';
  if (status === 'pending_settlement') return 'pending_payout';
  if (status === 'refunded') return 'refunded';
  if (status === 'disputed') return 'disputed';
  return 'paid';
}

export async function updateMarketplaceOrderSettlement(id: string, status: DigitalArtOrderStatus) {
  const updatedOrder = await updateDigitalArtOrderStatus({ id, status });
  const linkedEntries = await listFinanceLedgerEntriesByOrderId(id);
  const ledgerStatus = mapOrderStatusToFinanceStatus(status);
  const updatedLedgerEntries: FinanceLedgerEntry[] = [];
  for (const entry of linkedEntries) {
    updatedLedgerEntries.push(
      await updateFinanceLedgerEntryStatus({
        id: entry.id,
        status: ledgerStatus,
        metadata: {
          ...(entry.metadata || {}),
          orderSettlementStatus: status,
          orderSettlementUpdatedAt: new Date().toISOString()
        }
      })
    );
  }
  return { order: updatedOrder, ledgerEntries: updatedLedgerEntries };
}

export async function updateSettlementCaseStatus(id: string, status: DigitalArtOrderStatus) {
  const state = await listFinancialServices();
  const settlementCase = state.orderReconciliation.find((entry) => entry.settlementId === id);
  if (!settlementCase) throw new Error('Settlement case not found.');
  if (settlementCase.settlementEntity === 'marketplace-order') {
    return updateMarketplaceOrderSettlement(id, status);
  }
  const ledgerStatus = mapOrderStatusToFinanceStatus(status);
  const updatedLedgerEntries: FinanceLedgerEntry[] = [];
  for (const entryId of settlementCase.linkedLedgerEntryIds) {
    updatedLedgerEntries.push(
      await updateFinanceLedgerEntryStatus({
        id: entryId,
        status: ledgerStatus,
        metadata: {
          settlementCaseId: settlementCase.settlementId,
          settlementCaseStatus: status,
          settlementCaseUpdatedAt: new Date().toISOString()
        }
      })
    );
  }
  return {
    settlementCase: {
      ...settlementCase,
      orderStatus: status,
      saleLedgerStatuses: updatedLedgerEntries.filter((entry) => entry.type === 'sale').map((entry) => entry.status),
      royaltyLedgerStatuses: updatedLedgerEntries.filter((entry) => entry.type === 'royalty').map((entry) => entry.status)
    },
    ledgerEntries: updatedLedgerEntries
  };
}

export function buildFinancialReconciliationReport(rows: FinancialOrderReconciliation[]): FinancialReconciliationReportRow[] {
  const grouped = new Map<string, FinancialReconciliationReportRow>();
  for (const row of rows) {
    const current = grouped.get(row.pillar) || {
      pillar: row.pillar,
      caseCount: 0,
      grossAmount: 0,
      royaltyAmount: 0,
      platformFeeAmount: 0,
      sellerNetAmount: 0,
      pendingCount: 0,
      settledCount: 0,
      disputedCount: 0
    };
    current.caseCount += 1;
    current.grossAmount += row.amountPaid;
    current.royaltyAmount += row.royaltyAmount;
    current.platformFeeAmount += row.platformFeeAmount;
    current.sellerNetAmount += row.sellerNetAmount;
    if (row.orderStatus === 'settled') current.settledCount += 1;
    else if (row.orderStatus === 'disputed') current.disputedCount += 1;
    else current.pendingCount += 1;
    grouped.set(row.pillar, current);
  }
  return Array.from(grouped.values()).sort((left, right) => right.grossAmount - left.grossAmount);
}

export function buildFinancialAuditHistory(data: FinancialServicesDashboard): FinancialAuditHistoryEntry[] {
  const payoutEntries: FinancialAuditHistoryEntry[] = data.payouts.map((entry) => ({
    id: `payout-${entry.id}`,
    entity: 'payout',
    entityId: entry.id,
    pillar: 'platform-finance',
    title: entry.walletAddress,
    status: entry.status,
    actorId: entry.actorId,
    sourceReference: entry.id,
    amount: entry.netAmount,
    currency: 'USD',
    note: 'Instant payout queue update',
    occurredAt: entry.createdAt
  }));

  const withdrawalEntries: FinancialAuditHistoryEntry[] = data.indiWithdrawals.map((entry) => ({
    id: `withdrawal-${entry.id}`,
    entity: 'indi-withdrawal',
    entityId: entry.id,
    pillar: 'platform-finance',
    title: entry.destinationLabel || entry.destinationType,
    status: entry.status,
    actorId: entry.actorId,
    sourceReference: entry.referenceId || entry.id,
    amount: entry.netAmount,
    currency: entry.currency,
    note: entry.note || 'Withdrawal lifecycle update',
    occurredAt: entry.completedAt || entry.updatedAt || entry.requestedAt
  }));

  const royaltyEntries: FinancialAuditHistoryEntry[] = data.royalties.map((entry) => ({
    id: `ledger-${entry.id}`,
    entity: 'royalty',
    entityId: entry.id,
    pillar: entry.pillar,
    title: entry.item,
    status: entry.status,
    actorId: entry.actorId,
    sourceReference:
      String(entry.metadata?.orderId || '') ||
      String(entry.metadata?.receiptId || '') ||
      String(entry.metadata?.bookingId || '') ||
      entry.id,
    amount: entry.creatorNetAmount,
    currency: String(entry.metadata?.currency || 'INDI'),
    note: entry.type === 'royalty' ? 'Royalty ledger update' : 'Sale ledger update',
    occurredAt:
      String(entry.metadata?.settlementCaseUpdatedAt || '') ||
      String(entry.metadata?.orderSettlementUpdatedAt || '') ||
      String(entry.metadata?.royaltyStatusUpdatedAt || '') ||
      entry.createdAt
  }));

  const settlementEntries: FinancialAuditHistoryEntry[] = data.orderReconciliation.map((entry) => ({
    id: `settlement-${entry.settlementEntity}-${entry.settlementId}`,
    entity: entry.settlementEntity,
    entityId: entry.settlementId,
    pillar: entry.pillar,
    title: entry.title,
    status: entry.orderStatus,
    actorId: entry.sellerActorId || entry.creatorActorId,
    sourceReference: entry.sourceReference,
    amount: entry.amountPaid,
    currency: entry.currency,
    note: `${entry.sourceLabel} reconciliation snapshot`,
    occurredAt: entry.createdAt
  }));

  return [...payoutEntries, ...withdrawalEntries, ...royaltyEntries, ...settlementEntries]
    .sort((left, right) => String(right.occurredAt).localeCompare(String(left.occurredAt)))
    .slice(0, 200);
}
