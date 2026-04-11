import { promises as fs } from 'node:fs';
import path from 'node:path';
import { isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { isGlobalMockFallbackEnabled, isNamedMockFallbackEnabled } from '@/app/lib/mockMode';

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const AUDIT_SUMMARY_FILE = path.join(RUNTIME_DIR, 'audit-summary.json');
const LAUNCH_REPORT_FILE = path.join(RUNTIME_DIR, 'launch-readiness.json');

export interface LaunchReadinessCheck {
  key: string;
  label: string;
  ok: boolean;
  value: string;
}

export interface LaunchReadinessSnapshot {
  generatedAt: string;
  overallStatus: 'ready' | 'warning';
  score: {
    passed: number;
    total: number;
  };
  runtime: {
    nodeEnv: string;
    useAppApi: boolean;
    supabaseConfigured: boolean;
    mockFallbackEnabled: boolean;
    tourismMocksEnabled: boolean;
    runtimePersistenceAllowed: boolean;
  };
  groups: Array<{
    key: string;
    label: string;
    passed: number;
    total: number;
    checks: LaunchReadinessCheck[];
  }>;
  auditSummary: null | {
    generatedAt: string;
    visitedRoutes: number;
    totalManifestRoutes: number;
    missingDynamicPatterns: number;
    issueCount: number;
    commerceIssueCount: number;
    modalIssueCount: number;
    clean: boolean;
  };
  lastLaunchReport: null | {
    generatedAt: string;
    overallStatus: string;
    smokePassed: boolean;
    auditPassed: boolean;
  };
}

async function readJson<T>(filePath: string): Promise<T | null> {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function envCheck(key: string, label: string, value: string | undefined, required = true): LaunchReadinessCheck {
  const trimmed = String(value || '').trim();
  return {
    key,
    label,
    ok: required ? Boolean(trimmed) : true,
    value: trimmed ? 'configured' : required ? 'missing' : 'optional',
  };
}

function boolCheck(key: string, label: string, ok: boolean, value: string): LaunchReadinessCheck {
  return { key, label, ok, value };
}

function summarizeGroup(key: string, label: string, checks: LaunchReadinessCheck[]) {
  return {
    key,
    label,
    passed: checks.filter((check) => check.ok).length,
    total: checks.length,
    checks,
  };
}

export async function getLaunchReadinessSnapshot(): Promise<LaunchReadinessSnapshot> {
  const useAppApi = String(process.env.NEXT_PUBLIC_USE_APP_API || 'true').trim().toLowerCase() === 'true';
  const mockFallbackEnabled = isGlobalMockFallbackEnabled();
  const tourismMocksEnabled = isNamedMockFallbackEnabled('NEXT_PUBLIC_ALLOW_TOURISM_MOCKS');
  const runtimePersistenceAllowed =
    String(process.env.ALLOW_RUNTIME_PERSISTENCE_IN_PRODUCTION || 'false').trim().toLowerCase() === 'true';
  const supabaseConfigured = isSupabaseServerConfigured();

  const core = summarizeGroup('core', 'Core runtime', [
    envCheck('NEXT_PUBLIC_SUPABASE_URL', 'Supabase URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    envCheck('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anon key', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    envCheck('SUPABASE_SERVICE_ROLE_KEY', 'Supabase service role', process.env.SUPABASE_SERVICE_ROLE_KEY),
    envCheck('INDIGENA_WALLET_SESSION_SECRET', 'Wallet session secret', process.env.INDIGENA_WALLET_SESSION_SECRET),
    boolCheck('use_app_api', 'Internal app API mode', useAppApi, useAppApi ? 'enabled' : 'disabled'),
    boolCheck('supabase_configured', 'Supabase server wiring', supabaseConfigured, supabaseConfigured ? 'connected' : 'not configured'),
  ]);

  const finance = summarizeGroup('finance', 'Payments and payout rails', [
    envCheck('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'Stripe publishable key', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    envCheck('STRIPE_SECRET_KEY', 'Stripe secret key', process.env.STRIPE_SECRET_KEY),
    envCheck('MARKETING_PAYMENT_WEBHOOK_SECRET', 'Marketing webhook secret', process.env.MARKETING_PAYMENT_WEBHOOK_SECRET),
    envCheck('MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET', 'Materials & Tools webhook secret', process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET),
    envCheck('ADVOCACY_PAYMENT_WEBHOOK_SECRET', 'Advocacy webhook secret', process.env.ADVOCACY_PAYMENT_WEBHOOK_SECRET),
  ]);

  const storage = summarizeGroup('storage', 'Storage and media buckets', [
    envCheck('SUPABASE_ENTERPRISE_CONTRACT_BUCKET', 'Enterprise contract bucket', process.env.SUPABASE_ENTERPRISE_CONTRACT_BUCKET),
    envCheck('SUPABASE_ADVOCACY_EVIDENCE_BUCKET', 'Advocacy evidence bucket', process.env.SUPABASE_ADVOCACY_EVIDENCE_BUCKET),
    envCheck('SUPABASE_MATERIALS_TOOLS_PROOF_BUCKET', 'Materials proof bucket', process.env.SUPABASE_MATERIALS_TOOLS_PROOF_BUCKET),
    envCheck('SUPABASE_CREATOR_PROFILE_MEDIA_BUCKET', 'Creator profile media bucket', process.env.SUPABASE_CREATOR_PROFILE_MEDIA_BUCKET),
  ]);

  const safety = summarizeGroup('safety', 'Launch safety flags', [
    boolCheck('mock_fallback_disabled', 'Mock fallback disabled', !mockFallbackEnabled, mockFallbackEnabled ? 'enabled' : 'disabled'),
    boolCheck('tourism_mocks_disabled', 'Tourism mocks disabled', !tourismMocksEnabled, tourismMocksEnabled ? 'enabled' : 'disabled'),
    boolCheck(
      'runtime_persistence_disabled',
      'Runtime persistence disabled',
      !runtimePersistenceAllowed,
      runtimePersistenceAllowed ? 'enabled' : 'disabled',
    ),
  ]);

  const auditSummaryRaw = await readJson<any>(AUDIT_SUMMARY_FILE);
  const auditSummary = auditSummaryRaw
    ? {
        generatedAt: String(auditSummaryRaw.generatedAt || ''),
        visitedRoutes: Number(auditSummaryRaw.fullAudit?.visitedRoutes || 0),
        totalManifestRoutes: Number(auditSummaryRaw.fullAudit?.totalManifestRoutes || 0),
        missingDynamicPatterns: Number(auditSummaryRaw.fullAudit?.missingDynamicPatterns || 0),
        issueCount: Number(auditSummaryRaw.fullAudit?.issueCount || 0),
        commerceIssueCount: Number(auditSummaryRaw.commerceAudit?.issueCount || 0),
        modalIssueCount: Number(auditSummaryRaw.modalAudit?.issueCount || 0),
        clean:
          Number(auditSummaryRaw.fullAudit?.issueCount || 0) === 0 &&
          Number(auditSummaryRaw.fullAudit?.missingDynamicPatterns || 0) === 0 &&
          Number(auditSummaryRaw.commerceAudit?.issueCount || 0) === 0 &&
          Number(auditSummaryRaw.modalAudit?.issueCount || 0) === 0,
      }
    : null;

  const lastLaunchReportRaw = await readJson<any>(LAUNCH_REPORT_FILE);
  const lastLaunchReport = lastLaunchReportRaw
    ? {
        generatedAt: String(lastLaunchReportRaw.generatedAt || ''),
        overallStatus: String(lastLaunchReportRaw.overallStatus || ''),
        smokePassed: Boolean(lastLaunchReportRaw.smoke?.passed),
        auditPassed: Boolean(lastLaunchReportRaw.audits?.passed),
      }
    : null;

  const groups = [core, finance, storage, safety];
  const total = groups.reduce((sum, group) => sum + group.total, 0);
  const passed = groups.reduce((sum, group) => sum + group.passed, 0);
  const overallStatus =
    passed === total && Boolean(auditSummary?.clean) && !mockFallbackEnabled && !tourismMocksEnabled ? 'ready' : 'warning';

  return {
    generatedAt: new Date().toISOString(),
    overallStatus,
    score: { passed, total },
    runtime: {
      nodeEnv: process.env.NODE_ENV || 'development',
      useAppApi,
      supabaseConfigured,
      mockFallbackEnabled,
      tourismMocksEnabled,
      runtimePersistenceAllowed,
    },
    groups,
    auditSummary,
    lastLaunchReport,
  };
}
