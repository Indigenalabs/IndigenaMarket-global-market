import { NextRequest, NextResponse } from 'next/server';
import { listCourseCertificates, updateCourseCertificateStatus } from '@/app/lib/courseCertificates';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';

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
  const updated = await updateCourseCertificateStatus({
    certificateId,
    status: action === 'revoke' ? 'cancelled' : 'issued',
    reissued: action === 'reissue'
  });
  return NextResponse.json({ certificate: updated });
}
