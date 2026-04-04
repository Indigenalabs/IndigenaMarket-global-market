'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type {
  ElderAuthorityRecord,
  PlatformAccountDashboard,
  PlatformAccountRecord,
  PlatformAccountType,
  PlatformVerificationStatus,
  RevenueSplitRuleRecord,
  SplitRuleType
} from '@/app/lib/platformAccounts';

export async function fetchPlatformAccounts(input?: { accountTypes?: PlatformAccountType[]; mine?: boolean }) {
  const params = new URLSearchParams();
  if (input?.accountTypes?.length) params.set('accountTypes', input.accountTypes.join(','));
  if (input?.mine) params.set('mine', 'true');
  const res = await fetchWithTimeout(`/api/platform-accounts${params.toString() ? `?${params.toString()}` : ''}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load platform accounts'));
  return ((await res.json()).data || []) as PlatformAccountRecord[];
}

export async function fetchPlatformAccount(slug: string) {
  const res = await fetchWithTimeout(`/api/platform-accounts/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load platform account'));
  return (await res.json()).data as {
    account: PlatformAccountRecord;
    members: PlatformAccountDashboard['members'];
    verification: PlatformAccountDashboard['verifications'][number] | null;
    splitRules: RevenueSplitRuleRecord[];
  };
}

export async function updatePlatformAccountMembersApi(
  slug: string,
  payload:
    | {
        action: 'upsert-member';
        actorId: string;
        displayName: string;
        role: PlatformAccountDashboard['members'][number]['role'];
        permissions?: string[];
      }
    | {
        action: 'remove-member';
        memberId?: string;
        actorId?: string;
      }
) {
  const res = await fetchWithTimeout(`/api/platform-accounts/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update community representatives'));
  return (await res.json()).data as {
    account: PlatformAccountRecord;
    members: PlatformAccountDashboard['members'];
    verification: PlatformAccountDashboard['verifications'][number] | null;
    splitRules: RevenueSplitRuleRecord[];
  };
}

export async function createPlatformAccountApi(payload: {
  slug: string;
  displayName: string;
  description: string;
  accountType: PlatformAccountType;
  location?: string;
  nation?: string;
  storefrontHeadline?: string;
  payoutWallet?: string;
  story?: string;
  authorityProof?: string;
  communityReferences?: string[];
  actorId?: string;
  actorDisplayName?: string;
}) {
  const res = await fetchWithTimeout('/api/platform-accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create platform account'));
  return (await res.json()).data as {
    account: PlatformAccountRecord;
  };
}

export async function fetchGovernancePlatformDashboard() {
  const res = await fetchWithTimeout('/api/admin/governance', { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load governance platform dashboard'));
  return (await res.json()).data as PlatformAccountDashboard & Record<string, unknown>;
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
  return (await res.json()).record as { verification: PlatformAccountDashboard['verifications'][number]; accountStatus: PlatformVerificationStatus };
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
  return (await res.json()).record as ElderAuthorityRecord;
}

export async function upsertRevenueSplitRuleApi(payload: {
  id?: string;
  ownerAccountId: string;
  offeringId: string;
  offeringLabel: string;
  pillar: string;
  ruleType: SplitRuleType;
  status?: RevenueSplitRuleRecord['status'];
  notes?: string;
  beneficiaries: Array<{
    beneficiaryType: 'actor' | 'account';
    beneficiaryId: string;
    label: string;
    percentage: number;
    payoutTarget: string;
  }>;
  actorId?: string;
}) {
  const res = await fetchWithTimeout('/api/admin/governance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity: 'revenue-split-rule', ...payload })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update revenue split rule'));
  return (await res.json()).record as RevenueSplitRuleRecord;
}
