import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient, isStripeConfigured } from '@/app/lib/stripeServer';
import { upsertActorSubscription, updateSubscriptionStatusByStripeReference } from '@/app/lib/subscriptionState';
import { beginWebhookEvent, completeWebhookEvent } from '@/app/lib/webhookEventStore';

const STRIPE_SUBSCRIPTIONS_WEBHOOK_SECRET = process.env.STRIPE_SUBSCRIPTIONS_WEBHOOK_SECRET || '';

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) return fail('Stripe is not configured', 500);
  if (!STRIPE_SUBSCRIPTIONS_WEBHOOK_SECRET) return fail('Stripe subscriptions webhook secret not configured', 500);

  const signature = req.headers.get('stripe-signature') || '';
  if (!signature) return fail('Missing Stripe signature', 401);

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripeServerClient().webhooks.constructEvent(rawBody, signature, STRIPE_SUBSCRIPTIONS_WEBHOOK_SECRET);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Invalid webhook signature', 401);
  }

  const eventLog = await beginWebhookEvent({
    provider: 'subscriptions-stripe',
    eventId: event.id,
    rawBody,
    metadata: { type: event.type }
  });
  if (eventLog.duplicate) {
    return NextResponse.json({ ok: true, duplicate: true, type: event.type, eventId: event.id });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const actorId = String(session.metadata?.actorId || '').trim() || 'guest';
      const walletAddress = String(session.metadata?.walletAddress || '').trim();
      const family = String(session.metadata?.family || '').trim() as 'member' | 'creator' | 'access' | 'team' | 'lifetime';
      const planId = String(session.metadata?.planId || '').trim();
      const billingCadence = String(session.metadata?.billingCadence || 'monthly').trim() as 'monthly' | 'annual' | 'one-time';
      const paymentMethod = String(session.metadata?.paymentMethod || 'card').trim() as 'card' | 'indi' | 'staked';

      if (!family || !planId) {
        await completeWebhookEvent({
          provider: 'subscriptions-stripe',
          eventId: event.id,
          status: 'failed',
          resultSummary: 'Missing subscription metadata'
        });
        return fail('Missing subscription metadata', 400);
      }

      await upsertActorSubscription({
        actorId,
        walletAddress,
        family,
        planId: planId as never,
        billingCadence,
        paymentMethod,
        stripeCustomerId: session.customer ? String(session.customer) : undefined,
        stripeCheckoutSessionId: session.id,
        stripeSubscriptionId: session.subscription ? String(session.subscription) : undefined
      });

      await completeWebhookEvent({
        provider: 'subscriptions-stripe',
        eventId: event.id,
        status: 'processed',
        resultSummary: `Subscription reconciled for ${planId}`,
        metadata: { actorId, planId, billingCadence }
      });

      return NextResponse.json({ ok: true, type: event.type, subscription: planId });
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const active = ['active', 'trialing'].includes(subscription.status);
      await updateSubscriptionStatusByStripeReference({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer ? String(subscription.customer) : undefined,
        status: active ? 'active' : 'cancelled'
      });
      await completeWebhookEvent({
        provider: 'subscriptions-stripe',
        eventId: event.id,
        status: 'processed',
        resultSummary: `Subscription status synced: ${subscription.status}`,
        metadata: { stripeSubscriptionId: subscription.id }
      });
      return NextResponse.json({ ok: true, type: event.type, status: subscription.status });
    }

    await completeWebhookEvent({
      provider: 'subscriptions-stripe',
      eventId: event.id,
      status: 'ignored',
      resultSummary: `Ignored event type ${event.type}`
    });
    return NextResponse.json({ ok: true, ignored: true, type: event.type });
  } catch (error) {
    await completeWebhookEvent({
      provider: 'subscriptions-stripe',
      eventId: event.id,
      status: 'failed',
      resultSummary: error instanceof Error ? error.message : 'Unknown subscription webhook failure'
    });
    throw error;
  }
}
