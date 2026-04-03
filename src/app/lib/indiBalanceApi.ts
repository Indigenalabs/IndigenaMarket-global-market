import { fetchWithTimeout, parseApiError } from './apiClient';
import type { IndiBalanceSnapshot, IndiLedgerEntry } from '@/app/lib/indiBalanceLedger';

export async function fetchMyIndiBalance(profileSlug = ''): Promise<IndiBalanceSnapshot> {
  const suffix = profileSlug ? `?profileSlug=${encodeURIComponent(profileSlug)}` : '';
  const res = await fetchWithTimeout(`/api/finance/indi/balance/me${suffix}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'INDI balance request failed'));
  const json = await res.json();
  return (json?.data ?? json) as IndiBalanceSnapshot;
}

export async function fetchMyIndiLedger(profileSlug = ''): Promise<IndiLedgerEntry[]> {
  const suffix = profileSlug ? `?profileSlug=${encodeURIComponent(profileSlug)}` : '';
  const res = await fetchWithTimeout(`/api/finance/indi/ledger/me${suffix}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'INDI ledger request failed'));
  const json = await res.json();
  return ((json?.data ?? json) || []) as IndiLedgerEntry[];
}
