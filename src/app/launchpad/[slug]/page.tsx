import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock3, Users } from 'lucide-react';
import { getLaunchpadCategoryLabel } from '@/app/lib/launchpad';
import { getLaunchpadCampaignRecordBySlug } from '@/app/lib/launchpadCampaignStore';
import { listLaunchpadReceiptsByCampaignSlug } from '@/app/lib/launchpadSupport';
import { summarizeHybridFunding } from '@/app/lib/phase8HybridFunding';
import LaunchpadCheckoutPanel from '@/app/launchpad/[slug]/LaunchpadCheckoutPanel';
import {
  SurfaceHero,
  SurfaceListStrip,
  SurfacePage,
  SurfaceSectionHeading,
  surfaceSecondaryActionClass
} from '@/app/components/phase-surfaces/SurfaceSystem';

function percent(raised: number, goal: number) {
  return Math.min(100, Math.round((raised / goal) * 100));
}

function getStatusCopy(status: string | undefined) {
  if (status === 'draft') {
    return {
      eyebrow: 'Draft campaign',
      title: 'This campaign is saved as a draft.',
      detail: 'It is not visible on the public Launchpad yet. Finish the story, images, and backer tiers before publishing.'
    };
  }
  if (status === 'pending_review') {
    return {
      eyebrow: 'Pending review',
      title: 'This campaign is waiting for review.',
      detail: 'The page is saved and shareable by direct link, but it will not appear in the public Launchpad until review is complete.'
    };
  }
  return null;
}

function ProgressBar({ raisedAmount, goalAmount }: { raisedAmount: number; goalAmount: number }) {
  return (
    <div className="space-y-2">
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#f3dfb1,#d7a04d,#bf7a1f)]" style={{ width: `${percent(raisedAmount, goalAmount)}%` }} />
      </div>
      <div className="flex items-center justify-between text-sm text-white/64">
        <span>{percent(raisedAmount, goalAmount)}% funded</span>
        <span>${raisedAmount.toLocaleString()} raised of ${goalAmount.toLocaleString()}</span>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getLaunchpadCampaignRecordBySlug(slug);
  return {
    title: campaign ? `${campaign.title} | Launchpad` : 'Launchpad | Indigena Global Market'
  };
}

export default async function LaunchpadCampaignDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getLaunchpadCampaignRecordBySlug(slug);
  if (!campaign) notFound();
  const receipts = await listLaunchpadReceiptsByCampaignSlug(slug);
  const liveRaised = campaign.raisedAmount + receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const liveSponsors = campaign.sponsorCount + receipts.length;
  const statusCopy = getStatusCopy(campaign.status);
  const fundingSummary = await summarizeHybridFunding({ source: 'launchpad', campaignSlug: slug });

  return (
    <SurfacePage tone="program">
      <SurfaceHero
        tone="program"
        eyebrow={`${getLaunchpadCategoryLabel(campaign.category)} campaign`}
        title={campaign.title}
        description={campaign.summary}
        image={campaign.image}
        actions={[
          { href: '/launchpad', label: 'Back to Launchpad', variant: 'secondary' },
          ...(campaign.linkedEntityHref ? [{ href: campaign.linkedEntityHref, label: 'Linked page' as const }] : [])
        ]}
        stats={[
          { label: 'Raised', value: `$${liveRaised.toLocaleString()}` },
          { label: 'Goal', value: `$${campaign.goalAmount.toLocaleString()}` },
          { label: 'Backers', value: String(liveSponsors) },
          { label: 'Time left', value: campaign.closesInLabel }
        ]}
      />

      {statusCopy ? (
        <section className="rounded-[28px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(212,175,55,0.10),rgba(0,0,0,0.22))] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">{statusCopy.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{statusCopy.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">{statusCopy.detail}</p>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.02fr,0.98fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[34px] border border-white/10 bg-black/20 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.26)] backdrop-blur-sm">
            <ProgressBar raisedAmount={liveRaised} goalAmount={campaign.goalAmount} />
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/64">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/18 px-3 py-2">
                <Users size={14} className="text-[#d4af37]" />
                {liveSponsors} backers
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/18 px-3 py-2">
                <Clock3 size={14} className="text-[#d4af37]" />
                {campaign.closesInLabel}
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Why now</p>
                <p className="mt-2 text-sm leading-7 text-white/72">{campaign.urgencyLabel} keeps this campaign time-sensitive and specific.</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Backer confidence</p>
                <p className="mt-2 text-sm leading-7 text-white/72">{liveSponsors} people have already backed this, which gives new visitors immediate trust signals.</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Clear use of funds</p>
                <p className="mt-2 text-sm leading-7 text-white/72">Backers can see exactly where support goes and what it is meant to unlock.</p>
              </div>
            </div>
            <p className="mt-6 text-lg leading-8 text-white/78">{campaign.story}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Beneficiary</p>
                <p className="mt-2 text-base font-semibold text-white">{campaign.beneficiaryName}</p>
                <p className="mt-1 text-sm text-white/60">{campaign.beneficiaryRole}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Location</p>
                <p className="mt-2 text-base font-semibold text-white">{campaign.location}</p>
                <p className="mt-1 text-sm text-white/60">Campaign context and delivery ground</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Urgency</p>
                <p className="mt-2 text-base font-semibold text-white">{campaign.urgencyLabel}</p>
                <p className="mt-1 text-sm text-white/60">Why the decision window is open now</p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#d4af37]/15 bg-[linear-gradient(135deg,rgba(212,175,55,0.10),rgba(0,0,0,0.26))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.26)] backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">Why this matters now</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Why people choose to back this now</h2>
            <p className="mt-4 text-sm leading-7 text-white/74">
              {campaign.summary} This page shows what is at stake, who is carrying the work, and what backing now changes for the beneficiary.
            </p>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/20 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.26)] backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">Phase 8 funding operations</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">How this campaign is routed and measured</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              <div className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">Receipts</p>
                <p className="mt-2 text-2xl font-semibold text-white">{fundingSummary.totalReceipts}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">Gross support</p>
                <p className="mt-2 text-2xl font-semibold text-white">${fundingSummary.totalGrossAmount.toLocaleString()}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">Visible fees</p>
                <p className="mt-2 text-2xl font-semibold text-white">${(fundingSummary.totalPlatformFees + fundingSummary.totalProcessorFees).toLocaleString()}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">Net onward</p>
                <p className="mt-2 text-2xl font-semibold text-[#d4af37]">${fundingSummary.totalNetAmount.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {fundingSummary.byLane.filter((entry) => entry.count > 0).map((entry) => (
                <div key={entry.key} className="flex items-center justify-between rounded-[18px] border border-white/10 bg-black/18 p-4 text-sm">
                  <div>
                    <p className="font-medium text-white">{entry.label}</p>
                    <p className="mt-1 text-white/60">{entry.count} recorded backings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">${entry.grossAmount.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-[#d4af37]">${entry.netAmount.toLocaleString()} net routed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SurfaceSectionHeading eyebrow="Use of funds" title="Where support lands" description="Each contribution is tied to a clear spending path." />
          {campaign.useOfFunds.map((item) => (
            <SurfaceListStrip key={item} title={item} description="Budget line already identified for this campaign." />
          ))}

          <SurfaceSectionHeading eyebrow="Proof of momentum" title="Signals that make this worth backing" description="Visible traction is what turns visitors into backers." />
          {campaign.impactPoints.map((item) => (
            <SurfaceListStrip key={item} title={item} description="Concrete traction already visible." />
          ))}

          <SurfaceSectionHeading eyebrow="Funding milestones" title="What unlocks as the total climbs" description="Show exactly what changes as backing increases." />
          {campaign.milestonePlan.map((milestone) => (
            <SurfaceListStrip
              key={`${milestone.label}-${milestone.amount}`}
              eyebrow={`$${milestone.amount.toLocaleString()}`}
              title={milestone.label}
              description={milestone.detail}
            />
          ))}

          <SurfaceSectionHeading eyebrow="Recent updates" title="Recent campaign activity" description="A good campaign page shows movement, not silence." />
          {campaign.campaignUpdates.map((update) => (
            <SurfaceListStrip
              key={`${update.title}-${update.postedLabel}`}
              eyebrow={update.postedLabel}
              title={update.title}
              description={update.detail}
            />
          ))}

          <SurfaceSectionHeading eyebrow="Stretch goals" title="What happens if the campaign outperforms the base ask" description="Extra support should map to clear upside, not vague expansion." />
          {campaign.milestonePlan.map((milestone, index) => (
            <SurfaceListStrip
              key={`${milestone.label}-${milestone.amount}-stretch`}
              eyebrow={index === campaign.milestonePlan.length - 1 ? 'Stretch target' : 'Base milestone'}
              title={`${milestone.label} | $${milestone.amount.toLocaleString()}`}
              description={milestone.detail}
            />
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            {campaign.gallery.map((image, index) => (
              <div key={`${image}-${index}`} className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
                <img src={image} alt={`${campaign.title} ${index + 1}`} className="h-56 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <LaunchpadCheckoutPanel campaign={campaign} />

          <div className="rounded-[30px] border border-white/10 bg-black/20 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.26)] backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Campaign organizer</p>
            <div className="mt-4 flex items-start gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-black/20">
                <img src={campaign.beneficiaryImage} alt={campaign.beneficiaryName} className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white">{campaign.beneficiaryName}</h3>
                <p className="mt-1 text-sm text-[#d4af37]">{campaign.beneficiaryRole}</p>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  This campaign is tied to a real person, collective, or program, with a named beneficiary and a defined funding goal.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/20 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.26)] backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Backer tiers</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">What people can choose right now</h3>
            <div className="mt-5 grid gap-3">
              {campaign.supportTiers.oneTime.map((tier) => (
                <div key={tier.id} className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{tier.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#d4af37]">{tier.badge}</p>
                    </div>
                    <p className="text-xl font-semibold text-white">${tier.amount}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/62">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/20 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.26)] backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">Backer wall</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Recent backers</h3>
            <p className="mt-4 text-sm leading-7 text-white/68">
              This activity gives new backers immediate proof that the campaign is live, moving, and trusted by other supporters.
            </p>
            <div className="mt-5 space-y-3">
              {campaign.recentBackers.map((backer) => (
                <div key={`${backer.name}-${backer.amount}`} className="flex items-start justify-between gap-3 rounded-[18px] border border-white/10 bg-black/18 p-4 text-sm">
                  <div>
                    <p className="font-medium text-white">{backer.name}</p>
                    <p className="mt-1 text-white/56">{backer.note}</p>
                  </div>
                  <p className="font-semibold text-[#d4af37]">${backer.amount}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[22px] border border-white/10 bg-black/16 p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Backer reactions</p>
              <div className="mt-3 space-y-3 text-sm text-white/68">
                {campaign.recentBackers.map((backer) => (
                  <p key={`${backer.name}-${backer.note}-reaction`}>
                    <span className="font-medium text-white">{backer.name}:</span> "{backer.note}"
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/launchpad" className={surfaceSecondaryActionClass}>Browse more campaigns</Link>
              {campaign.category === 'community' && campaign.linkedAccountSlug ? (
                <Link href={`/communities/${campaign.linkedAccountSlug}/support`} className={surfaceSecondaryActionClass}>
                  View linked support goals
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </SurfacePage>
  );
}
