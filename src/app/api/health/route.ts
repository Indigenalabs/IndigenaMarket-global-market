import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { isGlobalMockFallbackEnabled, isNamedMockFallbackEnabled } from '@/app/lib/mockMode';
import { getLaunchReadinessSnapshot } from '@/app/lib/launchReadiness';

export async function GET() {
  const supabaseConfigured = isSupabaseServerConfigured();
  const useAppApi = String(process.env.NEXT_PUBLIC_USE_APP_API || 'true').trim().toLowerCase() === 'true';
  const walletSessionConfigured = Boolean(process.env.INDIGENA_WALLET_SESSION_SECRET);
  const advocacyWebhookConfigured = Boolean(process.env.ADVOCACY_PAYMENT_WEBHOOK_SECRET);
  const advocacyEvidenceBucketConfigured = Boolean(process.env.SUPABASE_ADVOCACY_EVIDENCE_BUCKET);
  const mockFallbackEnabled = isGlobalMockFallbackEnabled();
  const tourismMocksEnabled = isNamedMockFallbackEnabled('NEXT_PUBLIC_ALLOW_TOURISM_MOCKS');
  const launchReadiness = await getLaunchReadinessSnapshot();

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: {
      nodeEnv: process.env.NODE_ENV || 'development',
      useAppApi
    },
    integrations: {
      supabaseConfigured,
      walletSessionConfigured,
      advocacyWebhookConfigured,
      advocacyEvidenceBucketConfigured
    },
    safety: {
      mockFallbackEnabled,
      tourismMocksEnabled,
      productionLike:
        useAppApi &&
        supabaseConfigured &&
        walletSessionConfigured &&
        advocacyWebhookConfigured &&
        !mockFallbackEnabled &&
        !tourismMocksEnabled
    },
    launchReadiness
  });
}
