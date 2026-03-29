import { API_BASE_URL, fetchWithTimeout, parseApiError } from './apiClient';
const USE_APP_API = process.env.NEXT_PUBLIC_USE_APP_API === 'true';

const API_BASE = USE_APP_API ? '/api' : API_BASE_URL;

export type ModerationStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';

export interface PhysicalModerationReport {
  _id: string;
  itemId: string;
  reporterAddress?: string;
  reason: string;
  details?: string;
  status: ModerationStatus;
  createdAt: string;
}

export interface FreelanceModerationReport {
  _id: string;
  serviceId: string;
  reporterAddress?: string;
  reason: string;
  details?: string;
  status: ModerationStatus;
  createdAt: string;
}

function getAdminWallet() {
  if (typeof window === 'undefined') return 'demo-admin-wallet';
  return (
    window.localStorage.getItem('indigena_admin_wallet') ||
    window.localStorage.getItem('indigena_wallet_address') ||
    'demo-admin-wallet'
  ).trim();
}

function adminHeaders() {
  const wallet = getAdminWallet();
  return {
    'Content-Type': 'application/json',
    'x-wallet-address': wallet,
    'x-admin-wallet': wallet
  };
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetchWithTimeout(url, {
    cache: 'no-store',
    headers: adminHeaders()
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function fetchPhysicalModerationQueue(status: string = 'open') {
  const url = `${API_BASE}/physical-items/moderation/queue?status=${encodeURIComponent(status)}&limit=100`;
  return getJson<{ status: boolean; data: { reports: PhysicalModerationReport[] } }>(url);
}

export async function fetchFreelancingModerationQueue(status: string = 'open') {
  const url = `${API_BASE}/freelancers/moderation/queue?status=${encodeURIComponent(status)}&limit=100`;
  return getJson<{ status: boolean; data: { reports: FreelanceModerationReport[] } }>(url);
}

export async function decidePhysicalReport(reportId: string, decision: 'resolve' | 'dismiss' | 'review', notes: string) {
  return postJson(`${API_BASE}/physical-items/moderation/reports/${reportId}/decision`, {
    decision,
    notes,
    moderator: 'admin-ui'
  });
}

export async function decideFreelanceReport(reportId: string, decision: 'resolve' | 'dismiss' | 'review', notes: string) {
  return postJson(`${API_BASE}/freelancers/moderation/reports/${reportId}/decision`, {
    decision,
    notes,
    moderator: 'admin-ui'
  });
}
