import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import {
  createVerificationPurchase,
  listVerificationPurchasesForActor,
  updateVerificationPurchaseByCheckoutSession
} from '@/app/lib/verificationPurchases';
import { getStripeServerClient, isStripeConfigured } from '@/app/lib/stripeServer';
import { getVerificationProduct } from '@/app/lib/verificationRevenue';
import { beginWebhookEvent, completeWebhookEvent } from '@/app/lib/webhookEventStore';

const STRIPE_VERIFICATION_WEBHOOK_SECRET = process.env.STRIPE_VERIFICATION_WEBHOOK_SECRET || '';

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) return fail('Stripe is not configured', 500);
  if (!STRIPE_VERIFICATION_WEBHOOK_SECRET) return fail('Stripe verification webhook secret not configured', 500);

  const signature = req.headers.get('stripe-signature') || '';
  if (!signature) return fail('Missing Stripe signature', 401);

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripeServerClient().webhooks.constructEvent(rawBody, signature, STRIPE_VERIFICATION_WEBHOOK_SECRET);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Invalid webhook signature', 401);
  }

  const eventLog = await beginWebhookEvent({
    provider: 'verification-stripe',
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
      const profileSlug = String(session.metadata?.profileSlug || '').trim();
      const productId = String(session.metadata?.productId || '').trim();
      const product = getVerificationProduct(productId);
      if (!profileSlug || !product) {
        await completeWebhookEvent({
          provider: 'verification-stripe',
          eventId: event.id,
          status: 'failed',
          resultSummary: 'Missing verification checkout metadata'
        });
        return fail('Missing verification checkout metadata', 400);
      }

      await updateVerificationPurchaseByCheckoutSession({
        stripeCheckoutSessionId: session.id,
        status: 'paid',
        stripePaymentIntentId: session.payment_intent ? String(session.payment_intent) : undefined,
        stripeCustomerId: session.customer ? String(session.customer) : undefined
      });

      const purchases = await listVerificationPurchasesForActor(actorId, walletAddress, profileSlug);
      const existing = purchases.find((entry) => entry.stripeCheckoutSessionId === session.id);
      if (!existing) {
        await createVerificationPurchase({
          actorId,
          walletAddress,
          profileSlug,
          productId: product.id,
          productName: product.name,
          amount: product.amount,
          currency: 'usd',
          status: 'paid',
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: session.payment_intent ? String(session.payment_intent) : undefined,
          stripeCustomerId: session.customer ? String(session.customer) : undefined
        });
      }

      await completeWebhookEvent({
        provider: 'verification-stripe',
        eventId: event.id,
        status: 'processed',
        resultSummary: `Verification purchase reconciled for ${product.id}`,
        metadata: { actorId, profileSlug, productId: product.id }
      });
      return NextResponse.json({ ok: true, type: event.type, productId: product.id });
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await updateVerificationPurchaseByCheckoutSession({
        stripeCheckoutSessionId: session.id,
        status: 'cancelled',
        stripePaymentIntentId: session.payment_intent ? String(session.payment_intent) : undefined,
        stripeCustomerId: session.customer ? String(session.customer) : undefined
      });
      await completeWebhookEvent({
        provider: 'verification-stripe',
        eventId: event.id,
        status: 'processed',
        resultSummary: 'Verification checkout expired',
        metadata: { stripeCheckoutSessionId: session.id }
      });
      return NextResponse.json({ ok: true, type: event.type });
    }

    await completeWebhookEvent({
      provider: 'verification-stripe',
      eventId: event.id,
      status: 'ignored',
      resultSummary: `Ignored event type ${event.type}`
    });
    return NextResponse.json({ ok: true, ignored: true, type: event.type });
  } catch (error) {
    await completeWebhookEvent({
      provider: 'verification-stripe',
      eventId: event.id,
      status: 'failed',
      resultSummary: error instanceof Error ? error.message : 'Unknown verification webhook failure'
    });
    throw error;
  }
}
