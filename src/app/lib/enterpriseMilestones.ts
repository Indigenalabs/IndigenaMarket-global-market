import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface EnterpriseMilestoneRecord {
  id: string;
  inquiryId: string;
  title: string;
  owner: string;
  dueDate: string | null;
  status: 'pending' | 'in_progress' | 'done' | 'blocked';
  note: string;
  createdAt: string;
  updatedAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'enterprise-milestones.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('enterprise milestones');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<EnterpriseMilestoneRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EnterpriseMilestoneRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: EnterpriseMilestoneRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function mapRow(row: Record<string, unknown>): EnterpriseMilestoneRecord {
  return {
    id: String(row.id || ''),
    inquiryId: String(row.inquiry_id || ''),
    title: String(row.title || ''),
    owner: String(row.owner || ''),
    dueDate: row.due_date ? String(row.due_date) : null,
    status: String(row.status || 'pending') as EnterpriseMilestoneRecord['status'],
    note: String(row.note || ''),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString())
  };
}

export async function listEnterpriseMilestones(inquiryId: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('enterprise_milestones')
      .select('*')
      .eq('inquiry_id', inquiryId)
      .order('created_at', { ascending: true });
    if (error) return [];
    return (data || []).map((row) => mapRow(row as Record<string, unknown>));
  }

  const runtime = await readRuntime();
  return runtime.filter((entry) => entry.inquiryId === inquiryId);
}

export async function upsertEnterpriseMilestone(input: {
  id?: string;
  inquiryId: string;
  title: string;
  owner?: string;
  dueDate?: string | null;
  status?: EnterpriseMilestoneRecord['status'];
  note?: string;
}) {
  const now = new Date().toISOString();
  const record: EnterpriseMilestoneRecord = {
    id: input.id || `mil-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    inquiryId: input.inquiryId,
    title: input.title,
    owner: input.owner || '',
    dueDate: input.dueDate || null,
    status: input.status || 'pending',
    note: input.note || '',
    createdAt: now,
    updatedAt: now
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('enterprise_milestones')
      .upsert({
        id: record.id,
        inquiry_id: record.inquiryId,
        title: record.title,
        owner: record.owner,
        due_date: record.dueDate,
        status: record.status,
        note: record.note,
        created_at: record.createdAt,
        updated_at: record.updatedAt
      }, { onConflict: 'id' })
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  }

  const runtime = await readRuntime();
  const index = runtime.findIndex((entry) => entry.id === record.id);
  if (index >= 0) {
    runtime[index] = { ...runtime[index], ...record, createdAt: runtime[index].createdAt };
  } else {
    runtime.push(record);
  }
  await writeRuntime(runtime);
  return index >= 0 ? runtime[index] : record;
}
