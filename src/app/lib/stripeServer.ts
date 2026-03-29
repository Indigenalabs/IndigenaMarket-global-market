import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(STRIPE_SECRET_KEY);
}

export function getStripeServerClient() {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY);
  }
  return stripeClient;
}
