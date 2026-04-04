import { createClient, User } from '@supabase/supabase-js';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { createClient as createSupabaseSsrClient } from '@/utils/supabase/server';

type JsonMap = Record<string, unknown>;

export type AccountSessionIdentity = {
  profileId: string;
  actorId: string;
  userUid: string;
  email: string;
  displayName: string;
  role: string;
  accountStatus: string;
  authProvider: string;
  emailVerified: boolean;
  walletAddress: string;
  walletProvider: string;
  walletType: string;
  walletStatus: string;
  creatorProfileSlug: string;
  method: 'email';
  verified: true;
};

function getSupabaseAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function hashFragment(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function createManagedWalletAddress(userUid: string) {
  const seed = hashFragment(`${userUid}:${randomUUID()}:${Date.now()}`);
  return `r${seed.slice(0, 33)}`.toLowerCase();
}

function createManagedWalletReference(userUid: string) {
  return `iw_${hashFragment(`${userUid}:${randomBytes(8).toString('hex')}`).slice(0, 24)}`;
}

function displayNameFromUser(user: User) {
  const meta = (user.user_metadata || {}) as JsonMap;
  const candidates = [
    meta.full_name,
    meta.name,
    meta.display_name,
    user.email?.split('@')[0]
  ];
  for (const value of candidates) {
    const safe = String(value || '').trim();
    if (safe) return safe;
  }
  return 'Indigena member';
}

function slugifySegment(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return normalized || 'indigena-member';
}

function creatorSlugBase(email: string, displayName: string) {
  const emailHandle = email.split('@')[0] || '';
  return slugifySegment(displayName || emailHandle || 'indigena-member');
}

function creatorUsernameFromSlug(slug: string) {
  return `@${slug.replace(/-/g, '.')}`;
}

function memberSinceLabel() {
  return new Intl.DateTimeFormat('en-AU', {
    month: 'short',
    year: 'numeric'
  }).format(new Date());
}

async function ensureLegacyWalletAccountRow(input: {
  profileId: string;
  walletAddress: string;
}) {
  const supabase = createSupabaseServerClient();
  const existing = await supabase
    .from('wallet_accounts')
    .select('id,wallet_address')
    .eq('user_profile_id', input.profileId)
    .ilike('wallet_address', input.walletAddress)
    .maybeSingle();
  if (existing.data) return existing.data;

  const inserted = await supabase
    .from('wallet_accounts')
    .insert({
      user_profile_id: input.profileId,
      wallet_address: input.walletAddress,
      chain: 'xrpl',
      is_primary: true,
      provider: 'legacy_external',
      wallet_type: 'external',
      status: 'active',
      wallet_reference: null,
      metadata: { migratedFromProfile: true }
    })
    .select('id,wallet_address')
    .single();
  if (inserted.error) throw inserted.error;
  return inserted.data;
}

async function provisionManagedWallet(input: { profileId: string; userUid: string }) {
  const supabase = createSupabaseServerClient();
  const walletAddress = createManagedWalletAddress(input.userUid);
  const walletReference = createManagedWalletReference(input.userUid);

  const inserted = await supabase
    .from('wallet_accounts')
    .insert({
      user_profile_id: input.profileId,
      wallet_address: walletAddress,
      chain: 'xrpl',
      is_primary: true,
      provider: 'indigena_managed',
      wallet_type: 'managed',
      status: 'active',
      wallet_reference: walletReference,
      metadata: {
        managed: true,
        custodyModel: 'indigena_managed',
        providerStatus: 'provisioned_internal'
      }
    })
    .select('*')
    .single();
  if (inserted.error) throw inserted.error;

  const profileUpdate = await supabase
    .from('user_profiles')
    .update({ wallet_address: walletAddress, updated_at: new Date().toISOString() })
    .eq('id', input.profileId);
  if (profileUpdate.error) throw profileUpdate.error;

  return inserted.data as JsonMap;
}

async function reserveUniqueCreatorSlug(baseSlug: string, actorId: string) {
  const supabase = createSupabaseServerClient();

  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const existing = await supabase
      .from('creator_profiles')
      .select('slug,owner_actor_id')
      .eq('slug', candidate)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data || String(existing.data.owner_actor_id || '') === actorId) {
      return candidate;
    }
  }

  return `${baseSlug}-${hashFragment(actorId).slice(0, 6)}`;
}

async function ensureCreatorProfileForAccount(input: {
  profileId: string;
  actorId: string;
  email: string;
  displayName: string;
}) {
  const supabase = createSupabaseServerClient();

  const byProfile = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_profile_id', input.profileId)
    .maybeSingle();
  if (byProfile.error) throw byProfile.error;

  let existing = byProfile.data as JsonMap | null;
  if (!existing) {
    const byActor = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('owner_actor_id', input.actorId)
      .maybeSingle();
    if (byActor.error) throw byActor.error;
    existing = byActor.data as JsonMap | null;
  }

  if (existing) {
    const fallbackSlug = await reserveUniqueCreatorSlug(creatorSlugBase(input.email, input.displayName), input.actorId);
    const nextSlug = String(existing.slug || '').trim() || fallbackSlug;
    const patch: JsonMap = {
      updated_at: new Date().toISOString()
    };
    if (String(existing.user_profile_id || '').trim() !== input.profileId) patch.user_profile_id = input.profileId;
    if (String(existing.owner_actor_id || '').trim() !== input.actorId) patch.owner_actor_id = input.actorId;
    if (!String(existing.display_name || '').trim()) patch.display_name = input.displayName;
    if (!String(existing.username || '').trim()) patch.username = creatorUsernameFromSlug(nextSlug);
    if (!String(existing.slug || '').trim()) patch.slug = nextSlug;
    if (!String(existing.member_since || '').trim()) patch.member_since = memberSinceLabel();
    if (!String(existing.verification_label || '').trim()) patch.verification_label = 'Verification pending';
    if (!String(existing.bio_short || '').trim()) {
      patch.bio_short = 'Finish verification to start selling through your Indigena storefront.';
    }

    if (Object.keys(patch).length > 1) {
      const updated = await supabase
        .from('creator_profiles')
        .update(patch)
        .eq('id', existing.id)
        .select('slug')
        .single();
      if (updated.error) throw updated.error;
      return String(updated.data.slug || nextSlug);
    }

    return nextSlug;
  }

  const slug = await reserveUniqueCreatorSlug(creatorSlugBase(input.email, input.displayName), input.actorId);
  const inserted = await supabase
    .from('creator_profiles')
    .insert({
      user_profile_id: input.profileId,
      owner_actor_id: input.actorId,
      slug,
      display_name: input.displayName,
      username: creatorUsernameFromSlug(slug),
      verification_label: 'Verification pending',
      bio_short: 'Finish verification to start selling through your Indigena storefront.',
      bio_long: '',
      member_since: memberSinceLabel(),
      languages: [],
      socials: [],
      awards: [],
      exhibitions: [],
      publications: [],
      dashboard_stats: {},
      earnings_by_pillar: [],
      traffic_sources: [],
      notifications: []
    })
    .select('slug')
    .single();
  if (inserted.error) throw inserted.error;
  return String(inserted.data.slug || slug);
}

function mapWalletRow(row: JsonMap | null | undefined, fallbackWalletAddress = '') {
  return {
    walletAddress: String(row?.wallet_address || fallbackWalletAddress || '').toLowerCase(),
    walletProvider: String(row?.provider || 'indigena_managed'),
    walletType: String(row?.wallet_type || 'managed'),
    walletStatus: String(row?.status || 'active')
  };
}

export async function verifySupabaseAccessToken(accessToken: string) {
  const supabaseAuth = getSupabaseAuthClient();
  const { data, error } = await supabaseAuth.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

export async function ensureAccountIdentityFromAccessToken(accessToken: string): Promise<AccountSessionIdentity | null> {
  const user = await verifySupabaseAccessToken(accessToken);
  if (!user) return null;

  if (!isSupabaseServerConfigured()) {
    throw new Error('Supabase server configuration is required for account auth');
  }

  const supabase = createSupabaseServerClient();
  const email = String(user.email || '').trim().toLowerCase();
  const displayName = displayNameFromUser(user);
  const emailVerified = Boolean(user.email_confirmed_at);

  const existing = await supabase
    .from('user_profiles')
    .select('*')
    .or(`user_uid.eq.${user.id},email.eq.${email}`)
    .maybeSingle();
  if (existing.error) throw existing.error;

  let profile = existing.data as JsonMap | null;

  if (!profile) {
    const inserted = await supabase
      .from('user_profiles')
      .insert({
        user_uid: user.id,
        email,
        display_name: displayName,
        role: 'user',
        verification_level: 'unverified',
        auth_provider: 'email',
        email_verified: emailVerified,
        account_status: 'active'
      })
      .select('*')
      .single();
    if (inserted.error) throw inserted.error;
    profile = inserted.data as JsonMap;
  } else {
    const patch: JsonMap = {};
    if (String(profile.user_uid || '').trim() !== user.id) patch.user_uid = user.id;
    if (email && String(profile.email || '').trim().toLowerCase() !== email) patch.email = email;
    if (!String(profile.display_name || '').trim()) patch.display_name = displayName;
    patch.auth_provider = 'email';
    patch.email_verified = emailVerified;
    patch.updated_at = new Date().toISOString();
    const updated = await supabase
      .from('user_profiles')
      .update(patch)
      .eq('id', profile.id)
      .select('*')
      .single();
    if (updated.error) throw updated.error;
    profile = updated.data as JsonMap;
  }

  const profileId = String(profile.id || '');
  const profileWallet = String(profile.wallet_address || '').trim().toLowerCase();

  let primaryWalletRow: JsonMap | null = null;
  const wallets = await supabase
    .from('wallet_accounts')
    .select('*')
    .eq('user_profile_id', profileId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });
  if (wallets.error) throw wallets.error;

  if (wallets.data && wallets.data.length > 0) {
    primaryWalletRow = (wallets.data[0] as JsonMap) || null;
  } else if (profileWallet) {
    primaryWalletRow = (await ensureLegacyWalletAccountRow({
      profileId,
      walletAddress: profileWallet
    })) as JsonMap;
  } else {
    primaryWalletRow = await provisionManagedWallet({ profileId, userUid: user.id });
  }

  const wallet = mapWalletRow(primaryWalletRow, profileWallet);
  if (!profileWallet && wallet.walletAddress) {
    profile.wallet_address = wallet.walletAddress;
  }

  const actorId = String(profile.user_uid || profile.id || user.id);
  const creatorProfileSlug = await ensureCreatorProfileForAccount({
    profileId,
    actorId,
    email,
    displayName: String(profile.display_name || displayName)
  });

  return {
    profileId,
    actorId,
    userUid: user.id,
    email,
    displayName: String(profile.display_name || displayName),
    role: String(profile.role || 'user'),
    accountStatus: String(profile.account_status || 'active'),
    authProvider: String(profile.auth_provider || 'email'),
    emailVerified: Boolean(profile.email_verified ?? emailVerified),
    walletAddress: wallet.walletAddress,
    walletProvider: wallet.walletProvider,
    walletType: wallet.walletType,
    walletStatus: wallet.walletStatus,
    creatorProfileSlug,
    method: 'email',
    verified: true
  };
}

export async function ensureCurrentAccountIdentityFromSession() {
  const supabase = await createSupabaseSsrClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) return null;
  return ensureAccountIdentityFromAccessToken(data.session.access_token);
}

export async function findCreatorProfileSlugForActor(actorId: string) {
  const safeActorId = actorId.trim();
  if (!safeActorId || safeActorId === 'guest') return null;

  const supabase = createSupabaseServerClient();
  const existing = await supabase
    .from('creator_profiles')
    .select('slug')
    .eq('owner_actor_id', safeActorId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  return existing.data ? String(existing.data.slug || '') : null;
}
