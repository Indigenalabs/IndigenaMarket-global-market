import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { listVerificationPurchaseEvents, listVerificationPurchases, updateVerificationPurchaseStatus } from '@/app/lib/verificationPurchases';
import { listElderSignatureRequestEvents, listElderSignatureRequests, updateElderSignatureRequest } from '@/app/lib/elderSignatureRequests';

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const [purchases, elderRequests] = await Promise.all([
    listVerificationPurchases(200),
    listElderSignatureRequests(200)
  ]);
  const [purchaseEvents, elderRequestEvents] = await Promise.all([
    listVerificationPurchaseEvents(300),
    listElderSignatureRequestEvents(300)
  ]);
  return NextResponse.json({ purchases, elderRequests, purchaseEvents, elderRequestEvents });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const entity = String(body.entity || '').trim();
  const id = String(body.id || '').trim();
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

  if (entity === 'purchase') {
    const status = String(body.status || '').trim() as 'pending' | 'paid' | 'cancelled';
    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return NextResponse.json({ message: 'Invalid verification purchase status' }, { status: 400 });
    }
    const purchase = await updateVerificationPurchaseStatus({
      id,
      status,
      actorId: auth.identity?.actorId || 'platform-admin',
      note: `Admin changed purchase to ${status}`
    });
    return NextResponse.json({ purchase });
  }

  if (entity === 'elder-request') {
    const status = String(body.status || '').trim() as 'pending' | 'approved' | 'rejected';
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid elder-signature status' }, { status: 400 });
    }
    const reviewedBy = auth.identity?.actorId || 'platform-admin';
    const elderRequest = await updateElderSignatureRequest({
      id,
      status,
      reviewedBy,
      note: `Admin changed elder request to ${status}`
    });
    return NextResponse.json({ elderRequest });
  }

  return NextResponse.json({ message: 'entity must be purchase or elder-request' }, { status: 400 });
}
