alter table if exists public.creator_account_subscriptions
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_subscription_id text;

create index if not exists creator_account_subscriptions_stripe_customer_idx
  on public.creator_account_subscriptions (stripe_customer_id);

create index if not exists creator_account_subscriptions_stripe_session_idx
  on public.creator_account_subscriptions (stripe_checkout_session_id);

create index if not exists creator_account_subscriptions_stripe_subscription_idx
  on public.creator_account_subscriptions (stripe_subscription_id);
