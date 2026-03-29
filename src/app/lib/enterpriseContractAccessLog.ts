import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface EnterpriseContractAccessLogRecord {
  id: string;
  contractStoragePath: string;
  actorId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'enterprise-contract-access-log.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('enterprise contract access logs');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<EnterpriseContractAccessLogRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EnterpriseContractAccessLogRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: EnterpriseContractAccessLogRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

export async function listEnterpriseContractAccessLogs(filters?: {
  limit?: number;
  contractStoragePath?: string;
}): Promise<EnterpriseContractAccessLogRecord[]> {
  const limit = Math.max(1, Math.min(200, filters?.limit || 50));
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('enterprise_contract_access_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (filters?.contractStoragePath) {
      query = query.eq('contract_storage_path', filters.contractStoragePath);
    }
    const result = await query;
    if (result.error) return [];
    return (result.data || []).map((row) => ({
      id: String(row.id),
      contractStoragePath: String(row.contract_storage_path || ''),
      actorId: String(row.actor_id || ''),
      ipAddress: String(row.ip_address || ''),
      userAgent: String(row.user_agent || ''),
      createdAt: String(row.created_at || '')
    }));
  }

  const runtime = await readRuntime();
  return runtime
    .filter((entry) => !filters?.contractStoragePath || entry.contractStoragePath === filters.contractStoragePath)
    .slice(0, limit);
}

export async function logEnterpriseContractAccess(input: {
  contractStoragePath: string;
  actorId: string;
  ipAddress: string;
  userAgent: string;
}) {
  const record: EnterpriseContractAccessLogRecord = {
    id: `eca-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    contractStoragePath: input.contractStoragePath,
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('enterprise_contract_access_logs').insert({
      id: record.id,
      contract_storage_path: record.contractStoragePath,
      actor_id: record.actorId,
      ip_address: record.ipAddress,
      user_agent: record.userAgent,
      created_at: record.createdAt
    });
    return record;
  }

  const runtime = await readRuntime();
  runtime.unshift(record);
  await writeRuntime(runtime);
  return record;
}
