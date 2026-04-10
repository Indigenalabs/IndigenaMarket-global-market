import { NextRequest, NextResponse } from 'next/server';
import { listCourseCertificates } from '@/app/lib/courseCertificates';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { applyPhase7CertificateAdminAction } from '@/app/lib/phase7CertificateAdmin';

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const certificates = await listCourseCertificates(200);
  return NextResponse.json({ certificates });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const certificateId = String(body.certificateId || '').trim();
  const action = String(body.action || '').trim();
  if (!certificateId) return NextResponse.json({ message: 'certificateId is required' }, { status: 400 });
  if (action !== 'revoke' && action !== 'reissue') {
    return NextResponse.json({ message: 'action must be revoke or reissue' }, { status: 400 });
  }

  const certificate = await applyPhase7CertificateAdminAction(certificateId, action as 'revoke' | 'reissue');
  if (!certificate) {
    return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
  }

  return NextResponse.json({ certificate });
}
