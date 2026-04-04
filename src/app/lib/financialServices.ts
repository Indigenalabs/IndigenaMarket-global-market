import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import { listIndiWithdrawalRequests, updateIndiWithdrawalRequestStatus, type IndiWithdrawalRequest, type IndiWithdrawalStatus } from '@/app/lib/indiWithdrawalRequests';
import { listFinanceLedgerEntriesByOrderId, updateFinanceLedgerEntryStatus, type FinanceLedgerEntry, type FinanceLedgerStatus } from '@/app/lib/financeLedger';
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

export interface FinancialOrderReconciliation {
  orderId: string;
  listingId: string;
  title: string;
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
  createdAt: string;
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
  return input.orders.map((order) => {
    const linkedLedger = input.royalties.filter((entry) => String(entry.metadata?.orderId || '').trim() === order.id);
    const linkedWithdrawals = input.withdrawals.filter((entry) => [order.sellerActorId, order.creatorActorId].includes(entry.actorId));
    return {
      orderId: order.id,
      listingId: order.listingId,
      title: order.title,
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
      createdAt: order.createdAt
    } satisfies FinancialOrderReconciliation;
  });
}

export async function listFinancialServices() {
  if (!isSupabaseServerConfigured()) return readRuntime();
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
    : await listIndiWithdrawalRequests({ actorId: '', profileSlug: '' });
  const mappedRoyalties = !royalties.error && royalties.data
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
    : [];
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
    : await listDigitalArtOrders({ includeAll: true });
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
  const updatedLedgerEntries = await Promise.all(
    linkedEntries.map((entry) =>
      updateFinanceLedgerEntryStatus({
        id: entry.id,
        status: ledgerStatus,
        metadata: {
          ...(entry.metadata || {}),
          orderSettlementStatus: status,
          orderSettlementUpdatedAt: new Date().toISOString()
        }
      })
    )
  );
  return { order: updatedOrder, ledgerEntries: updatedLedgerEntries };
}
