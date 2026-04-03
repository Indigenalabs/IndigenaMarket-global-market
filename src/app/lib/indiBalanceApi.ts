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

export async function recordMyIndiTopUp(input: {
  amount: number;
  profileSlug?: string;
  source?: string;
  note?: string;
}) {
  const res = await fetchWithTimeout('/api/finance/indi/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'record-top-up',
      amount: input.amount,
      profileSlug: input.profileSlug || '',
      source: input.source || 'wallet',
      note: input.note || ''
    })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'INDI top-up failed'));
  const json = await res.json();
  return json?.data ?? json;
}

export async function requestMyIndiWithdrawal(input: {
  amount: number;
  profileSlug?: string;
  destination?: string;
  note?: string;
}) {
  const res = await fetchWithTimeout('/api/finance/indi/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'request-withdrawal',
      amount: input.amount,
      profileSlug: input.profileSlug || '',
      destination: input.destination || 'fiat',
      note: input.note || ''
    })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'INDI withdrawal request failed'));
  const json = await res.json();
  return json?.data ?? json;
}
