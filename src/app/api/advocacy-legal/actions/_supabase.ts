import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type DbRow = Record<string, unknown>;

let client: SupabaseClient | null = null;

function getClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRole) return null;
  client = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return client;
}

export function isSupabaseConfigured() {
  return Boolean(getClient());
}

async function insertOne(table: string, row: DbRow) {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).insert(row).select('*').single();
  if (error) throw error;
  return data as DbRow;
}

async function updateMany(table: string, values: DbRow, filters: Record<string, unknown>) {
  const supabase = getClient();
  if (!supabase) return null;
  let query = supabase.from(table).update(values);
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query.select('*');
  if (error) throw error;
  return (data ?? []) as DbRow[];
}

async function listRecent(table: string, limit = 6) {
  const supabase = getClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as DbRow[];
}

async function listRecentForActor(table: string, actorId: string, limit = 6) {
  const supabase = getClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('actor_id', actorId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DbRow[];
}

async function listFiltered(table: string, filters: Record<string, unknown>, limit = 24, orderColumn = 'updated_at') {
  const supabase = getClient();
  if (!supabase) return [];
  let query = supabase.from(table).select('*').limit(limit).order(orderColumn, { ascending: false });
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DbRow[];
}

async function countRows(table: string) {
  const supabase = getClient();
  if (!supabase) return 0;
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) throw error;
  return Number(count || 0);
}

async function countRowsForActor(table: string, actorId: string) {
  const supabase = getClient();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('actor_id', actorId);
  if (error) throw error;
  return Number(count || 0);
}

export async function insertSupabaseAction(action: string, row: DbRow) {
  const tableByAction: Record<string, string> = {
    'case-intake': 'adv_case_intakes',
    'pro-bono-request': 'adv_pro_bono_requests',
    'alert-subscription': 'adv_alert_subscriptions',
    'donation-intent': 'adv_donations',
    donation: 'adv_donations',
    'donation-confirmation': 'adv_donations',
    'donation-receipt': 'adv_donation_receipts',
    'icip-registry-entry': 'adv_icip_registry_entries',
    'icip-registry-evidence': 'adv_icip_registry_evidence',
    'icip-registry-activity': 'adv_icip_registry_activity',
    'consultation-request': 'adv_consultation_requests',
    'policy-action': 'adv_policy_actions',
    audit: 'adv_audit_events'
  };
  const table = tableByAction[action];
  if (!table) throw new Error(`Unsupported action '${action}'`);
  return insertOne(table, row);
}

export async function insertSupabaseOperationalEvent(row: DbRow) {
  return insertOne('adv_operational_events', row);
}

export async function insertSupabasePaymentWebhookEvent(row: DbRow) {
  return insertOne('adv_payment_webhook_events', row);
}

export async function getSupabaseIcipActivity(entryId: string, limit = 40) {
  const rows = await listFiltered('adv_icip_registry_activity', { entry_id: entryId }, limit, 'created_at');
  return rows
    .map((row) => ({
      id: String(row.id || ''),
      entryId: String(row.entry_id || ''),
      activityType: String(row.activity_type || 'comment'),
      actorId: String(row.actor_id || ''),
      actorLabel: String(row.actor_label || row.actor_id || 'Protected contributor'),
      title: String(row.title || ''),
      body: String(row.body || ''),
      createdAt: String(row.created_at || '')
    }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function mapDonation(row: DbRow) {
  return {
    id: String(row.id || ''),
    campaignId: String(row.campaign_id || ''),
    campaignTitle: String(row.campaign_title || ''),
    amount: Number(row.amount || 0),
    donorName: String(row.donor_name || 'Supporter'),
    paymentIntentId: String(row.payment_intent_id || ''),
    paymentState: String(row.payment_state || 'succeeded'),
    processorEventId: String(row.processor_event_id || ''),
    processorFailureReason: String(row.processor_failure_reason || ''),
    reconciledAt: String(row.reconciled_at || ''),
    receiptId: String(row.receipt_id || ''),
    currency: String(row.currency || 'USD'),
    status: String(row.status || 'succeeded'),
    refundReason: String(row.refund_reason || ''),
    refundRequestedAt: String(row.refund_requested_at || ''),
    refundReviewedAt: String(row.refund_reviewed_at || ''),
    refundReviewedBy: String(row.refund_reviewed_by || ''),
    refundReviewNotes: String(row.refund_review_notes || ''),
    assignedReviewerId: String(row.assigned_reviewer_id || ''),
    assignedReviewerName: String(row.assigned_reviewer_name || ''),
    assignedReviewerAt: String(row.assigned_reviewer_at || ''),
    createdAt: String(row.created_at || '')
  };
}

function mapDonationReceipt(row: DbRow) {
  return {
    id: String(row.id || ''),
    donationId: String(row.donation_id || ''),
    paymentIntentId: String(row.payment_intent_id || ''),
    campaignId: String(row.campaign_id || ''),
    campaignTitle: String(row.campaign_title || ''),
    amount: Number(row.amount || 0),
    currency: String(row.currency || 'USD'),
    donorName: String(row.donor_name || 'Supporter'),
    paymentStatus: String(row.payment_status || 'succeeded'),
    receiptUrl: String(row.receipt_url || ''),
    refundReviewStatus: String(row.refund_review_status || 'none'),
    createdAt: String(row.created_at || '')
  };
}

function mapPolicyAction(row: DbRow) {
  return {
    id: String(row.id || ''),
    billId: String(row.bill_id || ''),
    title: String(row.title || ''),
    actionType: String(row.action_type || ''),
    actorName: String(row.actor_name || 'Community Member'),
    createdAt: String(row.created_at || '')
  };
}

function mapCaseIntake(row: DbRow) {
  return {
    id: String(row.id || ''),
    communityName: String(row.community_name || ''),
    urgency: String(row.urgency || 'high'),
    createdAt: String(row.created_at || '')
  };
}

function mapConsultation(row: DbRow) {
  return {
    id: String(row.id || ''),
    attorneyId: String(row.attorney_id || ''),
    attorneyName: String(row.attorney_name || ''),
    type: String(row.type || 'consultation'),
    createdAt: String(row.created_at || '')
  };
}

function mapAudit(row: DbRow) {
  return {
    id: String(row.id || ''),
    event: String(row.event || ''),
    actorId: String(row.actor_id || ''),
    timestamp: String(row.timestamp || row.created_at || ''),
    metadata: (row.metadata || {}) as Record<string, unknown>
  };
}

export async function getSupabaseSnapshot(actorId: string) {
  const supabase = getClient();
  if (!supabase) return null;

  const [
    totalContributedRows,
    campaignsSupportedRows,
    actionAlertsCompleted,
    activeAlertSubscriptions,
    consultationRequests,
    caseIntakes,
    proBonoRequests,
    recentDonations,
    recentDonationReceipts,
    recentActions,
    recentCaseIntakes,
    recentConsultations,
    auditTrail
  ] = await Promise.all([
    listRecentForActor('adv_donations', actorId, 2000),
    listRecentForActor('adv_donations', actorId, 2000),
    countRowsForActor('adv_policy_actions', actorId),
    countRowsForActor('adv_alert_subscriptions', actorId),
    countRowsForActor('adv_consultation_requests', actorId),
    countRowsForActor('adv_case_intakes', actorId),
    countRowsForActor('adv_pro_bono_requests', actorId),
    listRecentForActor('adv_donations', actorId, 6),
    listRecentForActor('adv_donation_receipts', actorId, 6),
    listRecentForActor('adv_policy_actions', actorId, 6),
    listRecentForActor('adv_case_intakes', actorId, 6),
    listRecentForActor('adv_consultation_requests', actorId, 6),
    listRecentForActor('adv_audit_events', actorId, 20)
  ]);

  const settledDonations = totalContributedRows.filter((row) => String(row.status || 'succeeded') === 'succeeded');
  const totalContributed = settledDonations.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const campaignsSupported = new Set(
    campaignsSupportedRows
      .filter((row) => String(row.status || 'succeeded') === 'succeeded')
      .map((row) => String(row.campaign_id || ''))
  ).size;

  return {
    totalContributed,
    campaignsSupported,
    actionAlertsCompleted,
    activeAlertSubscriptions,
    consultationRequests,
    caseIntakes,
    proBonoRequests,
    recentDonations: recentDonations.map(mapDonation),
    recentDonationReceipts: recentDonationReceipts.map(mapDonationReceipt),
    recentActions: recentActions.map(mapPolicyAction),
    recentCaseIntakes: recentCaseIntakes.map(mapCaseIntake),
    recentConsultations: recentConsultations.map(mapConsultation),
    auditTrail: auditTrail.map(mapAudit)
  };
}

export async function getSupabaseAudit(limit = 100) {
  const rows = await listRecent('adv_audit_events', limit);
  return rows.map(mapAudit);
}

export async function getSupabaseOperationalEvents(limit = 40) {
  const rows = await listRecent('adv_operational_events', limit);
  return rows.map((row) => ({
    id: String(row.id || ''),
    eventType: String(row.event_type || ''),
    severity: String(row.severity || 'info'),
    source: String(row.source || 'system'),
    actorId: String(row.actor_id || ''),
    entityType: String(row.entity_type || ''),
    entityId: String(row.entity_id || ''),
    status: String(row.status || 'recorded'),
    message: String(row.message || ''),
    metadata: (row.metadata || {}) as Record<string, unknown>,
    createdAt: String(row.created_at || '')
  }));
}

export async function getSupabasePaymentWebhookEvents(limit = 40) {
  const rows = await listRecent('adv_payment_webhook_events', limit);
  return rows.map((row) => ({
    id: String(row.id || ''),
    processorEventId: String(row.processor_event_id || ''),
    paymentIntentId: String(row.payment_intent_id || ''),
    paymentState: String(row.payment_state || ''),
    verificationStatus: String(row.verification_status || ''),
    processingOutcome: String(row.processing_outcome || ''),
    errorMessage: String(row.error_message || ''),
    payload: (row.payload || {}) as Record<string, unknown>,
    createdAt: String(row.created_at || '')
  }));
}

export async function getSupabaseIcipRegistry(params?: { actorId?: string; status?: string; limit?: number }) {
  const filters: Record<string, unknown> = {};
  if (params?.actorId) filters.actor_id = params.actorId;
  if (params?.status) filters.status = params.status;
  const rows = await listFiltered('adv_icip_registry_entries', filters, params?.limit ?? 24);
  return rows.map((row) => ({
    id: String(row.id || ''),
    registryNumber: String(row.registry_number || ''),
    claimTitle: String(row.claim_title || ''),
    communityName: String(row.community_name || ''),
    claimantName: String(row.claimant_name || ''),
    contactEmail: String(row.contact_email || ''),
    assetType: String(row.asset_type || 'other'),
    rightsScope: String(row.rights_scope || 'ownership'),
    protocolVisibility: String(row.protocol_visibility || 'restricted'),
    protocolSummary: String(row.protocol_summary || ''),
    licensingTerms: String(row.licensing_terms || ''),
    infringementSummary: String(row.infringement_summary || ''),
    status: String(row.status || 'submitted'),
    publicListingState: String(row.public_listing_state || 'private'),
    publicTitle: String(row.public_title || ''),
    publicSummary: String(row.public_summary || ''),
    publicProtocolNotice: String(row.public_protocol_notice || ''),
    reviewNotes: String(row.review_notes || ''),
    reviewedAt: String(row.reviewed_at || ''),
    reviewedBy: String(row.reviewed_by || ''),
    assignedReviewerId: String(row.assigned_reviewer_id || ''),
    assignedReviewerName: String(row.assigned_reviewer_name || ''),
    assignedReviewerAt: String(row.assigned_reviewer_at || ''),
    actorId: String(row.actor_id || ''),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || row.created_at || '')
  }));
}

export async function updateSupabaseIcipVisibility(params: {
  entryId: string;
  actorId?: string;
  publicListingState: 'private' | 'public_summary';
  publicTitle?: string;
  publicSummary?: string;
  publicProtocolNotice?: string;
}) {
  const updates: DbRow = {
    public_listing_state: params.publicListingState,
    public_title: params.publicTitle || null,
    public_summary: params.publicSummary || null,
    public_protocol_notice: params.publicProtocolNotice || null,
    public_updated_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const filters: Record<string, unknown> = { id: params.entryId };
  if (params.actorId) filters.actor_id = params.actorId;
  const rows = await updateMany('adv_icip_registry_entries', updates, filters);
  return (rows && rows[0]) ? rows[0] : null;
}

export async function getSupabasePublicIcipNotices(limit = 24) {
  const supabase = getClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('adv_icip_registry_entries')
    .select('*')
    .eq('status', 'approved')
    .eq('public_listing_state', 'public_summary')
    .not('public_summary', 'is', null)
    .order('public_updated_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: DbRow) => ({
    id: String(row.id || ''),
    registryNumber: String(row.registry_number || ''),
    claimTitle: String(row.public_title || row.claim_title || ''),
    communityName: String(row.community_name || ''),
    assetType: String(row.asset_type || 'other'),
    rightsScope: String(row.rights_scope || 'ownership'),
    protocolVisibility: String(row.protocol_visibility || 'restricted'),
    publicSummary: String(row.public_summary || ''),
    publicProtocolNotice: String(row.public_protocol_notice || ''),
    updatedAt: String(row.public_updated_at || row.updated_at || row.created_at || '')
  }));
}

export async function getSupabasePublicIcipNoticeById(id: string) {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('adv_icip_registry_entries')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .eq('public_listing_state', 'public_summary')
    .not('public_summary', 'is', null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: String(data.id || ''),
    registryNumber: String(data.registry_number || ''),
    claimTitle: String(data.public_title || data.claim_title || ''),
    communityName: String(data.community_name || ''),
    assetType: String(data.asset_type || 'other'),
    rightsScope: String(data.rights_scope || 'ownership'),
    protocolVisibility: String(data.protocol_visibility || 'restricted'),
    publicSummary: String(data.public_summary || ''),
    publicProtocolNotice: String(data.public_protocol_notice || ''),
    updatedAt: String(data.public_updated_at || data.updated_at || data.created_at || '')
  };
}

export async function getSupabaseIcipEvidence(entryId: string) {
  const rows = await listFiltered('adv_icip_registry_evidence', { entry_id: entryId }, 20, 'created_at');
  return rows.map((row) => ({
    id: String(row.id || ''),
    entryId: String(row.entry_id || ''),
    label: String(row.label || ''),
    evidenceType: String(row.evidence_type || 'document'),
    fileUrl: String(row.file_url || ''),
    contentHash: String(row.content_hash || ''),
    description: String(row.description || ''),
    createdAt: String(row.created_at || '')
  }));
}

export async function findSupabaseDonationByProcessorEvent(eventId: string) {
  const supabase = getClient();
  if (!supabase || !eventId.trim()) return null;
  const { data, error } = await supabase
    .from('adv_donations')
    .select('*')
    .eq('processor_event_id', eventId)
    .maybeSingle();
  if (error) throw error;
  return data as DbRow | null;
}

export async function updateSupabaseDonationState(params: {
  donationId: string;
  actorId: string;
  status: 'refund_requested' | 'refunded' | 'cancelled' | 'succeeded';
  receiptId?: string;
  refundReason?: string;
  refundReviewStatus?: 'pending' | 'approved' | 'rejected' | 'none';
  refundReviewedBy?: string;
  refundReviewNotes?: string;
}) {
  const now = new Date().toISOString();
  const donations = await updateMany(
    'adv_donations',
    {
      status: params.status,
      updated_at: now,
      reconciled_at: now,
      refund_reason: params.refundReason ?? null,
      refund_requested_at: params.status === 'refund_requested' ? now : undefined,
      refund_reviewed_at: params.refundReviewStatus && params.refundReviewStatus !== 'pending' && params.refundReviewStatus !== 'none' ? now : undefined,
      refund_reviewed_by: params.refundReviewedBy ?? undefined,
      refund_review_notes: params.refundReviewNotes ?? undefined
    },
    { id: params.donationId, actor_id: params.actorId }
  );
  if (params.receiptId) {
    await updateMany(
      'adv_donation_receipts',
      {
        payment_status: params.status === 'refund_requested' ? 'succeeded' : params.status,
        refund_review_status: params.refundReviewStatus ?? (params.status === 'refund_requested' ? 'pending' : 'none'),
        updated_at: now
      },
      { id: params.receiptId, actor_id: params.actorId }
    );
  }
  return (donations && donations[0]) ? donations[0] : null;
}

export async function reconcileSupabaseDonationByIntent(params: {
  paymentIntentId: string;
  paymentState: 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
  processorEventId?: string;
  processorFailureReason?: string;
}) {
  const now = new Date().toISOString();
  const updates: DbRow = {
    payment_state: params.paymentState,
    processor_event_id: params.processorEventId ?? null,
    processor_failure_reason: params.processorFailureReason ?? null,
    reconciled_at: now,
    updated_at: now
  };
  if (params.paymentState === 'failed') updates.status = 'cancelled';
  if (params.paymentState === 'refunded') updates.status = 'refunded';
  if (params.paymentState === 'cancelled') updates.status = 'cancelled';

  const rows = await updateMany('adv_donations', updates, {
    payment_intent_id: params.paymentIntentId
  });

  const donation = rows?.[0] || null;
  if (donation && donation.receipt_id) {
    const receiptState =
      params.paymentState === 'refunded'
        ? 'refunded'
        : params.paymentState === 'cancelled' || params.paymentState === 'failed'
          ? 'cancelled'
          : 'succeeded';
    await updateMany(
      'adv_donation_receipts',
      {
        payment_status: receiptState,
        updated_at: now
      },
      { id: donation.receipt_id }
    );
  }

  return donation;
}
