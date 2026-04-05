import { getCommunityEntityPresentation, type CommunityStorefrontItem } from '@/app/lib/communityEntityPresentation';
import { getTreasuryByCommunitySlug } from '@/app/lib/platformTreasury';
import { getPlatformAccountBySlug, listPlatformAccounts, type PlatformAccountRecord } from '@/app/lib/platformAccounts';

export interface CommunityMarketplaceOffer {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  priceValue: number | null;
  image: string;
  pillarLabel: string;
  splitLabel: string;
  splitRuleId?: string;
  ctaLabel: string;
  href: string;
  sourceHref?: string;
  ownerProfileSlug?: string;
  status?: string;
  availabilityLabel?: string;
  communitySlug: string;
  communityName: string;
  communityNation: string;
  communityVerificationStatus: string;
}

export interface CommunityTreasuryRoutingRollup {
  routingKey: string;
  label: string;
  splitRuleId?: string;
  liveOfferCount: number;
  projectedGrossValue: number;
  realizedGrossValue: number;
  realizedTreasuryValue: number;
  ledgerEntries: number;
  offers: CommunityMarketplaceOffer[];
}

function parsePriceValue(priceLabel: string) {
  const match = priceLabel.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function toCommunityOffer(account: PlatformAccountRecord, item: CommunityStorefrontItem): CommunityMarketplaceOffer {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    priceLabel: item.priceLabel,
    priceValue: parsePriceValue(item.priceLabel),
    image: item.image,
    pillarLabel: item.pillarLabel,
    splitLabel: item.splitLabel,
    splitRuleId: item.splitRuleId,
    ctaLabel: item.ctaLabel,
    href: item.href,
    sourceHref: item.sourceHref,
    ownerProfileSlug: item.ownerProfileSlug,
    status: item.status,
    availabilityLabel: item.availabilityLabel,
    communitySlug: account.slug,
    communityName: account.displayName,
    communityNation: account.nation,
    communityVerificationStatus: account.verificationStatus
  };
}

function matchesMarketplaceSearch(offer: CommunityMarketplaceOffer, search: string) {
  if (!search.trim()) return true;
  const q = search.trim().toLowerCase();
  return [
    offer.title,
    offer.description,
    offer.communityName,
    offer.communityNation,
    offer.pillarLabel,
    offer.splitLabel,
    offer.ownerProfileSlug || ''
  ].some((value) => value.toLowerCase().includes(q));
}

function matchesPillar(offer: CommunityMarketplaceOffer, pillar?: string) {
  if (!pillar?.trim()) return true;
  const normalized = pillar.trim().toLowerCase();
  return offer.pillarLabel.toLowerCase() === normalized || offer.href.toLowerCase().includes(`/${normalized}`);
}

export async function listCommunityMarketplaceOffers(input?: { pillar?: string; search?: string }) {
  const accounts = await listPlatformAccounts({ accountTypes: ['community', 'tribe', 'collective'] });
  const offers = (
    await Promise.all(
      accounts.map(async (account) => {
        const detail = await getPlatformAccountBySlug(account.slug);
        if (!detail) return [];
        const presentation = await getCommunityEntityPresentation(detail.account, detail.members, detail.splitRules);
        return presentation.storefrontItems.map((item) => toCommunityOffer(detail.account, item));
      })
    )
  ).flat();

  return offers
    .filter((offer) => matchesPillar(offer, input?.pillar))
    .filter((offer) => matchesMarketplaceSearch(offer, input?.search || ''))
    .sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
}

export async function getCommunityTreasuryRollups(slug: string) {
  const detail = await getPlatformAccountBySlug(slug);
  if (!detail || !['community', 'tribe', 'collective'].includes(detail.account.accountType)) return null;

  const [presentation, treasury] = await Promise.all([
    getCommunityEntityPresentation(detail.account, detail.members, detail.splitRules),
    getTreasuryByCommunitySlug(slug)
  ]);
  if (!treasury) return null;

  const baseOffers = presentation.storefrontItems.map((item) => toCommunityOffer(detail.account, item));
  const rollups = Object.values(
    baseOffers.reduce<Record<string, CommunityTreasuryRoutingRollup>>((acc, offer) => {
      const key = offer.splitRuleId || offer.splitLabel || 'unrouted-community-offers';
      if (!acc[key]) {
        acc[key] = {
          routingKey: key,
          label: offer.splitLabel || 'Unrouted community offers',
          splitRuleId: offer.splitRuleId,
          liveOfferCount: 0,
          projectedGrossValue: 0,
          realizedGrossValue: 0,
          realizedTreasuryValue: 0,
          ledgerEntries: 0,
          offers: []
        };
      }
      acc[key].offers.push(offer);
      acc[key].liveOfferCount += 1;
      acc[key].projectedGrossValue += offer.priceValue || 0;
      return acc;
    }, {})
  );

  for (const rollup of rollups) {
    const matchingDistributions = treasury.splitDistributions.filter((entry) => !rollup.splitRuleId || entry.splitRuleId === rollup.splitRuleId);
    rollup.realizedGrossValue = matchingDistributions.reduce((sum, entry) => sum + entry.grossAmount, 0);
    rollup.realizedTreasuryValue = matchingDistributions.reduce(
      (sum, entry) =>
        sum +
        entry.distributions
          .filter((distribution) => distribution.beneficiaryId === treasury.treasury.accountId)
          .reduce((inner, distribution) => inner + distribution.amount, 0),
      0
    );
    rollup.ledgerEntries = treasury.ledger.filter((entry) =>
      rollup.offers.some((offer) => entry.counterparty.includes(offer.title) || entry.note.includes(offer.title))
    ).length;
  }

  return {
    treasury: treasury.treasury,
    rollups: rollups.sort((a, b) => b.projectedGrossValue - a.projectedGrossValue),
    summary: {
      liveOfferCount: rollups.reduce((sum, rollup) => sum + rollup.liveOfferCount, 0),
      projectedGrossValue: rollups.reduce((sum, rollup) => sum + rollup.projectedGrossValue, 0),
      realizedGrossValue: rollups.reduce((sum, rollup) => sum + rollup.realizedGrossValue, 0),
      realizedTreasuryValue: rollups.reduce((sum, rollup) => sum + rollup.realizedTreasuryValue, 0)
    }
  };
}
