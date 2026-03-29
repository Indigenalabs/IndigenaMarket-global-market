import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface InstitutionalArchiveSeat {
  id: string;
  actorId: string;
  email: string;
  role: 'admin' | 'researcher' | 'viewer';
  status: 'active' | 'invited' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'institutional-archive-seats.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('institutional archive seats');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<InstitutionalArchiveSeat[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as InstitutionalArchiveSeat[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: InstitutionalArchiveSeat[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function normalizeRow(row: Record<string, unknown>): InstitutionalArchiveSeat {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    email: String(row.email || ''),
    role: String(row.role || 'viewer') as InstitutionalArchiveSeat['role'],
    status: String(row.status || 'invited') as InstitutionalArchiveSeat['status'],
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

export async function listInstitutionalArchiveSeats(actorId: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('institutional_archive_seats')
      .select('*')
      .eq('actor_id', actorId)
      .order('created_at', { ascending: false });
    return (data || []).map((row) => normalizeRow(row as Record<string, unknown>));
  }

  const runtime = await readRuntime();
  return runtime.filter((entry) => entry.actorId === actorId);
}

export async function upsertInstitutionalArchiveSeat(input: {
  actorId: string;
  email: string;
  role: InstitutionalArchiveSeat['role'];
}) {
  const now = new Date().toISOString();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const existing = await supabase
      .from('institutional_archive_seats')
      .select('*')
      .eq('actor_id', input.actorId)
      .eq('email', input.email)
      .maybeSingle();
    if ((existing.data as Record<string, unknown> | null)?.id) {
      const { data, error } = await supabase
        .from('institutional_archive_seats')
        .update({
          role: input.role,
          status: 'active',
          updated_at: now
        })
        .eq('id', String((existing.data as Record<string, unknown>).id))
        .select('*')
        .single();
      if (error) throw error;
      return normalizeRow(data as Record<string, unknown>);
    }

    const seat: InstitutionalArchiveSeat = {
      id: `seat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actorId: input.actorId,
      email: input.email,
      role: input.role,
      status: 'invited',
      createdAt: now,
      updatedAt: now
    };
    const { data, error } = await supabase
      .from('institutional_archive_seats')
      .insert({
        id: seat.id,
        actor_id: seat.actorId,
        email: seat.email,
        role: seat.role,
        status: seat.status,
        created_at: seat.createdAt,
        updated_at: seat.updatedAt
      })
      .select('*')
      .single();
    if (error) throw error;
    return normalizeRow(data as Record<string, unknown>);
  }

  const runtime = await readRuntime();
  const existingIndex = runtime.findIndex((entry) => entry.actorId === input.actorId && entry.email === input.email);
  if (existingIndex >= 0) {
    runtime[existingIndex] = {
      ...runtime[existingIndex],
      role: input.role,
      status: 'active',
      updatedAt: now
    };
    await writeRuntime(runtime);
    return runtime[existingIndex];
  }

  const seat: InstitutionalArchiveSeat = {
    id: `seat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorId: input.actorId,
    email: input.email,
    role: input.role,
    status: 'invited',
    createdAt: now,
    updatedAt: now
  };
  runtime.unshift(seat);
  await writeRuntime(runtime);
  return seat;
}
