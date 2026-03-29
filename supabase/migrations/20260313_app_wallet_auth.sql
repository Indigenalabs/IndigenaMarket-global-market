create table if not exists public.auth_wallet_challenges (
  challenge_id text primary key,
  wallet_address text not null,
  nonce text not null,
  message text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create index if not exists idx_auth_wallet_challenges_wallet
  on public.auth_wallet_challenges (wallet_address, created_at desc);

create index if not exists idx_auth_wallet_challenges_expiry
  on public.auth_wallet_challenges (expires_at);

create table if not exists public.auth_wallet_sessions (
  session_id text primary key,
  wallet_address text not null,
  actor_id text not null,
  role text not null default 'user',
  user_uid text,
  refresh_token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_auth_wallet_sessions_wallet
  on public.auth_wallet_sessions (wallet_address, created_at desc);

create index if not exists idx_auth_wallet_sessions_actor
  on public.auth_wallet_sessions (actor_id, created_at desc);

create index if not exists idx_auth_wallet_sessions_refresh_expiry
  on public.auth_wallet_sessions (refresh_expires_at);

create index if not exists idx_auth_wallet_sessions_revoked
  on public.auth_wallet_sessions (revoked_at);
