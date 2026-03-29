import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface CustomWorkMilestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'approved';
}

export interface CustomWorkRequestRecord {
  id: string;
  channel: 'digital-arts' | 'physical-items' | 'freelancing';
  buyerName: string;
  buyerEmail: string;
  requestedFor: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  deadline: string | null;
  referenceUrl: string;
  specialInstructions: string;
  status: 'submitted' | 'matching' | 'proposal-sent' | 'accepted' | 'in-progress' | 'disputed' | 'cancelled' | 'completed' | 'closed';
  facilitationFee: number;
  creatorNetEstimate: number;
  matchedCreators: string[];
  assignedCreator: string;
  milestones: CustomWorkMilestone[];
  cancellationReason: string;
  createdAt: string;
  updatedAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'custom-work-requests.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('custom work requests');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<CustomWorkRequestRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CustomWorkRequestRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: CustomWorkRequestRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function buildCustomWorkQuote(budget: number) {
  const subtotal = Number(budget || 0);
  const facilitationFee = Math.round(subtotal * 0.12 * 100) / 100;
  const creatorNetEstimate = Math.max(subtotal - facilitationFee, 0);
  return { facilitationFee, creatorNetEstimate };
}

function buildMilestones(budget: number): CustomWorkMilestone[] {
  const subtotal = Number(budget || 0);
  const deposit = Math.round(subtotal * 0.25 * 100) / 100;
  const concept = Math.round(subtotal * 0.35 * 100) / 100;
  const delivery = Math.max(Math.round((subtotal - deposit - concept) * 100) / 100, 0);
  return [
    { id: `cwm-${crypto.randomUUID().slice(0, 8)}`, title: 'Deposit and brief approval', amount: deposit, status: 'pending' },
    { id: `cwm-${crypto.randomUUID().slice(0, 8)}`, title: 'Concept approval', amount: concept, status: 'pending' },
    { id: `cwm-${crypto.randomUUID().slice(0, 8)}`, title: 'Final delivery', amount: delivery, status: 'pending' }
  ];
}

function mapRow(row: Record<string, unknown>): CustomWorkRequestRecord {
  return {
    id: String(row.id || ''),
    channel: String(row.channel || 'digital-arts') as CustomWorkRequestRecord['channel'],
    buyerName: String(row.buyer_name || ''),
    buyerEmail: String(row.buyer_email || ''),
    requestedFor: String(row.requested_for || ''),
    title: String(row.title || ''),
    description: String(row.description || ''),
    budget: Number(row.budget || 0),
    currency: String(row.currency || 'USD'),
    deadline: row.deadline ? String(row.deadline) : null,
    referenceUrl: String(row.reference_url || ''),
    specialInstructions: String(row.special_instructions || ''),
    status: String(row.status || 'submitted') as CustomWorkRequestRecord['status'],
    facilitationFee: Number(row.facilitation_fee || 0),
    creatorNetEstimate: Number(row.creator_net_estimate || 0),
    matchedCreators: Array.isArray(row.matched_creators) ? row.matched_creators.map(String) : [],
    assignedCreator: String(row.assigned_creator || ''),
    milestones: Array.isArray(row.milestones) ? (row.milestones as CustomWorkMilestone[]) : [],
    cancellationReason: String(row.cancellation_reason || ''),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || row.created_at || new Date().toISOString())
  };
}

export async function listCustomWorkRequests() {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('custom_work_requests').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map((row) => mapRow(row as Record<string, unknown>));
  }
  return readRuntime();
}

export async function createCustomWorkRequest(input: {
  channel: CustomWorkRequestRecord['channel'];
  buyerName: string;
  buyerEmail: string;
  requestedFor: string;
  title: string;
  description: string;
  budget: number;
  currency?: string;
  deadline?: string | null;
  referenceUrl?: string;
  specialInstructions?: string;
  matchedCreators?: string[];
}) {
  const quote = buildCustomWorkQuote(input.budget);
  const now = new Date().toISOString();
  const record: CustomWorkRequestRecord = {
    id: `cwr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    channel: input.channel,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    requestedFor: input.requestedFor,
    title: input.title,
    description: input.description,
    budget: Number(input.budget || 0),
    currency: input.currency || 'USD',
    deadline: input.deadline || null,
    referenceUrl: input.referenceUrl || '',
    specialInstructions: input.specialInstructions || '',
    status: 'submitted',
    facilitationFee: quote.facilitationFee,
    creatorNetEstimate: quote.creatorNetEstimate,
    matchedCreators: input.matchedCreators || [],
    assignedCreator: '',
    milestones: buildMilestones(input.budget),
    cancellationReason: '',
    createdAt: now,
    updatedAt: now
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('custom_work_requests').insert({
      id: record.id,
      channel: record.channel,
      buyer_name: record.buyerName,
      buyer_email: record.buyerEmail,
      requested_for: record.requestedFor,
      title: record.title,
      description: record.description,
      budget: record.budget,
      currency: record.currency,
      deadline: record.deadline,
      reference_url: record.referenceUrl,
      special_instructions: record.specialInstructions,
      status: record.status,
      facilitation_fee: record.facilitationFee,
      creator_net_estimate: record.creatorNetEstimate,
      matched_creators: record.matchedCreators,
      assigned_creator: record.assignedCreator,
      milestones: record.milestones,
      cancellation_reason: record.cancellationReason,
      created_at: record.createdAt,
      updated_at: record.updatedAt
    });
    return record;
  }

  const runtime = await readRuntime();
  runtime.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function updateCustomWorkRequest(input: {
  id: string;
  status?: CustomWorkRequestRecord['status'];
  matchedCreators?: string[];
  assignedCreator?: string;
  cancellationReason?: string;
  milestones?: CustomWorkMilestone[];
}) {
  const records = await listCustomWorkRequests();
  const current = records.find((entry) => entry.id === input.id);
  if (!current) throw new Error('Custom work request not found.');
  const updated: CustomWorkRequestRecord = {
    ...current,
    status: input.status ?? current.status,
    matchedCreators: input.matchedCreators ?? current.matchedCreators,
    assignedCreator: input.assignedCreator ?? current.assignedCreator,
    cancellationReason: input.cancellationReason ?? current.cancellationReason,
    milestones: input.milestones ?? current.milestones,
    updatedAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('custom_work_requests')
      .update({
        status: updated.status,
        matched_creators: updated.matchedCreators,
        assigned_creator: updated.assignedCreator,
        cancellation_reason: updated.cancellationReason,
        milestones: updated.milestones,
        updated_at: updated.updatedAt
      })
      .eq('id', input.id);
    if (error) throw new Error(error.message);
    return updated;
  }

  const nextRecords = records.map((entry) => (entry.id === input.id ? updated : entry));
  await writeRuntime(nextRecords);
  return updated;
}
