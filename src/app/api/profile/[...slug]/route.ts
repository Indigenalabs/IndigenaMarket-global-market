import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';
import {
  getCreatorProfileBySlug,
  getProfileConnectionsBySlug,
  getProfileMessageThreadsBySlug,
  type CreatorMessageThread,
  type ProfileFeaturedReview,
  type ProfileTrustSignal,
  type ProfilePresentationSettings,
  type CreatorProfileRecord,
  type CreatorShippingSettings,
  type CreatorPayoutMethod,
  type CreatorTransaction,
  type CreatorFunnelMetric,
  type CreatorItemInsight,
  type CreatorCampaignInsight,
  type CreatorVerificationWorkflowItem,
  type CreatorSupportRequest,
  type CreatorHelpResource,
  type CreatorFinanceSummary,
  type CreatorFinanceCase,
  type CreatorSubscriptionMetrics,
  type CreatorPlanCapabilities,
  type ProfileActivity,
  type ProfileBundle,
  type ProfileCollection,
  type ProfileConnection,
  type ProfileOffering,
  type ProfilePillarId
} from '@/app/profile/data/profileShowcase';
import { applyLaunchWindowState } from '@/app/profile/lib/offeringMerchandising';
import { listFinanceLedgerEntries, summarizeFinanceLedger } from '@/app/lib/financeLedger';
import { listFinanceCases } from '@/app/lib/financeCases';
import { getActorEntitlements, listActorSubscriptions } from '@/app/lib/subscriptionState';
import { summarizeSubscriptionMetrics } from '@/app/lib/subscriptionMetrics';
import { getCreatorPlanCapabilities } from '@/app/lib/creatorEntitlements';

type DbRow = Record<string, unknown>;

function isSellerVisiblePillar(pillar: string) {
  return pillar !== 'seva';
}

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : fallback;
}

function asArray<T>(value: unknown, fallback: T[] = []) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function rowToOffering(row: DbRow): ProfileOffering {
  return applyLaunchWindowState({
    id: asText(row.id),
    title: asText(row.title),
    pillar: asText(row.pillar) as ProfileOffering['pillar'],
    pillarLabel: asText(row.pillar_label),
    icon: asText(row.icon),
    type: asText(row.offering_type),
    priceLabel: asText(row.price_label),
    image: asText(row.image_url),
    href: asText(row.href),
    blurb: asText(row.blurb),
    status: asText(row.status),
    coverImage: asText((row as DbRow).cover_image_url, asText(row.image_url)),
    ctaMode: asText((row as DbRow).cta_mode, 'view') as ProfileOffering['ctaMode'],
    ctaPreset: asText((row as DbRow).cta_preset) as ProfileOffering['ctaPreset'],
    merchandisingRank: asNumber((row as DbRow).merchandising_rank),
    galleryOrder: asArray<string>((row as DbRow).gallery_order, []),
    launchWindowStartsAt: asText((row as DbRow).launch_window_starts_at),
    launchWindowEndsAt: asText((row as DbRow).launch_window_ends_at),
    availabilityLabel: asText((row as DbRow).availability_label),
    availabilityTone: asText((row as DbRow).availability_tone, 'default') as ProfileOffering['availabilityTone'],
    featured: asBool((row as DbRow).featured),
    metadata: asArray<string>(row.metadata, [])
  });
}

function rowToActivity(row: DbRow): ProfileActivity {
  return {
    id: asText(row.id),
    type: asText(row.activity_type, 'listing') as ProfileActivity['type'],
    title: asText(row.title),
    detail: asText(row.detail),
    ago: asText(row.ago_label || row.created_at)
  };
}

function rowToSupportRequest(row: DbRow): CreatorSupportRequest {
  const status = asText(row.status, 'queued');
  const channel = asText(row.channel, 'chat');
  return {
    id: asText(row.id),
    title: asText(row.title),
    detail: asText(row.detail),
    status: (status === 'open' || status === 'resolved' ? status : 'queued') as CreatorSupportRequest['status'],
    channel: (
      channel === 'callback' || channel === 'tutorial' || channel === 'compliance' ? channel : 'chat'
    ) as CreatorSupportRequest['channel'],
    createdAt: asText(row.created_at_label) || threadTimeLabel(asText(row.created_at))
  };
}

function rowToVerificationItem(row: DbRow): CreatorVerificationWorkflowItem {
  const status = asText(row.status, 'ready');
  return {
    id: asText(row.id),
    title: asText(row.title),
    detail: asText(row.detail),
    status: (
      status === 'submitted' || status === 'needs-info' || status === 'approved' ? status : 'ready'
    ) as CreatorVerificationWorkflowItem['status'],
    actionLabel: asText(row.action_label, 'Submit now')
  };
}

function rowToPayoutMethod(row: DbRow): CreatorPayoutMethod {
  const status = asText(row.status, 'active');
  return {
    id: asText(row.id),
    label: asText(row.label),
    detail: asText(row.detail),
    status: (status === 'pending' || status === 'needs-review' ? status : 'active') as CreatorPayoutMethod['status']
  };
}

function rowToTransaction(row: DbRow): CreatorTransaction {
  const status = asText(row.status, 'Paid');
  const entryType = asText(row.entry_type, 'sale');
  const pillar = asText(row.pillar, 'digital-arts');
  return {
    id: asText(row.id),
    date: asText(row.entry_date_label) || threadTimeLabel(asText(row.created_at)),
    item: asText(row.item),
    amount: asText(row.amount),
    status: (
      status === 'Pending payout' || status === 'Settled' || status === 'Refunded' ? status : 'Paid'
    ) as CreatorTransaction['status'],
    pillar: (
      pillar === 'physical-items' ||
      pillar === 'courses' ||
      pillar === 'freelancing' ||
      pillar === 'cultural-tourism' ||
      pillar === 'language-heritage' ||
      pillar === 'land-food' ||
      pillar === 'advocacy-legal' ||
      pillar === 'materials-tools'
        ? pillar
        : 'digital-arts'
    ) as ProfilePillarId,
    type: (entryType === 'payout' || entryType === 'refund' ? entryType : 'sale') as CreatorTransaction['type']
  };
}

function rowToCampaignInsight(row: DbRow): CreatorCampaignInsight {
  const status = asText(row.status, 'draft');
  return {
    campaignId: asText(row.campaign_id),
    placementLabel: asText(row.placement_label, 'Placement'),
    status: (status === 'scheduled' || status === 'live' || status === 'completed' ? status : 'draft') as CreatorCampaignInsight['status'],
    impressions: asNumber(row.impressions),
    clicks: asNumber(row.clicks),
    ctrLabel: asText(row.ctr_label, '0%'),
    spendLabel: asText(row.spend_label, '$0')
  };
}

function buildItemInsights(offerings: ProfileOffering[]): CreatorItemInsight[] {
  return offerings.slice(0, 6).map((offering, index) => {
    const featuredBoost = offering.featured ? 1.2 : 1;
    const baseViews = Math.round((320 - index * 26) * featuredBoost);
    const saves = Math.max(12, Math.round(baseViews * 0.08));
    const conversions = Math.max(1, Math.round(saves * 0.18));
    return {
      offeringId: offering.id,
      title: offering.title,
      pillar: offering.pillar,
      views: baseViews,
      saves,
      conversions,
      revenueLabel: offering.priceLabel || 'Contact'
    };
  });
}

function buildItemInsightsFromEvents(
  offerings: ProfileOffering[],
  eventRows: DbRow[],
  transactions: CreatorTransaction[]
): CreatorItemInsight[] {
  if (eventRows.length === 0) return buildItemInsights(offerings);

  const saleCounts = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.type !== 'sale') continue;
    saleCounts.set(transaction.item, (saleCounts.get(transaction.item) ?? 0) + 1);
  }

  const viewsByOffering = new Map<string, number>();
  const messageByOffering = new Map<string, number>();
  for (const event of eventRows) {
    const offeringId = asText(event.offering_id);
    if (!offeringId) continue;
    const eventName = asText(event.event_name);
    if (eventName === 'offer_open') {
      viewsByOffering.set(offeringId, (viewsByOffering.get(offeringId) ?? 0) + 1);
    }
    if (eventName === 'message_open') {
      messageByOffering.set(offeringId, (messageByOffering.get(offeringId) ?? 0) + 1);
    }
  }

  return offerings
    .filter((offering) => viewsByOffering.has(offering.id) || saleCounts.has(offering.title))
    .slice(0, 12)
    .map((offering) => {
      const views = viewsByOffering.get(offering.id) ?? 0;
      const conversions = saleCounts.get(offering.title) ?? 0;
      const saves = Math.max(messageByOffering.get(offering.id) ?? 0, Math.round(views * 0.12));
      return {
        offeringId: offering.id,
        title: offering.title,
        pillar: offering.pillar,
        views,
        saves,
        conversions,
        revenueLabel: offering.priceLabel || 'Contact'
      };
    });
}

function buildFunnelMetrics(
  offerings: ProfileOffering[],
  followerCount: number,
  transactions: CreatorTransaction[]
): CreatorFunnelMetric[] {
  const views = offerings.reduce((sum, _, index) => sum + Math.max(90, 260 - index * 12), 0);
  const saves = Math.max(24, Math.round(views * 0.07));
  const conversions = Math.max(transactions.filter((entry) => entry.type === 'sale').length, Math.round(saves * 0.16));
  return [
    {
      id: 'views',
      label: 'Store views',
      value: views.toLocaleString('en-AU'),
      detail: `${offerings.length} active offers across the storefront`
    },
    {
      id: 'saves',
      label: 'Buyer saves',
      value: saves.toLocaleString('en-AU'),
      detail: `${followerCount.toLocaleString('en-AU')} followers in the audience loop`
    },
    {
      id: 'conversions',
      label: 'Conversions',
      value: conversions.toLocaleString('en-AU'),
      detail: `${transactions.filter((entry) => entry.type === 'sale').length} settled sale records`
    }
  ];
}

function buildFunnelMetricsFromEvents(
  eventRows: DbRow[],
  offerings: ProfileOffering[],
  followerCount: number,
  transactions: CreatorTransaction[]
): CreatorFunnelMetric[] {
  if (eventRows.length === 0) return buildFunnelMetrics(offerings, followerCount, transactions);

  const counts = {
    storefrontViews: 0,
    offerOpens: 0,
    bundleViews: 0,
    messageOpens: 0,
    reviewViews: 0
  };

  for (const event of eventRows) {
    const eventName = asText(event.event_name);
    if (eventName === 'storefront_view') counts.storefrontViews += 1;
    if (eventName === 'offer_open') counts.offerOpens += 1;
    if (eventName === 'bundle_view') counts.bundleViews += 1;
    if (eventName === 'message_open') counts.messageOpens += 1;
    if (eventName === 'reviews_view') counts.reviewViews += 1;
  }

  const conversions = transactions.filter((entry) => entry.type === 'sale').length;
  return [
    {
      id: 'views',
      label: 'Store views',
      value: counts.storefrontViews.toLocaleString('en-AU'),
      detail: `${offerings.length} active offers in the storefront`
    },
    {
      id: 'opens',
      label: 'Offer opens',
      value: counts.offerOpens.toLocaleString('en-AU'),
      detail: `${counts.bundleViews.toLocaleString('en-AU')} bundle views and ${counts.messageOpens.toLocaleString('en-AU')} message starts`
    },
    {
      id: 'conversions',
      label: 'Conversions',
      value: conversions.toLocaleString('en-AU'),
      detail: `${counts.reviewViews.toLocaleString('en-AU')} review-page visits supporting trust`
    }
  ];
}

function buildBundlesFromCollections(
  offerings: ProfileOffering[],
  collections: Array<
    ProfileCollection & {
      priceLabel?: string;
      savingsLabel?: string;
      ctaLabel?: string;
      ctaType?: ProfileBundle['ctaType'];
      leadAudience?: ProfileBundle['leadAudience'];
    }
  >
): ProfileBundle[] {
  return collections.map((collection, index) => {
    const bundleItems = offerings.filter((offering) => collection.itemIds.includes(offering.id));
    const primaryPrice = bundleItems[0]?.priceLabel || 'Bundle';
    const bundleId = collection.id.startsWith('bundle-') ? collection.id : `bundle-${collection.id}`;
    return {
      id: bundleId,
      name: collection.name,
      summary: collection.summary,
      cover: collection.cover,
      itemIds: collection.itemIds,
      pillarBreakdown: collection.pillarBreakdown,
      priceLabel: collection.priceLabel || (bundleItems.length > 1 ? `${primaryPrice} + curated bundle` : primaryPrice),
      savingsLabel:
        collection.savingsLabel ||
        (index % 2 === 0 ? 'Cross-pillar release with added context and sequencing' : 'Bundled to make discovery and buying easier'),
      ctaLabel: collection.ctaLabel || (bundleItems.length > 1 ? 'View bundle' : 'View offer'),
      ctaType: collection.ctaType || 'shop',
      leadAudience: collection.leadAudience || 'collectors'
    };
  });
}

function asBool(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function formatUsd(amount: number) {
  return `$${Math.round(amount).toLocaleString('en-AU')}`;
}

function chooseMediaUrl(value: unknown, fallback = '') {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value) || value.length === 0) return fallback;
  const first = value[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object') {
    const record = first as Record<string, unknown>;
    const maybeUrl = record.url ?? record.src ?? record.image ?? record.media_url;
    return typeof maybeUrl === 'string' ? maybeUrl : fallback;
  }
  return fallback;
}

function formatPriceLabel(amount: unknown, currency = 'USD', prefix = '') {
  if (typeof amount !== 'number') return prefix || 'Contact';
  return `${prefix}${currency === 'INDI' ? `${amount} INDI` : `$${amount.toFixed(0)}`}`;
}

function rowToConnection(row: DbRow, relationship: 'follower' | 'following'): ProfileConnection {
  return {
    actorId: asText(row.actor_id),
    slug: asText(row.slug),
    displayName: asText(row.display_name),
    username: asText(row.username),
    avatar: asText(row.avatar_url),
    nation: asText(row.nation),
    location: asText(row.location),
    verificationLabel: asText(row.verification_label, 'Verified Creator'),
    bioShort: asText(row.bio_short),
    relationship
  };
}

function threadTimeLabel(isoValue: string) {
  if (!isoValue) return 'Now';
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return isoValue;
  return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
}

async function fetchLiveOfferings(slug: string, ownerActorId: string): Promise<ProfileOffering[]> {
  const supabase = createSupabaseServerClient();
  const baseOfferingsPromise = supabase
    .from('creator_profile_offerings')
    .select('*')
    .eq('profile_slug', slug)
    .order('created_at', { ascending: false });

  const sourcePromises = [
    supabase.from('digital_art_listings').select('*').eq('creator_actor_id', ownerActorId).neq('status', 'archived'),
    supabase.from('physical_item_listings').select('*').eq('maker_actor_id', ownerActorId).neq('status', 'archived'),
    supabase.from('course_listings').select('*').eq('instructor_actor_id', ownerActorId).eq('published', true),
    supabase.from('freelancing_services').select('*').eq('freelancer_actor_id', ownerActorId).neq('status', 'archived'),
    supabase.from('tourism_experiences').select('*').eq('operator_actor_id', ownerActorId).neq('status', 'archived'),
    supabase.from('language_heritage_listings').select('*').eq('contributor_actor_id', ownerActorId),
    supabase.from('land_food_listings').select('*').eq('producer_actor_id', ownerActorId).neq('status', 'archived'),
    supabase.from('advocacy_entities').select('*').eq('actor_id', ownerActorId).neq('status', 'archived')
  ] as const;

  const [baseOfferingsRes, ...sourceResults] = await Promise.all([baseOfferingsPromise, ...sourcePromises]);

  const merged = new Map<string, ProfileOffering>();

  for (const row of baseOfferingsRes.data ?? []) {
    const offering = rowToOffering(row as DbRow);
    if (!isSellerVisiblePillar(offering.pillar)) continue;
    merged.set(`${offering.pillar}:${offering.id}`, offering);
  }

  const mappedRows: ProfileOffering[] = [
    ...((sourceResults[0].data ?? []).map((row) => ({
      id: asText(row.id),
      title: asText(row.title),
      pillar: 'digital-arts' as const,
      pillarLabel: 'Digital Art',
      icon: 'ART',
      type: asText(row.sale_type, 'Digital Artwork'),
      priceLabel: formatPriceLabel(asNumber(row.price, Number.NaN), asText(row.currency, 'INDI')),
      image: chooseMediaUrl((row as DbRow).media, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&h=900&fit=crop'),
      href: `/digital-arts/artwork/${asText(row.id)}`,
      blurb: `${asText(row.category)} release from the live digital art inventory.`,
      status: asText(row.status, 'active'),
      availabilityLabel: asText(row.status, 'Active'),
      availabilityTone: 'default',
      metadata: [asText(row.category), asBool(row.verified) ? 'Verified' : 'Pending verification'].filter(Boolean)
    })) as ProfileOffering[]),
    ...((sourceResults[1].data ?? []).map((row) => ({
      id: asText(row.id),
      title: asText(row.title),
      pillar: 'physical-items' as const,
      pillarLabel: 'Physical',
      icon: 'OBJ',
      type: asText(row.category, 'Physical Item'),
      priceLabel: formatPriceLabel(asNumber(row.price, Number.NaN), asText(row.currency, 'USD')),
      image: chooseMediaUrl((row as DbRow).media, 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=900&h=900&fit=crop'),
      href: '/?pillar=physical-items',
      blurb: `${asText(row.category)} listing from the live maker catalog.`,
      status: asText(row.status, 'active'),
      availabilityLabel: asNumber(row.stock, 0) <= 1 ? `${Math.max(asNumber(row.stock, 0), 0)} left` : 'In stock',
      availabilityTone: asNumber(row.stock, 0) <= 1 ? 'warning' : 'success',
      metadata: [`Stock ${asNumber(row.stock, 0)}`, asBool(row.verified) ? 'Verified' : 'Open'].filter(Boolean)
    })) as ProfileOffering[]),
    ...((sourceResults[2].data ?? []).map((row) => ({
      id: asText(row.id),
      title: asText(row.title),
      pillar: 'courses' as const,
      pillarLabel: 'Courses',
      icon: 'EDU',
      type: asText(row.level, 'Course'),
      priceLabel: formatPriceLabel(asNumber(row.price, Number.NaN), asText(row.currency, 'USD')),
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=900&fit=crop',
      href: `/courses/${asText(row.id)}`,
      blurb: `${asText(row.category)} learning product published from the live course catalog.`,
      status: asBool(row.published) ? 'Published' : 'Draft',
      availabilityLabel: 'Open enrollment',
      availabilityTone: 'success',
      metadata: [asText(row.category), `${asNumber(row.duration_minutes, 0)} mins`].filter(Boolean)
    })) as ProfileOffering[]),
    ...((sourceResults[3].data ?? []).map((row) => ({
      id: asText(row.id),
      title: asText(row.title),
      pillar: 'freelancing' as const,
      pillarLabel: 'Freelancing',
      icon: 'SRV',
      type: asText(row.category, 'Service'),
      priceLabel: formatPriceLabel(asNumber(row.starting_price, Number.NaN), asText(row.currency, 'USD')),
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=900&fit=crop',
      href: '/freelancing',
      blurb: `${asText(row.category)} service available for direct inquiry.`,
      status: asText(row.status, 'active'),
      availabilityLabel: 'Available',
      availabilityTone: 'success',
      metadata: [`${asNumber(row.turnaround_days, 0)} day turnaround`, asBool(row.verified) ? 'Verified' : 'Open'].filter(Boolean)
    })) as ProfileOffering[]),
    ...((sourceResults[4].data ?? []).map((row) => ({
      id: asText(row.id),
      title: asText(row.title),
      pillar: 'cultural-tourism' as const,
      pillarLabel: 'Tourism',
      icon: 'TRIP',
      type: asText(row.kind, 'Experience'),
      priceLabel: asNumber(row.price_from, Number.NaN) ? `From $${asNumber(row.price_from, 0).toFixed(0)}` : 'By arrangement',
      image: chooseMediaUrl((row as DbRow).media, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=900&fit=crop'),
      href: `/cultural-tourism/experiences/${asText(row.id)}`,
      blurb: `${asText(row.region)} experience from the live tourism operator catalog.`,
      status: asText(row.status, 'active'),
      availabilityLabel: asText(row.available_next_date) ? `Next ${asText(row.available_next_date)}` : 'Book dates',
      availabilityTone: 'warning',
      metadata: [asText(row.verification_tier), asBool(row.elder_approved) ? 'Elder approved' : null].filter(Boolean) as string[]
    })) as ProfileOffering[]),
    ...((sourceResults[5].data ?? []).map((row) => ({
      id: asText(row.id),
      title: asText(row.title),
      pillar: 'language-heritage' as const,
      pillarLabel: 'Language',
      icon: 'LORE',
      type: asText(row.kind, 'Heritage Resource'),
      priceLabel: typeof row.price === 'number' ? formatPriceLabel(asNumber(row.price, Number.NaN), asText(row.currency, 'USD')) : 'Access request',
      image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=900&h=900&fit=crop',
      href: '/language-heritage',
      blurb: `${asText(row.language_name)} resource contributed to the archive.`,
      status: asText(row.access_tier, 'public'),
      availabilityLabel: asText(row.access_tier, 'Public'),
      availabilityTone: 'default',
      metadata: [asText(row.community), asBool(row.elder_verified) ? 'Elder verified' : null].filter(Boolean) as string[]
    })) as ProfileOffering[]),
    ...((sourceResults[6].data ?? []).map((row) => ({
      id: asText(row.id),
      title: asText(row.title),
      pillar: 'land-food' as const,
      pillarLabel: 'Land & Food',
      icon: 'LAND',
      type: asText(row.listing_type, 'Product'),
      priceLabel: formatPriceLabel(asNumber(row.price, Number.NaN), asText(row.currency, 'USD')),
      image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=900&h=900&fit=crop',
      href: `/land-food/product/${asText(row.id)}`,
      blurb: `${asText(row.category)} listing from the land and food economy.`,
      status: asText(row.status, 'active'),
      availabilityLabel: asNumber(row.quantity_available, 0) > 0 ? `Qty ${asNumber(row.quantity_available, 0)}` : 'By request',
      availabilityTone: asNumber(row.quantity_available, 0) > 0 ? 'success' : 'warning',
      metadata: [asText(row.unit), `Qty ${asNumber(row.quantity_available, 0)}`].filter(Boolean)
    })) as ProfileOffering[]),
    ...((sourceResults[7].data ?? []).map((row) => ({
      id: asText(row.id),
      title: asText(row.title),
      pillar: 'advocacy-legal' as const,
      pillarLabel: 'Advocacy',
      icon: 'LAW',
      type: asText(row.entity_type, 'Advocacy'),
      priceLabel: 'View',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&h=900&fit=crop',
      href: '/advocacy-legal',
      blurb: `${asText(row.category)} initiative from the live advocacy network.`,
      status: asText(row.status, 'active'),
      availabilityLabel: 'Open intake',
      availabilityTone: 'default',
      metadata: [asText(row.category)].filter(Boolean)
    })) as ProfileOffering[])
  ];

  for (const offering of mappedRows) {
    if (!isSellerVisiblePillar(offering.pillar)) continue;
    const key = `${offering.pillar}:${offering.id}`;
    if (!merged.has(key)) merged.set(key, offering);
  }

  return Array.from(merged.values());
}

async function buildMonetizationState(input: {
  slug: string;
  actorId: string;
  walletAddress?: string;
  transactions: CreatorTransaction[];
}) {
  const ledger = await listFinanceLedgerEntries(input.slug, input.actorId, input.transactions);
  const financeCases = await listFinanceCases(input.slug, input.actorId);
  const finance = summarizeFinanceLedger(ledger);
  const subscriptions = await listActorSubscriptions(input.actorId, input.walletAddress || '');
  const entitlements = await getActorEntitlements(input.actorId, input.walletAddress || '');
  const subscriptionMetrics = summarizeSubscriptionMetrics(subscriptions);
  const creatorPlanCapabilities = getCreatorPlanCapabilities(entitlements.creatorPlanId);
  return {
    ledger,
    financeCases,
    financeSummary: finance,
    subscriptionMetrics,
    creatorPlanCapabilities,
    creatorPlanId: entitlements.creatorPlanId
  };
}

async function fetchSupabaseConnections(slug: string, kind: 'followers' | 'following'): Promise<ProfileConnection[]> {
  if (!isSupabaseServerConfigured()) return getProfileConnectionsBySlug(slug, kind);
  const supabase = createSupabaseServerClient();
  const { data: profileRow } = await supabase
    .from('creator_profiles')
    .select('owner_actor_id')
    .eq('slug', slug)
    .single();
  if (!profileRow) return getProfileConnectionsBySlug(slug, kind);

  if (kind === 'followers') {
    const { data: follows } = await supabase.from('creator_profile_follows').select('follower_actor_id').eq('profile_slug', slug);
    const actorIds = (follows ?? []).map((row) => asText(row.follower_actor_id)).filter(Boolean);
    if (actorIds.length === 0) return [];
    const { data: profiles } = await supabase
      .from('creator_profiles')
      .select('owner_actor_id, slug, display_name, username, avatar_url, nation, location, verification_label, bio_short')
      .in('owner_actor_id', actorIds);
    return (profiles ?? []).map((row) =>
      rowToConnection(
        {
          actor_id: row.owner_actor_id,
          slug: row.slug,
          display_name: row.display_name,
          username: row.username,
          avatar_url: row.avatar_url,
          nation: row.nation,
          location: row.location,
          verification_label: row.verification_label,
          bio_short: row.bio_short
        },
        'follower'
      )
    );
  }

  const { data: follows } = await supabase
    .from('creator_profile_follows')
    .select('profile_slug')
    .eq('follower_actor_id', asText(profileRow.owner_actor_id));
  const followedSlugs = (follows ?? []).map((row) => asText(row.profile_slug)).filter(Boolean);
  if (followedSlugs.length === 0) return [];
  const { data: profiles } = await supabase
    .from('creator_profiles')
    .select('owner_actor_id, slug, display_name, username, avatar_url, nation, location, verification_label, bio_short')
    .in('slug', followedSlugs);
  return (profiles ?? []).map((row) =>
    rowToConnection(
      {
        actor_id: row.owner_actor_id,
        slug: row.slug,
        display_name: row.display_name,
        username: row.username,
        avatar_url: row.avatar_url,
        nation: row.nation,
        location: row.location,
        verification_label: row.verification_label,
        bio_short: row.bio_short
      },
      'following'
    )
  );
}

async function fetchSupabaseThreads(slug: string, actorId: string): Promise<CreatorMessageThread[]> {
  if (!isSupabaseServerConfigured()) return getProfileMessageThreadsBySlug(slug);
  const supabase = createSupabaseServerClient();
  const { data: profileRow } = await supabase
    .from('creator_profiles')
    .select('owner_actor_id, slug, username, avatar_url')
    .eq('slug', slug)
    .single();
  if (!profileRow) return getProfileMessageThreadsBySlug(slug);
  if (actorId === 'guest' || actorId !== asText(profileRow.owner_actor_id)) {
    return getProfileMessageThreadsBySlug(slug);
  }

  const { data: rows } = await supabase
    .from('creator_profile_messages')
    .select('*')
    .eq('profile_slug', slug)
    .order('created_at', { ascending: false });

  const threadMap = new Map<string, CreatorMessageThread>();
  for (const row of rows ?? []) {
    const senderId = asText(row.sender_actor_id);
    const recipientId = asText(row.recipient_actor_id);
    const ownerId = asText(profileRow.owner_actor_id);
    const counterpartActorId = senderId === ownerId ? recipientId : senderId;
    if (!counterpartActorId) continue;
    const existing = threadMap.get(counterpartActorId);
    const message = {
      id: asText(row.id),
      subject: asText(row.subject),
      body: asText(row.body),
      pillar: asText(row.pillar, 'digital-arts') as ProfilePillarId,
      unread: asBool(row.unread),
      createdAt: asText(row.created_at),
      fromActorId: senderId,
      fromLabel: asText(row.sender_label),
      toActorId: recipientId,
      direction: senderId === ownerId ? ('outbound' as const) : ('inbound' as const)
    };

    if (!existing) {
      threadMap.set(counterpartActorId, {
        counterpartActorId,
        counterpartSlug: counterpartActorId,
        counterpartLabel: senderId === ownerId ? `@${counterpartActorId}` : asText(row.sender_label),
        counterpartAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
        pillar: message.pillar,
        unreadCount: message.direction === 'inbound' && message.unread ? 1 : 0,
        latestSubject: message.subject,
        latestPreview: message.body,
        latestAt: threadTimeLabel(message.createdAt),
        messages: [message]
      });
      continue;
    }

    existing.messages.push(message);
    if (message.direction === 'inbound' && message.unread) existing.unreadCount += 1;
  }

  return Array.from(threadMap.values()).map((thread) => ({
    ...thread,
    messages: [...thread.messages].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
  }));
}

async function fetchSupabaseProfile(slug: string, actorId: string): Promise<{ profile: CreatorProfileRecord; isFollowing: boolean } | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createSupabaseServerClient();

  const { data: profileRow, error: profileError } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('slug', slug)
    .single();
  if (profileError || !profileRow) return null;

  const [
    offerings,
    collectionsRes,
    itemsRes,
    activitiesRes,
    followsCountRes,
    followStateRes,
    threads,
    supportRequestsRes,
    verificationWorkflowRes,
    payoutMethodsRes,
    transactionsRes,
    campaignInsightsRes,
    analyticsEventsRes
  ] = await Promise.all([
    fetchLiveOfferings(slug, asText(profileRow.owner_actor_id)),
    supabase.from('creator_profile_collections').select('*').eq('profile_slug', slug).order('created_at', { ascending: false }),
    supabase.from('creator_profile_collection_items').select('*'),
    supabase.from('creator_profile_activities').select('*').eq('profile_slug', slug).order('created_at', { ascending: false }),
    supabase.from('creator_profile_follows').select('*', { count: 'exact', head: true }).eq('profile_slug', slug),
    actorId !== 'guest'
      ? supabase.from('creator_profile_follows').select('*', { count: 'exact', head: true }).eq('profile_slug', slug).eq('follower_actor_id', actorId)
      : Promise.resolve({ count: 0 } as { count: number | null }),
    fetchSupabaseThreads(slug, actorId),
    supabase.from('creator_profile_support_requests').select('*').eq('profile_slug', slug).order('created_at', { ascending: false }),
    supabase.from('creator_profile_verification_items').select('*').eq('profile_slug', slug).order('created_at', { ascending: false }),
    supabase.from('creator_profile_payout_methods').select('*').eq('profile_slug', slug).order('created_at', { ascending: false }),
    supabase.from('creator_profile_transactions').select('*').eq('profile_slug', slug).order('created_at', { ascending: false }),
    supabase.from('creator_profile_campaign_insights').select('*').eq('profile_slug', slug).order('updated_at', { ascending: false }),
    supabase.from('creator_profile_analytics_events').select('*').eq('profile_slug', slug).order('created_at', { ascending: false }).limit(1000)
  ]);

  const fallbackProfile = getCreatorProfileBySlug(slug);
  const analyticsEvents = (analyticsEventsRes.data ?? []) as DbRow[];
  const supportRequests =
    (supportRequestsRes.data ?? []).length > 0
      ? (supportRequestsRes.data ?? []).map((row) => rowToSupportRequest(row as DbRow))
      : asArray<CreatorSupportRequest>(profileRow.support_requests, fallbackProfile.supportRequests);
  const verificationWorkflow =
    (verificationWorkflowRes.data ?? []).length > 0
      ? (verificationWorkflowRes.data ?? []).map((row) => rowToVerificationItem(row as DbRow))
      : asArray<CreatorVerificationWorkflowItem>(profileRow.verification_workflow, fallbackProfile.verificationWorkflow);
  const payoutMethods =
    (payoutMethodsRes.data ?? []).length > 0
      ? (payoutMethodsRes.data ?? []).map((row) => rowToPayoutMethod(row as DbRow))
      : asArray<CreatorPayoutMethod>(profileRow.payout_methods, fallbackProfile.payoutMethods);
  const transactionHistory =
    (transactionsRes.data ?? []).length > 0
      ? (transactionsRes.data ?? []).map((row) => rowToTransaction(row as DbRow))
      : asArray<CreatorTransaction>(profileRow.transaction_history, fallbackProfile.transactionHistory);
  const monetizationState = await buildMonetizationState({
    slug,
    actorId: asText(profileRow.owner_actor_id, slug),
    walletAddress: '',
    transactions: transactionHistory
  });
  const itemInsights =
    analyticsEvents.length > 0
      ? buildItemInsightsFromEvents(offerings, analyticsEvents, transactionHistory)
      : asArray<CreatorItemInsight>(profileRow.item_insights, fallbackProfile.itemInsights);
  const funnelMetrics =
    analyticsEvents.length > 0
      ? buildFunnelMetricsFromEvents(
          analyticsEvents,
          offerings,
          Number(followsCountRes.count ?? profileRow.follower_count ?? 0),
          transactionHistory
        )
      : asArray<CreatorFunnelMetric>(profileRow.funnel_metrics, fallbackProfile.funnelMetrics);
  const campaignInsights =
    (campaignInsightsRes.data ?? []).length > 0
      ? (campaignInsightsRes.data ?? []).map((row) => rowToCampaignInsight(row as DbRow))
      : asArray<CreatorCampaignInsight>(profileRow.campaign_insights, fallbackProfile.campaignInsights);

  const collectionItems = itemsRes.data ?? [];
  const collections = (collectionsRes.data ?? []).map((row) => ({
    id: asText(row.id),
    name: asText(row.name),
    summary: asText(row.summary),
    cover: asText(row.cover_url),
    itemIds: collectionItems
      .filter((item) => asText(item.collection_id) === asText(row.id))
      .sort((left, right) => asNumber(left.position) - asNumber(right.position))
      .map((item) => asText(item.offering_id)),
    pillarBreakdown: asArray<{ pillar: string; icon: string; count: number }>(row.pillar_breakdown, []) as ProfileCollection['pillarBreakdown'],
    visibility: asText(row.visibility, 'public') as ProfileCollection['visibility'],
    priceLabel: asText(row.price_label),
    savingsLabel: asText(row.savings_label),
    ctaLabel: asText(row.cta_label),
    ctaType: asText(row.cta_type) as ProfileBundle['ctaType'],
    leadAudience: asText(row.lead_audience) as ProfileBundle['leadAudience']
  }));

  const profile: CreatorProfileRecord = {
    slug: asText(profileRow.slug),
    displayName: asText(profileRow.display_name),
    username: asText(profileRow.username),
    avatar: asText(profileRow.avatar_url),
    cover: asText(profileRow.cover_url),
    location: asText(profileRow.location),
    nation: asText(profileRow.nation),
    verificationLabel: asText(profileRow.verification_label, 'Verified Creator'),
    bioShort: asText(profileRow.bio_short),
    bioLong: asText(profileRow.bio_long),
    memberSince: asText(profileRow.member_since),
    followerCount: Number(followsCountRes.count ?? profileRow.follower_count ?? 0),
    followingCount: asNumber(profileRow.following_count),
    salesCount: asNumber(profileRow.sales_count),
    languages: asArray<string>(profileRow.languages, []),
    website: asText(profileRow.website_url),
    socials: asArray<{ label: string; href: string }>(profileRow.socials, []),
    awards: asArray<string>(profileRow.awards, []),
    exhibitions: asArray<string>(profileRow.exhibitions, []),
    publications: asArray<string>(profileRow.publications, []),
    offerings,
    bundles: buildBundlesFromCollections(offerings, collections),
    featuredReviews: asArray<ProfileFeaturedReview>(profileRow.featured_reviews, fallbackProfile.featuredReviews),
    trustSignals: asArray<ProfileTrustSignal>(profileRow.trust_signals, fallbackProfile.trustSignals),
    presentation: ((profileRow.presentation_settings as ProfilePresentationSettings | null) ?? fallbackProfile.presentation),
    collections,
    activity: (activitiesRes.data ?? []).map((row) => rowToActivity(row as DbRow)),
    dashboardStats: (profileRow.dashboard_stats as CreatorProfileRecord['dashboardStats']) ?? {
      salesMtd: formatUsd(monetizationState.financeSummary.lifetimeGrossAmount),
      activeListings: offerings.length,
      followers: Number(followsCountRes.count ?? 0),
      availablePayout: formatUsd(monetizationState.financeSummary.availablePayoutAmount)
    },
    earningsByPillar:
      ((monetizationState.financeSummary.byPillar.length > 0
        ? (() => {
            const total = monetizationState.financeSummary.byPillar.reduce((sum, entry) => sum + Math.max(0, entry.grossAmount), 0);
            return monetizationState.financeSummary.byPillar.map((entry, index) => ({
              label: entry.pillar,
              value: total > 0 ? Math.round((Math.max(0, entry.grossAmount) / total) * 100) : 0,
              color: ['#d4af37', '#1d6b74', '#b45309', '#9333ea', '#16a34a'][index % 5]
            }));
          })()
        : asArray(profileRow.earnings_by_pillar, [])) as CreatorProfileRecord['earningsByPillar']),
    trafficSources: asArray(profileRow.traffic_sources, []) as CreatorProfileRecord['trafficSources'],
    funnelMetrics,
    itemInsights,
    campaignInsights,
    payoutMethods,
    transactionHistory,
    notifications: asArray(profileRow.notifications, []) as CreatorProfileRecord['notifications'],
    shippingSettings: ((profileRow.shipping_settings as CreatorShippingSettings | null) ?? fallbackProfile.shippingSettings),
    verificationWorkflow,
    supportRequests,
    helpResources: asArray<CreatorHelpResource>(profileRow.help_resources, fallbackProfile.helpResources),
    messages: threads.map((thread) => ({
      id: thread.messages[thread.messages.length - 1]?.id ?? thread.counterpartActorId,
      sender: thread.counterpartLabel,
      subject: thread.latestSubject,
      preview: thread.latestPreview,
      unread: thread.unreadCount > 0,
      pillar: thread.pillar
    })),
    financeCases: (monetizationState.financeCases ?? fallbackProfile.financeCases) as CreatorFinanceCase[],
    financeSummary: monetizationState.financeSummary as CreatorFinanceSummary,
    subscriptionMetrics: monetizationState.subscriptionMetrics as CreatorSubscriptionMetrics,
    creatorPlanCapabilities: monetizationState.creatorPlanCapabilities as CreatorPlanCapabilities
  };

  return {
    profile,
    isFollowing: Number(followStateRes.count ?? 0) > 0
  };
}

function getFallbackPublicProfile(slug: string, actorId: string) {
  const profile = getCreatorProfileBySlug(slug);
  const isFollowing = actorId !== 'guest' && actorId !== profile.slug;
  return { profile, isFollowing };
}

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const actorId = resolveRequestActorId(req);
  const [section, value] = slug;

  if (section === 'public' && value) {
    if (slug[2] === 'followers' || slug[2] === 'following') {
      const kind = slug[2] as 'followers' | 'following';
      const connections = await fetchSupabaseConnections(value, kind);
      return NextResponse.json({ data: { slug: value, kind, connections } });
    }
    if (slug[2] === 'bundles' && slug[3]) {
      const live = await fetchSupabaseProfile(value, actorId);
      const payload = live ?? getFallbackPublicProfile(value, actorId);
      const bundle = payload.profile.bundles.find((entry) => entry.id === slug[3]) ?? payload.profile.bundles[0] ?? null;
      return NextResponse.json({ data: { profile: payload.profile, bundle } });
    }
    const live = await fetchSupabaseProfile(value, actorId);
    return NextResponse.json({ data: live ?? getFallbackPublicProfile(value, actorId) });
  }

  if (section === 'dashboard') {
    const url = new URL(req.url);
    const requestedSlug = url.searchParams.get('slug') || 'aiyana-redbird';
    const live = await fetchSupabaseProfile(requestedSlug, actorId);
    const payload = live ?? getFallbackPublicProfile(requestedSlug, actorId);
    const messageThreads = live ? await fetchSupabaseThreads(requestedSlug, actorId) : getProfileMessageThreadsBySlug(requestedSlug);
    const followers = live ? await fetchSupabaseConnections(requestedSlug, 'followers') : getProfileConnectionsBySlug(requestedSlug, 'followers');
    const following = live ? await fetchSupabaseConnections(requestedSlug, 'following') : getProfileConnectionsBySlug(requestedSlug, 'following');
    return NextResponse.json({ data: { ...payload, messageThreads, followers, following } });
  }

  return NextResponse.json({ message: 'Profile route not found' }, { status: 404 });
}

