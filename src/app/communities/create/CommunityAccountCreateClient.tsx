'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPlatformAccountApi } from '@/app/lib/platformAccountsApi';
import { fetchAccountSessionMe } from '@/app/lib/accountAuthClient';

export default function CommunityAccountCreateClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: '',
    slug: '',
    accountType: 'community',
    nation: '',
    location: '',
    storefrontHeadline: '',
    description: '',
    story: '',
    payoutWallet: '',
    authorityProof: '',
    communityReferences: '',
    actorDisplayName: ''
  });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [identityLabel, setIdentityLabel] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchAccountSessionMe()
      .then((account) => {
        if (!account || cancelled) return;
        setIdentityLabel(account.displayName || account.email || '');
        setForm((state) => ({
          ...state,
          payoutWallet: state.payoutWallet || account.walletAddress || '',
          actorDisplayName: state.actorDisplayName || account.displayName || account.email || ''
        }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback('');
    try {
      const result = await createPlatformAccountApi({
        slug: form.slug,
        displayName: form.displayName,
        description: form.description,
        accountType: form.accountType as any,
        nation: form.nation,
        location: form.location,
        storefrontHeadline: form.storefrontHeadline,
        story: form.story,
        payoutWallet: form.payoutWallet,
        authorityProof: form.authorityProof,
        communityReferences: form.communityReferences.split('\n').map((entry) => entry.trim()).filter(Boolean),
        actorDisplayName: form.actorDisplayName
      });
      router.push(`/communities/${result.account.slug}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to create community page.');
    } finally {
      setSubmitting(false);
    }
  }

  function updateDisplayName(value: string) {
    const safeName = value;
    setForm((state) => {
      const nextSlug = state.slug.trim()
        ? state.slug
        : safeName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '-');
      return { ...state, displayName: safeName, slug: nextSlug };
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-[28px] border border-white/10 bg-[#111111] p-6 text-white">
      <div className="rounded-[22px] border border-[#d4af37]/20 bg-[#d4af37]/10 p-4 text-sm text-[#f1dec0]">
        {identityLabel
          ? `You are applying as ${identityLabel}. This account will become the first representative on the new community storefront.`
          : 'Sign in first if you want this page linked to your managed wallet and creator identity automatically.'}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-gray-300">Community name</span>
          <input value={form.displayName} onChange={(e) => updateDisplayName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" required />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-gray-300">Slug</span>
          <input value={form.slug} onChange={(e) => setForm((state) => ({ ...state, slug: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" placeholder="riverstone-arts-council" required />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-gray-300">Account type</span>
          <select value={form.accountType} onChange={(e) => setForm((state) => ({ ...state, accountType: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none">
            <option value="community">Community</option>
            <option value="tribe">Tribe</option>
            <option value="collective">Collective</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-gray-300">Nation</span>
          <input value={form.nation} onChange={(e) => setForm((state) => ({ ...state, nation: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-gray-300">Location</span>
          <input value={form.location} onChange={(e) => setForm((state) => ({ ...state, location: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-gray-300">Treasury wallet</span>
          <input value={form.payoutWallet} onChange={(e) => setForm((state) => ({ ...state, payoutWallet: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" placeholder="xrpl:rCommunityTreasury" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-gray-300">Lead representative name</span>
          <input value={form.actorDisplayName} onChange={(e) => setForm((state) => ({ ...state, actorDisplayName: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" placeholder="Representative or coordinator name" />
        </label>
      </div>

      <label className="block space-y-2 text-sm">
        <span className="text-gray-300">Storefront headline</span>
        <input value={form.storefrontHeadline} onChange={(e) => setForm((state) => ({ ...state, storefrontHeadline: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="text-gray-300">Description</span>
        <textarea value={form.description} onChange={(e) => setForm((state) => ({ ...state, description: e.target.value }))} className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" required />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="text-gray-300">Community story</span>
        <textarea value={form.story} onChange={(e) => setForm((state) => ({ ...state, story: e.target.value }))} className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="text-gray-300">Authority proof summary</span>
        <textarea value={form.authorityProof} onChange={(e) => setForm((state) => ({ ...state, authorityProof: e.target.value }))} className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="text-gray-300">Community references</span>
        <textarea value={form.communityReferences} onChange={(e) => setForm((state) => ({ ...state, communityReferences: e.target.value }))} className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none" placeholder="One reference per line" />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={submitting} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black disabled:opacity-60">
          {submitting ? 'Creating page...' : 'Create community page'}
        </button>
        <p className="text-sm text-gray-400">Submitting creates the page and opens a pending verification record for governance review.</p>
      </div>
      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </form>
  );
}
