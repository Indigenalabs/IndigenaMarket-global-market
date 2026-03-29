'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, ShieldAlert, XCircle } from 'lucide-react';
import type { MarketingCampaignRun } from '@/app/profile/data/marketingInventory';
import { fetchMarketingReviewQueue, updateMarketingCampaign } from '@/app/lib/profileApi';
import {
  PlacementPill,
  PlacementSectionHeader,
  placementHighlightedSurfaceCardClass,
  placementSecondaryButtonClass,
  placementStatusPillClass,
  placementSurfaceCardClass
} from '@/app/components/placements/PremiumPlacement';

export default function MarketingReviewClient() {
  const [campaigns, setCampaigns] = useState<MarketingCampaignRun[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchMarketingReviewQueue()
      .then((data) => {
        if (cancelled) return;
        setCampaigns(data.campaigns);
        if (data.campaigns[0]) {
          setSelectedId(data.campaigns[0].id);
          setReviewNotes(data.campaigns[0].reviewNotes || '');
        }
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load review queue.'));
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedId) ?? campaigns[0] ?? null;

  useEffect(() => {
    if (selectedCampaign) setReviewNotes(selectedCampaign.reviewNotes || '');
  }, [selectedCampaign]);

  async function handleAction(action: 'approve-creative' | 'request-creative-changes' | 'reject-campaign') {
    if (!selectedCampaign) return;
    try {
      setIsSubmitting(true);
      setFeedback('');
      const result = await updateMarketingCampaign({
        campaignId: selectedCampaign.id,
        action,
        reviewNotes
      });
      setCampaigns((current) => current.filter((campaign) => campaign.id !== result.campaign.id));
      setSelectedId('');
      setFeedback(
        action === 'approve-creative'
          ? 'Campaign approved.'
          : action === 'request-creative-changes'
            ? 'Changes requested from creator.'
            : 'Campaign rejected.'
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to update review decision.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
      <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-5">
        <PlacementSectionHeader
          icon={ShieldAlert}
          title="Marketing Review Queue"
          description="Approve sponsored campaigns before they go live on hero, sticky, and spotlight placements."
          meta="Admin review"
        />
        <div className="mt-5 space-y-3">
          {campaigns.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() => setSelectedId(campaign.id)}
              className={`w-full text-left ${selectedCampaign?.id === campaign.id ? placementHighlightedSurfaceCardClass : placementSurfaceCardClass} ${selectedCampaign?.id === campaign.id ? '' : 'hover:border-[#d4af37]/25'}`}
            >
              <p className="text-sm font-medium text-white">{campaign.offerTitle}</p>
              <p className="mt-1 text-xs text-gray-400">{campaign.placementTitle}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-300">
                {campaign.paymentStatus ? <span className={placementStatusPillClass}>Payment: {campaign.paymentStatus}</span> : null}
                {campaign.creativeStatus ? <span className={placementStatusPillClass}>Creative: {campaign.creativeStatus}</span> : null}
              </div>
            </button>
          ))}
          {campaigns.length === 0 ? <p className="text-sm text-gray-400">No campaigns are waiting for review.</p> : null}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        {selectedCampaign ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedCampaign.offerTitle}</h2>
                <p className="mt-1 text-sm text-gray-400">{selectedCampaign.placementTitle}</p>
              </div>
              <PlacementPill>{selectedCampaign.flight}</PlacementPill>
            </div>

            <div className={`mt-5 ${placementSurfaceCardClass}`}>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Placement preview</p>
              <p className="mt-3 text-lg font-medium text-white">{selectedCampaign.creative?.headline || selectedCampaign.offerTitle}</p>
              <p className="mt-2 text-sm leading-7 text-gray-300">{selectedCampaign.creative?.subheadline || selectedCampaign.result}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-300">
                <span className={placementStatusPillClass}>Surface: {selectedCampaign.placementTitle}</span>
                {selectedCampaign.paymentStatus ? <span className={placementStatusPillClass}>Payment: {selectedCampaign.paymentStatus}</span> : null}
                {selectedCampaign.creativeStatus ? <span className={placementStatusPillClass}>Creative: {selectedCampaign.creativeStatus}</span> : null}
                {selectedCampaign.creative?.cta ? <span className={placementStatusPillClass}>CTA: {selectedCampaign.creative.cta}</span> : null}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs uppercase tracking-[0.18em] text-gray-500">Review notes</label>
              <textarea
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/40"
                placeholder="Add approval notes or requested creative changes."
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => handleAction('approve-creative')} disabled={isSubmitting} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
                <CheckCircle2 className="mr-2 inline-block h-4 w-4" />
                Approve
              </button>
              <button onClick={() => handleAction('request-creative-changes')} disabled={isSubmitting} className={`rounded-full px-4 py-2 text-sm disabled:opacity-60 ${placementSecondaryButtonClass}`}>
                <RotateCcw className="mr-2 inline-block h-4 w-4" />
                Request changes
              </button>
              <button onClick={() => handleAction('reject-campaign')} disabled={isSubmitting} className="rounded-full border border-red-500/35 px-4 py-2 text-sm text-red-300 disabled:opacity-60">
                <XCircle className="mr-2 inline-block h-4 w-4" />
                Reject
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Select a campaign from the queue.</p>
        )}
        {feedback ? <p className="mt-4 text-sm text-[#f3deb1]">{feedback}</p> : null}
      </section>
    </div>
  );
}
