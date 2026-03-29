import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface EnterpriseArtifactRecord {
  id: string;
  inquiryId: string;
  kind: 'proposal' | 'invoice';
  title: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'approved' | 'paid' | 'void';
  issuedAt: string | null;
  dueDate: string | null;
  attachmentUrl: string;
  attachmentName: string;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'enterprise-artifacts.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('enterprise artifacts');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<EnterpriseArtifactRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EnterpriseArtifactRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: EnterpriseArtifactRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function mapRow(row: Record<string, unknown>): EnterpriseArtifactRecord {
  return {
    id: String(row.id || ''),
    inquiryId: String(row.inquiry_id || ''),
    kind: String(row.kind || 'proposal') as EnterpriseArtifactRecord['kind'],
    title: String(row.title || ''),
    amount: Number(row.amount || 0),
    currency: String(row.currency || 'USD'),
    status: String(row.status || 'draft') as EnterpriseArtifactRecord['status'],
    issuedAt: row.issued_at ? String(row.issued_at) : null,
    dueDate: row.due_date ? String(row.due_date) : null,
    attachmentUrl: String(row.attachment_url || ''),
    attachmentName: String(row.attachment_name || ''),
    storagePath: String(row.storage_path || ''),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString())
  };
}

export async function listEnterpriseArtifacts(inquiryId?: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    let query = supabase.from('enterprise_artifacts').select('*').order('updated_at', { ascending: false }).limit(200);
    if (inquiryId) query = query.eq('inquiry_id', inquiryId);
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map((row) => mapRow(row as Record<string, unknown>));
  }
  const runtime = await readRuntime();
  return inquiryId ? runtime.filter((entry) => entry.inquiryId === inquiryId) : runtime;
}

export async function getEnterpriseArtifactById(id: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('enterprise_artifacts').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return mapRow(data as Record<string, unknown>);
  }
  const runtime = await readRuntime();
  return runtime.find((entry) => entry.id === id) || null;
}

export async function upsertEnterpriseArtifact(
  input: Partial<EnterpriseArtifactRecord> & { inquiryId: string; kind: EnterpriseArtifactRecord['kind']; title: string }
) {
  const now = new Date().toISOString();
  const record: EnterpriseArtifactRecord = {
    id: input.id || `ear-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    inquiryId: input.inquiryId,
    kind: input.kind,
    title: input.title,
    amount: Number(input.amount || 0),
    currency: input.currency || 'USD',
    status: input.status || 'draft',
    issuedAt: input.issuedAt || null,
    dueDate: input.dueDate || null,
    attachmentUrl: input.attachmentUrl || '',
    attachmentName: input.attachmentName || '',
    storagePath: input.storagePath || '',
    createdAt: input.createdAt || now,
    updatedAt: now
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('enterprise_artifacts')
      .upsert({
        id: record.id,
        inquiry_id: record.inquiryId,
        kind: record.kind,
        title: record.title,
        amount: record.amount,
        currency: record.currency,
        status: record.status,
        issued_at: record.issuedAt,
        due_date: record.dueDate,
        attachment_url: record.attachmentUrl,
        attachment_name: record.attachmentName,
        storage_path: record.storagePath,
        created_at: record.createdAt,
        updated_at: record.updatedAt
      })
      .select('*')
      .maybeSingle();
    return data ? mapRow(data as Record<string, unknown>) : record;
  }

  const runtime = await readRuntime();
  const next = [record, ...runtime.filter((entry) => entry.id !== record.id)];
  await writeRuntime(next);
  return record;
}
