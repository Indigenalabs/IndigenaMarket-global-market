'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { CommunityEventRecord, CommunityEventRegistrationRecord } from '@/app/lib/eventTicketing';

export async function fetchCommunityEvents() {
  const res = await fetchWithTimeout('/api/events');
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load events'));
  const json = await res.json();
  return (json?.data?.events ?? []) as CommunityEventRecord[];
}

export async function fetchCommunityEvent(eventId: string) {
  const res = await fetchWithTimeout(`/api/events/${encodeURIComponent(eventId)}`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load event'));
  const json = await res.json();
  return json?.data as {
    event: CommunityEventRecord;
    registrations: CommunityEventRegistrationRecord[];
  };
}

export async function createCommunityEvent(payload: {
  title: string;
  description: string;
  hostName: string;
  hostAvatar?: string;
  createdByActorId?: string;
  eventType: CommunityEventRecord['eventType'];
  eventMode: CommunityEventRecord['eventMode'];
  location: string;
  startsAt: string;
  endsAt?: string | null;
  basePrice?: number;
  currency?: string;
  capacity?: number | null;
  livestreamEnabled?: boolean;
  vipAddonPrice?: number;
  image?: string;
  sponsor?: string;
}) {
  const res = await fetchWithTimeout('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create event'));
  const json = await res.json();
  return json?.data?.event as CommunityEventRecord;
}

export async function updateCommunityEventRecord(payload: {
  id: string;
  status?: CommunityEventRecord['status'];
  featured?: boolean;
  sponsor?: string;
}) {
  const res = await fetchWithTimeout('/api/admin/events', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update event'));
  const json = await res.json();
  return json?.event as CommunityEventRecord;
}

export async function fetchEventOpsData() {
  const res = await fetchWithTimeout('/api/admin/events');
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load event ops data'));
  return await res.json() as {
    events: CommunityEventRecord[];
    registrations: CommunityEventRegistrationRecord[];
  };
}

export async function updateEventRegistrationStatus(payload: {
  id: string;
  status: CommunityEventRegistrationRecord['status'];
}) {
  const res = await fetchWithTimeout('/api/admin/events', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update registration status'));
  const json = await res.json();
  return json?.registration as CommunityEventRegistrationRecord;
}

export async function registerCommunityEvent(payload: {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  tier: CommunityEventRegistrationRecord['tier'];
  quantity: number;
}) {
  const res = await fetchWithTimeout('/api/events/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to register for event'));
  const json = await res.json();
  return json?.data as {
    event: CommunityEventRecord;
    registration: CommunityEventRegistrationRecord;
  };
}
