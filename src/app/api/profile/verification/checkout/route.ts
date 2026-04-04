import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import { resolveRequestWallet } from '@/app/lib/requestIdentity';
import { createVerificationPurchase } from '@/app/lib/verificationPurchases';
import { getStripeServerClient, isStripeConfigured } from '@/app/lib/stripeServer';
import { getVerificationProduct } from '@/app/lib/verificationRevenue';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid verification checkout payload.' }, { status: 400 });

  const slug = asText(body.slug);
  const productId = asText(body.productId);
  if (!slug || !productId) {
    return NextResponse.json({ message: 'slug and productId are required.' }, { status: 400 });
  }

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Sign in to purchase verification services.',
    forbiddenMessage: 'You can only purchase verification services for your own creator profile.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  const product = getVerificationProduct(productId);
  if (!product) {
    return NextResponse.json({ message: 'Verification product was not found.' }, { status: 404 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: 'Stripe is not configured for verification payments.' }, { status: 500 });
  }
  const walletAddress = resolveRequestWallet(req);

  const origin = req.nextUrl.origin;
  const session = await getStripeServerClient().checkout.sessions.create({
    mode: 'payment',
    success_url: `${origin}/creator-hub?tab=verification&checkout=success`,
    cancel_url: `${origin}/creator-hub?tab=verification&checkout=cancelled`,
    customer_creation: 'always',
    metadata: {
      actorId: owner.actorId,
      walletAddress,
      profileSlug: slug,
      productId: product.id
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description
          },
          unit_amount: Math.round(product.amount * 100)
        }
      }
    ]
  });

  await createVerificationPurchase({
    actorId: owner.actorId,
    walletAddress,
    profileSlug: slug,
    productId: product.id,
    productName: product.name,
    amount: product.amount,
    currency: 'usd',
    status: 'pending',
    stripeCheckoutSessionId: session.id
  });

  return NextResponse.json({
    mode: 'redirect',
    checkoutUrl: session.url,
    checkoutSessionId: session.id
  });
}



