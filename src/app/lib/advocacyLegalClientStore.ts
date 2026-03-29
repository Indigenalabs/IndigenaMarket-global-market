import { isGlobalMockFallbackEnabled } from '@/app/lib/mockMode';
import { getStoredWalletAddress } from '@/app/lib/walletStorage';

﻿export type AdvocacyCaseIntake = {
  id: string;
  communityName: string;
  contactEmail: string;
  issueSummary: string;
  jurisdiction?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
};

export type AdvocacyProBonoRequest = {
  id: string;
  caseName: string;
  jurisdiction: string;
  details: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
};

export type AdvocacyAlertSubscription = {
  id: string;
  email: string;
  mobile?: string;
  topics: string[];
  channels: Array<'email' | 'sms'>;
  createdAt: string;
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
};

export type AdvocacyConsultationRequest = {
  id: string;
  attorneyId: string;
  attorneyName: string;
  type: 'consultation' | 'pro-bono-review';
  caseSummary: string;
  contactEmail: string;
  createdAt: string;
};

export type AdvocacyPolicyAction = {
  id: string;
  billId: string;
  title: string;
  actionType: 'letter' | 'petition' | 'hearing-rsvp';
  actorName: string;
  createdAt: string;
};

export type AdvocacyRefundReview = {
  donationId: string;
  receiptId?: string;
  refundReviewStatus: 'pending' | 'approved' | 'rejected';
  refundReason?: string;
  reviewNotes?: string;
  updatedAt: string;
};

export type AdvocacyRefundHistoryItem = {
  donationId: string;
  receiptId?: string;
  donorName: string;
  campaignTitle: string;
  amount: number;
  currency: string;
  refundReason?: string;
  refundReviewStatus: 'approved' | 'rejected';
  refundReviewedBy?: string;
  reviewNotes?: string;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedReviewerAt?: string;
  updatedAt: string;
};

export type AdvocacyDonationReconciliation = {
  donationId: string;
  campaignTitle: string;
  donorName: string;
  amount: number;
  currency: string;
  paymentIntentId?: string;
  paymentState: 'intent_created' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
  processorFailureReason?: string;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedReviewerAt?: string;
  updatedAt: string;
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

export type AdvocacyIcipClaim = {
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
  actorId?: string;
  createdAt: string;
  updatedAt: string;
  evidence?: AdvocacyIcipEvidence[];
  activity?: AdvocacyIcipActivity[];
};

export type AdvocacyPublicIcipNotice = {
  id: string;
  registryNumber: string;
  claimTitle: string;
  communityName: string;
  assetType: AdvocacyIcipClaim['assetType'];
  rightsScope: AdvocacyIcipClaim['rightsScope'];
  protocolVisibility: AdvocacyIcipClaim['protocolVisibility'];
  publicSummary: string;
  publicProtocolNotice?: string;
  updatedAt: string;
};

type DashboardSnapshot = {
  totalContributed: number;
  campaignsSupported: number;
  actionAlertsCompleted: number;
  activeAlertSubscriptions: number;
  consultationRequests: number;
  caseIntakes: number;
  proBonoRequests: number;
  recentDonations: AdvocacyDonation[];
  recentDonationReceipts: AdvocacyDonationReceipt[];
  recentActions: AdvocacyPolicyAction[];
};

const KEYS = {
  caseIntakes: 'indigena_adv_case_intakes',
  proBono: 'indigena_adv_probono_requests',
  alerts: 'indigena_adv_alert_subscriptions',
  donations: 'indigena_adv_donations',
  donationReceipts: 'indigena_adv_donation_receipts',
  icipClaims: 'indigena_adv_icip_claims',
  consultations: 'indigena_adv_consultation_requests',
  policyActions: 'indigena_adv_policy_actions'
} as const;

const API_ENDPOINT = '/api/advocacy-legal/actions';
const PUBLIC_ENDPOINT = '/api/advocacy-legal/public/overview';
const ALLOW_LOCAL_FALLBACK = isGlobalMockFallbackEnabled();

function browserSafe() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function actorId() {
  if (!browserSafe()) return 'guest';
  const wallet = getStoredWalletAddress();
  const userId = window.localStorage.getItem('indigena_user_id') || '';
  return (wallet || userId || 'guest').trim() || 'guest';
}

function authHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-actor-id': actorId()
  };

  if (!browserSafe()) return headers;
  const wallet = getStoredWalletAddress();
  const jwt = (window.localStorage.getItem('indigena_user_jwt') || '').trim();
  const adminSigned = (window.localStorage.getItem('indigena_admin_signed') || '').trim().toLowerCase() === 'true';
  if (wallet) headers['x-wallet-address'] = wallet;
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  if (adminSigned) headers['x-admin-signed'] = 'true';
  return headers;
}

function hasSignedAdvocacyIdentity() {
  if (!browserSafe()) return false;
  const wallet = getStoredWalletAddress();
  const jwt = (window.localStorage.getItem('indigena_user_jwt') || '').trim();
  const adminSigned = (window.localStorage.getItem('indigena_admin_signed') || '').trim().toLowerCase() === 'true';
  return Boolean(wallet || jwt || adminSigned);
}

async function postAction<T>(action: string, payload: Record<string, unknown>) {
  if (!browserSafe()) throw new Error('Advocacy actions require a browser session.');
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ action, ...payload })
  });
  if (!res.ok) {
    let message = 'Advocacy action failed';
    try {
      const json = (await res.json()) as { message?: string };
      if (json?.message) message = json.message;
    } catch {
      // fall through with default message
    }
    throw new Error(message);
  }
  const json = (await res.json()) as { data?: T };
  if (!json?.data) throw new Error('Advocacy action returned no data.');
  return json.data;
}

function readList<T>(key: string): T[] {
  if (!browserSafe()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]) {
  if (!browserSafe()) return;
  window.localStorage.setItem(key, JSON.stringify(list));
}

function addItem<T extends { id: string; createdAt: string }>(key: string, item: T, limit = 200): T {
  const current = readList<T>(key);
  const next = [item, ...current.filter((x) => x.id !== item.id)].slice(0, limit);
  writeList(key, next);
  return item;
}

function updateItem<T extends { id: string }>(key: string, id: string, patch: Partial<T>) {
  const current = readList<T>(key);
  const next = current.map((item) => (item.id === id ? { ...item, ...patch } : item));
  writeList(key, next);
  return next.find((item) => item.id === id) || null;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function countsTowardSupporterTotals(status?: AdvocacyDonation['status']) {
  return status === 'succeeded' || status === 'refund_requested';
}

export async function submitCaseIntake(input: Omit<AdvocacyCaseIntake, 'id' | 'createdAt'>): Promise<AdvocacyCaseIntake> {
  try {
    const row = await postAction<AdvocacyCaseIntake>('case-intake', input as Record<string, unknown>);
    return addItem(KEYS.caseIntakes, row);
  } catch (error) {
    if (!ALLOW_LOCAL_FALLBACK) throw error;
    return addItem(KEYS.caseIntakes, {
      ...input,
      id: uid('case'),
      createdAt: new Date().toISOString()
    });
  }
}

export async function submitProBonoRequest(input: Omit<AdvocacyProBonoRequest, 'id' | 'createdAt'>): Promise<AdvocacyProBonoRequest> {
  try {
    const row = await postAction<AdvocacyProBonoRequest>('pro-bono-request', input as Record<string, unknown>);
    return addItem(KEYS.proBono, row);
  } catch (error) {
    if (!ALLOW_LOCAL_FALLBACK) throw error;
    return addItem(KEYS.proBono, {
      ...input,
      id: uid('probono'),
      createdAt: new Date().toISOString()
    });
  }
}

export async function subscribeRapidAlerts(input: Omit<AdvocacyAlertSubscription, 'id' | 'createdAt'>): Promise<AdvocacyAlertSubscription> {
  try {
    const row = await postAction<AdvocacyAlertSubscription>('alert-subscription', input as Record<string, unknown>);
    return addItem(KEYS.alerts, row);
  } catch (error) {
    if (!ALLOW_LOCAL_FALLBACK) throw error;
    return addItem(KEYS.alerts, {
      ...input,
      id: uid('alert'),
      createdAt: new Date().toISOString()
    });
  }
}

export async function donateToCampaign(input: Omit<AdvocacyDonation, 'id' | 'createdAt'>): Promise<AdvocacyDonation> {
  try {
    const intent = await postAction<AdvocacyDonation>('donation-intent', input as Record<string, unknown>);
    const confirmation = await postAction<AdvocacyDonation & { receipt?: AdvocacyDonationReceipt }>('donation-confirmation', {
      ...input,
      paymentIntentId: intent.paymentIntentId
    });
    const saved = addItem(KEYS.donations, confirmation);
    if (confirmation.receipt) addItem(KEYS.donationReceipts, confirmation.receipt);
    return saved;
  } catch (error) {
    if (!ALLOW_LOCAL_FALLBACK) throw error;
    const createdAt = new Date().toISOString();
    const donationId = uid('donation');
    const paymentIntentId = uid('intent');
    const receiptId = uid('receipt');
    addItem(KEYS.donationReceipts, {
      id: receiptId,
      donationId,
      paymentIntentId,
      campaignId: input.campaignId,
      campaignTitle: input.campaignTitle,
      amount: input.amount,
      currency: input.currency || 'USD',
      donorName: input.donorName,
      paymentStatus: 'succeeded',
      receiptUrl: `/advocacy-legal/dashboard/my-advocacy/receipt/${receiptId}`,
      refundReviewStatus: 'none',
      createdAt
    });
    return addItem(KEYS.donations, {
      ...input,
      id: donationId,
      paymentIntentId,
      paymentState: 'succeeded' as const,
      receiptId,
      currency: input.currency || 'USD',
      status: 'succeeded' as const,
      createdAt
    });
  }
}

export async function requestConsultation(input: Omit<AdvocacyConsultationRequest, 'id' | 'createdAt'>): Promise<AdvocacyConsultationRequest> {
  try {
    const row = await postAction<AdvocacyConsultationRequest>('consultation-request', input as Record<string, unknown>);
    return addItem(KEYS.consultations, row);
  } catch (error) {
    if (!ALLOW_LOCAL_FALLBACK) throw error;
    return addItem(KEYS.consultations, {
      ...input,
      id: uid('consult'),
      createdAt: new Date().toISOString()
    });
  }
}

export async function recordPolicyAction(input: Omit<AdvocacyPolicyAction, 'id' | 'createdAt'>): Promise<AdvocacyPolicyAction> {
  try {
    const row = await postAction<AdvocacyPolicyAction>('policy-action', input as Record<string, unknown>);
    return addItem(KEYS.policyActions, row);
  } catch (error) {
    if (!ALLOW_LOCAL_FALLBACK) throw error;
    return addItem(KEYS.policyActions, {
      ...input,
      id: uid('action'),
      createdAt: new Date().toISOString()
    });
  }
}

export function getDashboardSnapshot(): DashboardSnapshot {
  const donations = readList<AdvocacyDonation>(KEYS.donations);
  const policyActions = readList<AdvocacyPolicyAction>(KEYS.policyActions);
  const alerts = readList<AdvocacyAlertSubscription>(KEYS.alerts);
  const consultations = readList<AdvocacyConsultationRequest>(KEYS.consultations);
  const caseIntakes = readList<AdvocacyCaseIntake>(KEYS.caseIntakes);
  const proBonoRequests = readList<AdvocacyProBonoRequest>(KEYS.proBono);

  return {
    totalContributed: donations.filter((row) => countsTowardSupporterTotals(row.status)).reduce((sum, row) => sum + row.amount, 0),
    campaignsSupported: new Set(donations.filter((row) => countsTowardSupporterTotals(row.status)).map((row) => row.campaignId)).size,
    actionAlertsCompleted: policyActions.length,
    activeAlertSubscriptions: alerts.length,
    consultationRequests: consultations.length,
    caseIntakes: caseIntakes.length,
    proBonoRequests: proBonoRequests.length,
    recentDonations: donations.filter((row) => row.status !== 'requires_confirmation').slice(0, 6),
    recentDonationReceipts: readList<AdvocacyDonationReceipt>(KEYS.donationReceipts).slice(0, 6),
    recentActions: policyActions.slice(0, 6)
  };
}

export function getAdvocacyReceiptRecord(receiptId: string) {
  const receipts = readList<AdvocacyDonationReceipt>(KEYS.donationReceipts);
  const donations = readList<AdvocacyDonation>(KEYS.donations);
  const receipt = receipts.find((item) => item.id === receiptId) || null;
  if (!receipt) return null;
  const donation = donations.find((item) => item.id === receipt.donationId) || null;
  return { receipt, donation };
}

export function getCommunityDashboardSnapshot() {
  const cases = readList<AdvocacyCaseIntake>(KEYS.caseIntakes);
  const alerts = readList<AdvocacyAlertSubscription>(KEYS.alerts);
  const proBono = readList<AdvocacyProBonoRequest>(KEYS.proBono);
  return {
    openCases: cases.length,
    alertMembers: alerts.length,
    activeCampaignRequests: proBono.length,
    latestCases: cases.slice(0, 5)
  };
}

export function getLegalProfessionalSnapshot() {
  const consultations = readList<AdvocacyConsultationRequest>(KEYS.consultations);
  const proBono = readList<AdvocacyProBonoRequest>(KEYS.proBono);
  const cases = readList<AdvocacyCaseIntake>(KEYS.caseIntakes);
  const donations = readList<AdvocacyDonation>(KEYS.donations);
  return {
    openMatters: cases.length + consultations.length,
    pendingConsultRequests: consultations.length,
    proBonoQueue: proBono.length,
    recentConsultations: consultations.slice(0, 6),
    refundRequests: donations
      .filter((row) => row.status === 'refund_requested')
      .slice(0, 6)
      .map((row) => ({
        donationId: row.id,
        receiptId: row.receiptId,
        donorName: row.donorName,
        campaignTitle: row.campaignTitle,
        amount: row.amount,
        currency: row.currency || 'USD',
        refundReason: row.refundReason || '',
        assignedReviewerId: row.assignedReviewerId || '',
        assignedReviewerName: row.assignedReviewerName || '',
        assignedReviewerAt: row.assignedReviewerAt || '',
        updatedAt: row.updatedAt || row.createdAt
      })),
    refundHistory: donations
      .filter((row) => Boolean(row.refundReviewedAt))
      .slice(0, 12)
      .map((row) => ({
        donationId: row.id,
        receiptId: row.receiptId,
        donorName: row.donorName,
        campaignTitle: row.campaignTitle,
        amount: row.amount,
        currency: row.currency || 'USD',
        refundReason: row.refundReason || '',
        refundReviewStatus: row.status === 'refunded' ? 'approved' : 'rejected',
        refundReviewedBy: row.refundReviewedBy || '',
        reviewNotes: row.refundReviewNotes || '',
        assignedReviewerId: row.assignedReviewerId || '',
        assignedReviewerName: row.assignedReviewerName || '',
        assignedReviewerAt: row.assignedReviewerAt || '',
        updatedAt: row.refundReviewedAt || row.updatedAt || row.createdAt
      })),
    reconciliationQueue: donations
      .filter((row) => Boolean(row.paymentState) && !['succeeded', 'refunded', 'cancelled'].includes(row.paymentState || ''))
      .slice(0, 12)
      .map((row) => ({
        donationId: row.id,
        campaignTitle: row.campaignTitle,
        donorName: row.donorName,
        amount: row.amount,
        currency: row.currency || 'USD',
        paymentIntentId: row.paymentIntentId,
        paymentState: (row.paymentState || 'intent_created') as AdvocacyDonationReconciliation['paymentState'],
        processorFailureReason: row.processorFailureReason || '',
        assignedReviewerId: row.assignedReviewerId || '',
        assignedReviewerName: row.assignedReviewerName || '',
        assignedReviewerAt: row.assignedReviewerAt || '',
        updatedAt: row.updatedAt || row.createdAt
      })),
    icipReviewQueue: readList<AdvocacyIcipClaim>(KEYS.icipClaims)
      .filter((row) => ['submitted', 'under_review'].includes(row.status))
      .slice(0, 12)
  };
}

export async function fetchAdvocacyServerSnapshot() {
  if (!browserSafe() || !hasSignedAdvocacyIdentity()) return null;
  try {
    const res = await fetch(`${API_ENDPOINT}?kind=snapshot`, { method: 'GET', headers: authHeaders() });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchAdvocacyPublicData() {
  try {
    const res = await fetch(PUBLIC_ENDPOINT, { method: 'GET' });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchAdvocacyCommunityDashboard() {
  try {
    const res = await fetch('/api/advocacy-legal/ops/community-dashboard', { method: 'GET', headers: authHeaders() });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchAdvocacyLegalDashboard() {
  try {
    const res = await fetch('/api/advocacy-legal/ops/legal-dashboard', { method: 'GET', headers: authHeaders() });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchAdvocacyClinicSlots() {
  try {
    const res = await fetch('/api/advocacy-legal/ops/clinic-slots', { method: 'GET' });
    if (!res.ok) return null;
    const json = (await res.json()) as { items?: unknown };
    return json.items ?? null;
  } catch {
    return null;
  }
}

export async function fetchAdvocacyIcipRegistry() {
  try {
    const res = await fetch('/api/advocacy-legal/ops/icip-registry', { method: 'GET', headers: authHeaders() });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchAdvocacyIcipClaim(claimId: string) {
  if (!browserSafe() || !hasSignedAdvocacyIdentity()) return null;
  try {
    const res = await fetch(`/api/advocacy-legal/ops/icip-registry/${claimId}`, { method: 'GET', headers: authHeaders() });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchAdvocacyPublicIcipNotices() {
  try {
    const res = await fetch('/api/advocacy-legal/public/icip-notices', { method: 'GET' });
    if (!res.ok) return [];
    const json = (await res.json()) as { items?: AdvocacyPublicIcipNotice[] };
    return Array.isArray(json.items) ? json.items : [];
  } catch {
    return [];
  }
}

export async function fetchAdvocacyPublicIcipNotice(noticeId: string) {
  try {
    const res = await fetch(`/api/advocacy-legal/public/icip-notices/${noticeId}`, { method: 'GET' });
    if (!res.ok) return null;
    const json = (await res.json()) as { item?: AdvocacyPublicIcipNotice };
    return json.item ?? null;
  } catch {
    return null;
  }
}

export async function fetchAdvocacyAuditCenter() {
  try {
    const res = await fetch('/api/advocacy-legal/ops/audit-center', { method: 'GET', headers: authHeaders() });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: unknown };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function uploadAdvocacyIcipEvidence(file: File) {
  const form = new FormData();
  form.append('file', file);
  const headers = authHeaders();
  delete headers['Content-Type'];
  const res = await fetch('/api/advocacy-legal/uploads/icip-evidence', {
    method: 'POST',
    headers,
    body: form
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(json.message || 'Failed to upload evidence');
  }
  const json = (await res.json()) as {
    data?: { fileName: string; filePath: string; fileUrl: string; contentType: string; size: number };
  };
  return json.data ?? null;
}

export function readAdvocacyAdminState() {
  if (!browserSafe()) return { wallet: '', adminSigned: false };
  return {
    wallet:
      window.localStorage.getItem('indigena_admin_wallet') ||
      window.localStorage.getItem('indigena_wallet_address') ||
      '',
    adminSigned: (window.localStorage.getItem('indigena_admin_signed') || '').trim().toLowerCase() === 'true'
  };
}

export function saveAdvocacyAdminState(wallet: string, adminSigned: boolean) {
  if (!browserSafe()) return;
  if (wallet.trim()) {
    window.localStorage.setItem('indigena_admin_wallet', wallet.trim());
    window.localStorage.setItem('indigena_wallet_address', wallet.trim());
  }
  window.localStorage.setItem('indigena_admin_signed', adminSigned ? 'true' : 'false');
}

export async function refundAdvocacyDonation(input: {
  donationId: string;
  receiptId?: string;
  refundReason?: string;
}) {
  const response = await postAction<{ id: string; status: 'refund_requested'; updatedAt: string }>('donation-refund', input as Record<string, unknown>);
  updateItem<AdvocacyDonation>(KEYS.donations, input.donationId, {
    status: 'refund_requested',
    updatedAt: response.updatedAt
  });
  if (input.receiptId) {
    updateItem<AdvocacyDonationReceipt>(KEYS.donationReceipts, input.receiptId, {
      refundReviewStatus: 'pending',
      updatedAt: response.updatedAt
    });
  }
  return response;
}

export async function submitAdvocacyIcipClaim(input: {
  claimTitle: string;
  communityName: string;
  claimantName: string;
  contactEmail: string;
  assetType: AdvocacyIcipClaim['assetType'];
  rightsScope: AdvocacyIcipClaim['rightsScope'];
  protocolVisibility: AdvocacyIcipClaim['protocolVisibility'];
  protocolSummary: string;
  licensingTerms?: string;
  infringementSummary?: string;
  evidence: Array<{
    label: string;
    evidenceType: AdvocacyIcipEvidence['evidenceType'];
    fileUrl?: string;
    contentHash?: string;
    description?: string;
  }>;
}) {
  const response = await postAction<AdvocacyIcipClaim>('icip-registry-entry', input as unknown as Record<string, unknown>);
  const current = readList<AdvocacyIcipClaim>(KEYS.icipClaims);
  writeList(KEYS.icipClaims, [response, ...current.filter((item) => item.id !== response.id)].slice(0, 100));
  return response;
}

export async function cancelAdvocacyDonation(input: {
  donationId: string;
  receiptId?: string;
}) {
  const response = await postAction<{ id: string; status: 'cancelled'; updatedAt: string }>('donation-cancel', input as Record<string, unknown>);
  updateItem<AdvocacyDonation>(KEYS.donations, input.donationId, {
    status: 'cancelled',
    updatedAt: response.updatedAt
  });
  if (input.receiptId) {
    updateItem<AdvocacyDonationReceipt>(KEYS.donationReceipts, input.receiptId, {
      paymentStatus: 'cancelled',
      updatedAt: response.updatedAt
    });
  }
  return response;
}

export async function updateAdvocacyCaseWorkflow(input: {
  caseId: string;
  workflowStatus: string;
  priority: string;
  queueBucket: string;
  assignedAttorneyId?: string;
  assignedAttorneyName?: string;
  nextReviewAt?: string;
  lastNote?: string;
}) {
  const res = await fetch('/api/advocacy-legal/ops/case-workflow', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(json.message || 'Failed to update case workflow');
  }
  const json = (await res.json()) as { data?: unknown };
  return json.data ?? null;
}

export async function reviewAdvocacyCampaign(input: {
  campaignId: string;
  reviewStatus: string;
  visibilityState: string;
  reviewNotes?: string;
}) {
  const res = await fetch('/api/advocacy-legal/ops/campaign-review', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(json.message || 'Failed to review campaign');
  }
  const json = (await res.json()) as { data?: unknown };
  return json.data ?? null;
}

export async function reviewAdvocacyRefund(input: {
  donationId: string;
  receiptId?: string;
  refundReviewStatus: 'approved' | 'rejected';
  reviewNotes?: string;
}) {
  const res = await fetch('/api/advocacy-legal/ops/refund-review', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(json.message || 'Failed to review refund');
  }
  const json = (await res.json()) as { data?: AdvocacyRefundReview };
  if (json.data) {
    updateItem<AdvocacyDonation>(KEYS.donations, input.donationId, {
      status: input.refundReviewStatus === 'approved' ? 'refunded' : 'succeeded',
      updatedAt: json.data.updatedAt
    });
    if (input.receiptId) {
      updateItem<AdvocacyDonationReceipt>(KEYS.donationReceipts, input.receiptId, {
        paymentStatus: input.refundReviewStatus === 'approved' ? 'refunded' : 'succeeded',
        refundReviewStatus: input.refundReviewStatus,
        updatedAt: json.data.updatedAt
      });
    }
  }
  return json.data ?? null;
}

export async function reviewAdvocacyIcipClaim(input: {
  entryId: string;
  reviewStatus: 'under_review' | 'approved' | 'rejected';
  reviewNotes?: string;
}) {
  const res = await fetch('/api/advocacy-legal/ops/icip-review', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(json.message || 'Failed to review ICIP claim');
  }
  const json = (await res.json()) as { data?: Partial<AdvocacyIcipClaim> & { id?: string } };
  if (json.data?.id) {
    updateItem<AdvocacyIcipClaim>(KEYS.icipClaims, json.data.id, {
      status: input.reviewStatus,
      reviewNotes: input.reviewNotes,
      reviewedAt: String((json.data as any).reviewed_at || (json.data as any).reviewedAt || new Date().toISOString()),
      reviewedBy: String((json.data as any).reviewed_by || (json.data as any).reviewedBy || ''),
      updatedAt: String((json.data as any).updated_at || (json.data as any).updatedAt || new Date().toISOString())
    } as Partial<AdvocacyIcipClaim>);
  }
  return json.data ?? null;
}

export async function updateAdvocacyIcipPublicVisibility(input: {
  entryId: string;
  publicListingState: 'private' | 'public_summary';
  publicTitle?: string;
  publicSummary?: string;
  publicProtocolNotice?: string;
}) {
  const response = await postAction<{
    id: string;
    publicListingState: 'private' | 'public_summary';
    publicTitle?: string;
    publicSummary?: string;
    publicProtocolNotice?: string;
    updatedAt: string;
  }>('icip-public-visibility', input as Record<string, unknown>);
  updateItem<AdvocacyIcipClaim>(KEYS.icipClaims, input.entryId, {
    publicListingState: response.publicListingState,
    publicTitle: response.publicTitle,
    publicSummary: response.publicSummary,
    publicProtocolNotice: response.publicProtocolNotice,
    updatedAt: response.updatedAt
  });
  return response;
}

export async function addAdvocacyIcipComment(input: {
  entryId: string;
  body: string;
}) {
  const response = await postAction<AdvocacyIcipActivity>('icip-claim-comment', input as Record<string, unknown>);
  return response;
}

export async function assignAdvocacyIcipReviewer(input: {
  entryId: string;
  assignedReviewerId?: string;
  assignedReviewerName: string;
}) {
  const res = await fetch('/api/advocacy-legal/ops/icip-assignment', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(json.message || 'Failed to assign ICIP reviewer');
  }
  const json = (await res.json()) as {
    data?: {
      id: string;
      assignedReviewerId?: string;
      assignedReviewerName?: string;
      assignedReviewerAt?: string;
      updatedAt?: string;
    };
  };
  if (json.data) {
    updateItem<AdvocacyIcipClaim>(KEYS.icipClaims, input.entryId, {
      assignedReviewerId: json.data.assignedReviewerId,
      assignedReviewerName: json.data.assignedReviewerName,
      assignedReviewerAt: json.data.assignedReviewerAt,
      updatedAt: json.data.updatedAt
    });
  }
  return json.data ?? null;
}

export async function assignAdvocacyDonationReviewer(input: {
  donationId: string;
  assignedReviewerId?: string;
  assignedReviewerName: string;
}) {
  const res = await fetch('/api/advocacy-legal/ops/donation-assignment', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(json.message || 'Failed to assign donation workflow reviewer');
  }
  const json = (await res.json()) as {
    data?: {
      donationId: string;
      assignedReviewerId?: string;
      assignedReviewerName?: string;
      assignedReviewerAt?: string;
      updatedAt?: string;
    };
  };
  if (json.data) {
    updateItem<AdvocacyDonation>(KEYS.donations, input.donationId, {
      assignedReviewerId: json.data.assignedReviewerId,
      assignedReviewerName: json.data.assignedReviewerName,
      assignedReviewerAt: json.data.assignedReviewerAt,
      updatedAt: json.data.updatedAt
    });
  }
  return json.data ?? null;
}

export async function reconcileAdvocacyDonation(input: {
  donationId: string;
  paymentState: 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
  processorEventId?: string;
  processorFailureReason?: string;
}) {
  const res = await fetch('/api/advocacy-legal/ops/donation-reconcile', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(json.message || 'Failed to reconcile donation');
  }
  const json = (await res.json()) as { data?: { updatedAt?: string } };
  updateItem<AdvocacyDonation>(KEYS.donations, input.donationId, {
    paymentState: input.paymentState,
    processorEventId: input.processorEventId,
    processorFailureReason: input.processorFailureReason,
    reconciledAt: json.data?.updatedAt,
    updatedAt: json.data?.updatedAt
  });
  return json.data ?? null;
}

export async function saveAdvocacyClinicSlot(input: {
  id?: string;
  attorneyId?: string;
  attorneyName: string;
  startsAt: string;
  endsAt: string;
  timezone?: string;
  locationLabel?: string;
  capacity?: number;
  bookingUrl?: string;
  bookingStatus?: string;
  featured?: boolean;
}) {
  const res = await fetch('/api/advocacy-legal/ops/clinic-slots', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(json.message || 'Failed to save clinic slot');
  }
  const json = (await res.json()) as { data?: unknown };
  return json.data ?? null;
}
