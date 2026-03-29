import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient, isStripeConfigured } from '@/app/lib/stripeServer';
import { resolveCheckoutPlanConfig, type CheckoutFamily } from '@/app/lib/subscriptionCatalog';
import { getActorEntitlements, upsertActorSubscription } from '@/app/lib/subscriptionState';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';

type JsonMap = Record<string, unknown>;

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as JsonMap | null;
  if (!body) return fail('Invalid subscription checkout payload.');

  const family = String(body.family || '').trim() as CheckoutFamily;
  const planId = String(body.planId || '').trim();
  const billingCadence = String(body.billingCadence || 'monthly').trim() as 'monthly' | 'annual' | 'one-time';
  const paymentMethod = String(body.paymentMethod || 'card').trim() as 'card' | 'indi' | 'staked';
  if (!family || !planId) return fail('family and planId are required.');

  const actorId = resolveRequestActorId(req);
  const walletAddress = resolveRequestWallet(req);
  const plan = resolveCheckoutPlanConfig(family, planId, billingCadence);
  if (!plan) return fail('Plan was not found for checkout.');

  if (plan.amount <= 0 || paymentMethod !== 'card' || !isStripeConfigured()) {
    await upsertActorSubscription({
      actorId,
      walletAddress,
      family,
      planId: planId as never,
      billingCadence: plan.cadence,
      paymentMethod
    });
    const entitlements = await getActorEntitlements(actorId, walletAddress);
    return NextResponse.json({ mode: 'activated', entitlements });
  }

  const stripe = getStripeServerClient();
  const origin = req.nextUrl.origin;
  const successUrl = `${origin}/subscription?checkout=success`;
  const cancelUrl = `${origin}/subscription?checkout=cancelled`;
  const session = await stripe.checkout.sessions.create({
    mode: plan.cadence === 'one-time' ? 'payment' : 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    ...(plan.cadence === 'one-time' ? { customer_creation: 'always' as const } : {}),
    metadata: {
      actorId,
      walletAddress,
      family,
      planId,
      billingCadence: plan.cadence,
      paymentMethod
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
            description: plan.description
          },
          unit_amount: Math.round(plan.amount * 100),
          ...(plan.cadence === 'one-time'
            ? {}
            : {
                recurring: {
                  interval: plan.cadence === 'annual' ? 'year' : 'month'
                }
              })
        }
      }
    ]
  });

  return NextResponse.json({
    mode: 'redirect',
    checkoutUrl: session.url,
    checkoutSessionId: session.id
  });
}
