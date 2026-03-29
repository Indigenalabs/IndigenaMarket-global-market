import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import { canCreateListing } from '@/app/lib/creatorEntitlements';
import { getActorEntitlements } from '@/app/lib/subscriptionState';
import {
  appendCreatorProfileOffering,
  getCreatorProfileBySlug,
  type ProfileOffering,
  type ProfilePillarId
} from '@/app/profile/data/profileShowcase';

type PillarKey =
  | 'freelancing'
  | 'language-heritage'
  | 'land-food'
  | 'advocacy-legal'
  | 'materials-tools';

type Body = {
  slug?: string;
  pillar: PillarKey;
  fields: Record<string, string>;
};

const PILLAR_META: Record<PillarKey, { pillar: ProfilePillarId; pillarLabel: string; icon: string }> = {
  freelancing: { pillar: 'freelancing', pillarLabel: 'Freelancing', icon: '🤝' },
  'language-heritage': { pillar: 'language-heritage', pillarLabel: 'Language', icon: '📖' },
  'land-food': { pillar: 'land-food', pillarLabel: 'Land & Food', icon: '🌿' },
  'advocacy-legal': { pillar: 'advocacy-legal', pillarLabel: 'Advocacy', icon: '⚖️' },
  'materials-tools': { pillar: 'materials-tools', pillarLabel: 'Materials', icon: '🛠️' }
};

function bad(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function parseAmount(value: string) {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function profileOfferingForDraft(
  id: string,
  pillar: PillarKey,
  title: string,
  blurb: string,
  priceLabel: string,
  href: string
): ProfileOffering {
  const meta = PILLAR_META[pillar];
  return {
    id,
    title,
    pillar: meta.pillar,
    pillarLabel: meta.pillarLabel,
    icon: meta.icon,
    type: 'Draft',
    priceLabel,
    image: '',
    href,
    blurb,
    status: 'Draft',
    metadata: ['Created in Creator Hub']
  };
}

async function insertDraft(body: Body, actorId: string) {
  const supabase = createSupabaseServerClient();
  const slug = body.slug || 'aiyana-redbird';
  const title =
    body.fields['Service title'] ||
    body.fields['Resource title'] ||
    body.fields['Product or project name'] ||
    body.fields['Service or campaign title'] ||
    body.fields['Listing title'] ||
    'Untitled draft';

  const id = `${body.pillar}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  switch (body.pillar) {
    case 'freelancing': {
      const category = body.fields['What you offer'] || 'Consulting';
      const startingPrice = parseAmount(body.fields['Rate or pricing'] || '');
      await supabase.from('freelancing_services').insert({
        id,
        freelancer_actor_id: actorId,
        title,
        category,
        starting_price: startingPrice || null,
        currency: 'USD',
        turnaround_days: 7,
        verified: false,
        tags: [body.fields['Availability']].filter(Boolean),
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return {
        id,
        href: '/freelancing',
        offering: profileOfferingForDraft(id, body.pillar, title, category, startingPrice ? `$${startingPrice}` : 'Draft', '/freelancing')
      };
    }
    case 'language-heritage': {
      const kind = 'story';
      const languageName = body.fields['Language'] || 'Community language';
      await supabase.from('language_heritage_listings').insert({
        id,
        contributor_actor_id: actorId,
        title,
        kind,
        language_name: languageName,
        community: '',
        access_tier: body.fields['Access level'] || 'public',
        elder_verified: false,
        price: 0,
        currency: 'USD',
        metadata: { significance: body.fields['Why this matters'] || '' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return {
        id,
        href: '/language-heritage/contributor-dashboard?focus=create&returnTo=/creator-hub',
        offering: profileOfferingForDraft(id, body.pillar, title, languageName, 'Access request', '/language-heritage')
      };
    }
    case 'land-food': {
      const quantity = parseAmount(body.fields['Available quantity'] || '');
      await supabase.from('land_food_listings').insert({
        id,
        producer_actor_id: actorId,
        title,
        category: 'producer-draft',
        listing_type: 'product',
        price: null,
        currency: 'USD',
        quantity_available: quantity || null,
        unit: 'units',
        traceability: { origin: body.fields['Origin or harvest area'] || '' },
        metadata: { fulfillmentNote: body.fields['Shipping or fulfillment note'] || '' },
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return {
        id,
        href: '/land-food/producer-dashboard?focus=create&returnTo=/creator-hub',
        offering: profileOfferingForDraft(id, body.pillar, title, body.fields['Origin or harvest area'] || 'Land & food draft', 'Draft', `/land-food/product/${id}`)
      };
    }
    case 'advocacy-legal': {
      await supabase.from('advocacy_entities').insert({
        id,
        entity_type: 'service',
        actor_id: actorId,
        title,
        category: body.fields['Practice area'] || 'General',
        status: 'draft',
        metadata: {
          feeModel: body.fields['Fee model'] || '',
          urgency: body.fields['Urgency or intake note'] || ''
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return {
        id,
        href: '/advocacy-legal/dashboard/legal-professional?focus=create&returnTo=/creator-hub',
        offering: profileOfferingForDraft(id, body.pillar, title, body.fields['Practice area'] || 'Advocacy draft', 'View', '/advocacy-legal')
      };
    }
    case 'materials-tools': {
      const supplierId = `supplier-${actorId}`;
      const profile = getCreatorProfileBySlug(slug);
      await supabase.from('materials_tools_suppliers').upsert({
        id: supplierId,
        name: profile.displayName,
        nation: profile.nation,
        region: profile.location,
        verified: false,
        verification_tier: 'Bronze',
        avatar: profile.avatar,
        cover: profile.cover,
        specialties: [body.fields['Material or tool type']].filter(Boolean),
        bio: profile.bioShort,
        response_time: '48h',
        fulfillment_score: 0,
        created_at: new Date().toISOString()
      });
      await supabase.from('materials_tools_listings').insert({
        id,
        supplier_id: supplierId,
        title,
        supplier_name: profile.displayName,
        nation: profile.nation,
        category: body.fields['Material or tool type'] || 'general',
        kind: 'material',
        price: null,
        currency: 'USD',
        image: '',
        stock_label: body.fields['Stock or lot size'] || 'Draft stock',
        lead_time: body.fields['Lead time or shipping note'] || '',
        verified: false,
        verification_tier: 'Bronze',
        summary: body.fields['Lead time or shipping note'] || '',
        traceability: {},
        certifications: [],
        moq_label: '',
        created_at: new Date().toISOString()
      });
      return {
        id,
        href: `/materials-tools/supplier-dashboard?supplierId=${encodeURIComponent(supplierId)}&focus=create&returnTo=/creator-hub`,
        offering: profileOfferingForDraft(id, body.pillar, title, body.fields['Material or tool type'] || 'Materials draft', 'Draft', `/materials-tools/product/${id}`)
      };
    }
    default:
      throw new Error('Unsupported pillar');
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.pillar || !body.fields) return bad('Invalid quick-create payload');
  const slug = body.slug || 'aiyana-redbird';
  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Wallet authentication required',
    forbiddenMessage: 'You can only create drafts for your own profile.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  const actorId = owner.actorId;
  const entitlements = await getActorEntitlements(actorId, '');
  const existingProfile = getCreatorProfileBySlug(slug);
  if (!canCreateListing(existingProfile.offerings.length, entitlements.creatorPlanId)) {
    return bad('Creator Free supports up to 12 active listings. Upgrade to Creator or Studio for unlimited listings.', 403);
  }
  const title =
    body.fields['Service title'] ||
    body.fields['Resource title'] ||
    body.fields['Product or project name'] ||
    body.fields['Service or campaign title'] ||
    body.fields['Listing title'] ||
    'Untitled draft';

  if (!isSupabaseServerConfigured()) {
    const id = `${body.pillar}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const href =
      body.pillar === 'freelancing'
        ? '/freelancing'
        : body.pillar === 'language-heritage'
          ? '/language-heritage/contributor-dashboard?focus=create&returnTo=/creator-hub'
          : body.pillar === 'land-food'
            ? '/land-food/producer-dashboard?focus=create&returnTo=/creator-hub'
            : body.pillar === 'advocacy-legal'
              ? '/advocacy-legal/dashboard/legal-professional?focus=create&returnTo=/creator-hub'
              : '/materials-tools/supplier-dashboard?focus=create&returnTo=/creator-hub';
    const offering = profileOfferingForDraft(id, body.pillar, title, 'Created from Creator Hub', 'Draft', href);
    appendCreatorProfileOffering(slug, offering, {
      type: 'listing',
      title: `Created draft: ${title}`,
      detail: `${PILLAR_META[body.pillar].pillarLabel} draft saved from Creator Hub`,
      ago: 'Just now'
    });
    return NextResponse.json({ data: { ok: true, draftId: id, href, offering } }, { status: 201 });
  }

  const result = await insertDraft(body, actorId);
  const supabase = createSupabaseServerClient();
  await supabase.from('creator_profile_offerings').insert({
    id: result.id,
    profile_slug: slug,
    title: result.offering.title,
    pillar: result.offering.pillar,
    pillar_label: result.offering.pillarLabel,
    icon: result.offering.icon,
    offering_type: result.offering.type,
    price_label: result.offering.priceLabel,
    image_url: result.offering.image,
    href: result.offering.href,
    blurb: result.offering.blurb,
    status: result.offering.status,
    metadata: result.offering.metadata,
    created_at: new Date().toISOString()
  });
  await supabase.from('creator_profile_activities').insert({
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    profile_slug: slug,
    activity_type: 'listing',
    title: `Created draft: ${title}`,
    detail: `${PILLAR_META[body.pillar].pillarLabel} draft saved from Creator Hub`,
    ago_label: 'Just now',
    created_at: new Date().toISOString()
  });

  return NextResponse.json({ data: { ok: true, draftId: result.id, href: result.href, offering: result.offering } }, { status: 201 });
}
