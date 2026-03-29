import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import { getCreatorProfileBySlug, saveCreatorProfileBundle, type ProfileBundle } from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function asBreakdown(value: unknown): ProfileBundle['pillarBreakdown'] {
  return Array.isArray(value)
    ? value
        .filter((item): item is { pillar: ProfileBundle['pillarBreakdown'][number]['pillar']; icon: string; count: number } => {
          return !!item && typeof item === 'object' && typeof (item as { pillar?: unknown }).pillar === 'string';
        })
        .map((item) => ({
          pillar: item.pillar,
          icon: typeof item.icon === 'string' ? item.icon : '',
          count: typeof item.count === 'number' ? item.count : 0
        }))
    : [];
}

function asBundle(value: unknown): ProfileBundle | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const id = asText(row.id) || `bundle-${Date.now()}`;
  const itemIds = asStringArray(row.itemIds);
  if (!asText(row.name) || itemIds.length === 0) return null;
  return {
    id,
    name: asText(row.name),
    summary: asText(row.summary),
    cover: asText(row.cover),
    itemIds,
    pillarBreakdown: asBreakdown(row.pillarBreakdown),
    priceLabel: asText(row.priceLabel),
    savingsLabel: asText(row.savingsLabel),
    ctaLabel: asText(row.ctaLabel, 'View bundle'),
    ctaType: (['shop', 'book', 'enroll', 'message', 'quote'].includes(asText(row.ctaType)) ? asText(row.ctaType) : 'shop') as ProfileBundle['ctaType'],
    leadAudience: (
      [
        'collectors',
        'learners',
        'clients',
        'travelers',
        'wholesale-buyers',
        'community-buyers'
      ].includes(asText(row.leadAudience))
        ? asText(row.leadAudience)
        : 'collectors'
    ) as ProfileBundle['leadAudience'],
    visibility: asText(row.visibility, 'public') === 'private' ? 'private' : 'public'
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ message: 'Invalid bundle payload.' }, { status: 400 });
  }

  const slug = asText(body.slug);
  const bundle = asBundle(body.bundle);
  if (!slug || !bundle) {
    return NextResponse.json({ message: 'Valid slug and bundle details are required.' }, { status: 400 });
  }

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Connect your wallet to manage bundles.',
    forbiddenMessage: 'You can only manage your own bundles.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  if (owner.supabase) {
    const { error: collectionError } = await owner.supabase
      .from('creator_profile_collections')
      .upsert(
        {
          id: bundle.id,
          profile_slug: slug,
          name: bundle.name,
          summary: bundle.summary,
          cover_url: bundle.cover,
          pillar_breakdown: bundle.pillarBreakdown,
          visibility: bundle.visibility ?? 'public',
          price_label: bundle.priceLabel,
          savings_label: bundle.savingsLabel,
          cta_label: bundle.ctaLabel,
          cta_type: bundle.ctaType ?? 'shop',
          lead_audience: bundle.leadAudience ?? 'collectors',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (collectionError) {
      return NextResponse.json({ message: collectionError.message || 'Unable to save bundle.' }, { status: 500 });
    }

    const { error: deleteItemsError } = await owner.supabase
      .from('creator_profile_collection_items')
      .delete()
      .eq('collection_id', bundle.id);

    if (deleteItemsError) {
      return NextResponse.json({ message: deleteItemsError.message || 'Unable to refresh bundle items.' }, { status: 500 });
    }

    const { error: insertItemsError } = await owner.supabase
      .from('creator_profile_collection_items')
      .insert(bundle.itemIds.map((offeringId, index) => ({ collection_id: bundle.id, offering_id: offeringId, position: index + 1 })));

    if (insertItemsError) {
      return NextResponse.json({ message: insertItemsError.message || 'Unable to save bundle items.' }, { status: 500 });
    }
  }

  const profile = saveCreatorProfileBundle(slug, bundle);
  return NextResponse.json({ data: { ok: true, profile, bundle } });
}
