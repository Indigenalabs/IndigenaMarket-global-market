import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { getWalletSessionMeFromToken } from '@/app/lib/walletAuthService';

type JsonMap = Record<string, unknown>;

export type AdvocacyActionIdentity = {
  actorId: string;
  walletAddress?: string;
  userUid?: string;
  role: string;
  method: 'jwt' | 'wallet';
  verified: boolean;
};

function parseBearerToken(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice('Bearer '.length).trim();
}

function parseWallet(req: NextRequest, body?: Record<string, unknown>) {
  return (
    req.headers.get('x-wallet-address') ||
    req.headers.get('x-actor-id') ||
    String(body?.actorId || '')
  ).trim();
}

function allowDevHeaderFallback() {
  return (
    process.env.NODE_ENV !== 'production' &&
    String(process.env.ADVOCACY_ALLOW_DEV_HEADER_AUTH || 'true').toLowerCase() === 'true'
  );
}

async function verifyJwtIdentity(token: string): Promise<AdvocacyActionIdentity | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) return null;

  const supabaseAuth = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return null;

  let role = 'user';
  let actorId = data.user.id;
  let walletAddress = '';

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const profile = await supabase
      .from('user_profiles')
      .select('id,role,wallet_address,user_uid,email')
      .or(`user_uid.eq.${data.user.id},email.eq.${data.user.email || ''}`)
      .maybeSingle();

    if (profile.data) {
      const row = profile.data as JsonMap;
      role = String(row.role || 'user');
      actorId = String(row.user_uid || row.id || data.user.id);
      walletAddress = String(row.wallet_address || '');
    }
  }

  return {
    actorId,
    walletAddress: walletAddress || undefined,
    userUid: data.user.id,
    role,
    method: 'jwt',
    verified: true
  };
}

async function verifyWalletSessionIdentity(token: string): Promise<AdvocacyActionIdentity | null> {
  const session = await getWalletSessionMeFromToken(token);
  if (!session) return null;
  return {
    actorId: session.actorId,
    walletAddress: session.walletAddress || undefined,
    userUid: session.userUid,
    role: session.role,
    method: 'wallet',
    verified: true
  };
}

async function resolveWalletProfile(walletAddress: string): Promise<AdvocacyActionIdentity | null> {
  const wallet = walletAddress.trim();
  if (!wallet) return null;

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const direct = await supabase
      .from('user_profiles')
      .select('id,role,wallet_address,user_uid')
      .ilike('wallet_address', wallet)
      .maybeSingle();
    let profile = direct.data as JsonMap | null;

    if (!profile) {
      const linked = await supabase
        .from('wallet_accounts')
        .select('wallet_address,user_profile_id,user_profiles(id,role,user_uid,wallet_address)')
        .ilike('wallet_address', wallet)
        .maybeSingle();
      if (linked.data) {
        const nested = (linked.data as JsonMap).user_profiles as JsonMap | JsonMap[] | null | undefined;
        profile = Array.isArray(nested) ? (nested[0] || null) : (nested || null);
      }
    }

    if (profile) {
      return {
        actorId: String(profile.user_uid || profile.id || wallet),
        walletAddress: String(profile.wallet_address || wallet),
        role: String(profile.role || 'user'),
        method: 'wallet',
        verified: false
      };
    }
  }

  if (!allowDevHeaderFallback()) return null;
  return {
    actorId: wallet,
    walletAddress: wallet,
    role: 'user',
    method: 'wallet',
    verified: false
  };
}

export async function resolveAdvocacyActionIdentity(req: NextRequest, body?: Record<string, unknown>) {
  const token = parseBearerToken(req);
  if (token) {
    const jwtIdentity = await verifyJwtIdentity(token);
    if (jwtIdentity) return jwtIdentity;
    const walletSessionIdentity = await verifyWalletSessionIdentity(token);
    if (walletSessionIdentity) return walletSessionIdentity;
  }

  const wallet = parseWallet(req, body);
  if (!wallet) return null;

  if (!allowDevHeaderFallback()) {
    return null;
  }

  return resolveWalletProfile(wallet);
}

export async function requireVerifiedAdvocacyActionIdentity(req: NextRequest, body?: Record<string, unknown>) {
  const identity = await resolveAdvocacyActionIdentity(req, body);
  if (!identity) {
    return {
      error: NextResponse.json({ success: false, message: 'Authenticated Supabase user required for this action' }, { status: 401 }),
      identity: null
    };
  }

  if (process.env.NODE_ENV === 'production' && !identity.verified) {
    return {
      error: NextResponse.json({ success: false, message: 'Verified session required for this action' }, { status: 401 }),
      identity: null
    };
  }

  return { error: null, identity };
}
