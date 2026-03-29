'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchSubscriptionEntitlements, type SubscriptionEntitlementsResponse } from '@/app/lib/profileApi';
import { canAccessHeritageLevel, getHeritageAccessUpgradeCopy } from '@/app/lib/archiveAccess';
import type { HeritageAccessLevel } from '@/app/lib/languageHeritageApi';

export default function HeritageAccessGate({
  accessLevel,
  fallbackTitle,
  fallbackDetail,
  children
}: {
  accessLevel: Exclude<HeritageAccessLevel, 'public'>;
  fallbackTitle?: string;
  fallbackDetail?: string;
  children: ReactNode;
}) {
  const [entitlements, setEntitlements] = useState<SubscriptionEntitlementsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSubscriptionEntitlements()
      .then((data) => {
        if (cancelled) return;
        setEntitlements(data);
      })
      .catch(() => {
        if (cancelled) return;
        setEntitlements(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4 text-sm text-gray-300">
        Checking archive access...
      </section>
    );
  }

  if (canAccessHeritageLevel(accessLevel, entitlements)) {
    return <>{children}</>;
  }

  const copy = getHeritageAccessUpgradeCopy(accessLevel);
  const title = fallbackTitle || copy.title;
  const detail = fallbackDetail || copy.detail;

  return (
    <section className="rounded-xl border border-[#d4af37]/25 bg-[#101010] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Archive gate</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-gray-300">{detail}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/subscription" className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
          {copy.ctaLabel}
        </Link>
        <Link href="/language-heritage/sacred-request" className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">
          Request reviewed access
        </Link>
      </div>
    </section>
  );
}
