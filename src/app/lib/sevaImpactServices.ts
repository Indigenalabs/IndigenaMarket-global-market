import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface SevaImpactProjectAdminRecord {
  id: string;
  requestId: string;
  projectId: string;
  serviceFeeRate: number;
  serviceFeeAmount: number;
  fundsManaged: number;
  donorCount: number;
  donorRetentionRate: number;
  status: 'active' | 'reporting' | 'closed';
  createdAt: string;
}

export interface SevaCorporateMatchRecord {
  id: string;
  companyName: string;
  projectId: string;
  committedAmount: number;
  matchedAmount: number;
  adminFeeRate: number;
  adminFeeAmount: number;
  status: 'proposed' | 'active' | 'completed';
  createdAt: string;
}

export interface SevaImpactReportRecord {
  id: string;
  clientName: string;
  projectId: string;
  contractAmount: number;
  status: 'requested' | 'in_progress' | 'delivered';
  createdAt: string;
}

export interface SevaDonorToolRecord {
  id: string;
  actorId: string;
  projectId: string;
  toolType: 'recurring-donation' | 'impact-digest' | 'matching-campaign';
  status: 'active' | 'paused';
  createdAt: string;
}

export interface SevaImpactDashboard {
  projectAdmin: SevaImpactProjectAdminRecord[];
  corporateMatches: SevaCorporateMatchRecord[];
  impactReports: SevaImpactReportRecord[];
  donorTools: SevaDonorToolRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'seva-impact-services.json');
async function ensureDir() { assertRuntimePersistenceAllowed('seva impact services'); await fs.mkdir(RUNTIME_DIR, { recursive: true }); }
async function readRuntime(): Promise<SevaImpactDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) return { projectAdmin: [], corporateMatches: [], impactReports: [], donorTools: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<SevaImpactDashboard>;
    return { projectAdmin: Array.isArray(parsed.projectAdmin) ? parsed.projectAdmin : [], corporateMatches: Array.isArray(parsed.corporateMatches) ? parsed.corporateMatches : [], impactReports: Array.isArray(parsed.impactReports) ? parsed.impactReports : [], donorTools: Array.isArray(parsed.donorTools) ? parsed.donorTools : [] };
  } catch { return { projectAdmin: [], corporateMatches: [], impactReports: [], donorTools: [] }; }
}
async function writeRuntime(data: SevaImpactDashboard) { await ensureDir(); await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8'); }

export async function listSevaImpactServices() {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const [projectAdmin, corporateMatches, impactReports, donorTools] = await Promise.all([
    supabase.from('seva_impact_project_admin').select('*').order('created_at', { ascending: false }),
    supabase.from('seva_corporate_matches').select('*').order('created_at', { ascending: false }),
    supabase.from('seva_impact_reports').select('*').order('created_at', { ascending: false }),
    supabase.from('seva_donor_tools').select('*').order('created_at', { ascending: false })
  ]);
  return {
    projectAdmin: (projectAdmin.data || []).map((row: any) => ({ id: row.id, requestId: row.request_id, projectId: row.project_id, serviceFeeRate: Number(row.service_fee_rate || 0.1), serviceFeeAmount: Number(row.service_fee_amount || 0), fundsManaged: Number(row.funds_managed || 0), donorCount: Number(row.donor_count || 0), donorRetentionRate: Number(row.donor_retention_rate || 0), status: row.status, createdAt: row.created_at })),
    corporateMatches: (corporateMatches.data || []).map((row: any) => ({ id: row.id, companyName: row.company_name, projectId: row.project_id, committedAmount: Number(row.committed_amount || 0), matchedAmount: Number(row.matched_amount || 0), adminFeeRate: Number(row.admin_fee_rate || 0.05), adminFeeAmount: Number(row.admin_fee_amount || 0), status: row.status, createdAt: row.created_at })),
    impactReports: (impactReports.data || []).map((row: any) => ({ id: row.id, clientName: row.client_name, projectId: row.project_id, contractAmount: Number(row.contract_amount || 5000), status: row.status, createdAt: row.created_at })),
    donorTools: (donorTools.data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, projectId: row.project_id, toolType: row.tool_type, status: row.status, createdAt: row.created_at }))
  };
}

export async function createSevaProjectAdmin(input: { requestId: string; projectId: string; fundsManaged: number; donorCount?: number; }) {
  const serviceFeeRate = 0.1;
  const record: SevaImpactProjectAdminRecord = { id: `sadm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, requestId: input.requestId, projectId: input.projectId, serviceFeeRate, serviceFeeAmount: Math.round(Number(input.fundsManaged || 0) * serviceFeeRate * 100) / 100, fundsManaged: Number(input.fundsManaged || 0), donorCount: Number(input.donorCount || 0), donorRetentionRate: 0.62, status: 'active', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) { const supabase = createSupabaseServerClient(); await supabase.from('seva_impact_project_admin').insert({ id: record.id, request_id: record.requestId, project_id: record.projectId, service_fee_rate: record.serviceFeeRate, service_fee_amount: record.serviceFeeAmount, funds_managed: record.fundsManaged, donor_count: record.donorCount, donor_retention_rate: record.donorRetentionRate, status: record.status, created_at: record.createdAt }); return record; }
  const state = await readRuntime(); state.projectAdmin.unshift(record); await writeRuntime(state); return record;
}

export async function createSevaCorporateMatch(input: { companyName: string; projectId: string; committedAmount: number; matchedAmount?: number; }) {
  const adminFeeRate = 0.05;
  const matchedAmount = Number(input.matchedAmount || 0);
  const record: SevaCorporateMatchRecord = { id: `smatch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, companyName: input.companyName, projectId: input.projectId, committedAmount: Number(input.committedAmount || 0), matchedAmount, adminFeeRate, adminFeeAmount: Math.round(Number(input.committedAmount || 0) * adminFeeRate * 100) / 100, status: 'proposed', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) { const supabase = createSupabaseServerClient(); await supabase.from('seva_corporate_matches').insert({ id: record.id, company_name: record.companyName, project_id: record.projectId, committed_amount: record.committedAmount, matched_amount: record.matchedAmount, admin_fee_rate: record.adminFeeRate, admin_fee_amount: record.adminFeeAmount, status: record.status, created_at: record.createdAt }); return record; }
  const state = await readRuntime(); state.corporateMatches.unshift(record); await writeRuntime(state); return record;
}

export async function createSevaImpactReport(input: { clientName: string; projectId: string; contractAmount?: number; }) {
  const record: SevaImpactReportRecord = { id: `sreport-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, clientName: input.clientName, projectId: input.projectId, contractAmount: Number(input.contractAmount || 5000), status: 'requested', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) { const supabase = createSupabaseServerClient(); await supabase.from('seva_impact_reports').insert({ id: record.id, client_name: record.clientName, project_id: record.projectId, contract_amount: record.contractAmount, status: record.status, created_at: record.createdAt }); return record; }
  const state = await readRuntime(); state.impactReports.unshift(record); await writeRuntime(state); return record;
}

export async function createSevaDonorTool(input: { actorId: string; projectId: string; toolType: SevaDonorToolRecord['toolType']; }) {
  const record: SevaDonorToolRecord = { id: `stool-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, actorId: input.actorId, projectId: input.projectId, toolType: input.toolType, status: 'active', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) { const supabase = createSupabaseServerClient(); await supabase.from('seva_donor_tools').insert({ id: record.id, actor_id: record.actorId, project_id: record.projectId, tool_type: record.toolType, status: record.status, created_at: record.createdAt }); return record; }
  const state = await readRuntime(); state.donorTools.unshift(record); await writeRuntime(state); return record;
}
