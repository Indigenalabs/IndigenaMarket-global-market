import {
  ACCESS_PLANS,
  CREATOR_PLANS,
  LIFETIME_PLANS,
  MEMBER_PLANS,
  TEAM_PLANS,
  type AccessPlanId,
  type CreatorPlanId,
  type LifetimePlanId,
  type MemberPlanId,
  type TeamPlanId
} from '@/app/lib/monetization';

export type CheckoutFamily = 'member' | 'creator' | 'access' | 'team' | 'lifetime';

export interface CheckoutPlanConfig {
  family: CheckoutFamily;
  planId: string;
  name: string;
  description: string;
  amount: number;
  cadence: 'monthly' | 'annual' | 'one-time';
}

export function resolveCheckoutPlanConfig(
  family: CheckoutFamily,
  planId: string,
  cadence: 'monthly' | 'annual' | 'one-time'
): CheckoutPlanConfig | null {
  if (family === 'member') {
    const plan = MEMBER_PLANS.find((entry) => entry.id === planId as MemberPlanId);
    if (!plan) return null;
    return {
      family,
      planId,
      name: plan.name,
      description: plan.description,
      amount: cadence === 'annual' ? plan.annualPrice : plan.monthlyPrice,
      cadence
    };
  }
  if (family === 'creator') {
    const plan = CREATOR_PLANS.find((entry) => entry.id === planId as CreatorPlanId);
    if (!plan) return null;
    return {
      family,
      planId,
      name: plan.name,
      description: plan.description,
      amount: cadence === 'annual' ? plan.annualPrice : plan.monthlyPrice,
      cadence
    };
  }
  if (family === 'access') {
    const plan = ACCESS_PLANS.find((entry) => entry.id === planId as AccessPlanId);
    if (!plan) return null;
    return {
      family,
      planId,
      name: plan.name,
      description: plan.description,
      amount: cadence === 'annual' ? plan.annualPrice : plan.monthlyPrice,
      cadence
    };
  }
  if (family === 'team') {
    const plan = TEAM_PLANS.find((entry) => entry.id === planId as TeamPlanId);
    if (!plan) return null;
    const amount = cadence === 'annual' ? plan.annualPrice : plan.monthlyPrice;
    if (amount === null) return null;
    return {
      family,
      planId,
      name: plan.name,
      description: plan.description,
      amount,
      cadence
    };
  }
  if (family === 'lifetime') {
    const plan = LIFETIME_PLANS.find((entry) => entry.id === planId as LifetimePlanId);
    if (!plan) return null;
    return {
      family,
      planId,
      name: plan.name,
      description: plan.description,
      amount: plan.price,
      cadence: 'one-time'
    };
  }
  return null;
}
