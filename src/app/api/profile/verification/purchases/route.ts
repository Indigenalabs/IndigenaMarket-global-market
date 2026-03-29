import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import { resolveRequestWallet } from '@/app/lib/requestIdentity';
import { listVerificationPurchasesForActor } from '@/app/lib/verificationPurchases';

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get('slug') || '').trim();
  if (!slug) {
    return NextResponse.json({ message: 'slug is required.' }, { status: 400 });
  }

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Connect your wallet to view verification purchases.',
    forbiddenMessage: 'You can only view verification purchases for your own creator profile.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  const purchases = await listVerificationPurchasesForActor(owner.actorId, resolveRequestWallet(req), slug);
  return NextResponse.json({ data: { purchases } });
}
