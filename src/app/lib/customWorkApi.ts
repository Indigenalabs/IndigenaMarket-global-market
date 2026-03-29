'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { CustomWorkMilestone, CustomWorkRequestRecord } from '@/app/lib/customWork';

export async function submitCustomWorkRequest(payload: {
  channel: CustomWorkRequestRecord['channel'];
  buyerName: string;
  buyerEmail: string;
  requestedFor: string;
  title: string;
  description: string;
  budget: number;
  currency?: string;
  deadline?: string | null;
  referenceUrl?: string;
  specialInstructions?: string;
  matchedCreators?: string[];
}) {
  const res = await fetchWithTimeout('/api/commissions/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to submit custom work request'));
  const json = await res.json();
  return json?.data?.request as CustomWorkRequestRecord;
}

export async function fetchCustomWorkRequests() {
  const res = await fetchWithTimeout('/api/admin/commissions/requests');
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load custom work requests'));
  const json = await res.json();
  return (json?.requests ?? []) as CustomWorkRequestRecord[];
}

export async function updateCustomWorkRequestRecord(payload: {
  id: string;
  status?: CustomWorkRequestRecord['status'];
  matchedCreators?: string[];
  assignedCreator?: string;
  cancellationReason?: string;
  milestones?: CustomWorkMilestone[];
}) {
  const res = await fetchWithTimeout('/api/admin/commissions/requests', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update custom work request'));
  const json = await res.json();
  return json?.request as CustomWorkRequestRecord;
}
