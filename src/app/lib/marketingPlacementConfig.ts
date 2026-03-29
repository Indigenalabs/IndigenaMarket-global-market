import { MARKETING_PLACEMENTS, type MarketingPlacement, type MarketingPlacementScope } from '@/app/profile/data/marketingInventory';
import { isServeablePlacementScope } from '@/app/lib/marketingPlacementFeeds';

export function findMarketingPlacementById(id: string) {
  return MARKETING_PLACEMENTS.find((placement) => placement.id === id) ?? null;
}

export function parsePlacementPriceAmount(priceLabel: string) {
  const match = priceLabel.match(/\$([\d.]+)/);
  return match ? Number(match[1]) : 0;
}

export function inferPlacementPeriod(priceLabel: string) {
  if (priceLabel.includes('/send')) return 'send';
  if (priceLabel.includes('/launch')) return 'launch';
  return 'week';
}

export function marketingPlacementKey(placement: MarketingPlacement) {
  return `${placement.scope}-${placement.id}`;
}

export function computeCampaignWindow(launchWeek: string) {
  const now = new Date();
  const normalized = launchWeek.trim().toLowerCase();
  let start = new Date(now);

  if (normalized === 'next monday') {
    const day = start.getDay();
    const daysUntilMonday = ((8 - day) % 7) || 7;
    start.setDate(start.getDate() + daysUntilMonday);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(launchWeek)) {
    start = new Date(`${launchWeek}T00:00:00.000Z`);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

export function canServePlacementScope(scope: MarketingPlacementScope) {
  return isServeablePlacementScope(scope);
}
