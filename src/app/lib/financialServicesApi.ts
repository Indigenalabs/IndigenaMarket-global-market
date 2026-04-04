'use client';

import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { FinancialServicesDashboard, InstantPayoutRequest, BnplApplication, TaxReportPurchase } from '@/app/lib/financialServices';

export async function fetchFinancialServicesDashboard() {
  const res = await fetchWithTimeout('/api/financial-services/dashboard');
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load financial services dashboard'));
  return (await res.json()).data as FinancialServicesDashboard;
}

export async function requestInstantPayoutApi(payload: { actorId: string; walletAddress: string; amount: number; }) {
  const res = await fetchWithTimeout('/api/financial-services/instant-payout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to request instant payout'));
  return (await res.json()).data.payout as InstantPayoutRequest;
}

export async function createBnplApplicationApi(payload: { actorId: string; orderId: string; amount: number; }) {
  const res = await fetchWithTimeout('/api/financial-services/bnpl', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to create BNPL application'));
  return (await res.json()).data.application as BnplApplication;
}

export async function purchaseTaxReportApi(payload: { actorId: string; taxYear: number; }) {
  const res = await fetchWithTimeout('/api/financial-services/tax-reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to purchase tax report'));
  return (await res.json()).data.report as TaxReportPurchase;
}

export async function updateFinancialServiceRecord(payload: { entity: 'payout' | 'indi-withdrawal' | 'royalty' | 'marketplace-order' | 'bnpl' | 'tax-report'; id: string; status: string; note?: string; }) {
  const res = await fetchWithTimeout('/api/admin/financial-services', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseApiError(res, 'Unable to update financial service record'));
  return await res.json();
}
