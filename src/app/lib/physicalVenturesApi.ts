'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { PhysicalVenturesDashboard, PhysicalVentureRecord } from '@/app/lib/physicalVentures';

export async function fetchPhysicalVenturesDashboard() {
  const res = await fetchWithTimeout('/api/physical-ventures/dashboard');
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load physical ventures dashboard'));
  return (await res.json()).data as PhysicalVenturesDashboard;
}

export async function createPhysicalVentureOrderApi(payload: { ventureType: PhysicalVentureRecord['ventureType']; title: string; buyerName: string; buyerEmail: string; quantity?: number; }) {
  const res = await fetchWithTimeout('/api/physical-ventures/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create physical venture order'));
  return (await res.json()).data.record as PhysicalVentureRecord;
}

export async function updatePhysicalVentureApi(payload: { id: string; status: PhysicalVentureRecord['status']; }) {
  const res = await fetchWithTimeout('/api/admin/physical-ventures', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update physical venture order'));
  return await res.json();
}
