import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface PhysicalVentureRecord {
  id: string;
  ventureType: 'native-seeds' | 'indigenous-food-products' | 'land-conservation-fees' | 'material-dyes-supplies' | 'tool-rental-program';
  title: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  revenueAmount: number;
  markupRate: number;
  status: 'ordered' | 'active' | 'completed';
  createdAt: string;
}

export interface PhysicalVenturesDashboard {
  ventures: PhysicalVentureRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'physical-ventures.json');
const MARKUPS: Record<PhysicalVentureRecord['ventureType'], number> = {
  'native-seeds': 0.08,
  'indigenous-food-products': 0.06,
  'land-conservation-fees': 0.03,
  'material-dyes-supplies': 0.05,
  'tool-rental-program': 0.15
};
const BASE_PRICES: Record<PhysicalVentureRecord['ventureType'], number> = {
  'native-seeds': 24,
  'indigenous-food-products': 18,
  'land-conservation-fees': 500,
  'material-dyes-supplies': 36,
  'tool-rental-program': 120
};
async function ensureDir() { assertRuntimePersistenceAllowed('physical ventures'); await fs.mkdir(RUNTIME_DIR, { recursive: true }); }
async function readRuntime(): Promise<PhysicalVenturesDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) return { ventures: [] };
  try { const parsed = JSON.parse(raw) as Partial<PhysicalVenturesDashboard>; return { ventures: Array.isArray(parsed.ventures) ? parsed.ventures : [] }; } catch { return { ventures: [] }; }
}
async function writeRuntime(data: PhysicalVenturesDashboard) { await ensureDir(); await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8'); }

export async function listPhysicalVentures() {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('physical_venture_orders').select('*').order('created_at', { ascending: false });
  return { ventures: (data || []).map((row: any) => ({ id: row.id, ventureType: row.venture_type, title: row.title, buyerName: row.buyer_name, buyerEmail: row.buyer_email, quantity: Number(row.quantity || 1), revenueAmount: Number(row.revenue_amount || 0), markupRate: Number(row.markup_rate || 0), status: row.status, createdAt: row.created_at })) };
}

export async function createPhysicalVentureOrder(input: { ventureType: PhysicalVentureRecord['ventureType']; title: string; buyerName: string; buyerEmail: string; quantity?: number; }) {
  const quantity = Number(input.quantity || 1);
  const base = BASE_PRICES[input.ventureType] * quantity;
  const record: PhysicalVentureRecord = { id: `pvo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ventureType: input.ventureType, title: input.title, buyerName: input.buyerName, buyerEmail: input.buyerEmail, quantity, revenueAmount: Math.round(base * (1 + MARKUPS[input.ventureType]) * 100) / 100, markupRate: MARKUPS[input.ventureType], status: input.ventureType === 'tool-rental-program' ? 'active' : 'ordered', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('physical_venture_orders').insert({ id: record.id, venture_type: record.ventureType, title: record.title, buyer_name: record.buyerName, buyer_email: record.buyerEmail, quantity: record.quantity, revenue_amount: record.revenueAmount, markup_rate: record.markupRate, status: record.status, created_at: record.createdAt });
    return record;
  }
  const state = await readRuntime(); state.ventures.unshift(record); await writeRuntime(state); return record;
}

export async function updatePhysicalVentureStatus(id: string, status: PhysicalVentureRecord['status']) {
  const state = await listPhysicalVentures();
  const current = state.ventures.find((entry) => entry.id === id);
  if (!current) throw new Error('Physical venture order not found.');
  const updated = { ...current, status };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('physical_venture_orders').update({ status }).eq('id', id);
    return updated;
  }
  const runtime = await readRuntime(); runtime.ventures = runtime.ventures.map((entry) => entry.id === id ? updated : entry); await writeRuntime(runtime); return updated;
}
