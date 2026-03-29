'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdvocacyFrame from '../components/AdvocacyFrame';
import { fetchAdvocacyPublicIcipNotices, type AdvocacyPublicIcipNotice } from '@/app/lib/advocacyLegalClientStore';

function toneForVisibility(value: string) {
  if (value === 'sacred') return 'border-red-400/30 bg-red-500/10 text-red-200';
  if (value === 'restricted') return 'border-amber-400/30 bg-amber-500/10 text-amber-100';
  return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200';
}

export default function IcipNoticesPageClient() {
  const [items, setItems] = useState<AdvocacyPublicIcipNotice[]>([]);

  useEffect(() => {
    void (async () => {
      setItems(await fetchAdvocacyPublicIcipNotices());
    })();
  }, []);

  return (
    <AdvocacyFrame
      title="Public ICIP Notices"
      subtitle="Sanitized approved notices that communicate cultural-rights boundaries without exposing private evidence or legal strategy."
    >
      <section className="overflow-hidden rounded-[30px] border border-[#d4af37]/20 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_38%),linear-gradient(135deg,rgba(42,13,17,0.98),rgba(11,11,12,0.98))]">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-[#d4af37]/35 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#f3e3b0]">
              Approved Public Summary Feed
            </span>
            <div>
              <h2 className="max-w-3xl text-3xl font-semibold text-white md:text-4xl">
                A public-facing notice board for approved Indigenous cultural-rights claims.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">
                This page is intentionally limited. It shows only a claimant-approved summary, high-level rights category, and any public protocol notice. Contact details, evidence files, internal notes, and sacred context stay inside the protected registry.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ['Published notices', items.length.toString(), 'Approved summaries now visible to the public.'],
                ['Protected by default', '100%', 'Claims remain private unless the claimant explicitly publishes a summary.'],
                ['Evidence exposed', '0', 'No private evidence or legal notes appear here.']
              ].map(([label, value, copy]) => (
                <article key={label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-xs leading-6 text-gray-400">{copy}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Why this exists', 'Communities often need a visible notice of rights and protocol limits without exposing the full case record.'],
              ['What stays private', 'Evidence files, claimant contact info, legal notes, infringement details, and sensitive protocol context.'],
              ['Who controls it', 'The claimant keeps the record private by default and can publish a sanitized summary only after approval.'],
              ['How to file a claim', 'Use the ICIP Registry to create a protected record, attach evidence, and move it through legal review.']
            ].map(([title, copy]) => (
              <article key={title} className="rounded-2xl border border-[#d4af37]/15 bg-black/30 p-4">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          {items.length ? items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[28px] border border-[#d4af37]/20 bg-[#101112]">
              <div className="h-2 bg-[linear-gradient(90deg,#d4af37,rgba(212,175,55,0.2),transparent)]" />
              <div className="space-y-5 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#d4af37]/35 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">
                    {item.registryNumber}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs ${toneForVisibility(item.protocolVisibility)}`}>
                    {item.protocolVisibility}
                  </span>
                </div>
                <div>
                  <Link href={`/advocacy-legal/icip-notices/${item.id}`} className="text-2xl font-semibold text-white transition hover:text-[#f3e3b0]">
                    {item.claimTitle}
                  </Link>
                  <p className="mt-2 text-sm text-[#f3e3b0]">{item.communityName}</p>
                </div>
                <p className="text-sm leading-7 text-gray-300">{item.publicSummary}</p>
                <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
                  <span className="rounded-full border border-white/10 px-2 py-1">{item.assetType}</span>
                  <span className="rounded-full border border-white/10 px-2 py-1">{item.rightsScope}</span>
                  <span className="rounded-full border border-white/10 px-2 py-1">{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
                {item.publicProtocolNotice ? (
                  <div className="rounded-2xl border border-[#d4af37]/15 bg-black/25 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Public protocol notice</p>
                    <p className="mt-2 text-sm leading-6 text-white">{item.publicProtocolNotice}</p>
                  </div>
                ) : null}
                <div className="flex justify-end">
                  <Link href={`/advocacy-legal/icip-notices/${item.id}`} className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
                    View public notice
                  </Link>
                </div>
              </div>
            </article>
          )) : (
            <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-8 text-center">
              <p className="text-lg font-semibold text-white">No public notices published yet</p>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                Approved summaries will appear here once claimants choose to publish a sanitized notice from their protected claim record.
              </p>
            </article>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Privacy Model</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Private record, optional public summary</h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-gray-300">
              <li>Full ICIP claim records remain protected.</li>
              <li>Only approved claims can publish a public summary.</li>
              <li>Publishing is optional and claimant-controlled.</li>
              <li>Evidence and legal review material never appear here.</li>
            </ul>
          </section>

          <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Next Step</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Need to register a cultural-rights claim?</h3>
            <p className="mt-3 text-sm leading-7 text-gray-300">
              Start in the protected ICIP Registry, attach evidence, and move the claim through legal review before deciding whether a public notice is appropriate.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/advocacy-legal/icip-registry" className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:brightness-110">
                Open ICIP Registry
              </Link>
              <Link href="/advocacy-legal" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
                Back to Pillar 9
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </AdvocacyFrame>
  );
}
