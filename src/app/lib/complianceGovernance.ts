import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  ElderAuthorityRecord,
  PlatformAccountRecord,
  PlatformAccountVerificationRecord,
  RevenueSplitRuleRecord
} from '@/app/lib/platformAccounts';
import type {
  ChampionSponsorshipDisbursementRecord,
  CommunityTreasuryRecord,
  SplitDistributionRecord,
  TreasuryLedgerEntryRecord
} from '@/app/lib/platformTreasury';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export type ComplianceStatus = 'pending' | 'approved' | 'rejected';
export type FinancialServiceType = 'instant-payout' | 'bnpl' | 'tax-report';

export interface ComplianceProfileRecord {
  id: string;
  actorId: string;
  walletAddress: string;
  kycStatus: ComplianceStatus;
  amlStatus: ComplianceStatus;
  payoutEnabled: boolean;
  bnplEnabled: boolean;
  taxReportingEnabled: boolean;
  reviewedBy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataUseConsentRecord {
  id: string;
  actorId: string;
  buyerName: string;
  buyerEmail: string;
  usagePurpose: string;
  scopes: string[];
  status: ComplianceStatus;
  reference: string;
  reviewedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GovernanceAuditEventRecord {
  id: string;
  actorId: string;
  domain: 'financial-services' | 'data-insights' | 'governance';
  action: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface GovernanceDashboard {
  complianceProfiles: ComplianceProfileRecord[];
  dataUseConsents: DataUseConsentRecord[];
  auditEvents: GovernanceAuditEventRecord[];
  platformAccounts: PlatformAccountRecord[];
  platformAccountVerifications: PlatformAccountVerificationRecord[];
  elderAuthorities: ElderAuthorityRecord[];
  revenueSplitRules: RevenueSplitRuleRecord[];
  treasuries: CommunityTreasuryRecord[];
  treasuryLedger: TreasuryLedgerEntryRecord[];
  splitDistributions: SplitDistributionRecord[];
  championDisbursements: ChampionSponsorshipDisbursementRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'governance-controls.json');

async function ensureDir() {
  assertRuntimePersistenceAllowed('governance controls');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<GovernanceDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) {
    return { complianceProfiles: [], dataUseConsents: [], auditEvents: [], platformAccounts: [], platformAccountVerifications: [], elderAuthorities: [], revenueSplitRules: [], treasuries: [], treasuryLedger: [], splitDistributions: [], championDisbursements: [] };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<GovernanceDashboard>;
    return {
      complianceProfiles: Array.isArray(parsed.complianceProfiles) ? parsed.complianceProfiles as ComplianceProfileRecord[] : [],
      dataUseConsents: Array.isArray(parsed.dataUseConsents) ? parsed.dataUseConsents as DataUseConsentRecord[] : [],
      auditEvents: Array.isArray(parsed.auditEvents) ? parsed.auditEvents as GovernanceAuditEventRecord[] : [],
      platformAccounts: Array.isArray(parsed.platformAccounts) ? parsed.platformAccounts as PlatformAccountRecord[] : [],
      platformAccountVerifications: Array.isArray(parsed.platformAccountVerifications) ? parsed.platformAccountVerifications as PlatformAccountVerificationRecord[] : [],
      elderAuthorities: Array.isArray(parsed.elderAuthorities) ? parsed.elderAuthorities as ElderAuthorityRecord[] : [],
      revenueSplitRules: Array.isArray(parsed.revenueSplitRules) ? parsed.revenueSplitRules as RevenueSplitRuleRecord[] : [],
      treasuries: Array.isArray(parsed.treasuries) ? parsed.treasuries as CommunityTreasuryRecord[] : [],
      treasuryLedger: Array.isArray(parsed.treasuryLedger) ? parsed.treasuryLedger as TreasuryLedgerEntryRecord[] : [],
      splitDistributions: Array.isArray(parsed.splitDistributions) ? parsed.splitDistributions as SplitDistributionRecord[] : [],
      championDisbursements: Array.isArray(parsed.championDisbursements) ? parsed.championDisbursements as ChampionSponsorshipDisbursementRecord[] : []
    };
  } catch {
    return { complianceProfiles: [], dataUseConsents: [], auditEvents: [], platformAccounts: [], platformAccountVerifications: [], elderAuthorities: [], revenueSplitRules: [], treasuries: [], treasuryLedger: [], splitDistributions: [], championDisbursements: [] };
  }
}

async function writeRuntime(data: GovernanceDashboard) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

function complianceFromRow(row: Record<string, unknown>): ComplianceProfileRecord {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    walletAddress: String(row.wallet_address || ''),
    kycStatus: String(row.kyc_status || 'pending') as ComplianceStatus,
    amlStatus: String(row.aml_status || 'pending') as ComplianceStatus,
    payoutEnabled: Boolean(row.payout_enabled),
    bnplEnabled: Boolean(row.bnpl_enabled),
    taxReportingEnabled: Boolean(row.tax_reporting_enabled),
    reviewedBy: String(row.reviewed_by || ''),
    notes: String(row.notes || ''),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

function consentFromRow(row: Record<string, unknown>): DataUseConsentRecord {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    buyerName: String(row.buyer_name || ''),
    buyerEmail: String(row.buyer_email || ''),
    usagePurpose: String(row.usage_purpose || ''),
    scopes: Array.isArray(row.scopes) ? row.scopes.map(String) : [],
    status: String(row.status || 'pending') as ComplianceStatus,
    reference: String(row.reference || ''),
    reviewedBy: String(row.reviewed_by || ''),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

function auditFromRow(row: Record<string, unknown>): GovernanceAuditEventRecord {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    domain: String(row.domain || 'governance') as GovernanceAuditEventRecord['domain'],
    action: String(row.action || ''),
    targetId: String(row.target_id || ''),
    metadata: typeof row.metadata === 'object' && row.metadata ? row.metadata as Record<string, unknown> : {},
    createdAt: String(row.created_at || '')
  };
}

export async function listGovernanceDashboard(): Promise<GovernanceDashboard> {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const [profiles, consents, audit] = await Promise.all([
    supabase.from('governance_compliance_profiles').select('*').order('updated_at', { ascending: false }),
    supabase.from('governance_data_use_consents').select('*').order('updated_at', { ascending: false }),
    supabase.from('governance_audit_events').select('*').order('created_at', { ascending: false }).limit(200)
  ]);
  return {
    complianceProfiles: (profiles.data || []).map((row: any) => complianceFromRow(row)),
    dataUseConsents: (consents.data || []).map((row: any) => consentFromRow(row)),
    auditEvents: (audit.data || []).map((row: any) => auditFromRow(row)),
    platformAccounts: [],
    platformAccountVerifications: [],
    elderAuthorities: [],
    revenueSplitRules: [],
    treasuries: [],
    treasuryLedger: [],
    splitDistributions: [],
    championDisbursements: []
  };
}

export async function getComplianceProfile(actorId: string, walletAddress = ''): Promise<ComplianceProfileRecord | null> {
  const dashboard = await listGovernanceDashboard();
  return dashboard.complianceProfiles.find((entry) => entry.actorId === actorId || (!!walletAddress && entry.walletAddress === walletAddress)) || null;
}

export async function upsertComplianceProfile(input: {
  actorId: string;
  walletAddress?: string;
  kycStatus?: ComplianceStatus;
  amlStatus?: ComplianceStatus;
  payoutEnabled?: boolean;
  bnplEnabled?: boolean;
  taxReportingEnabled?: boolean;
  reviewedBy?: string;
  notes?: string;
}) {
  const now = new Date().toISOString();
  const current = await getComplianceProfile(input.actorId, input.walletAddress || '');
  const record: ComplianceProfileRecord = {
    id: current?.id || `gcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorId: input.actorId,
    walletAddress: input.walletAddress || current?.walletAddress || '',
    kycStatus: input.kycStatus || current?.kycStatus || 'pending',
    amlStatus: input.amlStatus || current?.amlStatus || 'pending',
    payoutEnabled: input.payoutEnabled ?? current?.payoutEnabled ?? false,
    bnplEnabled: input.bnplEnabled ?? current?.bnplEnabled ?? false,
    taxReportingEnabled: input.taxReportingEnabled ?? current?.taxReportingEnabled ?? false,
    reviewedBy: input.reviewedBy || current?.reviewedBy || '',
    notes: input.notes ?? current?.notes ?? '',
    createdAt: current?.createdAt || now,
    updatedAt: now
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('governance_compliance_profiles').upsert({
      id: record.id,
      actor_id: record.actorId,
      wallet_address: record.walletAddress || null,
      kyc_status: record.kycStatus,
      aml_status: record.amlStatus,
      payout_enabled: record.payoutEnabled,
      bnpl_enabled: record.bnplEnabled,
      tax_reporting_enabled: record.taxReportingEnabled,
      reviewed_by: record.reviewedBy || null,
      notes: record.notes,
      created_at: record.createdAt,
      updated_at: record.updatedAt
    });
    return record;
  }
  const runtime = await readRuntime();
  const idx = runtime.complianceProfiles.findIndex((entry) => entry.actorId === record.actorId || (!!record.walletAddress && entry.walletAddress === record.walletAddress));
  if (idx >= 0) runtime.complianceProfiles[idx] = record; else runtime.complianceProfiles.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function createDataUseConsent(input: {
  actorId: string;
  buyerName: string;
  buyerEmail: string;
  usagePurpose: string;
  scopes: string[];
  reference?: string;
}) {
  const now = new Date().toISOString();
  const record: DataUseConsentRecord = {
    id: `duc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorId: input.actorId,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    usagePurpose: input.usagePurpose,
    scopes: input.scopes,
    status: 'pending',
    reference: input.reference || '',
    reviewedBy: '',
    createdAt: now,
    updatedAt: now
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('governance_data_use_consents').insert({
      id: record.id,
      actor_id: record.actorId,
      buyer_name: record.buyerName,
      buyer_email: record.buyerEmail,
      usage_purpose: record.usagePurpose,
      scopes: record.scopes,
      status: record.status,
      reference: record.reference,
      reviewed_by: null,
      created_at: record.createdAt,
      updated_at: record.updatedAt
    });
    return record;
  }
  const runtime = await readRuntime();
  runtime.dataUseConsents.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function updateDataUseConsent(input: { id: string; status: ComplianceStatus; reviewedBy?: string; reference?: string; }) {
  const dashboard = await listGovernanceDashboard();
  const current = dashboard.dataUseConsents.find((entry) => entry.id === input.id);
  if (!current) throw new Error('Data-use consent not found.');
  const updated: DataUseConsentRecord = { ...current, status: input.status, reviewedBy: input.reviewedBy || current.reviewedBy, reference: input.reference ?? current.reference, updatedAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('governance_data_use_consents').update({ status: updated.status, reviewed_by: updated.reviewedBy || null, reference: updated.reference || null, updated_at: updated.updatedAt }).eq('id', input.id);
    return updated;
  }
  const runtime = await readRuntime();
  runtime.dataUseConsents = runtime.dataUseConsents.map((entry) => entry.id === input.id ? updated : entry);
  await writeRuntime(runtime);
  return updated;
}

export async function recordGovernanceAuditEvent(input: {
  actorId: string;
  domain: GovernanceAuditEventRecord['domain'];
  action: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  const record: GovernanceAuditEventRecord = {
    id: `gae-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorId: input.actorId,
    domain: input.domain,
    action: input.action,
    targetId: input.targetId,
    metadata: input.metadata || {},
    createdAt: new Date().toISOString()
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('governance_audit_events').insert({
      id: record.id,
      actor_id: record.actorId,
      domain: record.domain,
      action: record.action,
      target_id: record.targetId,
      metadata: record.metadata,
      created_at: record.createdAt
    });
    return record;
  }
  const runtime = await readRuntime();
  runtime.auditEvents.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function ensureFinancialServiceAccess(input: { actorId: string; walletAddress?: string; service: FinancialServiceType; }) {
  let profile = await getComplianceProfile(input.actorId, input.walletAddress || '');
  if (!profile) {
    profile = await upsertComplianceProfile({
      actorId: input.actorId,
      walletAddress: input.walletAddress || '',
      kycStatus: 'pending',
      amlStatus: 'pending',
      payoutEnabled: false,
      bnplEnabled: false,
      taxReportingEnabled: false,
      notes: `Auto-created from ${input.service} request.`
    });
    await recordGovernanceAuditEvent({
      actorId: input.actorId,
      domain: 'governance',
      action: 'compliance-profile-created-from-service-request',
      targetId: profile.id,
      metadata: { service: input.service }
    });
    throw new Error('Compliance review is required before using financial services. Your review record has been created.');
  }
  if (profile.kycStatus !== 'approved') throw new Error('KYC approval is required before using financial services.');
  if (profile.amlStatus !== 'approved') throw new Error('AML review is required before using financial services.');
  if (input.service === 'instant-payout' && !profile.payoutEnabled) throw new Error('Instant payouts are not enabled for this account.');
  if (input.service === 'bnpl' && !profile.bnplEnabled) throw new Error('BNPL access is not enabled for this account.');
  if (input.service === 'tax-report' && !profile.taxReportingEnabled) throw new Error('Tax reporting access is not enabled for this account.');
  return profile;
}
