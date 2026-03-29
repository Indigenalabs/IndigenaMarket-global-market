'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import { fetchAdvocacyPublicIcipNotice, type AdvocacyPublicIcipNotice } from '@/app/lib/advocacyLegalClientStore';

function toneForVisibility(value: string) {
  if (value === 'sacred') return 'border-red-400/30 bg-red-500/10 text-red-200';
  if (value === 'restricted') return 'border-amber-400/30 bg-amber-500/10 text-amber-100';
  return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200';
}

export default function IcipNoticeDetailClient({ noticeId }: { noticeId: string }) {
  const [notice, setNotice] = useState<AdvocacyPublicIcipNotice | null>(null);

  useEffect(() => {
    void (async () => {
      setNotice(await fetchAdvocacyPublicIcipNotice(noticeId));
    })();
  }, [noticeId]);

  if (!notice) {
    return (
      <AdvocacyFrame
        title="Public ICIP Notice"
        subtitle="Sanitized public rights summary for an approved Indigenous cultural-rights claim."
      >
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-8 text-center">
          <p className="text-lg font-semibold text-white">We could not load that public notice.</p>
          <p className="mt-3 text-sm leading-7 text-gray-400">
            The notice may be private again, unpublished, or unavailable in the current environment.
          </p>
          <Link href="/advocacy-legal/icip-notices" className="mt-5 inline-flex rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
            Back to public notices
          </Link>
        </section>
      </AdvocacyFrame>
    );
  }

  return (
    <AdvocacyFrame
      title="Public ICIP Notice"
      subtitle="Approved public summary for a cultural-rights claim, designed for clear notice without exposing protected registry material."
    >
      <section className="overflow-hidden rounded-[32px] border border-[#d4af37]/20 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_36%),linear-gradient(135deg,rgba(38,12,16,0.98),rgba(10,10,11,0.98))]">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#d4af37]/35 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">
                {notice.registryNumber}
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs ${toneForVisibility(notice.protocolVisibility)}`}>
                {notice.protocolVisibility}
              </span>
            </div>
            <div>
              <h2 className="max-w-3xl text-3xl font-semibold text-white md:text-4xl">{notice.claimTitle}</h2>
              <p className="mt-3 text-sm text-[#f3e3b0]">{notice.communityName}</p>
            </div>
            <p className="max-w-3xl text-sm leading-8 text-gray-300">{notice.publicSummary}</p>
            <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
              <span className="rounded-full border border-white/10 px-2 py-1">{notice.assetType}</span>
              <span className="rounded-full border border-white/10 px-2 py-1">{notice.rightsScope}</span>
              <span className="rounded-full border border-white/10 px-2 py-1">{new Date(notice.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="grid gap-4">
            <article className="rounded-2xl border border-[#d4af37]/15 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">What this page is</p>
              <p className="mt-3 text-sm leading-7 text-gray-300">
                A public notice that communicates cultural-rights boundaries at a high level. It is not the protected registry record and does not include evidence, contacts, review notes, or legal strategy.
              </p>
            </article>
            <article className="rounded-2xl border border-[#d4af37]/15 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Public protocol notice</p>
              <p className="mt-3 text-sm leading-7 text-white">
                {notice.publicProtocolNotice || 'No additional public protocol notice was attached to this summary.'}
              </p>
            </article>
            <div className="flex flex-wrap gap-3">
              <Link href="/advocacy-legal/icip-notices" className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:brightness-110">
                Back to notices
              </Link>
              <Link href="/advocacy-legal/icip-registry" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
                Open protected registry
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Rights Summary</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Public-facing statement</h3>
          <p className="mt-4 text-sm leading-8 text-gray-300">{notice.publicSummary}</p>
        </article>

        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Protected by design</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-gray-300">
            <li>Evidence files are not shown here.</li>
            <li>Claimant contact information is not shown here.</li>
            <li>Internal legal review notes are not shown here.</li>
            <li>Sacred or restricted protocol detail remains inside the protected claim record.</li>
          </ul>
        </article>
      </section>
    </AdvocacyFrame>
  );
}
