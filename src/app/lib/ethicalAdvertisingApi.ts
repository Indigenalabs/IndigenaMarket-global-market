'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { EthicalAdvertisingDashboard, EthicalAdvertisingRecord } from '@/app/lib/ethicalAdvertising';

export async function fetchEthicalAdsDashboard() {
  const res = await fetchWithTimeout('/api/ethical-advertising/dashboard');
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load ethical advertising dashboard'));
  return (await res.json()).data as EthicalAdvertisingDashboard;
}

export async function createEthicalAdApi(payload: { adType: EthicalAdvertisingRecord['adType']; partnerName: string; partnerEmail: string; placementScope: string; creativeTitle: string; issueLabel?: string; }) {
  const res = await fetchWithTimeout('/api/ethical-advertising/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create ethical advertising order'));
  return (await res.json()).data.record as EthicalAdvertisingRecord;
}

export async function updateEthicalAdApi(payload: { id: string; status: EthicalAdvertisingRecord['status']; reviewNotes?: string; }) {
  const res = await fetchWithTimeout('/api/admin/ethical-advertising', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update ethical advertising order'));
  return await res.json();
}
