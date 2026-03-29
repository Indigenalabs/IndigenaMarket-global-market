import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

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
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'financial-services.json');

async function ensureDir() { assertRuntimePersistenceAllowed('financial services'); await fs.mkdir(RUNTIME_DIR, { recursive: true }); }
async function readRuntime(): Promise<FinancialServicesDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) return { payouts: [], bnplApplications: [], taxReports: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<FinancialServicesDashboard>;
    return { payouts: Array.isArray(parsed.payouts) ? parsed.payouts : [], bnplApplications: Array.isArray(parsed.bnplApplications) ? parsed.bnplApplications : [], taxReports: Array.isArray(parsed.taxReports) ? parsed.taxReports : [] };
  } catch { return { payouts: [], bnplApplications: [], taxReports: [] }; }
}
async function writeRuntime(data: FinancialServicesDashboard) { await ensureDir(); await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8'); }

export async function listFinancialServices() {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const [payouts, bnplApplications, taxReports] = await Promise.all([
    supabase.from('finance_instant_payout_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('finance_bnpl_applications').select('*').order('created_at', { ascending: false }),
    supabase.from('finance_tax_report_purchases').select('*').order('created_at', { ascending: false })
  ]);
  return {
    payouts: (payouts.data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, walletAddress: row.wallet_address, amount: Number(row.amount || 0), feeAmount: Number(row.fee_amount || 0), netAmount: Number(row.net_amount || 0), status: row.status, createdAt: row.created_at })),
    bnplApplications: (bnplApplications.data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, orderId: row.order_id, amount: Number(row.amount || 0), partner: row.partner, feeAmount: Number(row.fee_amount || 0), status: row.status, createdAt: row.created_at })),
    taxReports: (taxReports.data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, taxYear: Number(row.tax_year || new Date().getUTCFullYear()), feeAmount: Number(row.fee_amount || 25), status: row.status, createdAt: row.created_at }))
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
