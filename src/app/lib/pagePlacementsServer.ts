import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';

export type PlacementFeedEntry = {
  id: string;
  placement_key: string;
  title: string;
  cta_label: string;
  cta_url: string;
  media_url: string;
  created_at: string;
  creative: {
    image: string;
    headline: string;
    subheadline: string;
    cta: string;
  };
};

export type PlacementSummaryRow = {
  typeId: string;
  price: number;
  period: string;
};

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : fallback;
}

function asObject(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function rowToFeedEntry(row: Record<string, unknown>): PlacementFeedEntry {
  const metadata = asObject(row.metadata);
  const creative = asObject(metadata.creative);
  return {
    id: asText(row.id),
    placement_key: asText(row.placement_key),
    title: asText(row.title),
    cta_label: asText(row.cta_label),
    cta_url: asText(row.cta_url),
    media_url: asText(row.media_url),
    created_at: asText(row.created_at),
    creative: {
      image: asText(creative.image, asText(row.media_url)),
      headline: asText(creative.headline, asText(row.title)),
      subheadline: asText(creative.subheadline, asText(metadata.summary)),
      cta: asText(creative.cta, asText(row.cta_label, 'View'))
    }
  };
}

export async function getPlacementFeed(
  pillar: string,
  groups: Record<string, string>,
  summaryMap: Record<string, { price: number; period: string }>
) {
  const empty = {
    success: true,
    page: pillar,
    source: 'mock',
    summary: Object.entries(summaryMap).map(([typeId, value]) => ({ typeId, price: value.price, period: value.period })),
    placements: Object.fromEntries(Object.keys(groups).map((key) => [key, []]))
  };

  if (!isSupabaseServerConfigured()) return empty;

  const supabase = createSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const [{ data: campaigns }, { data: legacyPlacements }] = await Promise.all([
    supabase
      .from('creator_marketing_campaigns')
      .select('*')
      .eq('scope', pillar)
      .in('status', ['live', 'scheduled'])
      .order('created_at', { ascending: false }),
    supabase
      .from('premium_placements')
      .select('*')
      .eq('pillar', pillar)
      .eq('active', true)
      .order('created_at', { ascending: false })
  ]);

  const placementsByKey = new Map<string, PlacementFeedEntry[]>();
  const pushEntry = (entry: PlacementFeedEntry) => {
    const current = placementsByKey.get(entry.placement_key) ?? [];
    current.push(entry);
    placementsByKey.set(entry.placement_key, current);
  };

  const activeCampaigns = (campaigns ?? []).filter((row) => {
    const startsAt = asText(row.starts_at);
    return !startsAt || startsAt <= nowIso;
  });

  for (const row of activeCampaigns) {
    pushEntry(
      rowToFeedEntry({
        id: row.id,
        placement_key: row.placement_key,
        title: row.placement_title,
        cta_label: 'View Offer',
        cta_url: asText(row.metadata && asObject(row.metadata).href),
        media_url: asText(asObject(row.creative).image),
        created_at: row.created_at,
        metadata: {
          summary: asText(asObject(row.creative).subheadline),
          creative: row.creative
        }
      })
    );
  }

  if (activeCampaigns.length === 0) {
    for (const row of legacyPlacements ?? []) {
      pushEntry(rowToFeedEntry(row as Record<string, unknown>));
    }
  }

  const placements = Object.fromEntries(
    Object.entries(groups).map(([groupKey, placementKey]) => [groupKey, placementsByKey.get(placementKey) ?? []])
  );

  return {
    success: true,
    page: pillar,
    source: activeCampaigns.length > 0 ? 'campaigns' : (legacyPlacements ?? []).length > 0 ? 'legacy' : 'mock',
    summary: Object.entries(summaryMap).map(([typeId, value]) => ({ typeId, price: value.price, period: value.period })),
    placements
  };
}
