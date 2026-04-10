import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { applyPhase7CertificateAdminAction } from '@/app/lib/phase7CertificateAdmin';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ certificateId: string; action: string }> }
) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;

  const { certificateId, action } = await context.params;
  const normalizedCertificateId = String(certificateId || '').trim();
  const normalizedAction = String(action || '').trim();

  if (!normalizedCertificateId) {
    return NextResponse.json({ message: 'certificateId is required' }, { status: 400 });
  }
  if (normalizedAction !== 'revoke' && normalizedAction !== 'reissue') {
    return NextResponse.json({ message: 'action must be revoke or reissue' }, { status: 400 });
  }

  const certificate = await applyPhase7CertificateAdminAction(
    normalizedCertificateId,
    normalizedAction as 'revoke' | 'reissue'
  );
  if (!certificate) {
    return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
  }

  return NextResponse.json({ certificate });
}
