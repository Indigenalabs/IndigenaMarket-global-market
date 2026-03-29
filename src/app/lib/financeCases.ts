import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import type { ProfilePillarId } from '@/app/profile/data/profileShowcase';

export type FinanceCaseType = 'refund' | 'dispute';
export type FinanceCaseStatus = 'open' | 'under_review' | 'approved' | 'rejected' | 'resolved' | 'withdrawn';

export interface FinanceCaseRecord {
  id: string;
  actorId: string;
  profileSlug: string;
  pillar: ProfilePillarId;
  caseType: FinanceCaseType;
  status: FinanceCaseStatus;
  item: string;
  amount: number;
  reason: string;
  details: string;
  ledgerEntryId: string;
  resolutionNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceCaseEvent {
  id: string;
  caseId: string;
  actorId: string;
  eventType: 'created' | 'reviewed' | 'approved' | 'rejected' | 'resolved' | 'withdrawn';
  note: string;
  createdAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const CASES_FILE = path.join(RUNTIME_DIR, 'finance-cases.json');
const EVENTS_FILE = path.join(RUNTIME_DIR, 'finance-case-events.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('finance cases');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntimeCases() {
  await ensureRuntimeDir();
  const raw = await fs.readFile(CASES_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FinanceCaseRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntimeCases(cases: FinanceCaseRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(CASES_FILE, JSON.stringify(cases, null, 2), 'utf8');
}

async function readRuntimeEvents() {
  await ensureRuntimeDir();
  const raw = await fs.readFile(EVENTS_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FinanceCaseEvent[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntimeEvents(events: FinanceCaseEvent[]) {
  await ensureRuntimeDir();
  await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
}

function normalizeCase(row: Record<string, unknown>): FinanceCaseRecord {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    profileSlug: String(row.profile_slug || ''),
    pillar: String(row.pillar || 'digital-arts') as ProfilePillarId,
    caseType: String(row.case_type || 'refund') as FinanceCaseType,
    status: String(row.status || 'open') as FinanceCaseStatus,
    item: String(row.item || ''),
    amount: Number(row.amount || 0),
    reason: String(row.reason || ''),
    details: String(row.details || ''),
    ledgerEntryId: String(row.ledger_entry_id || ''),
    resolutionNotes: String(row.resolution_notes || ''),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

function normalizeEvent(row: Record<string, unknown>): FinanceCaseEvent {
  return {
    id: String(row.id || ''),
    caseId: String(row.case_id || ''),
    actorId: String(row.actor_id || ''),
    eventType: String(row.event_type || 'created') as FinanceCaseEvent['eventType'],
    note: String(row.note || ''),
    createdAt: String(row.created_at || '')
  };
}

export async function listFinanceCases(profileSlug: string, actorId?: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    let query = supabase.from('creator_finance_cases').select('*').order('created_at', { ascending: false }).limit(200);
    if (profileSlug && actorId) {
      query = query.or(`profile_slug.eq.${profileSlug},actor_id.eq.${actorId}`);
    } else if (profileSlug) {
      query = query.eq('profile_slug', profileSlug);
    } else if (actorId) {
      query = query.eq('actor_id', actorId);
    }
    const result = await query;
    if (!result.error && result.data) {
      return result.data.map((row) => normalizeCase(row as Record<string, unknown>));
    }
  }

  const cases = await readRuntimeCases();
  return cases.filter((entry) => (!profileSlug || entry.profileSlug === profileSlug) || (!!actorId && entry.actorId === actorId));
}

export async function listFinanceCaseEvents(caseId: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const result = await supabase
      .from('creator_finance_case_events')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    if (!result.error && result.data) {
      return result.data.map((row) => normalizeEvent(row as Record<string, unknown>));
    }
  }

  const events = await readRuntimeEvents();
  return events.filter((entry) => entry.caseId === caseId);
}

export async function appendFinanceCaseEvent(event: FinanceCaseEvent) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('creator_finance_case_events').insert({
      id: event.id,
      case_id: event.caseId,
      actor_id: event.actorId,
      event_type: event.eventType,
      note: event.note,
      created_at: event.createdAt
    });
    return event;
  }

  const events = await readRuntimeEvents();
  await writeRuntimeEvents([event, ...events.filter((entry) => entry.id !== event.id)]);
  return event;
}

export async function upsertFinanceCase(record: FinanceCaseRecord) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('creator_finance_cases').upsert({
      id: record.id,
      actor_id: record.actorId,
      profile_slug: record.profileSlug,
      pillar: record.pillar,
      case_type: record.caseType,
      status: record.status,
      item: record.item,
      amount: record.amount,
      reason: record.reason,
      details: record.details,
      ledger_entry_id: record.ledgerEntryId,
      resolution_notes: record.resolutionNotes,
      created_at: record.createdAt,
      updated_at: record.updatedAt
    }, { onConflict: 'id' });
    return record;
  }

  const cases = await readRuntimeCases();
  await writeRuntimeCases([record, ...cases.filter((entry) => entry.id !== record.id)]);
  return record;
}
