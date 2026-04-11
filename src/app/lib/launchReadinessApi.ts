'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { LaunchReadinessSnapshot } from '@/app/lib/launchReadiness';

export async function fetchLaunchReadiness() {
  const res = await fetchWithTimeout('/api/admin/launch-readiness', { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load launch readiness'));
  const json = await res.json();
  return json.snapshot as LaunchReadinessSnapshot;
}

export function buildLaunchReadinessExportUrl(format: 'json' | 'csv') {
  return `/api/admin/launch-readiness?format=${format}`;
}
