'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Loader2, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { ensureAccountSessionAuth, watchAccountAuthState } from '@/app/lib/accountAuthClient';
import { fetchWalletSessionMe, logoutWalletAuthSessionClient } from '@/app/lib/walletAuthClient';

type SessionState = {
  connected: boolean;
  walletAddress: string;
  actorId: string;
  role: string;
  email: string;
  displayName: string;
  method: 'email' | 'wallet' | 'guest';
};

type WalletSessionEntryProps = {
  variant?: 'header' | 'panel' | 'sidebar';
};

const initialState: SessionState = {
  connected: false,
  walletAddress: '',
  actorId: '',
  role: 'guest',
  email: '',
  displayName: '',
  method: 'guest'
};

function shortenWallet(value: string) {
  if (!value) return '';
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default function WalletSessionEntry({ variant = 'header' }: WalletSessionEntryProps) {
  const [session, setSession] = useState<SessionState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSession = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const storedWallet = (window.localStorage.getItem('indigena_wallet_address') || '').trim().toLowerCase();
    const storedActor = (window.localStorage.getItem('indigena_user_id') || '').trim();
    const storedEmail = (window.localStorage.getItem('indigena_user_email') || '').trim();
    const storedJwt = (window.localStorage.getItem('indigena_user_jwt') || '').trim();

    if (!storedJwt) {
      setSession({
        connected: false,
        walletAddress: storedWallet,
        actorId: storedActor || storedWallet,
        role: 'guest',
        email: storedEmail,
        displayName: '',
        method: 'guest'
      });
      return;
    }

    try {
      const me = await fetchWalletSessionMe();
      if (!me) {
        setSession(initialState);
        return;
      }
      setSession({
        connected: true,
        walletAddress: me.walletAddress,
        actorId: me.actorId,
        role: me.role,
        email: me.email || storedEmail,
        displayName: me.displayName || '',
        method: me.method
      });
      setError('');
    } catch {
      setSession({
        connected: Boolean(storedWallet || storedEmail),
        walletAddress: storedWallet,
        actorId: storedActor || storedWallet,
        role: 'guest',
        email: storedEmail,
        displayName: '',
        method: 'guest'
      });
    }
  }, []);

  useEffect(() => {
    void loadSession();
    const onSessionChange = () => {
      void loadSession();
    };
    window.addEventListener('indigena-wallet-session-changed', onSessionChange as EventListener);
    window.addEventListener('indigena-account-session-changed', onSessionChange as EventListener);
    window.addEventListener('storage', onSessionChange);
    const unsubscribe = watchAccountAuthState(onSessionChange);
    return () => {
      window.removeEventListener('indigena-wallet-session-changed', onSessionChange as EventListener);
      window.removeEventListener('indigena-account-session-changed', onSessionChange as EventListener);
      window.removeEventListener('storage', onSessionChange);
      unsubscribe();
    };
  }, [loadSession]);

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      await ensureAccountSessionAuth();
      await loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError('');
    try {
      await logoutWalletAuthSessionClient();
      setSession(initialState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account sign-out failed');
    } finally {
      setLoading(false);
    }
  };

  const badge = useMemo(() => {
    if (!session.connected) return 'Guest';
    if (session.role === 'admin') return 'Admin';
    if (session.role === 'legal_ops') return 'Legal Ops';
    return 'Verified';
  }, [session.connected, session.role]);

  if (variant === 'sidebar') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className={`w-2 h-2 rounded-full ${session.connected ? 'bg-green-400' : 'bg-[#DC143C] pulse-red'}`}></div>
        <span>{session.connected ? `${badge} ${session.email || shortenWallet(session.walletAddress)}` : 'Account session idle'}</span>
      </div>
    );
  }

  if (variant === 'panel') {
    return (
      <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/15 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
              <ShieldCheck size={14} />
              Account Session
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {session.connected ? 'Account signed in and ready' : 'Sign in with email to unlock protected actions'}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {session.connected
                  ? `Signed in as ${session.email || shortenWallet(session.walletAddress)} with ${badge.toLowerCase()} access.`
                  : 'Use one secure email-based account across tourism bookings, advocacy actions, courses, and future pillar flows. Your managed wallet is linked automatically.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {session.connected ? (
              <>
                <Link
                  href="/wallet"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm font-medium text-[#d4af37] transition-all hover:bg-[#d4af37] hover:text-black"
                >
                  <ExternalLink size={16} />
                  Open Wallet
                </Link>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition-all hover:border-[#DC143C]/40 hover:text-white disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#DC143C] to-[#8B0000] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#DC143C]/20 transition-all hover:shadow-[#DC143C]/35 disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                Sign In With Email
              </button>
            )}
          </div>
        </div>

        {session.connected && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Email</p>
              <p className="mt-1 text-sm text-white">{session.email || 'Email syncing...'}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Access</p>
              <p className="mt-1 text-sm font-medium text-[#d4af37]">{badge}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Managed Wallet</p>
              <p className="mt-1 truncate font-mono text-sm text-white">{shortenWallet(session.walletAddress) || 'Provisioning...'}</p>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-[#ff8f8f]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.connected && (
        <div className="hidden items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-2 text-xs text-[#d4af37] sm:flex">
          <CheckCircle2 size={14} />
          {badge}
        </div>
      )}

      <button
        type="button"
        onClick={session.connected ? handleDisconnect : handleConnect}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all disabled:opacity-60 ${
          session.connected
            ? 'border border-[#DC143C] bg-[#DC143C]/20 text-[#ff7070] hover:bg-[#DC143C]/30'
            : 'bg-gradient-to-r from-[#DC143C] to-[#8B0000] text-white hover:shadow-lg hover:shadow-[#DC143C]/30'
        }`}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : session.connected ? <LogOut size={16} /> : <Mail size={16} />}
        {session.connected ? (session.email || shortenWallet(session.walletAddress)) : 'Sign In'}
      </button>

      {error && <span className="hidden max-w-[220px] text-xs text-[#ff8f8f] lg:block">{error}</span>}
    </div>
  );
}


