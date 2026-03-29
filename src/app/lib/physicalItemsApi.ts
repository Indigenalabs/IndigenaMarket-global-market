import { fetchWithTimeout, parseApiError } from './apiClient';

type CartEntryPayload = {
  itemId: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
  maker?: string;
  nation?: string;
  variant?: string;
};

async function postJson(path: string, body: Record<string, unknown>) {
  const res = await fetchWithTimeout(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function createPhysicalCheckoutOrder(body: {
  entries: CartEntryPayload[];
  currency?: string;
  walletAddress?: string;
}) {
  return postJson('/physical-items/checkout', body);
}

export async function confirmPhysicalCheckoutOrder(body: {
  orderId: string;
  amountPaid: number;
  paymentBreakdown?: Record<string, unknown>;
  paymentReference?: string;
}) {
  return postJson(`/physical-items/orders/${encodeURIComponent(body.orderId)}/payment-confirm`, body);
}
