'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, ShieldCheck, Wallet } from 'lucide-react';
import {
  fetchAccountSessionMe,
  hydrateSupabaseSessionFromUrl,
  requestEmailSignInLink,
  syncAccountSessionFromSupabase
} from '@/app/lib/accountAuthClient';

type SignInClientProps = {
  nextPath?: string;
};

export default function SignInClient({ nextPath: nextPathProp = '/creator-hub' }: SignInClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const nextPath = useMemo(() => nextPathProp || '/creator-hub', [nextPathProp]);

  useEffect(() => {
    let active = true;
    const syncExistingSession = async () => {
      setSyncing(true);
      try {
        await hydrateSupabaseSessionFromUrl().catch(() => false);
        const account = await syncAccountSessionFromSupabase().catch(async () => fetchAccountSessionMe());
        if (!active) return;
        if (account?.actorId) {
          router.replace(nextPath);
          return;
        }
      } finally {
        if (active) setSyncing(false);
      }
    };
    void syncExistingSession();
    return () => {
      active = false;
    };
  }, [nextPath, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError('');
    setMessage('');
    try {
      await requestEmailSignInLink(email, nextPath);
      setMessage(`We sent a secure sign-in link to ${email.trim().toLowerCase()}. Open it on this device to finish signing in.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the sign-in link.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="overflow-hidden rounded-[32px] border border-[#DC143C]/20 bg-[radial-gradient(circle_at_top_left,rgba(220,20,60,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.16),transparent_30%),#0d0d0d] p-8 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-[#f0d39c]">
            <ShieldCheck size={14} />
            Phase 1 account access
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
            Sign in with email. Your Indigena account and managed wallet are prepared behind the scenes.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
            People do not need to know crypto to begin. Sign in by email, keep the same account across web and mobile, and use the same Indigena wallet and INDI balance everywhere.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/8 bg-black/25 p-5">
              <Mail size={18} className="text-[#d4af37]" />
              <p className="mt-4 text-sm font-semibold text-white">Email first</p>
              <p className="mt-2 text-sm leading-6 text-white/60">No wallet extension or seed phrase before people can create an account.</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/25 p-5">
              <Wallet size={18} className="text-[#d4af37]" />
              <p className="mt-4 text-sm font-semibold text-white">Managed wallet</p>
              <p className="mt-2 text-sm leading-6 text-white/60">Each account gets a linked Indigena-managed wallet for INDI balance and future payouts.</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/25 p-5">
              <ShieldCheck size={18} className="text-[#d4af37]" />
              <p className="mt-4 text-sm font-semibold text-white">Verification next</p>
              <p className="mt-2 text-sm leading-6 text-white/60">Anyone can join. Selling stays gated until Indigenous seller verification is approved.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#101010] p-8 md:p-10">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]/78">Account sign-in</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Send a secure sign-in link</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              Use the same email account on web and mobile. Once you open the sign-in link, we will finish your account session and route you back into the app.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/82">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]/45"
              />
            </label>

            <button
              type="submit"
              disabled={sending || syncing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DC143C] to-[#8B0000] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#DC143C]/20 transition hover:shadow-[#DC143C]/35 disabled:opacity-60"
            >
              {sending || syncing ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              {syncing ? 'Checking your session…' : sending ? 'Sending sign-in link…' : 'Email me a sign-in link'}
            </button>
          </form>

          {message ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-200">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-2xl border border-[#DC143C]/30 bg-[#2a0d12] p-4 text-sm leading-6 text-[#ffb5bf]">
              {error}
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/58">
            We will redirect you to <span className="font-medium text-white/85">{nextPath}</span> after sign-in.
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-white/72 transition hover:border-[#d4af37]/35 hover:text-white">
              Back home
            </Link>
            <Link href="/creator-hub" className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/8 px-4 py-2 text-[#f0d39c] transition hover:bg-[#d4af37]/12">
              Open Creator Hub
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
