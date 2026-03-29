'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { LaunchpadCampaign, LaunchpadCampaignStatus } from '@/app/lib/launchpad';

export async function fetchLaunchpadCampaignsForAccount(accountSlug: string) {
  const res = await fetchWithTimeout(`/api/launchpad/manage?accountSlug=${encodeURIComponent(accountSlug)}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load Launchpad campaigns'));
  return ((await res.json()).data || []) as LaunchpadCampaign[];
}

export async function updateLaunchpadCampaignStatusApi(input: {
  campaignSlug: string;
  status: LaunchpadCampaignStatus;
}) {
  const res = await fetchWithTimeout('/api/launchpad/manage', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update Launchpad campaign'));
  return ((await res.json()).data || null) as LaunchpadCampaign | null;
}
