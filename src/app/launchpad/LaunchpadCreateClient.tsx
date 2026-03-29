'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ImagePlus, LayoutTemplate, ShieldCheck, Sparkles, Target, UploadCloud } from 'lucide-react';
import type { LaunchpadCampaignStatus, LaunchpadCategory, LaunchpadSupportTier } from '@/app/lib/launchpad';
import { launchpadCategoryMeta } from '@/app/lib/launchpad';
import { fetchPlatformAccount } from '@/app/lib/platformAccountsApi';
import type { PlatformAccountRecord } from '@/app/lib/platformAccounts';

const categoryOrder: LaunchpadCategory[] = ['artist', 'athlete', 'scholarship', 'entrepreneurship', 'business-starter', 'travel', 'emergency', 'community', 'digital-champion'];

type TierField = 'label' | 'amount' | 'description';

const statusMeta: Record<LaunchpadCampaignStatus, { label: string; detail: string; accent: string }> = {
  draft: {
    label: 'Draft',
    detail: 'Saved privately so the organizer can keep shaping the story, photos, and reward tiers.',
    accent: 'border-white/10 bg-black/25 text-white/72'
  },
  pending_review: {
    label: 'Pending review',
    detail: 'Saved as a near-final campaign that is waiting for review before it enters the public Launchpad.',
    accent: 'border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f4d370]'
  },
  published: {
    label: 'Published',
    detail: 'Live on the public Launchpad and ready to collect one-time or monthly backing immediately.',
    accent: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
  }
};

function linesToArray(value: string) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function slugLine(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function defaultTiers(category: LaunchpadCategory) {
  const badge = launchpadCategoryMeta[category].label;
  const oneTime = [25, 75, 180, 400].map((amount, index) => ({
    id: `one-time-${index + 1}`,
    label: ['Spark', 'Builder', 'Patron', 'Cornerstone'][index],
    amount,
    badge,
    cadence: 'one-time' as const,
    description: [
      'Gets the campaign moving with an early visible pledge.',
      'Carries a meaningful slice of the core budget.',
      'Signals stronger trust and helps close the main funding gap.',
      'A major contribution that changes the campaign pace.'
    ][index]
  }));
  const monthly = [12, 35, 85, 180].map((amount, index) => ({
    id: `monthly-${index + 1}`,
    label: ['Seed', 'Circle', 'Steward', 'Anchor'][index],
    amount,
    badge,
    cadence: 'monthly' as const,
    description: [
      'Keeps the campaign active month over month.',
      'Supports recurring costs without becoming a one-off gesture.',
      'Creates reliable monthly support with real leverage.',
      'A serious recurring commitment for long-running work.'
    ][index]
  }));
  return { oneTime, monthly };
}

async function readFileAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.readAsDataURL(file);
  });
}

function PreviewCard({ label, image, fallbackLabel }: { label: string; image: string; fallbackLabel: string }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/25">
      <div className="relative h-44 overflow-hidden">
        <img src={image} alt={label} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.74))]" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">{fallbackLabel}</p>
          <p className="mt-2 text-lg font-semibold text-white">{label}</p>
        </div>
      </div>
    </div>
  );
}

function inferLaunchpadCategory(account: PlatformAccountRecord): LaunchpadCategory {
  switch (account.accountType) {
    case 'artist':
      return 'artist';
    case 'digital_champion':
      return 'digital-champion';
    case 'community':
    case 'tribe':
    case 'collective':
      return 'community';
    default:
      return 'community';
  }
}

function inferBeneficiaryRole(account: PlatformAccountRecord, mode: string) {
  if (account.accountType === 'artist') return 'Solo creator campaign';
  if (account.accountType === 'digital_champion') return 'Program support campaign';
  return mode === 'nation' ? 'Nation storefront campaign' : 'Community-backed campaign';
}

function inferLaunchpadTitle(account: PlatformAccountRecord, category: LaunchpadCategory) {
  switch (category) {
    case 'community':
      return `Back ${account.displayName}'s next treasury-backed goal.`;
    case 'digital-champion':
      return `Fund ${account.displayName}'s next regional support round.`;
    default:
      return `Back ${account.displayName}'s next launch.`;
  }
}

export default function LaunchpadCreateClient({
  initialContext
}: {
  initialContext?: {
    accountSlug?: string;
    mode?: string;
  };
}) {
  const router = useRouter();
  const [category, setCategory] = useState<LaunchpadCategory>('artist');
  const [title, setTitle] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryRole, setBeneficiaryRole] = useState('');
  const [location, setLocation] = useState('');
  const [goalAmount, setGoalAmount] = useState(5000);
  const [urgencyLabel, setUrgencyLabel] = useState('Funding window open now');
  const [summary, setSummary] = useState('');
  const [story, setStory] = useState('');
  const [tags, setTags] = useState('');
  const [useOfFunds, setUseOfFunds] = useState('');
  const [impactPoints, setImpactPoints] = useState('');
  const [milestoneOneLabel, setMilestoneOneLabel] = useState('Base campaign goal');
  const [milestoneOneAmount, setMilestoneOneAmount] = useState(2500);
  const [milestoneOneDetail, setMilestoneOneDetail] = useState('Covers the minimum launch need.');
  const [milestoneTwoLabel, setMilestoneTwoLabel] = useState('Full target');
  const [milestoneTwoAmount, setMilestoneTwoAmount] = useState(5000);
  const [milestoneTwoDetail, setMilestoneTwoDetail] = useState('Funds the full campaign plan.');
  const [updateTitle, setUpdateTitle] = useState('Campaign launched');
  const [updateDetail, setUpdateDetail] = useState('The page is now live and ready for backers.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState(launchpadCategoryMeta.artist.image);
  const [beneficiaryImage, setBeneficiaryImage] = useState(launchpadCategoryMeta.artist.image);
  const [oneTimeTiers, setOneTimeTiers] = useState<LaunchpadSupportTier[]>(() => defaultTiers('artist').oneTime);
  const [monthlyTiers, setMonthlyTiers] = useState<LaunchpadSupportTier[]>(() => defaultTiers('artist').monthly);
  const [activeStatus, setActiveStatus] = useState<LaunchpadCampaignStatus>('published');
  const [prefillLabel, setPrefillLabel] = useState('');
  const [linkedAccountSlug, setLinkedAccountSlug] = useState('');
  const [linkedEntityHref, setLinkedEntityHref] = useState('');

  const selectedMeta = launchpadCategoryMeta[category];

  useEffect(() => {
    const nextTiers = defaultTiers(category);
    setOneTimeTiers(nextTiers.oneTime);
    setMonthlyTiers(nextTiers.monthly);
    if (!linkedAccountSlug) {
      setCoverImage(selectedMeta.image);
      setBeneficiaryImage(selectedMeta.image);
    }
  }, [category, linkedAccountSlug, selectedMeta.image]);

  useEffect(() => {
    const accountSlug = initialContext?.accountSlug?.trim();
    if (!accountSlug) return;

    let cancelled = false;

    fetchPlatformAccount(accountSlug)
      .then((record) => {
        if (cancelled) return;
        const account = record.account;
        const mode = initialContext?.mode === 'nation' ? 'nation' : 'solo';
        const nextCategory = inferLaunchpadCategory(account);
        const entityHref =
          account.accountType === 'artist'
            ? `/profile/${account.slug}`
            : account.accountType === 'digital_champion'
              ? '/creator-hub'
              : `/communities/${account.slug}`;

        setCategory(nextCategory);
        setTitle(inferLaunchpadTitle(account, nextCategory));
        setBeneficiaryName(account.displayName);
        setBeneficiaryRole(inferBeneficiaryRole(account, mode));
        setLocation([account.location, account.nation].filter(Boolean).join(' | '));
        setUrgencyLabel(mode === 'nation' ? 'Community campaign window open now' : 'Public backing window open now');
        setSummary(account.storefrontHeadline || account.description);
        setStory(account.story || account.description);
        setTags(
          [mode === 'nation' ? 'Nation storefront' : 'Solo storefront', account.nation, account.location]
            .filter(Boolean)
            .join('\n')
        );
        setUseOfFunds(
          mode === 'nation'
            ? 'Treasury-backed delivery\nRepresentative coordination\nCommunity-facing launch costs'
            : 'Production costs\nTravel or launch support\nDirect creator capacity'
        );
        setImpactPoints(
          mode === 'nation'
            ? 'Supports the nation storefront directly\nRoutes through treasury and split logic\nBuilds collective selling capacity'
            : 'Supports the solo storefront directly\nKeeps launch momentum visible\nStrengthens independent creator capacity'
        );
        setCoverImage(account.banner || launchpadCategoryMeta[nextCategory].image);
        setBeneficiaryImage(account.avatar || launchpadCategoryMeta[nextCategory].image);
        setLinkedAccountSlug(account.slug);
        setLinkedEntityHref(entityHref);
        setPrefillLabel(
          mode === 'nation'
            ? `Prefilled from ${account.displayName} nation storefront mode.`
            : `Prefilled from ${account.displayName} solo storefront mode.`
        );
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Unable to load account context.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialContext?.accountSlug, initialContext?.mode]);

  const previewTitle = title.trim() || `${selectedMeta.label} campaign`;
  const previewBeneficiary = beneficiaryName.trim() || 'Beneficiary name';
  const previewRole = beneficiaryRole.trim() || 'Role or venture';
  const previewStatus = statusMeta[activeStatus];
  const suggestedSlug = useMemo(() => slugLine(`${beneficiaryName}-${title}`) || 'campaign-slug-preview', [beneficiaryName, title]);

  const updateTier = (
    cadence: 'one-time' | 'monthly',
    index: number,
    field: TierField,
    value: string
  ) => {
    const setter = cadence === 'one-time' ? setOneTimeTiers : setMonthlyTiers;
    setter((prev) => prev.map((tier, tierIndex) => {
      if (tierIndex !== index) return tier;
      if (field === 'amount') {
        return { ...tier, amount: Number(value || 0) };
      }
      return { ...tier, [field]: value };
    }));
  };

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'beneficiary') => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (target === 'cover') setCoverImage(dataUrl);
      else setBeneficiaryImage(dataUrl);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to prepare image preview.');
    } finally {
      event.target.value = '';
    }
  };

  const submit = async (status: LaunchpadCampaignStatus) => {
    setSubmitting(true);
    setError('');
    setActiveStatus(status);
    try {
      const response = await fetch('/api/launchpad/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          status,
          title,
          beneficiaryName,
          beneficiaryRole,
          location,
          goalAmount,
          urgencyLabel,
          summary,
          story,
          image: coverImage,
          beneficiaryImage,
          linkedAccountSlug,
          linkedEntityHref,
          tags: linesToArray(tags),
          useOfFunds: linesToArray(useOfFunds),
          impactPoints: linesToArray(impactPoints),
          supportTiers: {
            oneTime: oneTimeTiers,
            monthly: monthlyTiers
          },
          milestonePlan: [
            { label: milestoneOneLabel, amount: milestoneOneAmount, detail: milestoneOneDetail },
            { label: milestoneTwoLabel, amount: milestoneTwoAmount, detail: milestoneTwoDetail }
          ],
          campaignUpdates: [{ title: updateTitle, detail: updateDetail, postedLabel: 'Posted today' }]
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Unable to create Launchpad campaign.');
      router.push(payload.redirectUrl || '/launchpad');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create Launchpad campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[34px] border border-[#d4af37]/15 bg-[linear-gradient(135deg,rgba(220,20,60,0.16),rgba(0,0,0,0.72),rgba(212,175,55,0.12))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
              <Sparkles size={13} />
              Launchpad builder
            </div>
            <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Build a fundraising page that looks worth backing.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74">
              This flow now supports real campaign states, uploaded visuals, editable backer tiers, and a publish path that matches the public Launchpad experience.
            </p>
            {prefillLabel ? (
              <div className="mt-5 inline-flex rounded-full border border-[#d4af37]/22 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f3d780]">
                {prefillLabel}
              </div>
            ) : null}
          </div>
          <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Status target</p>
                <p className="mt-2 text-xl font-semibold text-white">{previewStatus.label}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${previewStatus.accent}`}>{previewStatus.label}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/66">{previewStatus.detail}</p>
            <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">Preview slug</p>
              <p className="mt-2 font-mono text-sm text-white/74">/launchpad/{suggestedSlug}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <aside className="space-y-4 rounded-[28px] border border-white/10 bg-[#101010] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Campaign lanes</p>
          <div className="grid gap-3">
            {categoryOrder.map((entry) => {
              const meta = launchpadCategoryMeta[entry];
              return (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setCategory(entry)}
                  className={`overflow-hidden rounded-[22px] border text-left transition ${category === entry ? 'border-[#d4af37]/45 bg-[#d4af37]/10' : 'border-white/10 bg-black/20 hover:border-[#d4af37]/25'}`}
                >
                  <div className="grid grid-cols-[84px,1fr]">
                    <img src={meta.image} alt={meta.label} className="h-full w-full object-cover" />
                    <div className="p-4">
                      <p className="font-medium text-white">{meta.label}</p>
                      <p className="mt-1 text-sm leading-6 text-white/62">{meta.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="space-y-5 rounded-[28px] border border-white/10 bg-[#101010] p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-white/80">
              Campaign title
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </label>
            <label className="grid gap-2 text-sm text-white/80">
              Goal amount
              <input type="number" min={500} value={goalAmount} onChange={(event) => setGoalAmount(Number(event.target.value || 0))} className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </label>
            <label className="grid gap-2 text-sm text-white/80">
              Beneficiary name
              <input value={beneficiaryName} onChange={(event) => setBeneficiaryName(event.target.value)} className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </label>
            <label className="grid gap-2 text-sm text-white/80">
              Beneficiary role
              <input value={beneficiaryRole} onChange={(event) => setBeneficiaryRole(event.target.value)} className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </label>
            <label className="grid gap-2 text-sm text-white/80">
              Location
              <input value={location} onChange={(event) => setLocation(event.target.value)} className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </label>
            <label className="grid gap-2 text-sm text-white/80">
              Urgency label
              <input value={urgencyLabel} onChange={(event) => setUrgencyLabel(event.target.value)} className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">Cover image</p>
                  <p className="mt-1 text-xs text-white/54">Hero image shown on the Launchpad card and campaign page.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1.5 text-xs text-[#f4d370] hover:border-[#d4af37]/40">
                  <UploadCloud size={13} />
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageFile(event, 'cover')} />
                </label>
              </div>
              <PreviewCard label={previewTitle} image={coverImage} fallbackLabel="Campaign cover" />
            </div>
            <div className="space-y-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">Beneficiary image</p>
                  <p className="mt-1 text-xs text-white/54">Used on campaign cards, trust panels, and the checkout side.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1.5 text-xs text-[#f4d370] hover:border-[#d4af37]/40">
                  <ImagePlus size={13} />
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageFile(event, 'beneficiary')} />
                </label>
              </div>
              <PreviewCard label={previewBeneficiary} image={beneficiaryImage} fallbackLabel={previewRole} />
            </div>
          </div>

          <label className="grid gap-2 text-sm text-white/80">
            Summary
            <textarea rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            Story
            <textarea rows={6} value={story} onChange={(event) => setStory(event.target.value)} className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm text-white/80">
              Tags
              <textarea rows={5} value={tags} onChange={(event) => setTags(event.target.value)} placeholder="one per line" className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </label>
            <label className="grid gap-2 text-sm text-white/80">
              Use of funds
              <textarea rows={5} value={useOfFunds} onChange={(event) => setUseOfFunds(event.target.value)} placeholder="one per line" className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </label>
            <label className="grid gap-2 text-sm text-white/80">
              Proof / traction
              <textarea rows={5} value={impactPoints} onChange={(event) => setImpactPoints(event.target.value)} placeholder="one per line" className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Milestone one</p>
              <input value={milestoneOneLabel} onChange={(event) => setMilestoneOneLabel(event.target.value)} className="rounded-[16px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
              <input type="number" min={100} value={milestoneOneAmount} onChange={(event) => setMilestoneOneAmount(Number(event.target.value || 0))} className="rounded-[16px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
              <textarea rows={3} value={milestoneOneDetail} onChange={(event) => setMilestoneOneDetail(event.target.value)} className="rounded-[16px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </div>
            <div className="space-y-3 rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Milestone two</p>
              <input value={milestoneTwoLabel} onChange={(event) => setMilestoneTwoLabel(event.target.value)} className="rounded-[16px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
              <input type="number" min={100} value={milestoneTwoAmount} onChange={(event) => setMilestoneTwoAmount(Number(event.target.value || 0))} className="rounded-[16px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
              <textarea rows={3} value={milestoneTwoDetail} onChange={(event) => setMilestoneTwoDetail(event.target.value)} className="rounded-[16px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {([
              { key: 'one-time' as const, label: 'One-time tiers', tiers: oneTimeTiers },
              { key: 'monthly' as const, label: 'Monthly tiers', tiers: monthlyTiers }
            ]).map((group) => (
              <div key={group.key} className="space-y-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-[#d4af37]">
                  <LayoutTemplate size={15} />
                  <p className="text-xs uppercase tracking-[0.2em]">{group.label}</p>
                </div>
                <div className="space-y-3">
                  {group.tiers.map((tier, index) => (
                    <div key={tier.id} className="rounded-[18px] border border-white/10 bg-black/20 p-3">
                      <div className="grid gap-3 md:grid-cols-[0.9fr,0.5fr]">
                        <input value={tier.label} onChange={(event) => updateTier(group.key, index, 'label', event.target.value)} className="rounded-[14px] border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]" />
                        <input type="number" min={1} value={tier.amount} onChange={(event) => updateTier(group.key, index, 'amount', event.target.value)} className="rounded-[14px] border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]" />
                      </div>
                      <textarea rows={2} value={tier.description} onChange={(event) => updateTier(group.key, index, 'description', event.target.value)} className="mt-3 w-full rounded-[14px] border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[#d4af37]">
              <ShieldCheck size={15} />
              <p className="text-xs uppercase tracking-[0.2em]">First update</p>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[0.9fr,1.1fr]">
              <input value={updateTitle} onChange={(event) => setUpdateTitle(event.target.value)} className="rounded-[16px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
              <input value={updateDetail} onChange={(event) => setUpdateDetail(event.target.value)} className="rounded-[16px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]" />
            </div>
          </div>

          {error ? <p className="text-sm text-[#ff9d84]">{error}</p> : null}

          <div className="rounded-[24px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(212,175,55,0.10),rgba(0,0,0,0.22))] p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">Launch path</p>
            <p className="mt-2 text-sm leading-7 text-white/70">
              Save a private draft, send it into review, or publish immediately. Published campaigns appear on the public Launchpad. Draft and review campaigns remain accessible by direct link only.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => void submit('draft')} disabled={submitting} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2.5 text-sm text-white hover:border-[#d4af37]/30 disabled:opacity-60">
                <LayoutTemplate size={14} />
                {submitting && activeStatus === 'draft' ? 'Saving...' : 'Save draft'}
              </button>
              <button type="button" onClick={() => void submit('pending_review')} disabled={submitting} className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/24 bg-[#d4af37]/10 px-4 py-2.5 text-sm text-[#f4d370] hover:border-[#d4af37]/40 disabled:opacity-60">
                <ShieldCheck size={14} />
                {submitting && activeStatus === 'pending_review' ? 'Submitting...' : 'Submit for review'}
              </button>
              <button type="button" onClick={() => void submit('published')} disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60">
                <Target size={15} />
                {submitting && activeStatus === 'published' ? 'Publishing...' : 'Publish now'}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
