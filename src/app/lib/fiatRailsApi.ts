import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { FiatPayoutDestinationRecord, FiatPayoutDestinationStatus, FiatPayoutDestinationType, FiatRailsSnapshot } from '@/app/lib/fiatRails';

export async function fetchMyFiatRailsSnapshot(profileSlug = ''): Promise<FiatRailsSnapshot> {
  const suffix = profileSlug ? `?profileSlug=${encodeURIComponent(profileSlug)}` : '';
  const res = await fetchWithTimeout(`/api/finance/compliance/me${suffix}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Fiat rails request failed'));
  const json = await res.json();
  return (json?.data ?? json) as FiatRailsSnapshot;
}

export async function saveMyFiatPayoutDestination(input: {
  profileSlug?: string;
  label: string;
  destinationType: FiatPayoutDestinationType;
  accountName?: string;
  institutionName?: string;
  last4?: string;
  currency?: string;
  countryCode?: string;
  isDefault?: boolean;
  status?: FiatPayoutDestinationStatus;
  metadata?: Record<string, unknown>;
}): Promise<{ destination: FiatPayoutDestinationRecord; snapshot: FiatRailsSnapshot }> {
  const res = await fetchWithTimeout('/api/finance/compliance/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'save-destination',
      profileSlug: input.profileSlug || '',
      label: input.label,
      destinationType: input.destinationType,
      accountName: input.accountName || '',
      institutionName: input.institutionName || '',
      last4: input.last4 || '',
      currency: input.currency || 'USD',
      countryCode: input.countryCode || 'AU',
      isDefault: input.isDefault ?? true,
      status: input.status || '',
      metadata: input.metadata || {}
    })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Saving payout destination failed'));
  const json = await res.json();
  return (json?.data ?? json) as { destination: FiatPayoutDestinationRecord; snapshot: FiatRailsSnapshot };
}

export async function requestMyFiatRailsReview(input: {
  profileSlug?: string;
  note?: string;
}): Promise<FiatRailsSnapshot> {
  const res = await fetchWithTimeout('/api/finance/compliance/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'request-review',
      profileSlug: input.profileSlug || '',
      note: input.note || ''
    })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Compliance review request failed'));
  const json = await res.json();
  return (json?.data ?? json) as FiatRailsSnapshot;
}