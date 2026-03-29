'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { SevaImpactDashboard, SevaCorporateMatchRecord, SevaImpactProjectAdminRecord, SevaImpactReportRecord, SevaDonorToolRecord } from '@/app/lib/sevaImpactServices';

export async function fetchSevaImpactDashboard() {
  const res = await fetchWithTimeout('/api/seva-impact/dashboard');
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load Seva impact dashboard'));
  return (await res.json()).data as SevaImpactDashboard;
}

export async function createSevaProjectAdminApi(payload: { requestId: string; projectId: string; fundsManaged: number; donorCount?: number; }) {
  const res = await fetchWithTimeout('/api/seva-impact/project-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create project admin record'));
  return (await res.json()).data.record as SevaImpactProjectAdminRecord;
}

export async function createSevaCorporateMatchApi(payload: { companyName: string; projectId: string; committedAmount: number; matchedAmount?: number; }) {
  const res = await fetchWithTimeout('/api/seva-impact/corporate-matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create corporate match'));
  return (await res.json()).data.record as SevaCorporateMatchRecord;
}

export async function createSevaImpactReportApi(payload: { clientName: string; projectId: string; contractAmount?: number; }) {
  const res = await fetchWithTimeout('/api/seva-impact/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create impact report'));
  return (await res.json()).data.record as SevaImpactReportRecord;
}

export async function createSevaDonorToolApi(payload: { actorId: string; projectId: string; toolType: SevaDonorToolRecord['toolType']; }) {
  const res = await fetchWithTimeout('/api/seva-impact/donor-tools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to activate donor tool'));
  return (await res.json()).data.record as SevaDonorToolRecord;
}
