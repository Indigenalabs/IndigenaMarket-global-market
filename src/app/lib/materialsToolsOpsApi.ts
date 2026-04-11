'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { MaterialsToolsLaunchAuditResponse } from '@/app/lib/materialsToolsApi';
import type {
  MaterialsToolsActionRecord,
  MaterialsToolsOperationsDashboard,
  MaterialsToolsReviewStatus,
} from '@/app/lib/materialsToolsOps';

export async function fetchMaterialsToolsOperations() {
  const res = await fetchWithTimeout('/api/admin/materials-tools/operations', { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load Materials & Tools operations'));
  const json = await res.json();
  return {
    dashboard: json.dashboard as MaterialsToolsOperationsDashboard,
    audit: json.audit as MaterialsToolsLaunchAuditResponse,
  };
}

export async function updateMaterialsToolsReview(payload: {
  id: string;
  status: MaterialsToolsReviewStatus;
  note?: string;
}) {
  const res = await fetchWithTimeout('/api/admin/materials-tools/operations', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update Materials & Tools review'));
  const json = await res.json();
  return json.action as MaterialsToolsActionRecord;
}
