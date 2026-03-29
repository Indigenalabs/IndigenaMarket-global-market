'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { EnterpriseOwnerRole } from '@/app/lib/enterpriseTeam';

export async function createEnterpriseInquiry(payload: {
  channel: 'licensing' | 'institutional-access' | 'consulting' | 'sponsorship';
  name: string;
  email: string;
  organization: string;
  scope: string;
  budget: string;
  detail: string;
  estimatedValue?: number;
  pipelineOwner?: string;
  pipelineOwnerRole?: EnterpriseOwnerRole | '';
  nextStep?: string;
  expectedCloseDate?: string | null;
  contractStoragePath?: string;
  contractAttachmentUrl?: string;
  contractAttachmentName?: string;
}) {
  const res = await fetchWithTimeout('/api/enterprise/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Enterprise inquiry failed'));
  const json = await res.json();
  return json?.data ?? json;
}

export interface EnterpriseInquiryRecord {
  id: string;
  channel: 'licensing' | 'institutional-access' | 'consulting' | 'sponsorship';
  name: string;
  email: string;
  organization: string;
  scope: string;
  budget: string;
  detail: string;
  status: 'new' | 'reviewing' | 'qualified' | 'closed';
  contractStage: 'lead' | 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost';
  contractLifecycleState: 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'terminated';
  estimatedValue: number;
  pipelineOwner: string;
  pipelineOwnerRole: EnterpriseOwnerRole | '';
  nextStep: string;
  expectedCloseDate: string | null;
  contractStoragePath: string;
  contractAttachmentUrl: string;
  contractAttachmentName: string;
  lastReviewedAt: string | null;
  createdAt: string;
}

export interface EnterpriseInquiryEventRecord {
  id: string;
  inquiryId: string;
  actorId: string;
  eventType: 'created' | 'updated' | 'contract-uploaded' | 'stage-changed' | 'status-changed';
  note: string;
  createdAt: string;
}

export interface EnterpriseMilestoneRecord {
  id: string;
  inquiryId: string;
  title: string;
  owner: string;
  dueDate: string | null;
  status: 'pending' | 'in_progress' | 'done' | 'blocked';
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseArtifactRecord {
  id: string;
  inquiryId: string;
  kind: 'proposal' | 'invoice';
  title: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'approved' | 'paid' | 'void';
  issuedAt: string | null;
  dueDate: string | null;
  attachmentUrl: string;
  attachmentName: string;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseSignatureRecord {
  id: string;
  inquiryId: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  status: 'pending' | 'sent' | 'signed' | 'declined';
  requestedAt: string;
  signedAt: string | null;
  note: string;
}

export interface EnterpriseArtifactPaymentRecord {
  id: string;
  artifactId: string;
  amount: number;
  currency: string;
  reference: string;
  paidAt: string;
  note: string;
}

export interface EnterpriseContractAccessLogRecord {
  id: string;
  contractStoragePath: string;
  actorId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface EnterprisePipelineSettings {
  stageWeights: Record<EnterpriseInquiryRecord['contractStage'], number>;
  updatedAt: string;
}

export async function fetchEnterpriseInquiries(filters?: {
  contractStage?: EnterpriseInquiryRecord['contractStage'];
  status?: EnterpriseInquiryRecord['status'];
}) {
  const params = new URLSearchParams();
  if (filters?.contractStage) params.set('contractStage', filters.contractStage);
  if (filters?.status) params.set('status', filters.status);
  const path = `/api/enterprise/inquiries${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetchWithTimeout(path);
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load enterprise inquiries'));
  const json = await res.json();
  return {
    inquiries: (json?.data?.inquiries ?? []) as EnterpriseInquiryRecord[],
    events: (json?.data?.events ?? []) as EnterpriseInquiryEventRecord[]
  };
}

export async function updateEnterpriseInquiryRecord(payload: {
  id: string;
  actorId?: string;
  status?: EnterpriseInquiryRecord['status'];
  contractStage?: EnterpriseInquiryRecord['contractStage'];
  contractLifecycleState?: EnterpriseInquiryRecord['contractLifecycleState'];
  estimatedValue?: number;
  pipelineOwner?: string;
  pipelineOwnerRole?: EnterpriseOwnerRole | '';
  nextStep?: string;
  expectedCloseDate?: string | null;
  contractStoragePath?: string;
  contractAttachmentUrl?: string;
  contractAttachmentName?: string;
}) {
  const res = await fetchWithTimeout('/api/enterprise/inquiries', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Enterprise inquiry update failed'));
  const json = await res.json();
  return json?.data?.inquiry as EnterpriseInquiryRecord;
}

export async function fetchEnterpriseArtifacts(inquiryId?: string) {
  const params = new URLSearchParams();
  if (inquiryId) params.set('inquiryId', inquiryId);
  const res = await fetchWithTimeout(`/api/enterprise/artifacts${params.toString() ? `?${params.toString()}` : ''}`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load enterprise artifacts'));
  const json = await res.json();
  return (json?.data?.artifacts ?? []) as EnterpriseArtifactRecord[];
}

export async function saveEnterpriseArtifact(payload: {
  id?: string;
  inquiryId: string;
  kind: EnterpriseArtifactRecord['kind'];
  title: string;
  amount?: number;
  currency?: string;
  status?: EnterpriseArtifactRecord['status'];
  issuedAt?: string | null;
  dueDate?: string | null;
  attachmentUrl?: string;
  attachmentName?: string;
  storagePath?: string;
}) {
  const res = await fetchWithTimeout('/api/enterprise/artifacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to save enterprise artifact'));
  const json = await res.json();
  return json?.data?.artifact as EnterpriseArtifactRecord;
}

export async function fetchEnterpriseSignatures(inquiryId: string) {
  const res = await fetchWithTimeout(`/api/enterprise/inquiries/${encodeURIComponent(inquiryId)}/signatures`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load enterprise signatures'));
  const json = await res.json();
  return (json?.data?.signatures ?? []) as EnterpriseSignatureRecord[];
}

export async function saveEnterpriseSignature(inquiryId: string, payload: {
  id?: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  status?: EnterpriseSignatureRecord['status'];
  requestedAt?: string;
  signedAt?: string | null;
  note?: string;
}) {
  const res = await fetchWithTimeout(`/api/enterprise/inquiries/${encodeURIComponent(inquiryId)}/signatures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to save enterprise signature'));
  const json = await res.json();
  return json?.data?.signature as EnterpriseSignatureRecord;
}

export async function fetchEnterpriseArtifactPayments(artifactId: string) {
  const res = await fetchWithTimeout(`/api/enterprise/artifacts/${encodeURIComponent(artifactId)}/payments`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load artifact payments'));
  const json = await res.json();
  return (json?.data?.payments ?? []) as EnterpriseArtifactPaymentRecord[];
}

export async function saveEnterpriseArtifactPayment(artifactId: string, payload: {
  amount: number;
  currency?: string;
  reference?: string;
  paidAt?: string;
  note?: string;
}) {
  const res = await fetchWithTimeout(`/api/enterprise/artifacts/${encodeURIComponent(artifactId)}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to save artifact payment'));
  const json = await res.json();
  return json?.data?.payment as EnterpriseArtifactPaymentRecord;
}

export function getEnterpriseArtifactPaymentSummary(
  artifact: Pick<EnterpriseArtifactRecord, 'amount' | 'kind'>,
  payments: EnterpriseArtifactPaymentRecord[]
) {
  const paid = payments.reduce((total, entry) => total + Number(entry.amount || 0), 0);
  const due = Math.max(Number(artifact.amount || 0) - paid, 0);
  const status =
    artifact.kind !== 'invoice'
      ? 'n/a'
      : due === 0 && paid > 0
        ? 'paid'
        : paid > 0
          ? 'partial'
          : 'unpaid';
  return { paid, due, status };
}

export function getEnterpriseMonthlyForecastExportUrl(format: 'csv' | 'json' = 'csv') {
  return `/api/enterprise/reports/monthly-forecast?format=${format}`;
}

export function getEnterpriseArtifactPdfUrl(artifactId: string) {
  return `/api/enterprise/artifacts/${encodeURIComponent(artifactId)}/pdf`;
}

export function getEnterpriseSignaturePacketPdfUrl(inquiryId: string) {
  return `/api/enterprise/inquiries/${encodeURIComponent(inquiryId)}/signature-packet`;
}

export async function fetchEnterpriseMilestones(inquiryId: string) {
  const res = await fetchWithTimeout(`/api/enterprise/inquiries/${encodeURIComponent(inquiryId)}/milestones`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load enterprise milestones'));
  const json = await res.json();
  return (json?.data?.milestones ?? []) as EnterpriseMilestoneRecord[];
}

export async function saveEnterpriseMilestone(inquiryId: string, payload: Partial<EnterpriseMilestoneRecord> & { title: string }) {
  const res = await fetchWithTimeout(`/api/enterprise/inquiries/${encodeURIComponent(inquiryId)}/milestones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to save enterprise milestone'));
  const json = await res.json();
  return json?.data?.milestone as EnterpriseMilestoneRecord;
}

export async function uploadEnterpriseContract(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetchWithTimeout('/api/enterprise/contracts/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Contract upload failed'));
  const json = await res.json();
  return (json?.data ?? json) as {
    ok: true;
    url?: string;
    fileName: string;
    storagePath?: string;
    privateStorage?: boolean;
  };
}

export async function fetchEnterpriseContractAccessUrl(path: string) {
  const res = await fetchWithTimeout(`/api/enterprise/contracts/access?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Contract access failed'));
  const json = await res.json();
  return String(json?.data?.url || '');
}

export async function fetchEnterprisePipelineSettings() {
  const res = await fetchWithTimeout('/api/enterprise/settings');
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load enterprise settings'));
  const json = await res.json();
  return json?.data?.settings as EnterprisePipelineSettings;
}

export async function updateEnterprisePipelineSettings(payload: Partial<Record<EnterpriseInquiryRecord['contractStage'], number>>) {
  const res = await fetchWithTimeout('/api/enterprise/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to update enterprise settings'));
  const json = await res.json();
  return json?.data?.settings as EnterprisePipelineSettings;
}

export async function fetchEnterpriseContractAccessLogs(filters?: {
  limit?: number;
  contractStoragePath?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.contractStoragePath) params.set('path', filters.contractStoragePath);
  const res = await fetchWithTimeout(`/api/admin/partnerships/contract-access${params.toString() ? `?${params.toString()}` : ''}`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load contract access logs'));
  const json = await res.json();
  return (json?.data?.logs ?? []) as EnterpriseContractAccessLogRecord[];
}
