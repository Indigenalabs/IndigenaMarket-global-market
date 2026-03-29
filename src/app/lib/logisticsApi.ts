'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { LogisticsDashboardData, LogisticsInsuranceClaim, LogisticsFulfillmentRecord, LogisticsShippingQuote, LogisticsInventorySubscription, LogisticsNfcTagRecord } from '@/app/lib/logisticsOps';

export async function fetchLogisticsDashboard() {
  const res = await fetchWithTimeout('/api/logistics/dashboard');
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load logistics dashboard'));
  return (await res.json()).data as LogisticsDashboardData;
}

export async function createLogisticsQuote(payload: { origin: string; destination: string; weightKg: number; insured?: boolean; currency?: string; }) {
  const res = await fetchWithTimeout('/api/logistics/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create shipping quote'));
  return (await res.json()).data.quote as LogisticsShippingQuote;
}

export async function createInsuranceClaimRequest(payload: { orderId: string; actorId: string; claimantName: string; amount: number; reason: string; evidenceUrl?: string; }) {
  const res = await fetchWithTimeout('/api/logistics/claims', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create insurance claim'));
  return (await res.json()).data.claim as LogisticsInsuranceClaim;
}

export async function issueNfcTagRequest(payload: { actorId: string; listingId: string; encodedUrl: string; }) {
  const res = await fetchWithTimeout('/api/logistics/nfc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to issue NFC tag'));
  return (await res.json()).data.tag as LogisticsNfcTagRecord;
}

export async function createFulfillmentRequest(payload: { actorId: string; orderId: string; warehouse: string; storageFee?: number; handlingFee?: number; }) {
  const res = await fetchWithTimeout('/api/logistics/fulfillment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create fulfillment order'));
  return (await res.json()).data.fulfillment as LogisticsFulfillmentRecord;
}

export async function createInventoryToolsSubscription(payload: { actorId: string; catalogSize: number; }) {
  const res = await fetchWithTimeout('/api/logistics/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to activate inventory tools'));
  return (await res.json()).data.subscription as LogisticsInventorySubscription;
}

export async function updateLogisticsRecord(payload: { entity: 'claim' | 'fulfillment'; id: string; status: string; }) {
  const res = await fetchWithTimeout('/api/admin/logistics', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update logistics record'));
  return await res.json();
}
