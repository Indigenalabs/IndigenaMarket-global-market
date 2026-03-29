import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface EthicalAdvertisingRecord {
  id: string;
  adType: 'newsletter-ad' | 'pillar-sponsorship' | 'event-sponsorship' | 'sponsored-content';
  partnerName: string;
  partnerEmail: string;
  placementScope: string;
  creativeTitle: string;
  priceAmount: number;
  status: 'submitted' | 'approved' | 'live' | 'rejected' | 'completed';
  reviewNotes: string;
  issueLabel: string;
  createdAt: string;
}

export interface EthicalAdvertisingDashboard {
  ads: EthicalAdvertisingRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'ethical-advertising.json');
async function ensureDir() { assertRuntimePersistenceAllowed('ethical advertising'); await fs.mkdir(RUNTIME_DIR, { recursive: true }); }
async function readRuntime(): Promise<EthicalAdvertisingDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) return { ads: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<EthicalAdvertisingDashboard>;
    return { ads: Array.isArray(parsed.ads) ? parsed.ads : [] };
  } catch { return { ads: [] }; }
}
async function writeRuntime(data: EthicalAdvertisingDashboard) { await ensureDir(); await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8'); }
const PRICES: Record<EthicalAdvertisingRecord['adType'], number> = { 'newsletter-ad': 350, 'pillar-sponsorship': 2000, 'event-sponsorship': 500, 'sponsored-content': 100 };

export async function listEthicalAds() {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('ethical_advertising_orders').select('*').order('created_at', { ascending: false });
  return { ads: (data || []).map((row: any) => ({ id: row.id, adType: row.ad_type, partnerName: row.partner_name, partnerEmail: row.partner_email, placementScope: row.placement_scope, creativeTitle: row.creative_title, priceAmount: Number(row.price_amount || 0), status: row.status, reviewNotes: row.review_notes || '', issueLabel: row.issue_label || '', createdAt: row.created_at })) };
}

export async function createEthicalAd(input: { adType: EthicalAdvertisingRecord['adType']; partnerName: string; partnerEmail: string; placementScope: string; creativeTitle: string; issueLabel?: string; }) {
  const record: EthicalAdvertisingRecord = { id: `ead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, adType: input.adType, partnerName: input.partnerName, partnerEmail: input.partnerEmail, placementScope: input.placementScope, creativeTitle: input.creativeTitle, priceAmount: PRICES[input.adType], status: 'submitted', reviewNotes: '', issueLabel: input.issueLabel || '', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('ethical_advertising_orders').insert({ id: record.id, ad_type: record.adType, partner_name: record.partnerName, partner_email: record.partnerEmail, placement_scope: record.placementScope, creative_title: record.creativeTitle, price_amount: record.priceAmount, status: record.status, review_notes: record.reviewNotes, issue_label: record.issueLabel, created_at: record.createdAt });
    return record;
  }
  const state = await readRuntime(); state.ads.unshift(record); await writeRuntime(state); return record;
}

export async function updateEthicalAdStatus(id: string, status: EthicalAdvertisingRecord['status'], reviewNotes = '') {
  const state = await listEthicalAds();
  const current = state.ads.find((entry) => entry.id === id);
  if (!current) throw new Error('Ethical ad order not found.');
  const updated = { ...current, status, reviewNotes };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('ethical_advertising_orders').update({ status, review_notes: reviewNotes }).eq('id', id);
    return updated;
  }
  const runtime = await readRuntime(); runtime.ads = runtime.ads.map((entry) => entry.id === id ? updated : entry); await writeRuntime(runtime); return updated;
}
