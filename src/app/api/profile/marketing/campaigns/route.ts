import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';
import { findCreatorProfileSlugForActor } from '@/app/lib/accountAuthService';
import { getSellerPermissionsForActor } from '@/app/lib/indigenousVerification';
import { MARKETING_ACTIVE_CAMPAIGNS, type MarketingCampaignRun } from '@/app/profile/data/marketingInventory';
import { getCreatorProfileBySlug } from '@/app/profile/data/profileShowcase';
import {
  canServePlacementScope,
  computeCampaignWindow,
  findMarketingPlacementById,
  inferPlacementPeriod,
  marketingPlacementKey,
  parsePlacementPriceAmount
} from '@/app/lib/marketingPlacementConfig';
import { syncCreatorCampaignInsights } from '@/app/lib/creatorProfileOperationalSync';
import { getStripeServerClient, isStripeConfigured } from '@/app/lib/stripeServer';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asObject(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asCreative(value: unknown, fallback: { headline: string; subheadline: string; cta: string; image?: string }) {
  const object = asObject(value);
  return {
    headline: asText(object.headline, fallback.headline),
    subheadline: asText(object.subheadline, fallback.subheadline),
    cta: asText(object.cta, fallback.cta),
    image: asText(object.image, fallback.image || '')
  };
}

function formatFlight(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' };
  return `${start.toLocaleDateString('en-AU', options)} - ${end.toLocaleDateString('en-AU', options)}`;
}

function isAdminSigned(req: NextRequest) {
  return req.headers.get('x-admin-signed') === 'true';
}

function resolveScheduledStatus(startsAt: string) {
  return new Date(startsAt).getTime() <= Date.now() ? 'live' : 'scheduled';
}

function fallbackCampaigns(slug: string) {
  const profile = getCreatorProfileBySlug(slug);
  return MARKETING_ACTIVE_CAMPAIGNS.map((campaign) => ({
    ...campaign,
    profileSlug: slug,
    offerId: profile.offerings.find((entry) => entry.title === campaign.offerTitle)?.id || '',
    placementId: '',
    paymentStatus: campaign.status === 'completed' || campaign.status === 'live' ? 'paid' : 'processing',
    creativeStatus: campaign.status === 'completed' || campaign.status === 'live' ? 'approved' : 'pending-review',
    launchWeek: 'Next Monday',
    checkoutReference: '',
    reviewNotes: '',
    creative: {
      headline: campaign.offerTitle,
      subheadline: campaign.result,
      cta: 'View Offer',
      image: ''
    }
  }));
}

function toCampaignRun(row: Record<string, unknown>): MarketingCampaignRun {
  const fallbackCreative = {
    headline: asText(row.offer_title),
    subheadline: asText(row.result_summary, 'Campaign reserved'),
    cta: 'View Offer',
    image: ''
  };
  const creative = asCreative(row.creative, fallbackCreative);
  return {
    id: asText(row.id),
    offerId: asText(row.offering_id),
    offerTitle: asText(row.offer_title),
    scope: asText(row.scope) as MarketingCampaignRun['scope'],
    placementId: asText(row.placement_id),
    placementTitle: asText(row.placement_title),
    status: asText(row.status, 'pending-payment') as MarketingCampaignRun['status'],
    paymentStatus: asText(row.payment_status, 'requires-payment') as NonNullable<MarketingCampaignRun['paymentStatus']>,
    creativeStatus: asText(row.creative_status, 'draft') as NonNullable<MarketingCampaignRun['creativeStatus']>,
    flight: formatFlight(asText(row.starts_at, new Date().toISOString()), asText(row.ends_at, new Date().toISOString())),
    result: asText(row.result_summary, creative.subheadline || 'Campaign reserved'),
    launchWeek: asText(row.launch_week),
    profileSlug: asText(row.profile_slug),
    checkoutReference: asText(row.checkout_reference),
    reviewNotes: asText(row.review_notes),
    creative
  };
}

async function findMirroredPlacementId(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  scope: string,
  placementKey: string,
  campaignId: string
) {
  const { data } = await supabase
    .from('premium_placements')
    .select('id, metadata')
    .eq('pillar', scope)
    .eq('placement_key', placementKey)
    .order('created_at', { ascending: false });

  const match = (data ?? []).find((row) => asText(asObject(row.metadata).campaign_id) === campaignId);
  return match ? asText(match.id) : '';
}

async function syncMirroredPlacement(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  row: Record<string, unknown>
) {
  const scope = asText(row.scope);
  if (!canServePlacementScope(scope as MarketingCampaignRun['scope'])) return;

  const campaignId = asText(row.id);
  const placementKey = asText(row.placement_key);
  const mirroredId = await findMirroredPlacementId(supabase, scope, placementKey, campaignId);
  const shouldServe =
    asText(row.status) !== 'paused' &&
    asText(row.status) !== 'rejected' &&
    asText(row.status) !== 'changes-requested' &&
    asText(row.status) !== 'pending-payment' &&
    asText(row.payment_status) === 'paid' &&
    asText(row.creative_status) === 'approved' &&
    ['scheduled', 'live'].includes(asText(row.status));

  if (!shouldServe) {
    if (mirroredId) {
      await supabase.from('premium_placements').update({ active: false }).eq('id', mirroredId);
    }
    return;
  }

  const creative = asCreative(row.creative, {
    headline: asText(row.offer_title),
    subheadline: asText(row.result_summary),
    cta: 'View Offer',
    image: ''
  });
  const metadata = asObject(row.metadata);
  const payload = {
    pillar: scope,
    placement_key: placementKey,
    title: asText(row.placement_title),
    media_url: creative.image || asText(metadata.image),
    cta_label: creative.cta || 'View Offer',
    cta_url: asText(metadata.href, '/creator-hub'),
    starts_at: asText(row.starts_at),
    ends_at: asText(row.ends_at),
    active: true,
    price_amount: row.price_amount,
    currency: asText(row.currency, 'USD'),
    metadata: {
      campaign_id: campaignId,
      creative,
      offering_id: asText(row.offering_id),
      profile_slug: asText(row.profile_slug),
      summary: creative.subheadline
    }
  };

  if (mirroredId) {
    await supabase.from('premium_placements').update(payload).eq('id', mirroredId);
  } else {
    await supabase.from('premium_placements').insert(payload);
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const actorId = resolveRequestActorId(req);
  const explicitSlug = (url.searchParams.get('slug') || '').trim();
  const slug = explicitSlug || (await findCreatorProfileSlugForActor(actorId).catch(() => null)) || '';
  const mode = url.searchParams.get('mode') || 'profile';

  if (mode === 'review') {
    const gate = await requirePlatformAdmin(req, ['admin', 'platform_ops', 'partnerships_admin']);
    if (gate.error) return gate.error;
  }

  if (!slug && mode !== 'review') {
    return NextResponse.json({ data: { campaigns: [] } });
  }

  if (!isSupabaseServerConfigured()) {
    const campaigns = fallbackCampaigns(slug);
    return NextResponse.json({
      data: {
        campaigns: mode === 'review' ? campaigns.filter((entry) => ['pending-approval', 'changes-requested'].includes(entry.status)) : campaigns
      }
    });
  }

  const supabase = createSupabaseServerClient();
  let query = supabase.from('creator_marketing_campaigns').select('*').order('created_at', { ascending: false });
  if (mode === 'review') {
    query = query.in('status', ['pending-approval', 'changes-requested']);
  } else {
    query = query.eq('profile_slug', slug);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ data: { campaigns: fallbackCampaigns(slug) } });
  }

  return NextResponse.json({ data: { campaigns: (data ?? []).map((row) => toCampaignRun(row as Record<string, unknown>)) } });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ message: 'Invalid campaign reservation payload.' }, { status: 400 });
  }

  const slug = asText(body.slug);
  const offeringId = asText(body.offeringId);
  const placementId = asText(body.placementId);
  const launchWeek = asText(body.launchWeek, 'Next Monday');

  if (!slug || !offeringId || !placementId) {
    return NextResponse.json({ message: 'Slug, offer, and placement are required.' }, { status: 400 });
  }

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Sign in to reserve a placement.',
    forbiddenMessage: 'You can only reserve placements for your own creator profile.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;
  const actorId = owner.actorId;
  const permissions = await getSellerPermissionsForActor({ actorId });
  if (!permissions.canLaunchVerifiedCampaigns) {
    return NextResponse.json(
      { message: 'Verification approval is required before you can launch a verified campaign.' },
      { status: 403 }
    );
  }
  const profile = owner.fallbackProfile;

  const offering = profile.offerings.find((entry) => entry.id === offeringId);
  const placement = findMarketingPlacementById(placementId);
  if (!offering || !placement) {
    return NextResponse.json({ message: 'Offer or placement was not found.' }, { status: 404 });
  }

  const { startsAt, endsAt } = computeCampaignWindow(launchWeek);
  const creative = asCreative(body.creative, {
    headline: offering.title,
    subheadline: offering.blurb,
    cta: 'View Offer',
    image: offering.image
  });
  const campaignRecord = {
    profile_slug: slug,
    owner_actor_id: actorId,
    offering_id: offering.id,
    offer_title: offering.title,
    scope: placement.scope,
    placement_id: placement.id,
    placement_title: placement.title,
    placement_key: marketingPlacementKey(placement),
    price_amount: parsePlacementPriceAmount(placement.priceLabel),
    currency: 'USD',
    billing_period: inferPlacementPeriod(placement.priceLabel),
    launch_week: launchWeek,
    starts_at: startsAt,
    ends_at: endsAt,
    status: 'pending-payment',
    payment_status: 'requires-payment',
    checkout_reference: `chk_${Date.now()}`,
    creative_status: 'draft',
    creative,
    result_summary: 'Campaign reserved. Complete checkout and submit creative for review.',
    metadata: {
      href: offering.href,
      pillar: offering.pillar,
      priceLabel: placement.priceLabel,
      inventory: placement.inventory,
      bestFor: placement.bestFor,
      image: offering.image
    },
    last_action_at: new Date().toISOString()
  };

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({
      data: {
        ok: true,
        campaign: toCampaignRun({
          id: `campaign-${Date.now()}`,
          ...campaignRecord
        })
      }
    });
  }

  const supabase = createSupabaseServerClient();
  const { data: liveProfile } = await supabase
    .from('creator_profiles')
    .select('owner_actor_id')
    .eq('slug', slug)
    .single();

  if (liveProfile && asText(liveProfile.owner_actor_id, profile.slug) !== actorId) {
    return NextResponse.json({ message: 'You can only reserve placements for your own creator profile.' }, { status: 403 });
  }

  const { data: insertedCampaign, error } = await supabase
    .from('creator_marketing_campaigns')
    .insert(campaignRecord)
    .select('*')
    .single();

  if (error || !insertedCampaign) {
    return NextResponse.json({ message: error?.message || 'Unable to reserve campaign.' }, { status: 500 });
  }

  await syncCreatorCampaignInsights(supabase, slug);

  return NextResponse.json({ data: { ok: true, campaign: toCampaignRun(insertedCampaign as Record<string, unknown>) } });
}

export async function PATCH(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  const adminSigned = isAdminSigned(req);
  if (actorId === 'guest' && !adminSigned) {
    return NextResponse.json({ message: 'Sign in to update campaigns.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid update payload.' }, { status: 400 });

  const campaignId = asText(body.campaignId);
  const action = asText(body.action);
  if (!campaignId || !action) {
    return NextResponse.json({ message: 'Campaign and action are required.' }, { status: 400 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ data: { ok: true } });
  }

  const supabase = createSupabaseServerClient();
  const { data: campaign, error } = await supabase
    .from('creator_marketing_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error || !campaign) {
    return NextResponse.json({ message: 'Campaign not found.' }, { status: 404 });
  }

  const owner = asText(campaign.owner_actor_id);
  const creatorAuthorized = actorId !== 'guest' && owner === actorId;
  const reviewAction = ['approve-creative', 'request-creative-changes', 'reject-campaign'].includes(action);
  if (reviewAction) {
    const gate = await requirePlatformAdmin(req, ['admin', 'platform_ops', 'partnerships_admin']);
    if (gate.error) return gate.error;
  }
  if (!reviewAction && !creatorAuthorized && !adminSigned) {
    return NextResponse.json({ message: 'You can only update your own campaigns.' }, { status: 403 });
  }

  const updates: Record<string, unknown> = { last_action_at: new Date().toISOString() };
  const currentPaymentStatus = asText(campaign.payment_status, 'requires-payment');
  const currentCreativeStatus = asText(campaign.creative_status, 'draft');
  const startsAt = asText(campaign.starts_at, new Date().toISOString());
  let checkoutUrl = '';

  if (action === 'start-checkout') {
    updates.payment_status = 'processing';
    if (isStripeConfigured()) {
      const stripe = getStripeServerClient();
      const origin = req.nextUrl.origin;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: `${origin}/creator-hub?tab=ads&campaign=${campaignId}&payment=success`,
        cancel_url: `${origin}/creator-hub?tab=ads&campaign=${campaignId}&payment=cancelled`,
        metadata: {
          campaignId,
          profileSlug: asText(campaign.profile_slug),
          placementId: asText(campaign.placement_id),
          offeringId: asText(campaign.offering_id)
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: asText(campaign.currency, 'usd').toLowerCase(),
              unit_amount: Math.round(Number(campaign.price_amount || 0) * 100),
              product_data: {
                name: asText(campaign.placement_title),
                description: `Promotion for ${asText(campaign.offer_title)}`
              }
            }
          }
        ]
      });
      updates.checkout_reference = session.id;
      updates.result_summary = 'Stripe checkout started. Awaiting payment confirmation.';
      checkoutUrl = session.url || '';
    } else {
      updates.checkout_reference = asText(campaign.checkout_reference) || `chk_${Date.now()}`;
      updates.result_summary = 'Checkout started. Awaiting payment confirmation.';
    }
  } else if (action === 'complete-checkout') {
    updates.payment_status = 'paid';
    updates.payment_reference = `pay_${Date.now()}`;
    updates.status = currentCreativeStatus === 'approved' ? resolveScheduledStatus(startsAt) : 'pending-approval';
    updates.result_summary =
      currentCreativeStatus === 'approved'
        ? 'Payment settled. Campaign is ready to serve.'
        : 'Payment settled. Creative is pending approval.';
  } else if (action === 'pause') {
    updates.status = 'paused';
    updates.paused_at = new Date().toISOString();
    updates.paused_by = adminSigned ? 'admin' : actorId;
    updates.result_summary = 'Campaign paused.';
  } else if (action === 'resume') {
    updates.status = currentPaymentStatus === 'paid' && currentCreativeStatus === 'approved' ? resolveScheduledStatus(startsAt) : 'pending-approval';
    updates.resumed_at = new Date().toISOString();
    updates.result_summary = updates.status === 'pending-approval' ? 'Campaign resumed and waiting on approval.' : 'Campaign resumed.';
  } else if (action === 'update-creative') {
    const fallbackCreative = {
      headline: asText(campaign.offer_title),
      subheadline: asText(campaign.result_summary),
      cta: 'View Offer',
      image: asText(asObject(campaign.metadata).image)
    };
    updates.creative = asCreative(body.creative, fallbackCreative);
    updates.creative_status = 'draft';
    updates.status = currentPaymentStatus === 'paid' ? 'pending-approval' : 'pending-payment';
    updates.result_summary = 'Creative updated. Submit it for review when ready.';
  } else if (action === 'submit-creative') {
    const fallbackCreative = {
      headline: asText(campaign.offer_title),
      subheadline: asText(campaign.result_summary),
      cta: 'View Offer',
      image: asText(asObject(campaign.metadata).image)
    };
    updates.creative = asCreative(body.creative ?? campaign.creative, fallbackCreative);
    updates.creative_status = 'pending-review';
    updates.status = currentPaymentStatus === 'paid' ? 'pending-approval' : 'pending-payment';
    updates.result_summary =
      currentPaymentStatus === 'paid'
        ? 'Creative submitted. Awaiting approval.'
        : 'Creative saved. Complete payment to move into review.';
  } else if (action === 'approve-creative') {
    updates.creative_status = 'approved';
    updates.approved_at = new Date().toISOString();
    updates.approved_by = adminSigned ? (actorId === 'guest' ? 'admin' : actorId) : actorId;
    updates.review_notes = asText(body.reviewNotes);
    updates.status = currentPaymentStatus === 'paid' ? resolveScheduledStatus(startsAt) : 'pending-payment';
    updates.result_summary =
      currentPaymentStatus === 'paid'
        ? 'Creative approved. Campaign is ready to serve.'
        : 'Creative approved. Awaiting payment before serving.';
  } else if (action === 'request-creative-changes') {
    updates.creative_status = 'changes-requested';
    updates.status = 'changes-requested';
    updates.review_notes = asText(body.reviewNotes, 'Adjust the creative and resubmit for approval.');
    updates.result_summary = 'Creative changes requested.';
  } else if (action === 'reject-campaign') {
    updates.status = 'rejected';
    updates.review_notes = asText(body.reviewNotes, 'Campaign rejected.');
    updates.result_summary = 'Campaign rejected.';
  } else {
    return NextResponse.json({ message: 'Unsupported campaign action.' }, { status: 400 });
  }

  const { data: updatedCampaign, error: updateError } = await supabase
    .from('creator_marketing_campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select('*')
    .single();

  if (updateError || !updatedCampaign) {
    return NextResponse.json({ message: updateError?.message || 'Unable to update campaign.' }, { status: 500 });
  }

  await syncMirroredPlacement(supabase, updatedCampaign as Record<string, unknown>);
  await syncCreatorCampaignInsights(supabase, asText(updatedCampaign.profile_slug));

  return NextResponse.json({
    data: {
      ok: true,
      campaign: toCampaignRun(updatedCampaign as Record<string, unknown>),
      checkoutUrl
    }
  });
}



