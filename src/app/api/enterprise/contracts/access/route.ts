import { NextRequest, NextResponse } from 'next/server';
import { logEnterpriseContractAccess } from '@/app/lib/enterpriseContractAccessLog';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';

export const runtime = 'nodejs';

const ENTERPRISE_CONTRACT_BUCKET =
  process.env.SUPABASE_ENTERPRISE_CONTRACT_BUCKET || 'enterprise-contracts';

export async function GET(req: NextRequest) {
  const path = String(req.nextUrl.searchParams.get('path') || '').trim();
  if (!path) {
    return NextResponse.json({ message: 'Contract storage path is required.' }, { status: 400 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ message: 'Private contract storage is not configured.' }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const result = await supabase.storage.from(ENTERPRISE_CONTRACT_BUCKET).createSignedUrl(path, 60 * 5);
    if (result.error || !result.data?.signedUrl) {
      return NextResponse.json({ message: result.error?.message || 'Unable to sign contract URL.' }, { status: 500 });
    }
    await logEnterpriseContractAccess({
      contractStoragePath: path,
      actorId: resolveRequestActorId(req),
      ipAddress: (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown',
      userAgent: req.headers.get('user-agent') || ''
    });
    return NextResponse.json({ data: { url: result.data.signedUrl } }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Unable to access contract attachment.' }, { status: 500 });
  }
}
