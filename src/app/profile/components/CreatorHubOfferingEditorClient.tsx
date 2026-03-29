'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, LayoutPanelTop, Save, ShieldCheck, Sparkles } from 'lucide-react';
import type { CreatorProfileRecord, ProfileOffering } from '@/app/profile/data/profileShowcase';
import { updateProfileOffering } from '@/app/lib/profileApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import { getNativeCreatorEditorHref } from '@/app/profile/lib/creatorHubEditing';
import { applyLaunchWindowState, getOfferingCtaLabel, getOfferingImage, getOfferingLaunchBadge } from '@/app/profile/lib/offeringMerchandising';

const PILLAR_PLAYBOOK: Record<
  ProfileOffering['pillar'],
  { title: string; points: string[] }
> = {
  'digital-arts': {
    title: 'Digital release focus',
    points: ['Media, editions, licensing, and provenance still live in the native digital editor.', 'Use this hub editor for storefront copy, pricing language, and launch state.']
  },
  'physical-items': {
    title: 'Physical item focus',
    points: ['Stock, dimensions, shipping, and authenticity details still belong in the native physical editor.', 'Use this hub editor for the selling story, badge, and featured placement state.']
  },
  courses: {
    title: 'Course focus',
    points: ['Lessons, curriculum, files, and certification still live in the native course studio.', 'Use this hub editor for storefront framing, enrollment cues, and lead merchandising.']
  },
  freelancing: {
    title: 'Service focus',
    points: ['Scope, rate framing, and storefront positioning can be managed here first.', 'Use the native flow when you need deeper service structure or intake specifics.']
  },
  'cultural-tourism': {
    title: 'Experience focus',
    points: ['Dates, capacity, and booking windows still live in the tourism operator flow.', 'Use this hub editor for title, summary, urgency, and storefront state.']
  },
  'language-heritage': {
    title: 'Resource focus',
    points: ['Access controls and archive-specific permissions still belong in the native heritage flow.', 'Use this hub editor for public presentation and storefront routing.']
  },
  'land-food': {
    title: 'Producer focus',
    points: ['Harvest, quantity, and stewardship specifics still belong in the native producer flow.', 'Use this hub editor for the buyer-facing story and state.']
  },
  'advocacy-legal': {
    title: 'Advocacy focus',
    points: ['Program, intake, and service specifics still belong in the advocacy flow.', 'Use this hub editor for storefront positioning and trust-facing messaging.']
  },
  'materials-tools': {
    title: 'Supply focus',
    points: ['Bulk, condition, and sourcing specifics still belong in the native supply flow.', 'Use this hub editor for storefront language and availability state.']
  },
  seva: {
    title: 'Seva',
    points: ['Seva stays platform-governed and does not use the creator editor.']
  }
};

export default function CreatorHubOfferingEditorClient({
  profile,
  offering
}: {
  profile: CreatorProfileRecord;
  offering: ProfileOffering;
}) {
  const [draft, setDraft] = useState({
    title: offering.title,
    blurb: offering.blurb,
    priceLabel: offering.priceLabel,
    status: offering.status ?? 'Active',
    coverImage: offering.coverImage ?? offering.image,
    ctaMode: offering.ctaMode ?? 'view',
    ctaPreset: offering.ctaPreset ?? 'collect-now',
    merchandisingRank: offering.merchandisingRank ?? 0,
    galleryOrder: offering.galleryOrder ?? [],
    launchWindowStartsAt: offering.launchWindowStartsAt ?? '',
    launchWindowEndsAt: offering.launchWindowEndsAt ?? '',
    availabilityLabel: offering.availabilityLabel ?? 'Available now',
    availabilityTone: offering.availabilityTone ?? 'success',
    featured: offering.featured ?? false
  });
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft({
      title: offering.title,
      blurb: offering.blurb,
      priceLabel: offering.priceLabel,
      status: offering.status ?? 'Active',
      coverImage: offering.coverImage ?? offering.image,
      ctaMode: offering.ctaMode ?? 'view',
      ctaPreset: offering.ctaPreset ?? 'collect-now',
      merchandisingRank: offering.merchandisingRank ?? 0,
      galleryOrder: offering.galleryOrder ?? [],
      launchWindowStartsAt: offering.launchWindowStartsAt ?? '',
      launchWindowEndsAt: offering.launchWindowEndsAt ?? '',
      availabilityLabel: offering.availabilityLabel ?? 'Available now',
      availabilityTone: offering.availabilityTone ?? 'success',
      featured: offering.featured ?? false
    });
    setFeedback('');
  }, [offering]);

  const nativeEditorHref = useMemo(() => getNativeCreatorEditorHref(offering, profile.slug), [offering, profile.slug]);
  const playbook = PILLAR_PLAYBOOK[offering.pillar] ?? PILLAR_PLAYBOOK['digital-arts'];
  const previewOffering = useMemo(() => applyLaunchWindowState({ ...offering, ...draft }), [offering, draft]);

  async function handleSave() {
    try {
      setIsSaving(true);
      setFeedback('');
      await requireWalletAction('save creator hub listing changes');
      await updateProfileOffering({
        slug: profile.slug,
        offeringId: offering.id,
        ...draft
      });
      setFeedback('Saved in Creator Hub.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save listing changes.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/creator-hub"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Creator Hub
        </Link>
        <div className="flex flex-wrap gap-3">
          <Link
            href={offering.href}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
          >
            <LayoutPanelTop size={14} />
            Storefront preview
          </Link>
          <Link
            href={nativeEditorHref}
            className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 px-4 py-2 text-sm text-[#d4af37] hover:border-[#d4af37]/45 hover:text-[#f4d370]"
          >
            <ExternalLink size={14} />
            Open advanced editor
          </Link>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <article className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Canonical Creator Hub Editor</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{offering.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">
            This is the first-stop editor for storefront-facing changes. Deep pillar-specific structure still lives in the advanced editor.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <FieldInput label="Title" value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} />
            <FieldInput label="Price label" value={draft.priceLabel} onChange={(value) => setDraft((current) => ({ ...current, priceLabel: value }))} />
            <FieldInput label="Status" value={draft.status} onChange={(value) => setDraft((current) => ({ ...current, status: value }))} />
            <FieldSelect
              label="Storefront tone"
              value={draft.availabilityTone}
              onChange={(value) => setDraft((current) => ({ ...current, availabilityTone: value as typeof current.availabilityTone }))}
              options={[
                { value: 'success', label: 'Ready to buy' },
                { value: 'warning', label: 'Limited / urgent' },
                { value: 'default', label: 'Neutral' },
                { value: 'danger', label: 'Restricted / archived' }
              ]}
            />
          </div>

          <div className="mt-4">
            <FieldInput label="Storefront badge" value={draft.availabilityLabel} onChange={(value) => setDraft((current) => ({ ...current, availabilityLabel: value }))} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FieldInput label="Cover image URL" value={draft.coverImage} onChange={(value) => setDraft((current) => ({ ...current, coverImage: value }))} />
            <FieldSelect
              label="Primary CTA"
              value={draft.ctaMode}
              onChange={(value) => setDraft((current) => ({ ...current, ctaMode: value as typeof current.ctaMode }))}
              options={[
                { value: 'view', label: 'View detail' },
                { value: 'buy', label: 'Buy now' },
                { value: 'book', label: 'Book now' },
                { value: 'enroll', label: 'Enroll now' },
                { value: 'quote', label: 'Request quote' },
                { value: 'message', label: 'Message creator' }
              ]}
            />
            <FieldSelect
              label="Buyer-intent preset"
              value={draft.ctaPreset}
              onChange={(value) => setDraft((current) => ({ ...current, ctaPreset: value as typeof current.ctaPreset }))}
              options={[
                { value: 'collect-now', label: 'Collectors' },
                { value: 'book-now', label: 'Bookings' },
                { value: 'enroll-now', label: 'Enrollment' },
                { value: 'request-quote', label: 'Quotes' },
                { value: 'message-first', label: 'Conversation first' }
              ]}
            />
            <FieldInput
              label="Merchandising priority"
              value={String(draft.merchandisingRank)}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  merchandisingRank: Number.isFinite(Number(value)) ? Number(value) : 0
                }))
              }
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FieldInput
              label="Launch window start"
              type="datetime-local"
              value={draft.launchWindowStartsAt}
              onChange={(value) => setDraft((current) => ({ ...current, launchWindowStartsAt: value }))}
            />
            <FieldInput
              label="Launch window end"
              type="datetime-local"
              value={draft.launchWindowEndsAt}
              onChange={(value) => setDraft((current) => ({ ...current, launchWindowEndsAt: value }))}
            />
          </div>

          <div className="mt-4">
            <FieldInput
              label="Gallery order"
              value={draft.galleryOrder.join(', ')}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  galleryOrder: value.split(',').map((entry) => entry.trim()).filter(Boolean)
                }))
              }
            />
          </div>

          <div className="mt-4">
            <FieldTextArea label="Short storefront story" value={draft.blurb} onChange={(value) => setDraft((current) => ({ ...current, blurb: value }))} />
          </div>

          <button
            onClick={() => setDraft((current) => ({ ...current, featured: !current.featured }))}
            className={`mt-4 rounded-[22px] border p-4 text-left ${draft.featured ? 'border-[#d4af37]/35 bg-[#d4af37]/10' : 'border-white/10 bg-black/20'}`}
          >
            <p className="text-sm font-medium text-white">Pin this listing to the storefront</p>
            <p className="mt-2 text-xs text-gray-400">{draft.featured ? 'Pinned in the storefront lead zone.' : 'Not pinned in the storefront lead zone.'}</p>
          </button>

          {feedback && (
            <div className="mt-4 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">
              {feedback}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60"
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save in Creator Hub'}
            </button>
            <Link
              href={nativeEditorHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
            >
              <ExternalLink size={14} />
              Continue in advanced editor
            </Link>
          </div>
        </article>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#101010]">
            <div className="h-52">
              <img src={getOfferingImage(previewOffering)} alt={previewOffering.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">{previewOffering.pillarLabel}</p>
              <p className="mt-2 text-xl font-semibold text-white">{previewOffering.title}</p>
              <p className="mt-2 text-sm text-gray-400">{previewOffering.type}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">{previewOffering.status || 'Active'}</span>
                <span className="rounded-full border border-[#d4af37]/20 px-3 py-1 text-xs text-[#d4af37]">{previewOffering.priceLabel}</span>
                {previewOffering.availabilityLabel ? <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">{previewOffering.availabilityLabel}</span> : null}
                {getOfferingLaunchBadge(previewOffering) ? <span className="rounded-full border border-cyan-400/30 px-3 py-1 text-xs text-cyan-100">{getOfferingLaunchBadge(previewOffering)}</span> : null}
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">{getOfferingCtaLabel(previewOffering)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#101010] p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#d4af37]" />
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">{playbook.title}</p>
            </div>
            <div className="mt-4 space-y-3">
              {playbook.points.map((point) => (
                <div key={point} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-gray-300">
                  {point}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#101010] p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#d4af37]" />
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Why this route exists</p>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-gray-300">
              <p>Phase 3 makes Creator Hub the canonical first edit layer, even when a pillar still has its own deep editor.</p>
              <p>That means title, story, price framing, urgency, and storefront pinning stop being scattered across pillar-specific routes.</p>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
      />
    </label>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldTextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
      />
    </label>
  );
}
