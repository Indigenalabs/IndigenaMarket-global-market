'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { HybridFundingReceiptRecord, HybridFundingSummary } from '@/app/lib/phase8HybridFunding';

async function getJson<T>(url: string) {
  const res = await fetchWithTimeout(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load hybrid funding'));
  return (await res.json()).data as T;
}

export async function fetchHybridFundingOverview(source?: 'launchpad' | 'seva') {
  return getJson<HybridFundingSummary>(
    `/api/funding/hybrid/overview${source ? `?source=${encodeURIComponent(source)}` : ''}`
  );
}

export async function fetchHybridFundingAccount(accountSlug: string) {
  return getJson<{ summary: HybridFundingSummary; receipts: HybridFundingReceiptRecord[] }>(
    `/api/funding/hybrid/account?accountSlug=${encodeURIComponent(accountSlug)}`
  );
}

export async function fetchHybridFundingLaunchpad(campaignSlug: string) {
  return getJson<{ summary: HybridFundingSummary; receipts: HybridFundingReceiptRecord[] }>(
    `/api/funding/hybrid/launchpad/${encodeURIComponent(campaignSlug)}`
  );
}

export async function fetchHybridFundingSevaProject(projectId: string) {
  return getJson<{ summary: HybridFundingSummary; receipts: HybridFundingReceiptRecord[] }>(
    `/api/funding/hybrid/seva-project/${encodeURIComponent(projectId)}`
  );
}

export async function fetchHybridFundingReceipt(receiptId: string) {
  return getJson<HybridFundingReceiptRecord>(`/api/funding/hybrid/receipt/${encodeURIComponent(receiptId)}`);
}
