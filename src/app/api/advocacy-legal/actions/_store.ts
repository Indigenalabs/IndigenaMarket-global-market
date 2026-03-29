import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type AdvocacyCaseIntake = {
  id: string;
  communityName: string;
  contactEmail: string;
  issueSummary: string;
  jurisdiction?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  actorId: string;
};

export type AdvocacyProBonoRequest = {
  id: string;
  caseName: string;
  jurisdiction: string;
  details: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  actorId: string;
};

export type AdvocacyAlertSubscription = {
  id: string;
  email: string;
  mobile?: string;
  topics: string[];
  channels: Array<'email' | 'sms'>;
  createdAt: string;
  actorId: string;
};

export type AdvocacyDonation = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  donorName: string;
  paymentIntentId?: string;
  paymentState?: 'intent_created' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
  processorEventId?: string;
  processorFailureReason?: string;
  reconciledAt?: string;
  receiptId?: string;
  currency?: string;
  status?: 'requires_confirmation' | 'succeeded' | 'refund_requested' | 'refunded' | 'cancelled';
  refundReason?: string;
  refundRequestedAt?: string;
  refundReviewedAt?: string;
  refundReviewedBy?: string;
  refundReviewNotes?: string;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedReviewerAt?: string;
  updatedAt?: string;
  createdAt: string;
  actorId: string;
};

export type AdvocacyDonationReceipt = {
  id: string;
  donationId: string;
  paymentIntentId: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  currency: string;
  donorName: string;
  paymentStatus: 'succeeded' | 'refunded' | 'cancelled';
  receiptUrl?: string;
  refundReviewStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  updatedAt?: string;
  createdAt: string;
  actorId: string;
};

export type AdvocacyConsultationRequest = {
  id: string;
  attorneyId: string;
  attorneyName: string;
  type: 'consultation' | 'pro-bono-review';
  caseSummary: string;
  contactEmail: string;
  createdAt: string;
  actorId: string;
};

export type AdvocacyPolicyAction = {
  id: string;
  billId: string;
  title: string;
  actionType: 'letter' | 'petition' | 'hearing-rsvp';
  actorName: string;
  createdAt: string;
  actorId: string;
};

export type AdvocacyAuditEvent = {
  id: string;
  event: string;
  actorId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
};

export type AdvocacyOperationalEvent = {
  id: string;
  eventType: string;
  severity: 'info' | 'warning' | 'critical';
  source: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  status: string;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AdvocacyPaymentWebhookEvent = {
  id: string;
  processorEventId?: string;
  paymentIntentId: string;
  paymentState: string;
  verificationStatus: string;
  processingOutcome: string;
  errorMessage?: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type AdvocacyIcipRegistryEntry = {
  id: string;
  registryNumber: string;
  claimTitle: string;
  communityName: string;
  claimantName: string;
  contactEmail: string;
  assetType: 'design' | 'symbol' | 'story' | 'song' | 'language' | 'ceremony' | 'artifact' | 'other';
  rightsScope: 'ownership' | 'licensing' | 'misuse-report' | 'attribution' | 'protocol-protection';
  protocolVisibility: 'public' | 'restricted' | 'sacred';
  protocolSummary: string;
  licensingTerms?: string;
  infringementSummary?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  publicListingState: 'private' | 'public_summary';
  publicTitle?: string;
  publicSummary?: string;
  publicProtocolNotice?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedReviewerAt?: string;
  createdAt: string;
  updatedAt: string;
  actorId: string;
};

export type AdvocacyIcipEvidence = {
  id: string;
  entryId: string;
  label: string;
  evidenceType: 'document' | 'audio' | 'video' | 'image' | 'hash' | 'link' | 'statement';
  fileUrl?: string;
  contentHash?: string;
  description?: string;
  createdAt: string;
  actorId: string;
};

export type AdvocacyIcipActivity = {
  id: string;
  entryId: string;
  activityType: 'claim_submitted' | 'review_status_changed' | 'public_visibility_updated' | 'assignment_updated' | 'comment';
  actorId: string;
  actorLabel: string;
  title: string;
  body?: string;
  createdAt: string;
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const store = {
  caseIntakes: [] as AdvocacyCaseIntake[],
  proBonoRequests: [] as AdvocacyProBonoRequest[],
  alertSubscriptions: [] as AdvocacyAlertSubscription[],
  donations: [] as AdvocacyDonation[],
  donationReceipts: [] as AdvocacyDonationReceipt[],
  consultations: [] as AdvocacyConsultationRequest[],
  policyActions: [] as AdvocacyPolicyAction[],
  icipRegistryEntries: [] as AdvocacyIcipRegistryEntry[],
  icipEvidence: [] as AdvocacyIcipEvidence[],
  icipActivity: [] as AdvocacyIcipActivity[],
  auditTrail: [] as AdvocacyAuditEvent[],
  operationalEvents: [] as AdvocacyOperationalEvent[],
  paymentWebhookEvents: [] as AdvocacyPaymentWebhookEvent[]
};

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'advocacy-actions.json');
let loadPromise: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

type PersistedShape = typeof store;

function hydrateFromObject(data: Partial<PersistedShape>) {
  store.caseIntakes = Array.isArray(data.caseIntakes) ? data.caseIntakes : [];
  store.proBonoRequests = Array.isArray(data.proBonoRequests) ? data.proBonoRequests : [];
  store.alertSubscriptions = Array.isArray(data.alertSubscriptions) ? data.alertSubscriptions : [];
  store.donations = Array.isArray(data.donations) ? data.donations : [];
  store.donationReceipts = Array.isArray(data.donationReceipts) ? data.donationReceipts : [];
  store.consultations = Array.isArray(data.consultations) ? data.consultations : [];
  store.policyActions = Array.isArray(data.policyActions) ? data.policyActions : [];
  store.icipRegistryEntries = Array.isArray(data.icipRegistryEntries) ? data.icipRegistryEntries : [];
  store.icipEvidence = Array.isArray(data.icipEvidence) ? data.icipEvidence : [];
  store.icipActivity = Array.isArray(data.icipActivity) ? data.icipActivity : [];
  store.auditTrail = Array.isArray(data.auditTrail) ? data.auditTrail : [];
  store.operationalEvents = Array.isArray(data.operationalEvents) ? data.operationalEvents : [];
  store.paymentWebhookEvents = Array.isArray(data.paymentWebhookEvents) ? data.paymentWebhookEvents : [];
}

export async function loadStore() {
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        await mkdir(DATA_DIR, { recursive: true });
        const raw = await readFile(DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw) as Partial<PersistedShape>;
        hydrateFromObject(parsed);
      } catch {
        // no-op: starts with empty store when file does not exist or invalid
      }
    })();
  }
  await loadPromise;
}

export function persistStore() {
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(DATA_FILE, JSON.stringify(store), 'utf8');
    });
  return writeQueue;
}

export function pushAudit(event: string, actorId: string, metadata: Record<string, unknown>) {
  const row: AdvocacyAuditEvent = {
    id: uid('audit'),
    event,
    actorId,
    timestamp: new Date().toISOString(),
    metadata
  };
  store.auditTrail = [row, ...store.auditTrail].slice(0, 2000);
  return row;
}

export function pushOperationalEvent(event: Omit<AdvocacyOperationalEvent, 'id' | 'createdAt'>) {
  const row: AdvocacyOperationalEvent = {
    id: uid('ops'),
    createdAt: new Date().toISOString(),
    ...event
  };
  store.operationalEvents = [row, ...store.operationalEvents].slice(0, 2000);
  return row;
}

export function pushPaymentWebhookEvent(event: Omit<AdvocacyPaymentWebhookEvent, 'id' | 'createdAt'>) {
  const row: AdvocacyPaymentWebhookEvent = {
    id: uid('webhook'),
    createdAt: new Date().toISOString(),
    ...event
  };
  store.paymentWebhookEvents = [row, ...store.paymentWebhookEvents].slice(0, 1000);
  return row;
}

export function snapshot() {
  const totalContributed = store.donations.reduce((sum, row) => sum + row.amount, 0);
  return {
    totalContributed,
    campaignsSupported: new Set(store.donations.map((row) => row.campaignId)).size,
    actionAlertsCompleted: store.policyActions.length,
    activeAlertSubscriptions: store.alertSubscriptions.length,
    consultationRequests: store.consultations.length,
    caseIntakes: store.caseIntakes.length,
    proBonoRequests: store.proBonoRequests.length,
    recentDonations: store.donations.slice(0, 6),
    recentDonationReceipts: store.donationReceipts.slice(0, 6),
    recentActions: store.policyActions.slice(0, 6),
    recentCaseIntakes: store.caseIntakes.slice(0, 6),
    recentConsultations: store.consultations.slice(0, 6),
    auditTrail: store.auditTrail.slice(0, 20),
    operationalEvents: store.operationalEvents.slice(0, 12),
    paymentWebhookEvents: store.paymentWebhookEvents.slice(0, 12)
  };
}

export function newId(prefix: string) {
  return uid(prefix);
}
