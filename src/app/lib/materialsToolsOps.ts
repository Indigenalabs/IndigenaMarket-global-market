import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export type MaterialsToolsReviewStatus = 'pending' | 'in-review' | 'approved' | 'rejected';

export type MaterialsToolsActionType =
  | 'wishlist'
  | 'tool-library-application'
  | 'verified-supplier-application'
  | 'elder-approval-request'
  | 'listing-proof-document'
  | 'coop-commit';

export interface MaterialsToolsReviewEvent {
  status: MaterialsToolsReviewStatus;
  note: string;
  reviewedBy: string;
  reviewedAt: string;
}

export interface MaterialsToolsActionRecord {
  id: string;
  actionType: MaterialsToolsActionType;
  actorId: string;
  walletAddress: string;
  payload: Record<string, unknown>;
  createdAt: string;
  reviewStatus: MaterialsToolsReviewStatus;
  reviewNote: string;
  reviewedBy: string;
  reviewedAt: string;
  history: MaterialsToolsReviewEvent[];
  summaryTitle: string;
  summaryDetail: string;
}

export interface MaterialsToolsSettingsOverview {
  actorId: string;
  applications: MaterialsToolsActionRecord[];
  latestByType: Partial<Record<MaterialsToolsActionType, MaterialsToolsActionRecord>>;
  counts: Record<MaterialsToolsReviewStatus, number>;
}

export interface MaterialsToolsOperationsDashboard {
  queue: MaterialsToolsActionRecord[];
  counts: {
    total: number;
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
  byType: Array<{
    actionType: MaterialsToolsActionType;
    label: string;
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const ACTIONS_FILE = path.join(RUNTIME_DIR, 'materials-tools-actions.json');

const ACTION_LABELS: Record<MaterialsToolsActionType, string> = {
  wishlist: 'Sourcing wishlist',
  'tool-library-application': 'Tool library application',
  'verified-supplier-application': 'Verified supplier application',
  'elder-approval-request': 'Elder approval request',
  'listing-proof-document': 'Listing proof document',
  'coop-commit': 'Co-op commitment',
};

function ensureRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('materials tools operations');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntimeActions(): Promise<MaterialsToolsActionRecord[]> {
  await ensureDir();
  const raw = await fs.readFile(ACTIONS_FILE, 'utf8').catch(() => '');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MaterialsToolsActionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRuntimeActions(records: MaterialsToolsActionRecord[]) {
  await ensureDir();
  await fs.writeFile(ACTIONS_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function summarizeAction(actionType: MaterialsToolsActionType, payload: Record<string, unknown>) {
  switch (actionType) {
    case 'wishlist':
      return {
        summaryTitle: String(payload.title || 'Studio sourcing request'),
        summaryDetail: String(payload.details || 'No sourcing context provided.'),
      };
    case 'tool-library-application':
      return {
        summaryTitle: String(payload.studioName || 'Tool library membership request'),
        summaryDetail: String(payload.equipmentNeed || 'No equipment need provided.'),
      };
    case 'verified-supplier-application':
      return {
        summaryTitle: String(payload.organization || 'Verified supplier application'),
        summaryDetail: String(payload.specialty || 'No specialty provided.'),
      };
    case 'elder-approval-request':
      return {
        summaryTitle: String(payload.materialName || 'Restricted material request'),
        summaryDetail: String(payload.useCase || 'No use-case provided.'),
      };
    case 'listing-proof-document':
      return {
        summaryTitle: String(payload.label || 'Proof document attached'),
        summaryDetail: `Listing ${String(payload.productId || 'unknown')}`,
      };
    case 'coop-commit':
      return {
        summaryTitle: `Co-op order ${String(payload.orderId || 'unknown')}`,
        summaryDetail: `${Number(payload.units || 0)} units committed`,
      };
    default:
      return { summaryTitle: ACTION_LABELS[actionType], summaryDetail: '' };
  }
}

function normalizeActionRow(row: Record<string, unknown>): MaterialsToolsActionRecord {
  const payload = ensureRecord(row.payload);
  const reviewStatus = (String(payload.reviewStatus || 'pending') as MaterialsToolsReviewStatus);
  const history = Array.isArray(payload.reviewHistory)
    ? payload.reviewHistory.map((entry) => {
        const event = ensureRecord(entry);
        return {
          status: String(event.status || 'pending') as MaterialsToolsReviewStatus,
          note: String(event.note || ''),
          reviewedBy: String(event.reviewedBy || ''),
          reviewedAt: String(event.reviewedAt || ''),
        };
      })
    : [];
  const summary = summarizeAction(String(row.action_type || row.actionType || 'wishlist') as MaterialsToolsActionType, payload);

  return {
    id: String(row.id || ''),
    actionType: String(row.action_type || row.actionType || 'wishlist') as MaterialsToolsActionType,
    actorId: String(row.actor_id || row.actorId || ''),
    walletAddress: String(row.wallet_address || row.walletAddress || ''),
    payload,
    createdAt: String(row.created_at || row.createdAt || ''),
    reviewStatus,
    reviewNote: String(payload.reviewNote || ''),
    reviewedBy: String(payload.reviewedBy || ''),
    reviewedAt: String(payload.reviewedAt || ''),
    history,
    summaryTitle: summary.summaryTitle,
    summaryDetail: summary.summaryDetail,
  };
}

function withReviewPayload(
  payload: Record<string, unknown>,
  reviewStatus: MaterialsToolsReviewStatus,
  reviewNote: string,
  reviewedBy: string,
  reviewedAt: string,
  history: MaterialsToolsReviewEvent[],
) {
  return {
    ...payload,
    reviewStatus,
    reviewNote,
    reviewedBy,
    reviewedAt,
    reviewHistory: history,
  };
}

export async function listMaterialsToolsActions() {
  if (!isSupabaseServerConfigured()) {
    return readRuntimeActions();
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('materials_tools_actions')
    .select('*')
    .order('created_at', { ascending: false });

  return (data || []).map((row) => normalizeActionRow(row as Record<string, unknown>));
}

export async function createMaterialsToolsActionRecord(input: {
  actionType: MaterialsToolsActionType;
  actorId: string;
  walletAddress: string;
  payload: Record<string, unknown>;
}) {
  const now = new Date().toISOString();
  const payload = withReviewPayload(input.payload, 'pending', '', '', '', []);
  const record: MaterialsToolsActionRecord = normalizeActionRow({
    id: `mta-${crypto.randomUUID()}`,
    action_type: input.actionType,
    actor_id: input.actorId,
    wallet_address: input.walletAddress,
    payload,
    created_at: now,
  });

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('materials_tools_actions').insert({
      id: record.id,
      action_type: input.actionType,
      actor_id: input.actorId,
      wallet_address: input.walletAddress || null,
      payload,
      created_at: now,
    });
    return record;
  }

  const existing = await readRuntimeActions();
  existing.unshift(record);
  await writeRuntimeActions(existing);
  return record;
}

export async function updateMaterialsToolsActionReview(input: {
  id: string;
  status: MaterialsToolsReviewStatus;
  note: string;
  reviewedBy: string;
}) {
  const reviewedAt = new Date().toISOString();

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('materials_tools_actions')
      .select('*')
      .eq('id', input.id)
      .maybeSingle();
    if (!data) throw new Error('Materials & Tools action not found.');

    const row = normalizeActionRow(data as Record<string, unknown>);
    const nextHistory = [
      {
        status: input.status,
        note: input.note,
        reviewedBy: input.reviewedBy,
        reviewedAt,
      },
      ...row.history,
    ];
    const nextPayload = withReviewPayload(row.payload, input.status, input.note, input.reviewedBy, reviewedAt, nextHistory);
    await supabase
      .from('materials_tools_actions')
      .update({ payload: nextPayload })
      .eq('id', input.id);
    return normalizeActionRow({ ...(data as Record<string, unknown>), payload: nextPayload });
  }

  const records = await readRuntimeActions();
  const record = records.find((entry) => entry.id === input.id);
  if (!record) throw new Error('Materials & Tools action not found.');

  const nextHistory = [
    {
      status: input.status,
      note: input.note,
      reviewedBy: input.reviewedBy,
      reviewedAt,
    },
    ...record.history,
  ];
  const updated: MaterialsToolsActionRecord = {
    ...record,
    reviewStatus: input.status,
    reviewNote: input.note,
    reviewedBy: input.reviewedBy,
    reviewedAt,
    history: nextHistory,
    payload: withReviewPayload(record.payload, input.status, input.note, input.reviewedBy, reviewedAt, nextHistory),
  };

  await writeRuntimeActions(records.map((entry) => (entry.id === input.id ? updated : entry)));
  return updated;
}

export async function getMaterialsToolsSettingsOverview(actorId: string) {
  const records = (await listMaterialsToolsActions()).filter((entry) => entry.actorId === actorId);
  const latestByType: Partial<Record<MaterialsToolsActionType, MaterialsToolsActionRecord>> = {};
  for (const record of records) {
    if (!latestByType[record.actionType]) {
      latestByType[record.actionType] = record;
    }
  }
  return {
    actorId,
    applications: records,
    latestByType,
    counts: {
      pending: records.filter((entry) => entry.reviewStatus === 'pending').length,
      'in-review': records.filter((entry) => entry.reviewStatus === 'in-review').length,
      approved: records.filter((entry) => entry.reviewStatus === 'approved').length,
      rejected: records.filter((entry) => entry.reviewStatus === 'rejected').length,
    },
  } satisfies MaterialsToolsSettingsOverview;
}

export async function getMaterialsToolsOperationsDashboard() {
  const queue = await listMaterialsToolsActions();
  const actionTypes = Object.keys(ACTION_LABELS) as MaterialsToolsActionType[];
  return {
    queue,
    counts: {
      total: queue.length,
      pending: queue.filter((entry) => entry.reviewStatus === 'pending').length,
      inReview: queue.filter((entry) => entry.reviewStatus === 'in-review').length,
      approved: queue.filter((entry) => entry.reviewStatus === 'approved').length,
      rejected: queue.filter((entry) => entry.reviewStatus === 'rejected').length,
    },
    byType: actionTypes.map((actionType) => {
      const scoped = queue.filter((entry) => entry.actionType === actionType);
      return {
        actionType,
        label: ACTION_LABELS[actionType],
        total: scoped.length,
        pending: scoped.filter((entry) => entry.reviewStatus === 'pending').length,
        approved: scoped.filter((entry) => entry.reviewStatus === 'approved').length,
        rejected: scoped.filter((entry) => entry.reviewStatus === 'rejected').length,
      };
    }),
  } satisfies MaterialsToolsOperationsDashboard;
}
