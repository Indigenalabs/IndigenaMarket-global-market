import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface EnterpriseArtifactPaymentRecord {
  id: string;
  artifactId: string;
  amount: number;
  currency: string;
  reference: string;
  paidAt: string;
  note: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'enterprise-artifact-payments.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('enterprise artifact payments');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<EnterpriseArtifactPaymentRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EnterpriseArtifactPaymentRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: EnterpriseArtifactPaymentRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function mapRow(row: Record<string, unknown>): EnterpriseArtifactPaymentRecord {
  return {
    id: String(row.id || ''),
    artifactId: String(row.artifact_id || ''),
    amount: Number(row.amount || 0),
    currency: String(row.currency || 'USD'),
    reference: String(row.reference || ''),
    paidAt: String(row.paid_at || new Date().toISOString()),
    note: String(row.note || '')
  };
}

export async function listEnterpriseArtifactPayments(artifactId: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('enterprise_artifact_payments')
      .select('*')
      .eq('artifact_id', artifactId)
      .order('paid_at', { ascending: false });
    if (error) return [];
    return (data || []).map((row) => mapRow(row as Record<string, unknown>));
  }
  const runtime = await readRuntime();
  return runtime.filter((entry) => entry.artifactId === artifactId);
}

export async function createEnterpriseArtifactPayment(
  input: Omit<EnterpriseArtifactPaymentRecord, 'id'>
) {
  const record: EnterpriseArtifactPaymentRecord = {
    id: `epay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...input
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('enterprise_artifact_payments')
      .insert({
        id: record.id,
        artifact_id: record.artifactId,
        amount: record.amount,
        currency: record.currency,
        reference: record.reference,
        paid_at: record.paidAt,
        note: record.note
      })
      .select('*')
      .maybeSingle();
    return data ? mapRow(data as Record<string, unknown>) : record;
  }

  const runtime = await readRuntime();
  runtime.unshift(record);
  await writeRuntime(runtime);
  return record;
}
