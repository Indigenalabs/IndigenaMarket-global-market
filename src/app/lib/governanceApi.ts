'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { GovernanceDashboard, ComplianceStatus } from '@/app/lib/complianceGovernance';
import type { PlatformVerificationStatus, SplitRuleType } from '@/app/lib/platformAccounts';

export async function fetchGovernanceDashboard() {
  const res = await fetchWithTimeout('/api/admin/governance');
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load governance dashboard'));
  return (await res.json()).data as GovernanceDashboard;
}

export async function updateComplianceProfileApi(payload: {
  actorId: string;
  walletAddress?: string;
  kycStatus?: ComplianceStatus;
  amlStatus?: ComplianceStatus;
  payoutEnabled?: boolean;
  bnplEnabled?: boolean;
  taxReportingEnabled?: boolean;
  notes?: string;
}) {
  const res = await fetchWithTimeout('/api/admin/governance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity: 'compliance-profile', ...payload })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update compliance profile'));
  return (await res.json()).record;
}

export async function updateDataUseConsentApi(payload: { id: string; status: ComplianceStatus; reference?: string; }) {
  const res = await fetchWithTimeout('/api/admin/governance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity: 'data-use-consent', ...payload })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update data-use consent'));
  return (await res.json()).record;
}

export async function updatePlatformAccountVerificationApi(payload: {
  accountId: string;
  treasuryReviewStatus?: PlatformVerificationStatus;
  representativeReviewStatus?: PlatformVerificationStatus;
  elderEndorsementStatus?: PlatformVerificationStatus;
  notes?: string;
}) {
  const res = await fetchWithTimeout('/api/admin/governance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity: 'platform-account-verification', ...payload })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update platform account verification'));
  return (await res.json()).record;
}

export async function upsertElderAuthorityApi(payload: {
  actorId: string;
  displayName: string;
  nation: string;
  status?: PlatformVerificationStatus;
  authorities?: string[];
  councilSeat?: string;
  notes?: string;
}) {
  const res = await fetchWithTimeout('/api/admin/governance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity: 'elder-authority', ...payload })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update elder authority'));
  return (await res.json()).record;
}

export async function upsertRevenueSplitRuleApi(payload: {
  id?: string;
  ownerAccountId: string;
  offeringId: string;
  offeringLabel: string;
  pillar: string;
  ruleType: SplitRuleType;
  status?: 'draft' | 'active' | 'archived';
  notes?: string;
  beneficiaries: Array<{
    beneficiaryType: 'actor' | 'account';
    beneficiaryId: string;
    label: string;
    percentage: number;
    payoutTarget: string;
  }>;
}) {
  const res = await fetchWithTimeout('/api/admin/governance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity: 'revenue-split-rule', ...payload })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update revenue split rule'));
  return (await res.json()).record;
}
