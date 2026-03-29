'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Layers3, MessageSquare, Package, ShieldCheck } from 'lucide-react';
import type { CreatorProfileRecord, ProfileBundle } from '@/app/profile/data/profileShowcase';
import { fetchProfileBundle, trackProfileAnalyticsEvent } from '@/app/lib/profileApi';
import { getBundleActionLabel, getOfferingImage } from '@/app/profile/lib/offeringMerchandising';

export default function BundleDetailClient({
  slug,
  bundleId,
  initialProfile,
  initialBundle
}: {
  slug: string;
  bundleId: string;
  initialProfile: CreatorProfileRecord;
  initialBundle: ProfileBundle | null;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [bundle, setBundle] = useState<ProfileBundle | null>(initialBundle);

  useEffect(() => {
    let cancelled = false;
    fetchProfileBundle(slug, bundleId)
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
        setBundle(data.bundle);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [bundleId, slug]);

  useEffect(() => {
    trackProfileAnalyticsEvent({
      profileSlug: slug,
      eventName: 'bundle_view',
      pageKind: 'bundle',
      bundleId
    });
  }, [bundleId, slug]);

  const items = useMemo(
    () => profile.offerings.filter((offering) => bundle?.itemIds.includes(offering.id)),
    [bundle?.itemIds, profile.offerings]
  );
  const bundleStats = useMemo(() => {
    const pillars = Array.from(new Set(items.map((item) => item.pillarLabel)));
    const includesBookable = items.some((item) => item.pillar === 'cultural-tourism' || item.pillar === 'freelancing');
    const includesEnroll = items.some((item) => item.pillar === 'courses');
    const includesShippable = items.some((item) => item.pillar === 'physical-items' || item.pillar === 'materials-tools' || item.pillar === 'land-food');
    return { pillars, includesBookable, includesEnroll, includesShippable };
  }, [items]);
  const collectorLead = useMemo(
    () => items.find((item) => item.ctaPreset === 'collect-now' || item.ctaMode === 'buy') || items.find((item) => item.pillar === 'digital-arts' || item.pillar === 'physical-items') || items[0],
    [items]
  );
  const learningLead = useMemo(
    () => items.find((item) => item.ctaPreset === 'enroll-now' || item.ctaMode === 'enroll') || items.find((item) => item.pillar === 'courses' || item.pillar === 'language-heritage') || items[0],
    [items]
  );
  const customLead = useMemo(
    () => items.find((item) => item.ctaPreset === 'request-quote' || item.ctaPreset === 'message-first' || item.ctaMode === 'quote' || item.ctaMode === 'message') || items[0],
    [items]
  );

  if (!bundle) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-[#101010] p-8 text-center">
        <p className="text-sm uppercase tracking-[0.22em] text-[#d4af37]">Bundle not found</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">That bundle is not available right now.</h1>
        <Link href={`/profile/${slug}`} className="mt-6 inline-flex rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black">
          Back to profile
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={`/profile/${slug}`} className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
        <ArrowLeft size={16} />
        Back to {profile.displayName}
      </Link>

      <section className="overflow-hidden rounded-[30px] border border-[#d4af37]/20 bg-[#101010] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <div className="relative h-72">
          <img src={bundle.cover} alt={bundle.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.84))]" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-black/40 px-3 py-1 text-xs text-[#f2d27f]">
              <Layers3 size={12} />
              Cross-pillar bundle
            </div>
            <h1 className="mt-3 text-4xl font-semibold text-white">{bundle.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#e8e0d2]">{bundle.summary}</p>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr,1.15fr]">
          <aside className="space-y-4">
            <div className="rounded-[24px] border border-[#d4af37]/20 bg-black/25 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Bundle Value</p>
              <p className="mt-3 text-3xl font-semibold text-white">{bundle.priceLabel}</p>
              <p className="mt-2 text-sm leading-6 text-gray-300">{bundle.savingsLabel}</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Why this bundle converts</p>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <Package size={16} className="mt-0.5 text-[#d4af37]" />
                  A guided path across this creator's most complementary offers.
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck size={16} className="mt-0.5 text-[#d4af37]" />
                  Designed to reduce decision fatigue for collectors, learners, and collaborators.
                </div>
              </div>
            </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/profile/${slug}`} className="inline-flex rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
                  View public profile
                </Link>
                <Link
                  href={customLead?.href || `/profile/${slug}`}
                  className="inline-flex rounded-full border border-[#d4af37]/20 px-5 py-2 text-sm text-[#d4af37] hover:border-[#d4af37]/45 hover:text-[#f4d370]"
                >
                  {getBundleActionLabel(customLead, 'bundle')}
                </Link>
                <Link
                  href={collectorLead?.href || `/profile/${slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
                >
                  <MessageSquare size={14} />
                  {getBundleActionLabel(collectorLead, 'item')}
                </Link>
              </div>
          </aside>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Best next action</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Use the bundle as one decision point</h2>
              <p className="mt-3 text-sm leading-7 text-gray-300">
                This bundle is designed to collapse discovery into one clear path. Start with a direct creator message, then move into the included items that fit your intent.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-200">
                {bundleStats.pillars.map((pillar) => (
                  <span key={pillar} className="rounded-full border border-white/10 px-3 py-1">{pillar}</span>
                ))}
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <ActionCallout
                  title="Collector path"
                  body="Open the art or object listings first if you want the most immediate purchase path."
                  ctaLabel={getBundleActionLabel(collectorLead, 'item')}
                  href={collectorLead?.href || `/profile/${slug}`}
                />
                <ActionCallout
                  title="Learning path"
                  body="Move into courses and guided experiences if you want a deeper cultural entry point."
                  ctaLabel={getBundleActionLabel(learningLead, 'item')}
                  href={learningLead?.href || `/profile/${slug}`}
                />
                <ActionCallout
                  title="Custom path"
                  body="Message the creator if you want the bundle adapted into a commission, booking, or wholesale package."
                  ctaLabel={getBundleActionLabel(customLead, 'bundle')}
                  href={customLead?.href || `/profile/${slug}`}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Included items</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{items.length} connected offers</h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20 transition-all hover:-translate-y-1 hover:border-[#d4af37]/30"
                >
                  <div className="h-40 overflow-hidden">
                    <img src={getOfferingImage(item)} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-[#d4af37]">{item.pillarLabel}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{item.blurb}</p>
                    <p className="mt-4 text-sm font-semibold text-white">{item.priceLabel}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function ActionCallout({ title, body, ctaLabel, href }: { title: string; body: string; ctaLabel: string; href: string }) {
  return (
    <Link href={href} className="rounded-[22px] border border-white/10 bg-black/25 p-4 transition-all hover:-translate-y-1 hover:border-[#d4af37]/30">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-gray-400">{body}</p>
      <span className="mt-4 inline-flex rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#d4af37]">{ctaLabel}</span>
    </Link>
  );
}
