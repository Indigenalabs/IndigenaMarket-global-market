import type { SubscriptionRecord } from '@/app/lib/subscriptionState';

export interface SubscriptionMetrics {
  activeCount: number;
  cancelledCount: number;
  churnCount: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  oneTimeRevenue: number;
  featureAdoption: {
    creatorAnalyticsUnlocked: boolean;
    unlimitedListingsUnlocked: boolean;
    teamWorkspaceUnlocked: boolean;
    archiveAccessUnlocked: boolean;
  };
}

function subscriptionAmount(record: SubscriptionRecord) {
  if (record.family === 'creator') {
    if (record.planId === 'creator') return record.billingCadence === 'annual' ? 99.9 : 9.99;
    if (record.planId === 'studio') return record.billingCadence === 'annual' ? 299.9 : 29.99;
    return 0;
  }
  if (record.family === 'member') {
    if (record.planId === 'community') return record.billingCadence === 'annual' ? 49.9 : 4.99;
    if (record.planId === 'patron') return record.billingCadence === 'annual' ? 299.9 : 29.99;
    if (record.planId === 'all-access') return record.billingCadence === 'annual' ? 149.9 : 14.99;
    return 0;
  }
  if (record.family === 'team') {
    if (record.planId === 'collective') return record.billingCadence === 'annual' ? 299.9 : 29.99;
    if (record.planId === 'hub') return record.billingCadence === 'annual' ? 990 : 99;
    return 0;
  }
  if (record.family === 'lifetime') {
    if (record.planId === 'founder') return 499;
    if (record.planId === 'elder') return 999;
  }
  if (record.family === 'access') {
    if (record.planId === 'basic-archive') return record.billingCadence === 'annual' ? 30 : 3;
    if (record.planId === 'researcher-access') return record.billingCadence === 'annual' ? 200 : 20;
    if (record.planId === 'institutional-archive') return record.billingCadence === 'annual' ? 1000 : 100;
    return record.billingCadence === 'annual' ? 49.9 : 4.99;
  }
  return 0;
}

export function summarizeSubscriptionMetrics(records: SubscriptionRecord[]): SubscriptionMetrics {
  const active = records.filter((record) => record.status === 'active');
  const cancelled = records.filter((record) => record.status === 'cancelled');
  return {
    activeCount: active.length,
    cancelledCount: cancelled.length,
    churnCount: cancelled.length,
    monthlyRecurringRevenue: active
      .filter((record) => record.billingCadence === 'monthly')
      .reduce((sum, record) => sum + subscriptionAmount(record), 0),
    annualRecurringRevenue: active
      .filter((record) => record.billingCadence === 'annual')
      .reduce((sum, record) => sum + subscriptionAmount(record), 0),
    oneTimeRevenue: records
      .filter((record) => record.billingCadence === 'one-time')
      .reduce((sum, record) => sum + subscriptionAmount(record), 0),
    featureAdoption: {
      creatorAnalyticsUnlocked: active.some((record) => record.family === 'creator' && (record.planId === 'creator' || record.planId === 'studio')),
      unlimitedListingsUnlocked: active.some((record) => record.family === 'creator' && (record.planId === 'creator' || record.planId === 'studio')),
      teamWorkspaceUnlocked: active.some((record) => record.family === 'creator' && record.planId === 'studio') || active.some((record) => record.family === 'team'),
      archiveAccessUnlocked: active.some((record) => record.family === 'access')
    }
  };
}
