import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import {
  getCreatorProfileBySlug,
  type CreatorProfileRecord,
  type ProfileActivity,
  type ProfileBundle,
  type ProfileCollection,
  type ProfileFeaturedReview,
  type ProfileOffering,
  type ProfileTrustSignal
} from '@/app/profile/data/profileShowcase';
import { applyLaunchWindowState } from '@/app/profile/lib/offeringMerchandising';

type DbRow = Record<string, unknown>;

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : fallback;
}

function asBool(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
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

function buildBundlesFromCollections(offerings: ProfileOffering[], collections: ProfileCollection[]): ProfileBundle[] {
  return collections.map((collection, index) => {
    const bundleItems = offerings.filter((offering) => collection.itemIds.includes(offering.id));
    const primaryPrice = bundleItems[0]?.priceLabel || 'Bundle';
    return {
      id: `bundle-${collection.id}`,
      name: collection.name,
      summary: collection.summary,
      cover: collection.cover,
      itemIds: collection.itemIds,
      pillarBreakdown: collection.pillarBreakdown,
      priceLabel: bundleItems.length > 1 ? `${primaryPrice} + curated bundle` : primaryPrice,
      savingsLabel: index % 2 === 0 ? 'Cross-pillar release with added context and sequencing' : 'Bundled to make discovery and buying easier',
      ctaLabel: bundleItems.length > 1 ? 'View bundle' : 'View offer'
    };
  });
}

export async function loadProfileForInitialRender(slug: string): Promise<CreatorProfileRecord> {
  const fallback = getCreatorProfileBySlug(slug);
  if (!isSupabaseServerConfigured()) return fallback;

  const supabase = createSupabaseServerClient();
  const { data: profileRow, error } = await supabase.from('creator_profiles').select('*').eq('slug', slug).single();
  if (error || !profileRow) return fallback;

  const [offeringsRes, collectionsRes, collectionItemsRes, activitiesRes] = await Promise.all([
    supabase.from('creator_profile_offerings').select('*').eq('profile_slug', slug).order('created_at', { ascending: false }),
    supabase.from('creator_profile_collections').select('*').eq('profile_slug', slug).order('created_at', { ascending: false }),
    supabase.from('creator_profile_collection_items').select('*'),
    supabase.from('creator_profile_activities').select('*').eq('profile_slug', slug).order('created_at', { ascending: false })
  ]);

  const offerings = (offeringsRes.data ?? [])
    .map((row) => rowToOffering(row as DbRow))
    .filter((entry) => entry.pillar !== 'seva');
  const collectionItems = collectionItemsRes.data ?? [];
  const collections: ProfileCollection[] = (collectionsRes.data ?? []).map((row) => ({
    id: asText(row.id),
    name: asText(row.name),
    summary: asText(row.summary),
    cover: asText(row.cover_url),
    itemIds: collectionItems
      .filter((item) => asText(item.collection_id) === asText(row.id))
      .sort((left, right) => asNumber(left.position) - asNumber(right.position))
      .map((item) => asText(item.offering_id)),
    pillarBreakdown: asArray(row.pillar_breakdown, []) as ProfileCollection['pillarBreakdown'],
    visibility: asText(row.visibility, 'public') as ProfileCollection['visibility']
  }));

  return {
    ...fallback,
    slug: asText(profileRow.slug, fallback.slug),
    displayName: asText(profileRow.display_name, fallback.displayName),
    username: asText(profileRow.username, fallback.username),
    avatar: asText(profileRow.avatar_url, fallback.avatar),
    cover: asText(profileRow.cover_url, fallback.cover),
    location: asText(profileRow.location, fallback.location),
    nation: asText(profileRow.nation, fallback.nation),
    verificationLabel: asText(profileRow.verification_label, fallback.verificationLabel),
    bioShort: asText(profileRow.bio_short, fallback.bioShort),
    bioLong: asText(profileRow.bio_long, fallback.bioLong),
    memberSince: asText(profileRow.member_since, fallback.memberSince),
    followerCount: asNumber(profileRow.follower_count, fallback.followerCount),
    followingCount: asNumber(profileRow.following_count, fallback.followingCount),
    salesCount: asNumber(profileRow.sales_count, fallback.salesCount),
    languages: asArray<string>(profileRow.languages, fallback.languages),
    website: asText(profileRow.website_url, fallback.website),
    socials: asArray(profileRow.socials, fallback.socials),
    awards: asArray<string>(profileRow.awards, fallback.awards),
    exhibitions: asArray<string>(profileRow.exhibitions, fallback.exhibitions),
    publications: asArray<string>(profileRow.publications, fallback.publications),
    offerings: offerings.length > 0 ? offerings : fallback.offerings,
    collections: collections.length > 0 ? collections : fallback.collections,
    bundles: collections.length > 0 ? buildBundlesFromCollections(offerings.length > 0 ? offerings : fallback.offerings, collections) : fallback.bundles,
    featuredReviews: asArray<ProfileFeaturedReview>((profileRow as DbRow).featured_reviews, fallback.featuredReviews),
    trustSignals: asArray<ProfileTrustSignal>((profileRow as DbRow).trust_signals, fallback.trustSignals),
    presentation: ((profileRow as DbRow).presentation_settings as CreatorProfileRecord['presentation'] | null) ?? fallback.presentation,
    activity: (activitiesRes.data ?? []).map((row) => rowToActivity(row as DbRow)).length > 0
      ? (activitiesRes.data ?? []).map((row) => rowToActivity(row as DbRow))
      : fallback.activity,
    dashboardStats: ((profileRow as DbRow).dashboard_stats as CreatorProfileRecord['dashboardStats'] | null) ?? fallback.dashboardStats,
    earningsByPillar: asArray((profileRow as DbRow).earnings_by_pillar, fallback.earningsByPillar),
    trafficSources: asArray((profileRow as DbRow).traffic_sources, fallback.trafficSources),
    notifications: asArray((profileRow as DbRow).notifications, fallback.notifications),
    shippingSettings: ((profileRow as DbRow).shipping_settings as CreatorProfileRecord['shippingSettings'] | null) ?? fallback.shippingSettings
  };
}
