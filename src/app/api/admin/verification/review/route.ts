import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { listVerificationPurchaseEvents, listVerificationPurchases, updateVerificationPurchaseStatus } from '@/app/lib/verificationPurchases';
import { listElderSignatureRequestEvents, listElderSignatureRequests, updateElderSignatureRequest } from '@/app/lib/elderSignatureRequests';
import { listVerificationApplications, listVerificationStatusHistory, updateVerificationApplicationStatus } from '@/app/lib/indigenousVerification';

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const [applications, purchases, elderRequests] = await Promise.all([
    listVerificationApplications(200),
    listVerificationPurchases(200),
    listElderSignatureRequests(200)
  ]);
  const [statusHistory, purchaseEvents, elderRequestEvents] = await Promise.all([
    listVerificationStatusHistory(300),
    listVerificationPurchaseEvents(300),
    listElderSignatureRequestEvents(300)
  ]);
  return NextResponse.json({ applications, statusHistory, purchases, elderRequests, purchaseEvents, elderRequestEvents });
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

  if (entity === 'application') {
    const status = String(body.status || '').trim() as
      | 'draft'
      | 'pending_review'
      | 'provisional_verified'
      | 'verified_indigenous_seller'
      | 'verified_community'
      | 'verified_elder_authority'
      | 'restricted';
    if (![
      'draft',
      'pending_review',
      'provisional_verified',
      'verified_indigenous_seller',
      'verified_community',
      'verified_elder_authority',
      'restricted'
    ].includes(status)) {
      return NextResponse.json({ message: 'Invalid verification application status' }, { status: 400 });
    }
    const application = await updateVerificationApplicationStatus({
      id,
      status,
      reviewerActorId: auth.identity?.actorId || 'platform-admin',
      decisionNotes: String(body.decisionNotes || '').trim() || `Admin changed verification status to ${status}`
    });
    return NextResponse.json({ application });
  }

  return NextResponse.json({ message: 'entity must be application, purchase, or elder-request' }, { status: 400 });
}

