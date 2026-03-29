import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export type ArchiveAccessAction =
  | 'recording-download'
  | 'citation-export'
  | 'offline-pack'
  | 'citation-bundle';

export interface ArchiveAccessLogRecord {
  id: string;
  actorId: string;
  walletAddress: string;
  listingId: string;
  action: ArchiveAccessAction;
  accessLevel: string;
  fileName: string;
  createdAt: string;
}

export interface ArchiveAccessAnomaly {
  actorId: string;
  accessCount: number;
  distinctListings: number;
  recentBurstCount: number;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'archive-access-logs.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('archive access logs');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<ArchiveAccessLogRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ArchiveAccessLogRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: ArchiveAccessLogRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function normalizeRow(row: Record<string, unknown>): ArchiveAccessLogRecord {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    walletAddress: String(row.wallet_address || ''),
    listingId: String(row.listing_id || ''),
    action: String(row.action || 'recording-download') as ArchiveAccessAction,
    accessLevel: String(row.access_level || 'community'),
    fileName: String(row.file_name || ''),
    createdAt: String(row.created_at || '')
  };
}

export async function appendArchiveAccessLog(input: Omit<ArchiveAccessLogRecord, 'id' | 'createdAt'>) {
  const record: ArchiveAccessLogRecord = {
    id: `aal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('archive_access_logs').insert({
      id: record.id,
      actor_id: record.actorId,
      wallet_address: record.walletAddress || null,
      listing_id: record.listingId,
      action: record.action,
      access_level: record.accessLevel,
      file_name: record.fileName,
      created_at: record.createdAt
    });
    return record;
  }

  const runtime = await readRuntime();
  runtime.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function listArchiveAccessLogs(limit = 100) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('archive_access_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map((row) => normalizeRow(row as Record<string, unknown>));
  }

  const runtime = await readRuntime();
  return runtime.slice(0, limit);
}

export function summarizeArchiveAccessAnomalies(logs: ArchiveAccessLogRecord[]) {
  const now = Date.now();
  const byActor = new Map<string, ArchiveAccessLogRecord[]>();
  for (const entry of logs) {
    const actorKey = entry.actorId || entry.walletAddress || 'unknown';
    const list = byActor.get(actorKey) || [];
    list.push(entry);
    byActor.set(actorKey, list);
  }

  return Array.from(byActor.entries())
    .map(([actorId, entries]) => {
      const distinctListings = new Set(entries.map((entry) => entry.listingId)).size;
      const recentBurstCount = entries.filter((entry) => now - new Date(entry.createdAt).getTime() <= 1000 * 60 * 60).length;
      return {
        actorId,
        accessCount: entries.length,
        distinctListings,
        recentBurstCount
      } satisfies ArchiveAccessAnomaly;
    })
    .filter((entry) => entry.accessCount >= 4 || entry.recentBurstCount >= 3)
    .sort((a, b) => b.recentBurstCount - a.recentBurstCount || b.accessCount - a.accessCount);
}
