'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck } from 'lucide-react';
import { fetchPlatformAccount } from '@/app/lib/platformAccountsApi';
import type { PlatformAccountRecord } from '@/app/lib/platformAccounts';
import {
  getCommunityStorefrontState,
  isCommunityStorefrontAccount
} from '@/app/lib/communityStorefrontState';

export default function CommunityStorefrontBanner({
  accountSlug,
  returnTo = '/creator-hub'
}: {
  accountSlug?: string;
  returnTo?: string;
}) {
  const [account, setAccount] = useState<PlatformAccountRecord | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!accountSlug) {
      setAccount(null);
      setError('');
      return;
    }
    fetchPlatformAccount(accountSlug)
      .then((data) => {
        if (cancelled) return;
        setAccount(data.account);
        setError('');
      })
      .catch((fetchError) => {
        if (cancelled) return;
        setAccount(null);
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load storefront status.');
      });
    return () => {
      cancelled = true;
    };
  }, [accountSlug]);

  if (!accountSlug) return null;

  if (error) {
    return (
      <div className="rounded-[24px] border border-[#DC143C]/20 bg-[#DC143C]/10 px-4 py-4 text-sm text-[#ffb4c0]">
        {error}
      </div>
    );
  }

  if (!account || !isCommunityStorefrontAccount(account)) return null;

  const state = getCommunityStorefrontState(account.verificationStatus);

  return (
    <div className="rounded-[24px] border border-[#d4af37]/20 bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 p-2 text-[#d4af37]">
            <Building2 size={16} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Community storefront</p>
            <h3 className="mt-1 text-base font-semibold text-white">{account.displayName}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-300">{state.title}</p>
            <p className="mt-2 text-sm leading-6 text-gray-400">{state.detail}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${state.badgeClassName}`}>
          <ShieldCheck size={12} />
          {state.badgeLabel}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link
          href={`/communities/${encodeURIComponent(account.slug)}/members?returnTo=${encodeURIComponent(returnTo)}`}
          className="rounded-full border border-white/10 px-4 py-2 text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
        >
          Manage representatives
        </Link>
        <Link
          href={`/creator-hub?accountSlug=${encodeURIComponent(account.slug)}`}
          className="rounded-full border border-[#d4af37]/20 px-4 py-2 text-[#d4af37] hover:border-[#d4af37]/45 hover:text-[#f4d370]"
        >
          Open this storefront in Creator Hub
        </Link>
      </div>
    </div>
  );
}
