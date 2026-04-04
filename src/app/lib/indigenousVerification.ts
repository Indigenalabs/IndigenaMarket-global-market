import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';

export type VerificationType =
  | 'individual_indigenous_seller'
  | 'nation_community_seller'
  | 'elder_cultural_authority'
  | 'partner_institution';

export type VerificationStatus =
  | 'draft'
  | 'pending_review'
  | 'provisional_verified'
  | 'verified_indigenous_seller'
  | 'verified_community'
  | 'verified_elder_authority'
  | 'restricted';

export interface VerificationEvidenceRecord {
  id: string;
  applicationId: string;
  evidenceType: string;
  label: string;
  detail: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface VerificationEndorsementRecord {
  id: string;
  applicationId: string;
  endorserActorId: string;
  endorserName: string;
  endorserRole: string;
  endorsementType: string;
  note: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface VerificationStatusHistoryRecord {
  id: string;
  applicationId: string;
  actorId: string;
  fromStatus: VerificationStatus | '';
  toStatus: VerificationStatus;
  note: string;
  createdAt: string;
}

export interface VerificationApplicationRecord {
  id: string;
  actorId: string;
  walletAddress: string;
  email: string;
  profileSlug: string;
  verificationType: VerificationType;
  status: VerificationStatus;
  applicantDisplayName: string;
  nationName: string;
  communityName: string;
  communitySlug: string;
  statement: string;
  evidenceSummary: string;
  endorsementSummary: string;
  decisionNotes: string;
  metadata: Record<string, unknown>;
  submittedAt: string;
  reviewedAt: string;
  reviewerActorId: string;
  createdAt: string;
  updatedAt: string;
  evidence: VerificationEvidenceRecord[];
  endorsements: VerificationEndorsementRecord[];
}

export interface SellerPermissionRecord {
  id: string;
  actorId: string;
  walletAddress: string;
  email: string;
  verificationApplicationId: string;
  verificationType: VerificationType | '';
  status: VerificationStatus | 'unverified';
  canSell: boolean;
  canReceivePayouts: boolean;
  canLaunchVerifiedCampaigns: boolean;
  canCreateCommunityStorefronts: boolean;
  canPublishSensitiveContent: boolean;
  createdAt: string;
  updatedAt: string;
}

type JsonMap = Record<string, unknown>;

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const APPLICATIONS_FILE = path.join(RUNTIME_DIR, 'verification-applications.json');
const EVIDENCE_FILE = path.join(RUNTIME_DIR, 'verification-evidence.json');
const ENDORSEMENTS_FILE = path.join(RUNTIME_DIR, 'verification-endorsements.json');
const HISTORY_FILE = path.join(RUNTIME_DIR, 'verification-status-history.json');
const PERMISSIONS_FILE = path.join(RUNTIME_DIR, 'seller-permissions.json');

function nowIso() {
  return new Date().toISOString();
}

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('indigenous verification');
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

async function writeRuntimeJson<T>(filePath: string, records: T[]) {
  await ensureRuntimeDir();
  await fs.writeFile(filePath, JSON.stringify(records, null, 2), 'utf8');
}

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asJsonMap(value: unknown): JsonMap {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonMap) : {};
}

function normalizeEvidence(row: JsonMap): VerificationEvidenceRecord {
  return {
    id: asText(row.id),
    applicationId: asText(row.application_id || row.applicationId),
    evidenceType: asText(row.evidence_type || row.evidenceType),
    label: asText(row.label),
    detail: asText(row.detail),
    metadata: asJsonMap(row.metadata),
    createdAt: asText(row.created_at || row.createdAt)
  };
}

function normalizeEndorsement(row: JsonMap): VerificationEndorsementRecord {
  return {
    id: asText(row.id),
    applicationId: asText(row.application_id || row.applicationId),
    endorserActorId: asText(row.endorser_actor_id || row.endorserActorId),
    endorserName: asText(row.endorser_name || row.endorserName),
    endorserRole: asText(row.endorser_role || row.endorserRole),
    endorsementType: asText(row.endorsement_type || row.endorsementType),
    note: asText(row.note),
    metadata: asJsonMap(row.metadata),
    createdAt: asText(row.created_at || row.createdAt)
  };
}

function normalizeHistory(row: JsonMap): VerificationStatusHistoryRecord {
  return {
    id: asText(row.id),
    applicationId: asText(row.application_id || row.applicationId),
    actorId: asText(row.actor_id || row.actorId),
    fromStatus: asText(row.from_status || row.fromStatus) as VerificationStatus | '',
    toStatus: asText(row.to_status || row.toStatus) as VerificationStatus,
    note: asText(row.note),
    createdAt: asText(row.created_at || row.createdAt)
  };
}

function normalizeApplication(row: JsonMap): VerificationApplicationRecord {
  return {
    id: asText(row.id),
    actorId: asText(row.actor_id || row.actorId),
    walletAddress: asText(row.wallet_address || row.walletAddress).toLowerCase(),
    email: asText(row.email).toLowerCase(),
    profileSlug: asText(row.profile_slug || row.profileSlug),
    verificationType: asText(row.verification_type || row.verificationType) as VerificationType,
    status: asText(row.status, 'pending_review') as VerificationStatus,
    applicantDisplayName: asText(row.applicant_display_name || row.applicantDisplayName),
    nationName: asText(row.nation_name || row.nationName),
    communityName: asText(row.community_name || row.communityName),
    communitySlug: asText(row.community_slug || row.communitySlug),
    statement: asText(row.statement),
    evidenceSummary: asText(row.evidence_summary || row.evidenceSummary),
    endorsementSummary: asText(row.endorsement_summary || row.endorsementSummary),
    decisionNotes: asText(row.decision_notes || row.decisionNotes),
    metadata: asJsonMap(row.metadata),
    submittedAt: asText(row.submitted_at || row.submittedAt),
    reviewedAt: asText(row.reviewed_at || row.reviewedAt),
    reviewerActorId: asText(row.reviewer_actor_id || row.reviewerActorId),
    createdAt: asText(row.created_at || row.createdAt),
    updatedAt: asText(row.updated_at || row.updatedAt),
    evidence: Array.isArray(row.evidence) ? (row.evidence as JsonMap[]).map(normalizeEvidence) : [],
    endorsements: Array.isArray(row.endorsements) ? (row.endorsements as JsonMap[]).map(normalizeEndorsement) : []
  };
}

function normalizePermissions(row: JsonMap): SellerPermissionRecord {
  return {
    id: asText(row.id),
    actorId: asText(row.actor_id || row.actorId),
    walletAddress: asText(row.wallet_address || row.walletAddress).toLowerCase(),
    email: asText(row.email).toLowerCase(),
    verificationApplicationId: asText(row.verification_application_id || row.verificationApplicationId),
    verificationType: asText(row.verification_type || row.verificationType) as VerificationType | '',
    status: asText(row.status, 'unverified') as VerificationStatus | 'unverified',
    canSell: Boolean(row.can_sell ?? row.canSell),
    canReceivePayouts: Boolean(row.can_receive_payouts ?? row.canReceivePayouts),
    canLaunchVerifiedCampaigns: Boolean(row.can_launch_verified_campaigns ?? row.canLaunchVerifiedCampaigns),
    canCreateCommunityStorefronts: Boolean(row.can_create_community_storefronts ?? row.canCreateCommunityStorefronts),
    canPublishSensitiveContent: Boolean(row.can_publish_sensitive_content ?? row.canPublishSensitiveContent),
    createdAt: asText(row.created_at || row.createdAt),
    updatedAt: asText(row.updated_at || row.updatedAt)
  };
}

function emptyPermissions(input: { actorId: string; walletAddress?: string; email?: string }): SellerPermissionRecord {
  const now = nowIso();
  return {
    id: `svp-${randomUUID()}`,
    actorId: input.actorId,
    walletAddress: (input.walletAddress || '').toLowerCase(),
    email: (input.email || '').toLowerCase(),
    verificationApplicationId: '',
    verificationType: '',
    status: 'unverified',
    canSell: false,
    canReceivePayouts: false,
    canLaunchVerifiedCampaigns: false,
    canCreateCommunityStorefronts: false,
    canPublishSensitiveContent: false,
    createdAt: now,
    updatedAt: now
  };
}

function buildPermissionsFromApplication(application: VerificationApplicationRecord): SellerPermissionRecord {
  const now = nowIso();
  const base = emptyPermissions({ actorId: application.actorId, walletAddress: application.walletAddress, email: application.email });
  const permissions = {
    canSell: false,
    canReceivePayouts: false,
    canLaunchVerifiedCampaigns: false,
    canCreateCommunityStorefronts: false,
    canPublishSensitiveContent: false
  };

  switch (application.status) {
    case 'provisional_verified':
      permissions.canSell = true;
      permissions.canReceivePayouts = true;
      break;
    case 'verified_indigenous_seller':
      permissions.canSell = true;
      permissions.canReceivePayouts = true;
      permissions.canLaunchVerifiedCampaigns = true;
      break;
    case 'verified_community':
      permissions.canSell = true;
      permissions.canReceivePayouts = true;
      permissions.canLaunchVerifiedCampaigns = true;
      permissions.canCreateCommunityStorefronts = true;
      break;
    case 'verified_elder_authority':
      permissions.canPublishSensitiveContent = true;
      break;
  }

  return {
    ...base,
    verificationApplicationId: application.id,
    verificationType: application.verificationType,
    status: application.status,
    ...permissions,
    updatedAt: now
  };
}

async function readRuntimeApplications() {
  return readRuntimeJson<VerificationApplicationRecord>(APPLICATIONS_FILE);
}

async function readRuntimeEvidence() {
  return readRuntimeJson<VerificationEvidenceRecord>(EVIDENCE_FILE);
}

async function readRuntimeEndorsements() {
  return readRuntimeJson<VerificationEndorsementRecord>(ENDORSEMENTS_FILE);
}

async function readRuntimeHistory() {
  return readRuntimeJson<VerificationStatusHistoryRecord>(HISTORY_FILE);
}

async function readRuntimePermissions() {
  return readRuntimeJson<SellerPermissionRecord>(PERMISSIONS_FILE);
}

function actorMatches(record: { actorId: string; walletAddress: string; email: string }, actorId: string, walletAddress = '', email = '') {
  return record.actorId === actorId || (!!walletAddress && record.walletAddress === walletAddress.toLowerCase()) || (!!email && record.email === email.toLowerCase());
}

async function hydrateRuntimeApplications(records: VerificationApplicationRecord[]) {
  const [evidence, endorsements] = await Promise.all([readRuntimeEvidence(), readRuntimeEndorsements()]);
  return records.map((record) => ({
    ...record,
    evidence: evidence.filter((item) => item.applicationId === record.id),
    endorsements: endorsements.filter((item) => item.applicationId === record.id)
  }));
}

async function hydrateSupabaseApplications(rows: JsonMap[]) {
  const supabase = createSupabaseServerClient();
  const ids = rows.map((row) => asText(row.id)).filter(Boolean);
  if (ids.length === 0) return [];
  const [evidenceResult, endorsementsResult] = await Promise.all([
    supabase.from('verification_evidence').select('*').in('application_id', ids),
    supabase.from('verification_endorsements').select('*').in('application_id', ids)
  ]);
  const evidence = (evidenceResult.data || []).map((row) => normalizeEvidence(row as JsonMap));
  const endorsements = (endorsementsResult.data || []).map((row) => normalizeEndorsement(row as JsonMap));
  return rows.map((row) => {
    const application = normalizeApplication(row);
    return {
      ...application,
      evidence: evidence.filter((item) => item.applicationId === application.id),
      endorsements: endorsements.filter((item) => item.applicationId === application.id)
    };
  });
}

export async function listVerificationApplications(limit = 200) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('verification_applications').select('*').order('created_at', { ascending: false }).limit(limit);
    return hydrateSupabaseApplications((data || []) as JsonMap[]);
  }

  const runtime = await readRuntimeApplications();
  const hydrated = await hydrateRuntimeApplications(runtime);
  return hydrated.slice(0, limit).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listVerificationApplicationsForActor(input: { actorId: string; walletAddress?: string; email?: string; profileSlug?: string }) {
  const actorId = input.actorId.trim();
  const walletAddress = (input.walletAddress || '').trim().toLowerCase();
  const email = (input.email || '').trim().toLowerCase();
  const profileSlug = (input.profileSlug || '').trim();
  const applications = await listVerificationApplications(200);
  return applications.filter((entry) => (!profileSlug || entry.profileSlug === profileSlug) && actorMatches(entry, actorId, walletAddress, email));
}

export async function listVerificationStatusHistory(limit = 400) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('verification_status_history').select('*').order('created_at', { ascending: false }).limit(limit);
    return (data || []).map((row) => normalizeHistory(row as JsonMap));
  }

  const runtime = await readRuntimeHistory();
  return runtime.slice(0, limit).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSellerPermissionsForActor(input: { actorId: string; walletAddress?: string; email?: string }) {
  const actorId = input.actorId.trim();
  const walletAddress = (input.walletAddress || '').trim().toLowerCase();
  const email = (input.email || '').trim().toLowerCase();

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const filters = [actorId && `actor_id.eq.${actorId}`, walletAddress && `wallet_address.eq.${walletAddress}`, email && `email.eq.${email}`].filter(Boolean).join(',');
    if (!filters) return emptyPermissions({ actorId, walletAddress, email });
    const { data } = await supabase.from('seller_permissions').select('*').or(filters).order('updated_at', { ascending: false }).limit(1).maybeSingle();
    return data ? normalizePermissions(data as JsonMap) : emptyPermissions({ actorId, walletAddress, email });
  }

  const runtime = await readRuntimePermissions();
  const match = runtime.find((entry) => actorMatches(entry, actorId, walletAddress, email));
  return match || emptyPermissions({ actorId, walletAddress, email });
}

async function upsertSellerPermissions(input: SellerPermissionRecord) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('seller_permissions').upsert({
      actor_id: input.actorId,
      wallet_address: input.walletAddress || null,
      email: input.email || null,
      verification_application_id: input.verificationApplicationId || null,
      verification_type: input.verificationType || null,
      status: input.status,
      can_sell: input.canSell,
      can_receive_payouts: input.canReceivePayouts,
      can_launch_verified_campaigns: input.canLaunchVerifiedCampaigns,
      can_create_community_storefronts: input.canCreateCommunityStorefronts,
      can_publish_sensitive_content: input.canPublishSensitiveContent,
      updated_at: input.updatedAt
    }, { onConflict: 'actor_id' }).select('*').single();
    if (error) throw error;
    return normalizePermissions(data as JsonMap);
  }

  const runtime = await readRuntimePermissions();
  const existingIndex = runtime.findIndex((entry) => actorMatches(entry, input.actorId, input.walletAddress, input.email));
  const next = existingIndex >= 0 ? { ...runtime[existingIndex], ...input, updatedAt: input.updatedAt || nowIso() } : input;
  if (existingIndex >= 0) runtime[existingIndex] = next; else runtime.unshift(next);
  await writeRuntimeJson(PERMISSIONS_FILE, runtime);
  return next;
}

async function appendStatusHistory(input: { applicationId: string; actorId: string; fromStatus: VerificationStatus | ''; toStatus: VerificationStatus; note: string }) {
  const record: VerificationStatusHistoryRecord = {
    id: `vsh-${randomUUID()}`,
    applicationId: input.applicationId,
    actorId: input.actorId,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    note: input.note,
    createdAt: nowIso()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('verification_status_history').insert({
      id: record.id,
      application_id: record.applicationId,
      actor_id: record.actorId,
      from_status: record.fromStatus || null,
      to_status: record.toStatus,
      note: record.note,
      created_at: record.createdAt
    });
    if (error) throw error;
    return record;
  }

  const runtime = await readRuntimeHistory();
  runtime.unshift(record);
  await writeRuntimeJson(HISTORY_FILE, runtime);
  return record;
}

export async function createVerificationApplication(input: {
  actorId: string;
  walletAddress?: string;
  email?: string;
  profileSlug?: string;
  verificationType: VerificationType;
  applicantDisplayName: string;
  nationName?: string;
  communityName?: string;
  communitySlug?: string;
  statement?: string;
  evidenceSummary?: string;
  endorsementSummary?: string;
  evidence?: Array<{ evidenceType: string; label: string; detail?: string; metadata?: Record<string, unknown> }>;
  endorsements?: Array<{ endorserActorId?: string; endorserName: string; endorserRole: string; endorsementType: string; note?: string; metadata?: Record<string, unknown> }>;
  metadata?: Record<string, unknown>;
}) {
  const now = nowIso();
  const application: VerificationApplicationRecord = {
    id: `vapp-${randomUUID()}`,
    actorId: input.actorId.trim(),
    walletAddress: (input.walletAddress || '').trim().toLowerCase(),
    email: (input.email || '').trim().toLowerCase(),
    profileSlug: (input.profileSlug || '').trim(),
    verificationType: input.verificationType,
    status: 'pending_review',
    applicantDisplayName: input.applicantDisplayName.trim(),
    nationName: (input.nationName || '').trim(),
    communityName: (input.communityName || '').trim(),
    communitySlug: (input.communitySlug || '').trim(),
    statement: (input.statement || '').trim(),
    evidenceSummary: (input.evidenceSummary || '').trim(),
    endorsementSummary: (input.endorsementSummary || '').trim(),
    decisionNotes: '',
    metadata: input.metadata || {},
    submittedAt: now,
    reviewedAt: '',
    reviewerActorId: '',
    createdAt: now,
    updatedAt: now,
    evidence: (input.evidence || []).map((entry) => ({
      id: `vev-${randomUUID()}`,
      applicationId: '',
      evidenceType: entry.evidenceType,
      label: entry.label,
      detail: entry.detail || '',
      metadata: entry.metadata || {},
      createdAt: now
    })),
    endorsements: (input.endorsements || []).map((entry) => ({
      id: `ven-${randomUUID()}`,
      applicationId: '',
      endorserActorId: entry.endorserActorId || '',
      endorserName: entry.endorserName,
      endorserRole: entry.endorserRole,
      endorsementType: entry.endorsementType,
      note: entry.note || '',
      metadata: entry.metadata || {},
      createdAt: now
    }))
  };

  application.evidence = application.evidence.map((entry) => ({ ...entry, applicationId: application.id }));
  application.endorsements = application.endorsements.map((entry) => ({ ...entry, applicationId: application.id }));

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('verification_applications').insert({
      id: application.id,
      actor_id: application.actorId,
      wallet_address: application.walletAddress || null,
      email: application.email || null,
      profile_slug: application.profileSlug || null,
      verification_type: application.verificationType,
      status: application.status,
      applicant_display_name: application.applicantDisplayName,
      nation_name: application.nationName || null,
      community_name: application.communityName || null,
      community_slug: application.communitySlug || null,
      statement: application.statement || null,
      evidence_summary: application.evidenceSummary || null,
      endorsement_summary: application.endorsementSummary || null,
      decision_notes: null,
      metadata: application.metadata,
      submitted_at: application.submittedAt,
      created_at: application.createdAt,
      updated_at: application.updatedAt
    }).select('*').single();
    if (error) throw error;

    if (application.evidence.length > 0) {
      const { error: evidenceError } = await supabase.from('verification_evidence').insert(application.evidence.map((entry) => ({
        id: entry.id,
        application_id: application.id,
        evidence_type: entry.evidenceType,
        label: entry.label,
        detail: entry.detail || null,
        metadata: entry.metadata,
        created_at: entry.createdAt
      })));
      if (evidenceError) throw evidenceError;
    }

    if (application.endorsements.length > 0) {
      const { error: endorsementError } = await supabase.from('verification_endorsements').insert(application.endorsements.map((entry) => ({
        id: entry.id,
        application_id: application.id,
        endorser_actor_id: entry.endorserActorId || null,
        endorser_name: entry.endorserName,
        endorser_role: entry.endorserRole,
        endorsement_type: entry.endorsementType,
        note: entry.note || null,
        metadata: entry.metadata,
        created_at: entry.createdAt
      })));
      if (endorsementError) throw endorsementError;
    }

    const hydrated = (await hydrateSupabaseApplications([data as JsonMap]))[0];
    await appendStatusHistory({ applicationId: hydrated.id, actorId: hydrated.actorId, fromStatus: '', toStatus: hydrated.status, note: 'Verification application submitted' });
    await upsertSellerPermissions(buildPermissionsFromApplication(hydrated));
    return hydrated;
  }

  const runtimeApplications = await readRuntimeApplications();
  runtimeApplications.unshift(application);
  await writeRuntimeJson(APPLICATIONS_FILE, runtimeApplications);

  if (application.evidence.length > 0) {
    const runtimeEvidence = await readRuntimeEvidence();
    runtimeEvidence.unshift(...application.evidence);
    await writeRuntimeJson(EVIDENCE_FILE, runtimeEvidence);
  }

  if (application.endorsements.length > 0) {
    const runtimeEndorsements = await readRuntimeEndorsements();
    runtimeEndorsements.unshift(...application.endorsements);
    await writeRuntimeJson(ENDORSEMENTS_FILE, runtimeEndorsements);
  }

  await appendStatusHistory({ applicationId: application.id, actorId: application.actorId, fromStatus: '', toStatus: application.status, note: 'Verification application submitted' });
  await upsertSellerPermissions(buildPermissionsFromApplication(application));
  return application;
}

export async function updateVerificationApplicationStatus(input: { id: string; status: VerificationStatus; reviewerActorId: string; decisionNotes?: string }) {
  const nextStatus = input.status;
  const decisionNotes = (input.decisionNotes || '').trim();
  const reviewedAt = nowIso();

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data: current, error: currentError } = await supabase.from('verification_applications').select('*').eq('id', input.id).single();
    if (currentError || !current) throw currentError || new Error('Verification application not found');

    const { data, error } = await supabase.from('verification_applications').update({
      status: nextStatus,
      decision_notes: decisionNotes || null,
      reviewer_actor_id: input.reviewerActorId,
      reviewed_at: reviewedAt,
      updated_at: reviewedAt
    }).eq('id', input.id).select('*').single();
    if (error) throw error;

    const hydrated = (await hydrateSupabaseApplications([data as JsonMap]))[0];
    await appendStatusHistory({
      applicationId: hydrated.id,
      actorId: input.reviewerActorId,
      fromStatus: normalizeApplication(current as JsonMap).status,
      toStatus: hydrated.status,
      note: decisionNotes || `Status updated to ${hydrated.status}`
    });
    await upsertSellerPermissions(buildPermissionsFromApplication(hydrated));

    if (hydrated.status === 'verified_indigenous_seller' || hydrated.status === 'verified_community' || hydrated.status === 'verified_elder_authority') {
      await supabase.from('user_profiles').update({
        verification_level:
          hydrated.status === 'verified_indigenous_seller'
            ? 'verified-seller'
            : hydrated.status === 'verified_community'
              ? 'verified-community'
              : 'verified-elder',
        updated_at: reviewedAt
      }).or(`user_uid.eq.${hydrated.actorId},wallet_address.eq.${hydrated.walletAddress},email.eq.${hydrated.email}`);
    }

    return hydrated;
  }

  const runtime = await readRuntimeApplications();
  const index = runtime.findIndex((entry) => entry.id === input.id);
  if (index < 0) throw new Error('Verification application not found');
  const current = runtime[index];
  const updated: VerificationApplicationRecord = { ...current, status: nextStatus, decisionNotes, reviewerActorId: input.reviewerActorId, reviewedAt, updatedAt: reviewedAt };
  runtime[index] = updated;
  await writeRuntimeJson(APPLICATIONS_FILE, runtime);
  await appendStatusHistory({ applicationId: updated.id, actorId: input.reviewerActorId, fromStatus: current.status, toStatus: updated.status, note: decisionNotes || `Status updated to ${updated.status}` });
  await upsertSellerPermissions(buildPermissionsFromApplication(updated));
  return updated;
}


