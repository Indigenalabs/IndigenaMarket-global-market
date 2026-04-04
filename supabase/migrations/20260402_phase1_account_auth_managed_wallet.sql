alter table if exists public.user_profiles
  add column if not exists auth_provider text not null default 'email',
  add column if not exists email_verified boolean not null default false,
  add column if not exists account_status text not null default 'active';

alter table if exists public.wallet_accounts
  add column if not exists provider text not null default 'indigena_managed',
  add column if not exists wallet_type text not null default 'managed',
  add column if not exists status text not null default 'active',
  add column if not exists wallet_reference text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_user_profiles_user_uid on public.user_profiles (user_uid);
create index if not exists idx_user_profiles_email_lower on public.user_profiles (lower(email));
create unique index if not exists idx_wallet_accounts_wallet_reference on public.wallet_accounts (wallet_reference) where wallet_reference is not null;


