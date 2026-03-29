import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import { getAdvocacyPublicData, getAdvocacyVictoryById } from '@/app/lib/advocacyLegalPublicData';

type VictoryNarrative = {
  story: string;
  whyItWorked: string[];
  timeline: { date: string; title: string; detail: string }[];
  lessons: string[];
  rippleEffects: string[];
};

function getVictoryNarrative(victory: { id: string }): VictoryNarrative {
  const byId: Record<string, VictoryNarrative> = {
    'river-access-win-2024': {
      story:
        'This victory came from a coordinated mix of treaty framing, community testimony, and disciplined legal escalation. The case did not succeed because one filing changed everything; it succeeded because community records, legal timing, and public pressure were aligned well enough to make exclusion barriers legally and politically untenable.',
      whyItWorked: [
        'Strong treaty-rights framing from the outset',
        'Community evidence stayed consistent and well documented',
        'Advocacy pressure supported the legal strategy instead of distracting from it'
      ],
      timeline: [
        { date: 'February 2024', title: 'Initial exclusion incidents documented', detail: 'Community observers and legal allies built the first evidence pack tied to access restrictions.' },
        { date: 'May 2024', title: 'Emergency filings and affidavits submitted', detail: 'The legal team moved the issue into a stronger court posture with witness-backed filings.' },
        { date: 'September 2024', title: 'Permanent injunction secured', detail: 'The court blocked exclusion barriers and recognized the strength of the access-rights position.' }
      ],
      lessons: [
        'Early documentation matters more than most campaigns expect',
        'Community coordination can be a legal asset when it is disciplined',
        'Victories scale better when the strategy is teachable and repeatable'
      ],
      rippleEffects: [
        'Stronger confidence for future access-rights filings',
        'Better local readiness for rapid treaty-rights response',
        'A public example that communities can point to in later disputes'
      ]
    },
    'repatriation-bundle-return': {
      story:
        'This repatriation success came through patient institutional negotiation backed by clear cultural authority, careful documentation, and legal pressure where needed. The return process worked because the community maintained control over protocol while still building a credible institutional pathway for the items to come home.',
      whyItWorked: [
        'Cultural authority was visible and consistent',
        'Negotiation was paired with documentation discipline',
        'The return process respected protocol as well as legal process'
      ],
      timeline: [
        { date: 'January 2025', title: 'Item history and custody trail assembled', detail: 'The team aligned archive material, provenance notes, and community records into one evidence file.' },
        { date: 'April 2025', title: 'Return negotiations formalized', detail: 'Institutional contacts moved into a structured repatriation pathway with defined terms.' },
        { date: 'August 2025', title: 'Protocol-safe return completed', detail: 'The items were returned under a culturally supervised process with stronger handling safeguards.' }
      ],
      lessons: [
        'Repatriation is both legal process and cultural process',
        'Clear documentation reduces institutional delay tactics',
        'Return planning should be designed before the final handover stage'
      ],
      rippleEffects: [
        'A stronger template for future return negotiations',
        'Better institutional understanding of protocol obligations',
        'A visible precedent for communities seeking culturally safe repatriation'
      ]
    }
  };

  return byId[victory.id] || {
    story:
      'This impact story shows how legal strategy, community coordination, and advocacy pressure can come together to create a durable protection outcome.',
    whyItWorked: ['Clear legal framing', 'Coordinated community action', 'Credible evidence and follow-through'],
    timeline: [
      { date: 'Phase 1', title: 'Issue documented', detail: 'The matter moved from community concern into a structured evidence and legal pathway.' },
      { date: 'Phase 2', title: 'Action escalated', detail: 'Legal and advocacy steps were coordinated around the strongest opportunity window.' },
      { date: 'Phase 3', title: 'Outcome secured', detail: 'The campaign reached an outcome strong enough to guide future matters.' }
    ],
    lessons: ['Repeatable process matters', 'Strategy is stronger when community-led', 'Documentation under pressure is critical'],
    rippleEffects: ['More confidence for similar matters', 'Clearer playbook for future response', 'Stronger public proof of what works']
  };
}

export default async function VictoryImpactStoryPage({ params }: { params: Promise<{ victoryId: string }> }) {
  const { victoryId } = await params;
  const victory = await getAdvocacyVictoryById(victoryId);
  if (!victory) return notFound();

  const narrative = getVictoryNarrative(victory);
  const publicData = await getAdvocacyPublicData();
  const relatedVictories = publicData.victories.filter((item) => item.id !== victory.id).slice(0, 2);

  return (
    <AdvocacyFrame title={victory.title} subtitle={`${victory.year} - ${victory.impact}`}>
      <section className="overflow-hidden rounded-[28px] border border-[#d4af37]/20 bg-[#101112] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <img src={victory.image} alt={victory.title} className="h-80 w-full object-cover" />
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-[#d4af37]/70">
            <span>Impact Story</span>
            <span className="h-1 w-1 rounded-full bg-[#d4af37]/50" />
            <span>{victory.year}</span>
          </div>
          <p className="mt-4 text-base leading-8 text-gray-300">{victory.summary}</p>
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-7">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">What Happened</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">How this outcome was won</h2>
            <p className="mt-4 text-base leading-8 text-gray-300">{narrative.story}</p>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[26px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Why It Worked</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {narrative.whyItWorked.map((item) => (
                  <li key={item} className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-[#d4af37]" /><span>{item}</span></li>
                ))}
              </ul>
            </div>
            <div className="rounded-[26px] border border-[#d4af37]/15 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Ripple Effects</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {narrative.rippleEffects.map((item) => (
                  <li key={item} className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-[#d4af37]" /><span>{item}</span></li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Timeline</p>
            <div className="mt-5 space-y-4">
              {narrative.timeline.map((item, index) => (
                <div key={item.title} className="grid gap-4 rounded-2xl border border-white/6 bg-black/20 p-5 md:grid-cols-[150px_1fr]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]/60">{item.date}</p>
                    <p className="mt-2 text-sm text-gray-500">Step {index + 1}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-300">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Key Lessons</p>
            <div className="mt-4 space-y-3">
              {narrative.lessons.map((item, index) => (
                <div key={item} className="rounded-xl border border-white/6 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]/60">Lesson {index + 1}</p>
                  <p className="mt-2 text-sm leading-7 text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d4af37]/15 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_60%),#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Use This Story</p>
            <p className="mt-4 text-sm leading-7 text-gray-300">Impact stories are there to show communities and supporters what effective legal coordination looks like in practice. Use this page as proof, precedent, and momentum.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/advocacy-legal/campaigns" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Explore Campaigns</Link>
              <Link href="/advocacy-legal/resources/case-law-database" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">Open Case Law Resources</Link>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Related Victory Stories</p>
            <div className="mt-4 space-y-3">
              {relatedVictories.map((item) => (
                <Link key={item.id} href={`/advocacy-legal/victory/${item.id}`} className="block rounded-xl border border-white/6 bg-black/20 p-4 transition-all hover:border-[#d4af37]/30 hover:bg-black/30">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-gray-300">{item.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </AdvocacyFrame>
  );
}
