import { API_BASE_URL, fetchWithTimeout, parseApiError } from './apiClient';
const USE_APP_API = process.env.NEXT_PUBLIC_USE_APP_API === 'true';
const API_BASE = USE_APP_API ? '/api' : API_BASE_URL;

export interface WalletSnapshot {
  address: string;
  balance: { INDI: number; XRP: number; USD: number };
  stats: { totalBought: number; totalSold: number; totalVolume: number; profit: number };
  transactions: Array<{
    id: string;
    type: 'buy' | 'sell' | 'mint' | 'royalty' | 'bid';
    item: string;
    amount: number;
    currency: string;
    date: string;
    status: string;
  }>;
}

export async function fetchWalletSnapshot(address: string): Promise<WalletSnapshot> {
  const safe = String(address || '').trim();
  if (!safe) throw new Error('Wallet address is required');

  const [walletRes, historyRes] = await Promise.all([
    fetchWithTimeout(`${API_BASE}/finance/wallet/${encodeURIComponent(safe)}`, { cache: 'no-store' }),
    fetchWithTimeout(`${API_BASE}/finance/history/${encodeURIComponent(safe)}`, { cache: 'no-store' })
  ]);
  if (!walletRes.ok) throw new Error(await parseApiError(walletRes, 'Wallet request failed'));
  if (!historyRes.ok) throw new Error(await parseApiError(historyRes, 'History request failed'));

  const walletJson = (await walletRes.json()) as Record<string, unknown>;
  const historyJson = (await historyRes.json()) as Record<string, unknown>;
  const walletData = ((walletJson.data || walletJson) as Record<string, unknown>) || {};
  const historyRows = (Array.isArray((historyJson as { data?: unknown[] }).data) ? (historyJson as { data?: unknown[] }).data : []) as Array<Record<string, unknown>>;

  const transactions = historyRows.slice(0, 50).map((row, idx) => {
    const rawType = String(row.type || row.action || 'buy').toLowerCase();
    const type = (['buy', 'sell', 'mint', 'royalty', 'bid'].includes(rawType) ? rawType : 'buy') as WalletSnapshot['transactions'][number]['type'];
    const timestamp = row.date || row.createdAt;
    return {
      id: String(row.id || row.txId || row._id || `tx-${idx + 1}`),
      type,
      item: String(row.item || row.title || row.description || 'Marketplace transaction'),
      amount: Number(row.amount || 0),
      currency: String(row.currency || 'INDI'),
      date: timestamp ? new Date(String(timestamp)).toLocaleDateString() : 'Recently',
      status: String(row.status || 'completed')
    };
  });

  const totalBought = transactions.filter((t) => t.type === 'buy').length;
  const totalSold = transactions.filter((t) => t.type === 'sell').length;
  const totalVolume = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const inflow = transactions.filter((t) => t.type === 'sell' || t.type === 'royalty').reduce((sum, t) => sum + t.amount, 0);
  const outflow = transactions.filter((t) => t.type === 'buy' || t.type === 'bid').reduce((sum, t) => sum + t.amount, 0);

  return {
    address: safe,
    balance: {
      INDI: Number(walletData.indiBalance || walletData.INDI || 0),
      XRP: Number(walletData.xrpBalance || walletData.XRP || 0),
      USD: Number(walletData.usdValue || walletData.USD || 0)
    },
    stats: {
      totalBought,
      totalSold,
      totalVolume,
      profit: inflow - outflow
    },
    transactions
  };
}
