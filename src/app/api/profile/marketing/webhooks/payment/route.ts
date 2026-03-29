import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { syncCreatorCampaignInsights } from '@/app/lib/creatorProfileOperationalSync';
import { getStripeServerClient, isStripeConfigured } from '@/app/lib/stripeServer';
import { beginWebhookEvent, completeWebhookEvent } from '@/app/lib/webhookEventStore';

const STRIPE_MARKETING_WEBHOOK_SECRET = process.env.STRIPE_MARKETING_WEBHOOK_SECRET || '';

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) return fail('Stripe is not configured', 500);
  if (!STRIPE_MARKETING_WEBHOOK_SECRET) return fail('Stripe marketing webhook secret not configured', 500);

  const signature = req.headers.get('stripe-signature') || '';
  if (!signature) return fail('Missing Stripe signature', 401);

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripeServerClient().webhooks.constructEvent(rawBody, signature, STRIPE_MARKETING_WEBHOOK_SECRET);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Invalid webhook signature', 401);
  }

  const eventLog = await beginWebhookEvent({
    provider: 'marketing-stripe',
    eventId: event.id,
    rawBody,
    metadata: { type: event.type }
  });
  if (eventLog.duplicate) {
    return NextResponse.json({ ok: true, duplicate: true, type: event.type, eventId: event.id });
  }

  try {
    if (event.type !== 'checkout.session.completed') {
      await completeWebhookEvent({
        provider: 'marketing-stripe',
        eventId: event.id,
        status: 'ignored',
        resultSummary: `Ignored event type ${event.type}`
      });
      return NextResponse.json({ ok: true, ignored: true, type: event.type });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const campaignId = String(session.metadata?.campaignId || '').trim();
    if (!campaignId) {
      await completeWebhookEvent({
        provider: 'marketing-stripe',
        eventId: event.id,
        status: 'failed',
        resultSummary: 'Missing campaign metadata'
      });
      return fail('Missing campaign metadata', 400);
    }
    if (!isSupabaseServerConfigured()) {
      await completeWebhookEvent({
        provider: 'marketing-stripe',
        eventId: event.id,
        status: 'processed',
        resultSummary: `Campaign ${campaignId} acknowledged without Supabase reconciliation`,
        metadata: { campaignId }
      });
      return NextResponse.json({ ok: true, campaignId });
    }

    const supabase = createSupabaseServerClient();
    const { data: campaign, error } = await supabase
      .from('creator_marketing_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    if (error || !campaign) {
      await completeWebhookEvent({
        provider: 'marketing-stripe',
        eventId: event.id,
        status: 'failed',
        resultSummary: `Campaign ${campaignId} not found`
      });
      return fail('Campaign not found', 404);
    }

    const paidStatus = session.payment_status === 'paid' ? 'paid' : 'processing';
    const nextStatus =
      paidStatus === 'paid'
        ? String(campaign.creative_status || '') === 'approved'
          ? new Date(String(campaign.starts_at || new Date().toISOString())).getTime() <= Date.now()
            ? 'live'
            : 'scheduled'
          : 'pending-approval'
        : String(campaign.status || 'pending-payment');

    const { data: updatedCampaign, error: updateError } = await supabase
      .from('creator_marketing_campaigns')
      .update({
        payment_status: paidStatus,
        payment_reference: session.payment_intent ? String(session.payment_intent) : session.id,
        checkout_reference: session.id,
        status: nextStatus,
        result_summary:
          paidStatus === 'paid'
            ? nextStatus === 'pending-approval'
              ? 'Payment settled. Creative is pending approval.'
              : 'Payment settled. Campaign is ready to serve.'
            : 'Stripe checkout update received.',
        last_action_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select('id, payment_status, status')
      .single();

    if (updateError || !updatedCampaign) {
      await completeWebhookEvent({
        provider: 'marketing-stripe',
        eventId: event.id,
        status: 'failed',
        resultSummary: `Unable to reconcile marketing payment for ${campaignId}`
      });
      return fail('Unable to reconcile marketing payment', 500);
    }

    await syncCreatorCampaignInsights(supabase, String(campaign.profile_slug || ''));
    await completeWebhookEvent({
      provider: 'marketing-stripe',
      eventId: event.id,
      status: 'processed',
      resultSummary: `Marketing campaign ${campaignId} reconciled as ${String(updatedCampaign.status)}`,
      metadata: {
        campaignId: String(updatedCampaign.id),
        paymentStatus: String(updatedCampaign.payment_status),
        status: String(updatedCampaign.status)
      }
    });

    return NextResponse.json({
      ok: true,
      campaignId: String(updatedCampaign.id),
      paymentStatus: String(updatedCampaign.payment_status),
      status: String(updatedCampaign.status)
    });
  } catch (error) {
    await completeWebhookEvent({
      provider: 'marketing-stripe',
      eventId: event.id,
      status: 'failed',
      resultSummary: error instanceof Error ? error.message : 'Unknown marketing webhook failure'
    });
    throw error;
  }
}
