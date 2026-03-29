import { isSupabaseServerConfigured } from '@/app/lib/supabase/server';

function envFlag(name: string) {
  return String(process.env[name] || '').trim().toLowerCase() === 'true';
}

function envValue(name: string) {
  return String(process.env[name] || '').trim().toLowerCase();
}

export function isProductionRuntimeFallbackAllowed() {
  return envFlag('ALLOW_RUNTIME_PERSISTENCE_IN_PRODUCTION');
}

function isBuildPhase() {
  return String(process.env.NEXT_PHASE || '').includes('phase-production-build');
}

function isHostedProductionRuntime() {
  if (envValue('app_env') === 'production') return true;
  return Boolean(
    process.env.VERCEL ||
      process.env.CF_PAGES ||
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RENDER ||
      process.env.FLY_APP_NAME ||
      process.env.AWS_EXECUTION_ENV ||
      process.env.K_SERVICE
  );
}

export function assertRuntimePersistenceAllowed(feature: string) {
  if (isSupabaseServerConfigured()) return;
  if (isBuildPhase()) return;
  if (process.env.NODE_ENV !== 'production') return;
  if (!isHostedProductionRuntime()) return;
  if (isProductionRuntimeFallbackAllowed()) return;
  throw new Error(
    `${feature} requires Supabase-backed persistence in production. ` +
      'Configure Supabase or explicitly allow runtime persistence for a non-production deployment.'
  );
}

export function assertPrivateStorageAvailable(feature: string) {
  if (isSupabaseServerConfigured()) return;
  if (isBuildPhase()) return;
  if (process.env.NODE_ENV !== 'production') return;
  if (!isHostedProductionRuntime()) return;
  throw new Error(`${feature} requires private Supabase storage in production.`);
}
