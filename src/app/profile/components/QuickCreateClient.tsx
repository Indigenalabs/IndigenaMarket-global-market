'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, Briefcase, Languages, Scale, Sprout, Wrench } from 'lucide-react';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import { resolveCurrentCreatorProfileSlug } from '@/app/lib/accountAuthClient';
import { createQuickProfileDraft } from '@/app/lib/profileApi';
import VoiceInputButton from '@/app/components/VoiceInputButton';
import SimpleModeDock from '@/app/components/SimpleModeDock';

const PILLAR_CONFIG = {
  freelancing: {
    label: 'Freelance Service',
    icon: Briefcase,
    accent: '#d4af37',
    destination: '/freelancing',
    destinationLabel: 'Open Freelancing marketplace',
    fields: ['Service title', 'What you offer', 'Rate or pricing', 'Availability'] as const,
    presets: [
      { label: 'Consulting', icon: 'Guide', seed: ['Cultural consulting', 'I help with strategy and guidance.'] },
      { label: 'Translation', icon: 'Words', seed: ['Language translation', 'I translate and review language materials.'] },
      { label: 'Custom work', icon: 'Craft', seed: ['Custom project', 'I make custom work for clients.'] }
    ] as const
  },
  'language-heritage': {
    label: 'Language Resource',
    icon: Languages,
    accent: '#d4af37',
    destination: '/language-heritage/contributor-dashboard?focus=create&returnTo=/creator-hub',
    destinationLabel: 'Open contributor dashboard',
    fields: ['Resource title', 'Language', 'Access level', 'Why this matters'] as const,
    presets: [
      { label: 'Story', icon: 'Voice', seed: ['Community story', 'A story to help keep language and memory alive.'] },
      { label: 'Word list', icon: 'Words', seed: ['Word list', 'A simple learning resource for key words and phrases.'] },
      { label: 'Audio', icon: 'Listen', seed: ['Audio recording', 'A spoken resource for listening and practice.'] }
    ] as const
  },
  'land-food': {
    label: 'Land & Food Listing',
    icon: Sprout,
    accent: '#d4af37',
    destination: '/land-food/producer-dashboard?focus=create&returnTo=/creator-hub',
    destinationLabel: 'Open producer dashboard',
    fields: ['Product or project name', 'Origin or harvest area', 'Available quantity', 'Shipping or fulfillment note'] as const,
    presets: [
      { label: 'Seeds', icon: 'Seed', seed: ['Heirloom seeds', 'Seeds gathered and shared from local stewardship.'] },
      { label: 'Food', icon: 'Taste', seed: ['Traditional food', 'Food prepared or gathered with care.'] },
      { label: 'Stewardship', icon: 'Land', seed: ['Stewardship project', 'A land care offering or stewardship effort.'] }
    ] as const
  },
  'advocacy-legal': {
    label: 'Advocacy Service',
    icon: Scale,
    accent: '#d4af37',
    destination: '/advocacy-legal/dashboard/legal-professional?focus=create&returnTo=/creator-hub',
    destinationLabel: 'Open legal professional dashboard',
    fields: ['Service or campaign title', 'Practice area', 'Fee model', 'Urgency or intake note'] as const,
    presets: [
      { label: 'Legal help', icon: 'Rights', seed: ['Legal service', 'I help with legal support and case intake.'] },
      { label: 'Campaign', icon: 'Action', seed: ['Advocacy campaign', 'A public action or rights awareness effort.'] },
      { label: 'Consulting', icon: 'Guide', seed: ['Rights consulting', 'Guidance on policy, rights, and strategy.'] }
    ] as const
  },
  'materials-tools': {
    label: 'Materials & Tools Listing',
    icon: Wrench,
    accent: '#1d6b74',
    destination: '/materials-tools/supplier-dashboard?focus=create&returnTo=/creator-hub',
    destinationLabel: 'Open supplier dashboard',
    fields: ['Listing title', 'Material or tool type', 'Stock or lot size', 'Lead time or shipping note'] as const,
    presets: [
      { label: 'Material', icon: 'Supply', seed: ['Raw material listing', 'A supply listing for makers and studios.'] },
      { label: 'Tool', icon: 'Tool', seed: ['Tool listing', 'A studio tool or workshop tool for sale.'] },
      { label: 'Bulk lot', icon: 'Stack', seed: ['Bulk lot listing', 'A larger lot with grouped stock and lead time.'] }
    ] as const
  }
} as const;

function SimpleQuestionCard({
  step,
  title,
  detail,
  children
}: {
  step: string;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">{step}</p>
      <h3 className="mt-2 text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{detail}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

export default function QuickCreateClient({
  pillar,
  embedded = false,
  simpleMode = false
}: {
  pillar: string;
  embedded?: boolean;
  simpleMode?: boolean;
}) {
  const config = PILLAR_CONFIG[pillar as keyof typeof PILLAR_CONFIG];
  const storageKey = useMemo(() => `indigena_quick_create_${pillar}`, [pillar]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState('');
  const [createdHref, setCreatedHref] = useState('');
  const [creating, setCreating] = useState(false);

  if (!config) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-[#101010] p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-[#d4af37]">Creator Hub</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">This quick-create lane is not available.</h1>
        <Link href="/creator-hub" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black">
          <ArrowLeft size={14} />
          Back to simple home
        </Link>
      </section>
    );
  }

  const Icon = config.icon;
  const [field1, field2, field3, field4] = config.fields;
  const presets = config.presets;
  const canAdvanceToSecond = (values[field1] ?? '').trim().length > 1;
  const canAdvanceToThird = canAdvanceToSecond && (values[field2] ?? '').trim().length > 1;
  const canAdvanceToFourth = canAdvanceToThird && (values[field3] ?? '').trim().length > 0;

  const setFieldValue = (field: string, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const applyPreset = (seed: readonly string[]) => {
    setValues((current) => ({
      ...current,
      [field1]: current[field1] || seed[0] || '',
      [field2]: current[field2] || seed[1] || ''
    }));
  };

  return (
    <div className="space-y-6">
      {!embedded && (
        <Link href="/creator-hub" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
          <ArrowLeft size={16} />
          {simpleMode ? 'Back to simple home' : 'Back to Creator Hub'}
        </Link>
      )}

      <section className={`rounded-[30px] border border-white/10 bg-[#101010] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] ${embedded ? 'shadow-none' : ''}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4" style={{ color: config.accent }}>
              <Icon size={26} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">{simpleMode ? 'Start here' : 'Quick create'}</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{config.label}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-300">
                {simpleMode
                  ? 'Start here.'
                  : 'Start with a simple draft here, then move into the full pillar workflow when you\'re ready. This keeps the Creator Hub usable even when a pillar uses a dashboard-first publishing model.'}
              </p>
            </div>
          </div>
          <Link href={config.destination} className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">
            {simpleMode ? 'Open full page' : config.destinationLabel}
          </Link>
        </div>

        {simpleMode ? (
          <div className="mt-6 space-y-4">
            <SimpleQuestionCard step="Pick one" title="What fits best?" detail="Tap the closest match to start faster.">
              <div className="grid gap-3 md:grid-cols-3">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset.seed)}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition-all hover:border-[#d4af37]/35 hover:bg-[#d4af37]/10"
                  >
                    <div className="text-sm text-[#d4af37]">{preset.icon}</div>
                    <p className="mt-2 text-sm font-semibold text-white">{preset.label}</p>
                  </button>
                ))}
              </div>
            </SimpleQuestionCard>

            <SimpleQuestionCard step="Question 1" title={field1} detail="Start here.">
              <input
                value={values[field1] ?? ''}
                onChange={(event) => setFieldValue(field1, event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
              />
              <VoiceInputButton onTranscript={(text) => setFieldValue(field1, text)} />
            </SimpleQuestionCard>

            {canAdvanceToSecond ? (
              <SimpleQuestionCard step="Question 2" title={field2} detail="Explain it simply.">
                <textarea
                  value={values[field2] ?? ''}
                  onChange={(event) => setFieldValue(field2, event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
                />
                <VoiceInputButton onTranscript={(text) => setFieldValue(field2, text)} />
              </SimpleQuestionCard>
            ) : null}

            {canAdvanceToThird ? (
              <SimpleQuestionCard step="Question 3" title={field3} detail="Add the key detail.">
                <input
                  value={values[field3] ?? ''}
                  onChange={(event) => setFieldValue(field3, event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
                />
                <VoiceInputButton onTranscript={(text) => setFieldValue(field3, text)} />
              </SimpleQuestionCard>
            ) : null}

            {canAdvanceToFourth ? (
              <SimpleQuestionCard step="Question 4" title={field4} detail="Add the last note.">
                <textarea
                  value={values[field4] ?? ''}
                  onChange={(event) => setFieldValue(field4, event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
                />
                <VoiceInputButton onTranscript={(text) => setFieldValue(field4, text)} />
              </SimpleQuestionCard>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <label key={field} className="grid gap-2 text-sm text-gray-300">
                {field}
                <input
                  value={values[field] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
                />
              </label>
            ))}
          </div>
        )}

        {saved ? (
          <div className="mt-5 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3ddb1]">
            {saved}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              window.localStorage.setItem(storageKey, JSON.stringify(values));
              setSaved(simpleMode ? 'Saved on this device.' : 'Quick draft saved in this browser.');
            }}
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
          >
            {simpleMode ? 'Save here' : 'Save local draft'}
          </button>
          <button
            onClick={async () => {
              try {
                setCreating(true);
                await requireWalletAction(`create a ${config.label.toLowerCase()} draft`);
                const profileSlug = await resolveCurrentCreatorProfileSlug();
                if (!profileSlug) {
                  throw new Error('Sign in to continue.');
                }
                const result = await createQuickProfileDraft({
                  slug: profileSlug,
                  pillar: pillar as keyof typeof PILLAR_CONFIG,
                  fields: values
                });
                setCreatedHref(result.href);
                setSaved(
                  simpleMode
                    ? `Saved. You can keep working on your ${config.label.toLowerCase()} on the full page now.`
                    : `Draft created in the live ${config.label} workflow. You can continue refining it inside the pillar dashboard now.`
                );
              } catch (error) {
                setSaved(error instanceof Error ? error.message : 'Unable to create live draft right now.');
              } finally {
                setCreating(false);
              }
            }}
            className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60"
            disabled={creating}
          >
            {creating ? 'Saving...' : simpleMode ? 'Save and keep going' : 'Create live draft'}
          </button>
          <Link href={createdHref || config.destination} className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">
            {simpleMode ? 'Keep going' : 'Continue in pillar workflow'}
          </Link>
          {simpleMode && canAdvanceToFourth ? (
            <Link href={createdHref || config.destination} className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-5 py-2 text-sm font-semibold text-[#f3ddb1] hover:bg-[#d4af37]/20">
              Next: full page
            </Link>
          ) : null}
        </div>
      </section>
      {simpleMode ? (
        <SimpleModeDock
          tips={['Say it out loud if typing is hard.', 'Fill one box, then save and keep going.', 'Open the full page later only if you need more tools.']}
        />
      ) : null}
    </div>
  );
}
