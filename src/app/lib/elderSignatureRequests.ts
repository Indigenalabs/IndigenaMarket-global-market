import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface ElderSignatureRequestRecord {
  id: string;
  requesterName: string;
  affiliation: string;
  listingId: string;
  purpose: string;
  justification: string;
  acknowledgedProtocols: boolean;
  actorId: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string;
  reviewedAt: string;
  createdAt: string;
}

export interface ElderSignatureRequestEventRecord {
  id: string;
  requestId: string;
  status: ElderSignatureRequestRecord['status'];
  note: string;
  actorId: string;
  createdAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'elder-signature-requests.json');
const EVENTS_RUNTIME_FILE = path.join(RUNTIME_DIR, 'elder-signature-request-events.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('elder signature requests');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<ElderSignatureRequestRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ElderSignatureRequestRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: ElderSignatureRequestRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

async function readRuntimeEvents(): Promise<ElderSignatureRequestEventRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(EVENTS_RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ElderSignatureRequestEventRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntimeEvents(records: ElderSignatureRequestEventRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(EVENTS_RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function normalizeRow(row: Record<string, unknown>): ElderSignatureRequestRecord {
  return {
    id: String(row.id || ''),
    requesterName: String(row.requester_name || ''),
    affiliation: String(row.affiliation || ''),
    listingId: String(row.listing_id || ''),
    purpose: String(row.purpose || ''),
    justification: String(row.justification || ''),
    acknowledgedProtocols: Boolean(row.acknowledged_protocols),
    actorId: String(row.actor_id || ''),
    status: String(row.status || 'pending') as ElderSignatureRequestRecord['status'],
    reviewedBy: String(row.reviewed_by || ''),
    reviewedAt: String(row.reviewed_at || ''),
    createdAt: String(row.created_at || '')
  };
}

function normalizeEventRow(row: Record<string, unknown>): ElderSignatureRequestEventRecord {
  return {
    id: String(row.id || ''),
    requestId: String(row.request_id || ''),
    status: String(row.status || 'pending') as ElderSignatureRequestRecord['status'],
    note: String(row.note || ''),
    actorId: String(row.actor_id || ''),
    createdAt: String(row.created_at || '')
  };
}

export async function listElderSignatureRequests(limit = 200) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('language_heritage_sacred_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map((row) => normalizeRow(row as Record<string, unknown>));
  }
  const runtime = await readRuntime();
  return runtime.slice(0, limit);
}

export async function updateElderSignatureRequest(input: {
  id: string;
  status: ElderSignatureRequestRecord['status'];
  reviewedBy: string;
  note?: string;
}) {
  const reviewedAt = new Date().toISOString();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('language_heritage_sacred_requests')
      .update({
        status: input.status,
        reviewed_by: input.reviewedBy,
        reviewed_at: reviewedAt
      })
      .eq('id', input.id)
      .select('*')
      .single();
    if (error) throw error;
    const record = normalizeRow(data as Record<string, unknown>);
    await appendElderSignatureRequestEvent({
      requestId: input.id,
      status: input.status,
      note: input.note || `Request ${input.status}`,
      actorId: input.reviewedBy
    });
    return record;
  }
  const runtime = await readRuntime();
  const updated = runtime.map((entry) =>
    entry.id === input.id
      ? { ...entry, status: input.status, reviewedBy: input.reviewedBy, reviewedAt }
      : entry
  );
  await writeRuntime(updated);
  await appendElderSignatureRequestEvent({
    requestId: input.id,
    status: input.status,
    note: input.note || `Request ${input.status}`,
    actorId: input.reviewedBy
  });
  return updated.find((entry) => entry.id === input.id) || null;
}

export async function appendElderSignatureRequestEvent(input: {
  requestId: string;
  status: ElderSignatureRequestRecord['status'];
  note: string;
  actorId: string;
}) {
  const event: ElderSignatureRequestEventRecord = {
    id: `ese-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    requestId: input.requestId,
    status: input.status,
    note: input.note,
    actorId: input.actorId,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('language_heritage_sacred_request_events').insert({
      id: event.id,
      request_id: event.requestId,
      status: event.status,
      note: event.note,
      actor_id: event.actorId,
      created_at: event.createdAt
    });
    return event;
  }

  const runtime = await readRuntimeEvents();
  runtime.unshift(event);
  await writeRuntimeEvents(runtime);
  return event;
}

export async function listElderSignatureRequestEvents(limit = 300) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('language_heritage_sacred_request_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map((row) => normalizeEventRow(row as Record<string, unknown>));
  }

  const runtime = await readRuntimeEvents();
  return runtime.slice(0, limit);
}
