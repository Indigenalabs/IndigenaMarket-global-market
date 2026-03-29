import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface InsightProductRecord {
  id: string;
  productType: 'annual-report' | 'custom-research' | 'api-access' | 'trend-forecast' | 'regional-analysis';
  buyerName: string;
  buyerEmail: string;
  region: string;
  pillar: string;
  priceAmount: number;
  status: 'requested' | 'in_progress' | 'delivered' | 'active';
  contractTerm: string;
  createdAt: string;
}

export interface InsightApiSubscriptionRecord {
  id: string;
  buyerName: string;
  buyerEmail: string;
  apiKeyLabel: string;
  monthlyPrice: number;
  status: 'active' | 'paused';
  createdAt: string;
}

export interface InsightsDashboard {
  products: InsightProductRecord[];
  apiSubscriptions: InsightApiSubscriptionRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'data-insights.json');
async function ensureDir() { assertRuntimePersistenceAllowed('data insights'); await fs.mkdir(RUNTIME_DIR, { recursive: true }); }
async function readRuntime(): Promise<InsightsDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) return { products: [], apiSubscriptions: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<InsightsDashboard>;
    return { products: Array.isArray(parsed.products) ? parsed.products : [], apiSubscriptions: Array.isArray(parsed.apiSubscriptions) ? parsed.apiSubscriptions : [] };
  } catch { return { products: [], apiSubscriptions: [] }; }
}
async function writeRuntime(data: InsightsDashboard) { await ensureDir(); await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8'); }

export async function listInsightProducts() {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const [products, apiSubscriptions] = await Promise.all([
    supabase.from('insight_products').select('*').order('created_at', { ascending: false }),
    supabase.from('insight_api_subscriptions').select('*').order('created_at', { ascending: false })
  ]);
  return {
    products: (products.data || []).map((row: any) => ({ id: row.id, productType: row.product_type, buyerName: row.buyer_name, buyerEmail: row.buyer_email, region: row.region || '', pillar: row.pillar || '', priceAmount: Number(row.price_amount || 0), status: row.status, contractTerm: row.contract_term || '', createdAt: row.created_at })),
    apiSubscriptions: (apiSubscriptions.data || []).map((row: any) => ({ id: row.id, buyerName: row.buyer_name, buyerEmail: row.buyer_email, apiKeyLabel: row.api_key_label, monthlyPrice: Number(row.monthly_price || 1000), status: row.status, createdAt: row.created_at }))
  };
}

const PRICE_MAP: Record<InsightProductRecord['productType'], number> = {
  'annual-report': 5000,
  'custom-research': 25000,
  'api-access': 1000,
  'trend-forecast': 500,
  'regional-analysis': 10000
};

export async function createInsightProduct(input: { productType: InsightProductRecord['productType']; buyerName: string; buyerEmail: string; region?: string; pillar?: string; contractTerm?: string; }) {
  const record: InsightProductRecord = { id: `ins-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, productType: input.productType, buyerName: input.buyerName, buyerEmail: input.buyerEmail, region: input.region || '', pillar: input.pillar || '', priceAmount: PRICE_MAP[input.productType], status: input.productType === 'api-access' ? 'active' : 'requested', contractTerm: input.contractTerm || '', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('insight_products').insert({ id: record.id, product_type: record.productType, buyer_name: record.buyerName, buyer_email: record.buyerEmail, region: record.region, pillar: record.pillar, price_amount: record.priceAmount, status: record.status, contract_term: record.contractTerm, created_at: record.createdAt });
    return record;
  }
  const state = await readRuntime(); state.products.unshift(record); await writeRuntime(state); return record;
}

export async function createInsightApiSubscription(input: { buyerName: string; buyerEmail: string; apiKeyLabel: string; }) {
  const record: InsightApiSubscriptionRecord = { id: `insa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, buyerName: input.buyerName, buyerEmail: input.buyerEmail, apiKeyLabel: input.apiKeyLabel, monthlyPrice: 1000, status: 'active', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('insight_api_subscriptions').insert({ id: record.id, buyer_name: record.buyerName, buyer_email: record.buyerEmail, api_key_label: record.apiKeyLabel, monthly_price: record.monthlyPrice, status: record.status, created_at: record.createdAt });
    return record;
  }
  const state = await readRuntime(); state.apiSubscriptions.unshift(record); await writeRuntime(state); return record;
}

export async function updateInsightProductStatus(id: string, status: InsightProductRecord['status']) {
  const state = await listInsightProducts();
  const current = state.products.find((entry) => entry.id === id);
  if (!current) throw new Error('Insight product not found.');
  const updated = { ...current, status };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('insight_products').update({ status }).eq('id', id);
    return updated;
  }
  const runtime = await readRuntime(); runtime.products = runtime.products.map((entry) => entry.id === id ? updated : entry); await writeRuntime(runtime); return updated;
}
