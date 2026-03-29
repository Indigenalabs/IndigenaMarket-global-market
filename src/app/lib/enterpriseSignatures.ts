import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface EnterpriseSignatureRecord {
  id: string;
  inquiryId: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  status: 'pending' | 'sent' | 'signed' | 'declined';
  requestedAt: string;
  signedAt: string | null;
  note: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'enterprise-signatures.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('enterprise signatures');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<EnterpriseSignatureRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EnterpriseSignatureRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: EnterpriseSignatureRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function mapRow(row: Record<string, unknown>): EnterpriseSignatureRecord {
  return {
    id: String(row.id || ''),
    inquiryId: String(row.inquiry_id || ''),
    signerName: String(row.signer_name || ''),
    signerEmail: String(row.signer_email || ''),
    signerRole: String(row.signer_role || ''),
    status: String(row.status || 'pending') as EnterpriseSignatureRecord['status'],
    requestedAt: String(row.requested_at || new Date().toISOString()),
    signedAt: row.signed_at ? String(row.signed_at) : null,
    note: String(row.note || '')
  };
}

export async function listEnterpriseSignatures(inquiryId: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('enterprise_signatures')
      .select('*')
      .eq('inquiry_id', inquiryId)
      .order('requested_at', { ascending: false });
    if (error) return [];
    return (data || []).map((row) => mapRow(row as Record<string, unknown>));
  }
  const runtime = await readRuntime();
  return runtime.filter((entry) => entry.inquiryId === inquiryId);
}

export async function upsertEnterpriseSignature(
  input: Partial<EnterpriseSignatureRecord> & { inquiryId: string; signerName: string; signerEmail: string; signerRole: string }
) {
  const now = new Date().toISOString();
  const record: EnterpriseSignatureRecord = {
    id: input.id || `esig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    inquiryId: input.inquiryId,
    signerName: input.signerName,
    signerEmail: input.signerEmail,
    signerRole: input.signerRole,
    status: input.status || 'pending',
    requestedAt: input.requestedAt || now,
    signedAt: input.signedAt || null,
    note: input.note || ''
  };

  if (record.status === 'signed' && !record.signedAt) {
    record.signedAt = now;
  }

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('enterprise_signatures')
      .upsert({
        id: record.id,
        inquiry_id: record.inquiryId,
        signer_name: record.signerName,
        signer_email: record.signerEmail,
        signer_role: record.signerRole,
        status: record.status,
        requested_at: record.requestedAt,
        signed_at: record.signedAt,
        note: record.note
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
