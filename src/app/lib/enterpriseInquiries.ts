import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import type { EnterpriseOwnerRole } from '@/app/lib/enterpriseTeam';

export interface EnterpriseInquiryRecord {
  id: string;
  channel: 'licensing' | 'institutional-access' | 'consulting' | 'sponsorship';
  name: string;
  email: string;
  organization: string;
  scope: string;
  budget: string;
  detail: string;
  status: 'new' | 'reviewing' | 'qualified' | 'closed';
  contractStage: 'lead' | 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost';
  contractLifecycleState: 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'terminated';
  estimatedValue: number;
  pipelineOwner: string;
  pipelineOwnerRole: EnterpriseOwnerRole | '';
  nextStep: string;
  expectedCloseDate: string | null;
  contractStoragePath: string;
  contractAttachmentUrl: string;
  contractAttachmentName: string;
  lastReviewedAt: string | null;
  createdAt: string;
}

export interface EnterpriseInquiryEventRecord {
  id: string;
  inquiryId: string;
  actorId: string;
  eventType: 'created' | 'updated' | 'contract-uploaded' | 'stage-changed' | 'status-changed';
  note: string;
  createdAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'enterprise-inquiries.json');
const EVENTS_RUNTIME_FILE = path.join(RUNTIME_DIR, 'enterprise-inquiry-events.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('enterprise inquiries');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<EnterpriseInquiryRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EnterpriseInquiryRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(records: EnterpriseInquiryRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

async function readRuntimeEvents(): Promise<EnterpriseInquiryEventRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(EVENTS_RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EnterpriseInquiryEventRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntimeEvents(records: EnterpriseInquiryEventRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(EVENTS_RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

export async function createEnterpriseInquiry(
  input: Omit<EnterpriseInquiryRecord, 'id' | 'status' | 'contractStage' | 'contractLifecycleState' | 'estimatedValue' | 'pipelineOwner' | 'pipelineOwnerRole' | 'nextStep' | 'lastReviewedAt' | 'createdAt'> & {
    estimatedValue?: number;
    pipelineOwner?: string;
    pipelineOwnerRole?: EnterpriseOwnerRole | '';
    nextStep?: string;
    expectedCloseDate?: string | null;
    contractStoragePath?: string;
    contractAttachmentUrl?: string;
    contractAttachmentName?: string;
  }
) {
  const record: EnterpriseInquiryRecord = {
    id: `ent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...input,
    status: 'new',
    contractStage: 'lead',
    contractLifecycleState: 'draft',
    estimatedValue: Number(input.estimatedValue || 0),
    pipelineOwner: input.pipelineOwner || '',
    pipelineOwnerRole: input.pipelineOwnerRole || '',
    nextStep: input.nextStep || '',
    expectedCloseDate: input.expectedCloseDate || null,
    contractStoragePath: input.contractStoragePath || '',
    contractAttachmentUrl: input.contractAttachmentUrl || '',
    contractAttachmentName: input.contractAttachmentName || '',
    lastReviewedAt: null,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('enterprise_inquiries').insert({
      id: record.id,
      channel: record.channel,
      name: record.name,
      email: record.email,
      organization: record.organization,
      scope: record.scope,
      budget: record.budget,
      detail: record.detail,
      status: record.status,
      contract_stage: record.contractStage,
      contract_lifecycle_state: record.contractLifecycleState,
      estimated_value: record.estimatedValue,
      pipeline_owner: record.pipelineOwner,
      pipeline_owner_role: record.pipelineOwnerRole,
      next_step: record.nextStep,
      expected_close_date: record.expectedCloseDate,
      contract_storage_path: record.contractStoragePath,
      contract_attachment_url: record.contractAttachmentUrl,
      contract_attachment_name: record.contractAttachmentName,
      last_reviewed_at: record.lastReviewedAt,
      created_at: record.createdAt
    });
    await appendEnterpriseInquiryEvent({
      inquiryId: record.id,
      actorId: record.email || record.name,
      eventType: 'created',
      note: `Inquiry created for ${record.channel}.`
    });
    return record;
  }

  const runtime = await readRuntime();
  runtime.unshift(record);
  await writeRuntime(runtime);
  await appendEnterpriseInquiryEvent({
    inquiryId: record.id,
    actorId: record.email || record.name,
    eventType: 'created',
    note: `Inquiry created for ${record.channel}.`
  });
  return record;
}

function mapSupabaseInquiry(row: Record<string, unknown>): EnterpriseInquiryRecord {
  return {
    id: String(row.id),
    channel: String(row.channel) as EnterpriseInquiryRecord['channel'],
    name: String(row.name || ''),
    email: String(row.email || ''),
    organization: String(row.organization || ''),
    scope: String(row.scope || ''),
    budget: String(row.budget || ''),
    detail: String(row.detail || ''),
    status: String(row.status || 'new') as EnterpriseInquiryRecord['status'],
    contractStage: String(row.contract_stage || 'lead') as EnterpriseInquiryRecord['contractStage'],
    contractLifecycleState: String(row.contract_lifecycle_state || 'draft') as EnterpriseInquiryRecord['contractLifecycleState'],
    estimatedValue: Number(row.estimated_value || 0),
    pipelineOwner: String(row.pipeline_owner || ''),
    pipelineOwnerRole: String(row.pipeline_owner_role || '') as EnterpriseInquiryRecord['pipelineOwnerRole'],
    nextStep: String(row.next_step || ''),
    expectedCloseDate: row.expected_close_date ? String(row.expected_close_date) : null,
    contractStoragePath: String(row.contract_storage_path || ''),
    contractAttachmentUrl: String(row.contract_attachment_url || ''),
    contractAttachmentName: String(row.contract_attachment_name || ''),
    lastReviewedAt: row.last_reviewed_at ? String(row.last_reviewed_at) : null,
    createdAt: String(row.created_at || new Date().toISOString())
  };
}

function mapSupabaseInquiryEvent(row: Record<string, unknown>): EnterpriseInquiryEventRecord {
  return {
    id: String(row.id || ''),
    inquiryId: String(row.inquiry_id || ''),
    actorId: String(row.actor_id || ''),
    eventType: String(row.event_type || 'updated') as EnterpriseInquiryEventRecord['eventType'],
    note: String(row.note || ''),
    createdAt: String(row.created_at || new Date().toISOString())
  };
}

export async function listEnterpriseInquiries(filters?: {
  contractStage?: EnterpriseInquiryRecord['contractStage'];
  status?: EnterpriseInquiryRecord['status'];
}) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    let query = supabase.from('enterprise_inquiries').select('*').order('created_at', { ascending: false }).limit(200);
    if (filters?.contractStage) query = query.eq('contract_stage', filters.contractStage);
    if (filters?.status) query = query.eq('status', filters.status);
    const result = await query;
    if (result.error) return [];
    return (result.data || []).map((row) => mapSupabaseInquiry(row as Record<string, unknown>));
  }
  const runtime = await readRuntime();
  return runtime.filter((entry) => {
    if (filters?.contractStage && entry.contractStage !== filters.contractStage) return false;
    if (filters?.status && entry.status !== filters.status) return false;
    return true;
  });
}

export async function updateEnterpriseInquiry(
  id: string,
  updates: Partial<Pick<EnterpriseInquiryRecord, 'status' | 'contractStage' | 'contractLifecycleState' | 'estimatedValue' | 'pipelineOwner' | 'pipelineOwnerRole' | 'nextStep' | 'expectedCloseDate' | 'contractStoragePath' | 'contractAttachmentUrl' | 'contractAttachmentName'>>,
  actorId = 'platform-admin'
) {
  const normalized: Partial<EnterpriseInquiryRecord> = {
    ...updates,
    estimatedValue: updates.estimatedValue === undefined ? undefined : Number(updates.estimatedValue || 0),
    expectedCloseDate: updates.expectedCloseDate === undefined ? undefined : updates.expectedCloseDate || null,
    lastReviewedAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const result = await supabase
      .from('enterprise_inquiries')
      .update({
        status: normalized.status,
        contract_stage: normalized.contractStage,
        contract_lifecycle_state: normalized.contractLifecycleState,
        estimated_value: normalized.estimatedValue,
        pipeline_owner: normalized.pipelineOwner,
        pipeline_owner_role: normalized.pipelineOwnerRole,
        next_step: normalized.nextStep,
        expected_close_date: normalized.expectedCloseDate,
        contract_storage_path: normalized.contractStoragePath,
        contract_attachment_url: normalized.contractAttachmentUrl,
        contract_attachment_name: normalized.contractAttachmentName,
        last_reviewed_at: normalized.lastReviewedAt
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (result.error || !result.data) return null;
    const inquiry = mapSupabaseInquiry(result.data as Record<string, unknown>);
    const events: Array<Promise<unknown>> = [
      appendEnterpriseInquiryEvent({
        inquiryId: id,
        actorId,
        eventType: 'updated',
        note: 'Inquiry updated.'
      })
    ];
    if (updates.contractStage !== undefined) {
      events.push(
        appendEnterpriseInquiryEvent({
          inquiryId: id,
          actorId,
          eventType: 'stage-changed',
          note: `Stage changed to ${updates.contractStage}.`
        })
      );
    }
    if (updates.status !== undefined) {
      events.push(
        appendEnterpriseInquiryEvent({
          inquiryId: id,
          actorId,
          eventType: 'status-changed',
          note: `Status changed to ${updates.status}.`
        })
      );
    }
    if (updates.contractStoragePath !== undefined || updates.contractAttachmentUrl !== undefined) {
      events.push(
        appendEnterpriseInquiryEvent({
          inquiryId: id,
          actorId,
          eventType: 'contract-uploaded',
          note: 'Contract attachment updated.'
        })
      );
    }
    await Promise.all(events);
    return inquiry;
  }

  const runtime = await readRuntime();
  const index = runtime.findIndex((entry) => entry.id === id);
  if (index === -1) return null;
  runtime[index] = {
    ...runtime[index],
    ...normalized
  } as EnterpriseInquiryRecord;
  await writeRuntime(runtime);
  await appendEnterpriseInquiryEvent({
    inquiryId: id,
    actorId,
    eventType: 'updated',
    note: 'Inquiry updated.'
  });
  if (updates.contractStage !== undefined) {
    await appendEnterpriseInquiryEvent({
      inquiryId: id,
      actorId,
      eventType: 'stage-changed',
      note: `Stage changed to ${updates.contractStage}.`
    });
  }
  if (updates.status !== undefined) {
    await appendEnterpriseInquiryEvent({
      inquiryId: id,
      actorId,
      eventType: 'status-changed',
      note: `Status changed to ${updates.status}.`
    });
  }
  if (updates.contractStoragePath !== undefined || updates.contractAttachmentUrl !== undefined) {
    await appendEnterpriseInquiryEvent({
      inquiryId: id,
      actorId,
      eventType: 'contract-uploaded',
      note: 'Contract attachment updated.'
    });
  }
  return runtime[index];
}

export async function appendEnterpriseInquiryEvent(input: {
  inquiryId: string;
  actorId: string;
  eventType: EnterpriseInquiryEventRecord['eventType'];
  note: string;
}) {
  const event: EnterpriseInquiryEventRecord = {
    id: `eev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    inquiryId: input.inquiryId,
    actorId: input.actorId,
    eventType: input.eventType,
    note: input.note,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('enterprise_inquiry_events').insert({
      id: event.id,
      inquiry_id: event.inquiryId,
      actor_id: event.actorId,
      event_type: event.eventType,
      note: event.note,
      created_at: event.createdAt
    });
    return event;
  }

  const runtime = await readRuntimeEvents();
  runtime.unshift(event);
  await writeRuntimeEvents(runtime);
  return event;
}

export async function listEnterpriseInquiryEvents(inquiryId?: string, limit = 300) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('enterprise_inquiry_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (inquiryId) query = query.eq('inquiry_id', inquiryId);
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map((row) => mapSupabaseInquiryEvent(row as Record<string, unknown>));
  }

  const runtime = await readRuntimeEvents();
  const filtered = inquiryId ? runtime.filter((entry) => entry.inquiryId === inquiryId) : runtime;
  return filtered.slice(0, limit);
}
