import { NextRequest } from 'next/server';
import type { CreatorPlanId, MemberPlanId } from '@/app/lib/monetization';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { getActorEntitlements } from '@/app/lib/subscriptionState';

type JsonMap = Record<string, unknown>;

export async function resolveRequestPlanIds(req: NextRequest, body: JsonMap) {
  const actorId = resolveRequestActorId(req);
  const walletAddress = resolveRequestWallet(req);
  const entitlements = await getActorEntitlements(actorId, walletAddress);
  const requestedCreatorPlanId =
    (typeof body.creatorPlan === 'string' ? body.creatorPlan : undefined) as CreatorPlanId | undefined;
  const requestedMemberPlanId =
    (typeof body.memberPlan === 'string' ? body.memberPlan : undefined) as MemberPlanId | undefined;
  const creatorPlanId =
    entitlements.creatorPlanId !== 'free' ? entitlements.creatorPlanId : requestedCreatorPlanId || 'free';
  const memberPlanId =
    entitlements.memberPlanId !== 'free' ? entitlements.memberPlanId : requestedMemberPlanId || 'free';
  return {
    actorId,
    walletAddress,
    creatorPlanId,
    memberPlanId,
    entitlements
  };
}
