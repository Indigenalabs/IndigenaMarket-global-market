import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { getWalletSessionMeFromToken } from '@/app/lib/walletAuthService';

type JsonMap = Record<string, unknown>;

export type AdvocacyOpsIdentity = {
  actorId: string;
  walletAddress?: string;
  userUid?: string;
  role: string;
  source: 'jwt' | 'wallet';
};

function parseBearerToken(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice('Bearer '.length).trim();
}

function parseWallet(req: NextRequest) {
  return (req.headers.get('x-wallet-address') || req.headers.get('x-actor-id') || '').trim();
}

function parseAllowedWallets(value: string | undefined) {
  return (value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

async function verifyJwtIdentity(token: string): Promise<AdvocacyOpsIdentity | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) return null;

  const supabaseAuth = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return null;

  let role = 'user';
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const profile = await supabase
      .from('user_profiles')
      .select('role,wallet_address,user_uid,email')
      .or(`user_uid.eq.${data.user.id},email.eq.${data.user.email || ''}`)
      .maybeSingle();
    if (profile.data) {
      role = String((profile.data as JsonMap).role || 'user');
      return {
        actorId: String((profile.data as JsonMap).user_uid || data.user.id),
        walletAddress: String((profile.data as JsonMap).wallet_address || ''),
        userUid: data.user.id,
        role,
        source: 'jwt'
      };
    }
  }

  return {
    actorId: data.user.id,
    userUid: data.user.id,
    role,
    source: 'jwt'
  };
}

async function verifyWalletSessionIdentity(token: string): Promise<AdvocacyOpsIdentity | null> {
  const session = await getWalletSessionMeFromToken(token);
  if (!session) return null;
  return {
    actorId: session.actorId,
    walletAddress: session.walletAddress || undefined,
    userUid: session.userUid,
    role: session.role,
    source: 'wallet'
  };
}

async function resolveWalletRole(walletAddress: string): Promise<AdvocacyOpsIdentity | null> {
  const wallet = walletAddress.trim();
  if (!wallet) return null;
  const normalized = wallet.toLowerCase();
  const adminWallets = parseAllowedWallets(process.env.ADVOCACY_ADMIN_WALLETS);
  const legalWallets = parseAllowedWallets(process.env.ADVOCACY_LEGAL_OPS_WALLETS);

  let role = adminWallets.includes(normalized) ? 'admin' : legalWallets.includes(normalized) ? 'legal_ops' : 'user';

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
      role = String(profile.role || role || 'user');
      return {
        actorId: String(profile.user_uid || profile.id || wallet),
        walletAddress: String(profile.wallet_address || wallet),
        role,
        source: 'wallet'
      };
    }
  }

  if (role !== 'user') {
    return {
      actorId: wallet,
      walletAddress: wallet,
      role,
      source: 'wallet'
    };
  }

  return null;
}

export async function requireAdvocacyOpsRole(req: NextRequest, allowedRoles: string[]) {
  const token = parseBearerToken(req);
  const wallet = parseWallet(req);
  const adminSigned = req.headers.get('x-admin-signed') === 'true';
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

  let identity: AdvocacyOpsIdentity | null = null;
  if (token) identity = await verifyJwtIdentity(token);
  if (!identity && token) identity = await verifyWalletSessionIdentity(token);
  const walletIdentity = wallet ? await resolveWalletRole(wallet) : null;
  if (
    walletIdentity &&
    normalizedAllowedRoles.includes(walletIdentity.role.toLowerCase()) &&
    (!identity || !normalizedAllowedRoles.includes(identity.role.toLowerCase()))
  ) {
    identity = walletIdentity;
  }
  if (!identity && walletIdentity) identity = walletIdentity;

  if (!identity) {
    return {
      error: NextResponse.json({ message: 'Verified wallet or authenticated user required' }, { status: 401 }),
      identity: null
    };
  }

  if (!adminSigned) {
    return {
      error: NextResponse.json({ message: 'Admin signature required' }, { status: 403 }),
      identity: null
    };
  }

  if (!normalizedAllowedRoles.includes(identity.role.toLowerCase())) {
    return {
      error: NextResponse.json({ message: 'Insufficient role for advocacy ops action' }, { status: 403 }),
      identity
    };
  }

  return { error: null, identity };
}
