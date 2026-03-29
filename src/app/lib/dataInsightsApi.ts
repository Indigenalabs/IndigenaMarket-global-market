'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { InsightProductRecord, InsightApiSubscriptionRecord, InsightsDashboard } from '@/app/lib/dataInsights';

export async function fetchInsightsDashboard() {
  const res = await fetchWithTimeout('/api/data-insights/dashboard');
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load insights dashboard'));
  return (await res.json()).data as InsightsDashboard;
}

export async function createInsightProductApi(payload: { productType: InsightProductRecord['productType']; buyerName: string; buyerEmail: string; usagePurpose: string; consentAccepted: boolean; scopes?: string[]; region?: string; pillar?: string; contractTerm?: string; }) {
  const res = await fetchWithTimeout('/api/data-insights/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create insight product'));
  return (await res.json()).data.record as InsightProductRecord;
}

export async function createInsightApiSubscriptionApi(payload: { buyerName: string; buyerEmail: string; apiKeyLabel: string; usagePurpose: string; consentAccepted: boolean; scopes?: string[]; }) {
  const res = await fetchWithTimeout('/api/data-insights/api-subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create API subscription'));
  return (await res.json()).data.record as InsightApiSubscriptionRecord;
}

export async function updateInsightProductApi(payload: { id: string; status: InsightProductRecord['status']; }) {
  const res = await fetchWithTimeout('/api/admin/data-insights', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update insight product'));
  return await res.json();
}
