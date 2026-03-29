import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import { DEFAULT_ENTERPRISE_STAGE_WEIGHTS, type EnterpriseStageWeightMap } from '@/app/lib/enterpriseForecastConfig';

export interface EnterprisePipelineSettings {
  stageWeights: EnterpriseStageWeightMap;
  updatedAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'enterprise-pipeline-settings.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('enterprise settings');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

function normalizeWeights(input?: Partial<Record<keyof EnterpriseStageWeightMap, number>>): EnterpriseStageWeightMap {
  return {
    lead: clampWeight(input?.lead, DEFAULT_ENTERPRISE_STAGE_WEIGHTS.lead),
    discovery: clampWeight(input?.discovery, DEFAULT_ENTERPRISE_STAGE_WEIGHTS.discovery),
    proposal: clampWeight(input?.proposal, DEFAULT_ENTERPRISE_STAGE_WEIGHTS.proposal),
    negotiation: clampWeight(input?.negotiation, DEFAULT_ENTERPRISE_STAGE_WEIGHTS.negotiation),
    won: clampWeight(input?.won, DEFAULT_ENTERPRISE_STAGE_WEIGHTS.won),
    lost: clampWeight(input?.lost, DEFAULT_ENTERPRISE_STAGE_WEIGHTS.lost)
  };
}

function clampWeight(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(1, parsed));
}

export async function getEnterprisePipelineSettings(): Promise<EnterprisePipelineSettings> {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const result = await supabase
      .from('enterprise_pipeline_settings')
      .select('*')
      .eq('settings_key', 'default')
      .maybeSingle();
    if (!result.error && result.data) {
      return {
        stageWeights: normalizeWeights((result.data.stage_weights as Partial<Record<keyof EnterpriseStageWeightMap, number>>) || undefined),
        updatedAt: String(result.data.updated_at || new Date().toISOString())
      };
    }
  }

  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '');
  if (!raw) {
    return { stageWeights: DEFAULT_ENTERPRISE_STAGE_WEIGHTS, updatedAt: new Date().toISOString() };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<EnterprisePipelineSettings>;
    return {
      stageWeights: normalizeWeights(parsed.stageWeights),
      updatedAt: String(parsed.updatedAt || new Date().toISOString())
    };
  } catch {
    return { stageWeights: DEFAULT_ENTERPRISE_STAGE_WEIGHTS, updatedAt: new Date().toISOString() };
  }
}

export async function updateEnterprisePipelineSettings(
  weights: Partial<Record<keyof EnterpriseStageWeightMap, number>>
): Promise<EnterprisePipelineSettings> {
  const next: EnterprisePipelineSettings = {
    stageWeights: normalizeWeights(weights),
    updatedAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('enterprise_pipeline_settings').upsert(
      {
        settings_key: 'default',
        stage_weights: next.stageWeights,
        updated_at: next.updatedAt
      },
      { onConflict: 'settings_key' }
    );
    return next;
  }

  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(next, null, 2), 'utf8');
  return next;
}
