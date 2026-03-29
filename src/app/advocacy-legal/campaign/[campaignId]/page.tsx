import { notFound } from 'next/navigation';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import CampaignActionPanel from '../../components/CampaignActionPanel';
import { getAdvocacyCampaignById } from '@/app/lib/advocacyLegalPublicData';

type CampaignNarrative = {
  about: string;
  urgency: string;
  fundUse: string[];
  outcomes: string[];
  timeline: string[];
  updates: { label: string; date: string; title: string; detail: string }[];
  team: { name: string; role: string; note: string }[];
  budget: { label: string; percent: number; detail: string }[];
  endorsements: { name: string; role: string; quote: string }[];
};

function getCampaignNarrative(campaign: {
  id: string;
  type: 'legal-defense' | 'land-defense' | 'policy-action';
}): CampaignNarrative {
  const sharedTimeline = [
    'Immediate legal response and evidence coordination',
    'Community briefings, witness preparation, and strategy alignment',
    'Formal filings, hearings, and public advocacy pressure'
  ];

  const narratives: Record<string, CampaignNarrative> = {
    'coastal-fishery-defense': {
      about:
        'Coastal families are defending treaty-protected fishing access after repeated interference, safety risks, and costly legal escalation. This campaign funds counsel, marine evidence gathering, treaty research, and rapid-response legal support so fishers can continue exercising their rights with real protection on the water and in court.',
      urgency:
        'Hearings, enforcement complaints, and evidence collection are all time-sensitive. Missing this phase would weaken the community\'s ability to secure immediate protection and document ongoing treaty violations properly.',
      fundUse: [
        'Emergency litigation filings and court preparation',
        'On-water documentation, affidavits, and expert testimony',
        'Safety coordination and legal hotline support for fishers',
        'Community briefings and treaty-rights communications'
      ],
      outcomes: [
        'A stronger injunction and enforcement position',
        'A more complete treaty-rights evidence package',
        'Safer operating conditions for community fishers'
      ],
      timeline: sharedTimeline,
      updates: [
        {
          label: 'This week',
          date: 'March 10, 2026',
          title: 'Affidavit pack moved into final review',
          detail: 'Fishers, safety observers, and treaty advisors have completed the latest witness statements for filing.'
        },
        {
          label: 'Evidence',
          date: 'March 6, 2026',
          title: 'Marine incident log expanded',
          detail: 'The legal team added new footage, route mapping, and enforcement documentation to strengthen the case file.'
        },
        {
          label: 'Community',
          date: 'March 1, 2026',
          title: 'Briefing sessions are underway',
          detail: 'Families and crew leaders are receiving updates on court timing, safety protocol, and documentation standards.'
        }
      ],
      team: [
        { name: 'Mika Redsky', role: 'Lead Treaty Counsel', note: 'Coordinates injunction strategy and treaty-rights arguments.' },
        { name: 'Asha Paul', role: 'Community Legal Organizer', note: 'Handles witness prep, family briefings, and support logistics.' },
        { name: 'Noah Martin', role: 'Evidence Coordinator', note: 'Manages marine documentation, timelines, and incident records.' }
      ],
      budget: [
        { label: 'Litigation + Filings', percent: 42, detail: 'Court filings, legal counsel time, emergency motions.' },
        { label: 'Evidence + Experts', percent: 28, detail: 'Affidavits, field documentation, technical review, expert input.' },
        { label: 'Safety + Community Ops', percent: 18, detail: 'Briefings, hotline support, coordination for affected fishers.' },
        { label: 'Advocacy + Comms', percent: 12, detail: 'Protected public materials and stakeholder communications.' }
      ],
      endorsements: [
        {
          name: 'Rae Martin',
          role: 'Community Supporter',
          quote: 'This is one of the few campaigns where I can see exactly what the legal team is doing and why funding timing matters.'
        },
        {
          name: 'Jonah Peters',
          role: 'Treaty Rights Volunteer',
          quote: 'The updates and evidence milestones make this feel accountable, not abstract. That made it easy to contribute.'
        }
      ]
    },
    'sacred-ridge-injunction': {
      about:
        'This project supports urgent legal action to stop extraction activity near burial grounds, ceremonial sites, and culturally protected ridge corridors. Donations help the community move quickly with injunction work, cultural authority statements, environmental review support, and protocol-safe communications.',
      urgency:
        'Permit timelines move faster than most communities can mobilize without outside funding. This campaign exists to close that gap before site damage becomes irreversible.',
      fundUse: [
        'Injunction filings and emergency land-defense counsel',
        'Cultural heritage evidence packs and expert declarations',
        'Environmental review support and mapping documentation',
        'Protected community outreach and media-safe briefings'
      ],
      outcomes: [
        'Delay or halt high-risk extraction activity',
        'Strengthen protected status for sacred land records',
        'Give the community time to act from a position of strength'
      ],
      timeline: sharedTimeline,
      updates: [
        {
          label: 'Land defense',
          date: 'March 11, 2026',
          title: 'Emergency injunction papers prepared',
          detail: 'The legal team is finalizing the filing set tied to current permit and access timelines.'
        },
        {
          label: 'Protocols',
          date: 'March 7, 2026',
          title: 'Cultural authority statements compiled',
          detail: 'Elders and custodians have completed protected evidence statements for restricted review use.'
        },
        {
          label: 'Planning',
          date: 'February 28, 2026',
          title: 'Environmental mapping updated',
          detail: 'The case now includes revised impact overlays and access corridor documentation.'
        }
      ],
      team: [
        { name: 'Tere Moana', role: 'Land Defense Counsel', note: 'Leads injunction strategy and sacred site legal framing.' },
        { name: 'Leah Rangi', role: 'Cultural Protocol Liaison', note: 'Coordinates authority statements and protected review process.' },
        { name: 'Eli Stone', role: 'Impact Mapping Lead', note: 'Maintains land-use evidence and environmental risk maps.' }
      ],
      budget: [
        { label: 'Injunction Work', percent: 38, detail: 'Urgent filings, hearing prep, and counsel time.' },
        { label: 'Cultural Evidence', percent: 26, detail: 'Protected statements, protocol review, evidence preparation.' },
        { label: 'Environmental Review', percent: 22, detail: 'Mapping, technical review, expert assessments.' },
        { label: 'Community Coordination', percent: 14, detail: 'Briefings, secure communications, and organizing support.' }
      ],
      endorsements: [
        {
          name: 'Marina Te Awa',
          role: 'Land Protector',
          quote: 'The campaign explains the legal and cultural stakes clearly. You understand what is at risk before you donate.'
        },
        {
          name: 'Ethan Gray',
          role: 'Advocacy Donor',
          quote: 'Seeing where funds go and who is running point gave me confidence this support would actually move the case forward.'
        }
      ]
    },
    'language-rights-bill': {
      about:
        'The campaign funds a coordinated push for meaningful language protections, implementation standards, and school resourcing. This is not only about passing a bill; it is about equipping communities with legal analysis, public submissions, advocacy organizing, and education-sector pressure at the same time.',
      urgency:
        'Policy windows close fast. Without enough support during committee review and public consultation, weak language can pass or key protections can be stripped out before the final vote.',
      fundUse: [
        'Policy drafting, legal review, and legislative tracking',
        'Community submission support and advocacy materials',
        'Language-rights briefings for schools and partner groups',
        'Mobilization campaigns tied to hearings and votes'
      ],
      outcomes: [
        'Stronger legislative language and implementation guardrails',
        'More visible community participation in the policy process',
        'Higher pressure on decision-makers to resource language access'
      ],
      timeline: sharedTimeline,
      updates: [
        {
          label: 'Legislation',
          date: 'March 9, 2026',
          title: 'Draft amendments circulated',
          detail: 'The advocacy team is aligning community-backed language with the current committee review cycle.'
        },
        {
          label: 'Schools',
          date: 'March 4, 2026',
          title: 'Educator coalition expanded',
          detail: 'More education partners have joined the push for meaningful resourcing and implementation standards.'
        },
        {
          label: 'Mobilization',
          date: 'February 26, 2026',
          title: 'Public submission drive launched',
          detail: 'Organizers are collecting coordinated testimony ahead of the next hearing window.'
        }
      ],
      team: [
        { name: 'Jalen Yazzie', role: 'Policy Counsel', note: 'Reviews bill language and legislative risk points.' },
        { name: 'Mira Thompson', role: 'Community Mobilization Lead', note: 'Coordinates public submissions and hearing participation.' },
        { name: 'Aroha King', role: 'Education Advocate', note: 'Links school systems, language leaders, and implementation strategy.' }
      ],
      budget: [
        { label: 'Policy + Legal Review', percent: 36, detail: 'Bill analysis, amendment drafting, legislative tracking.' },
        { label: 'Community Mobilization', percent: 29, detail: 'Submission drives, campaign materials, hearing prep.' },
        { label: 'Education Partnerships', percent: 20, detail: 'School-sector briefings and language-rights coalition building.' },
        { label: 'Campaign Operations', percent: 15, detail: 'Coordination, outreach, and public-facing materials.' }
      ],
      endorsements: [
        {
          name: 'Kira Thompson',
          role: 'Language Educator',
          quote: 'This campaign makes the policy process understandable and shows exactly how donations help communities show up with a stronger voice.'
        },
        {
          name: 'Aiden Cole',
          role: 'Parent Advocate',
          quote: 'I donated because it felt like a real organizing engine, not just a slogan around language rights.'
        }
      ]
    }
  };

  if (narratives[campaign.id]) return narratives[campaign.id];

  if (campaign.type === 'land-defense') {
    return {
      about:
        'This campaign is community-led and focused on protecting culturally significant land through legal filings, evidence collection, and coordinated advocacy. Funding goes directly toward the work needed to hold the line during an active risk window.',
      urgency:
        'The legal window is active right now. Delays can mean lost filing opportunities and weaker protection for land, protocols, and community authority.',
      fundUse: [
        'Legal counsel and procedural costs',
        'Evidence collection and expert support',
        'Community coordination and protected communications',
        'Rapid-response advocacy during critical milestones'
      ],
      outcomes: [
        'A stronger legal position',
        'Better documented cultural and land evidence',
        'Clearer next-step protection for affected communities'
      ],
      timeline: sharedTimeline,
      updates: [
        { label: 'Review', date: 'March 8, 2026', title: 'Legal posture assessed', detail: 'Counsel and community leadership are aligning evidence and filing strategy.' },
        { label: 'Evidence', date: 'March 3, 2026', title: 'Documentation pack growing', detail: 'Additional testimony, mapping, and technical review are being added to the case.' },
        { label: 'Action', date: 'February 27, 2026', title: 'Response window active', detail: 'The team is working against live deadlines tied to permits or procedural review.' }
      ],
      team: [
        { name: 'Lead Counsel', role: 'Case Strategy', note: 'Directs filings, hearings, and legal risk management.' },
        { name: 'Community Lead', role: 'Coordination', note: 'Connects families, witnesses, and local decision-makers.' },
        { name: 'Evidence Lead', role: 'Documentation', note: 'Organizes records, timelines, and supporting material.' }
      ],
      budget: [
        { label: 'Legal Work', percent: 40, detail: 'Filings, motions, and counsel time.' },
        { label: 'Evidence', percent: 25, detail: 'Research, documentation, and expert review.' },
        { label: 'Community Operations', percent: 20, detail: 'Coordination and support infrastructure.' },
        { label: 'Advocacy', percent: 15, detail: 'Protected public messaging and campaign materials.' }
      ],
      endorsements: [
        {
          name: 'Community Donor',
          role: 'Supporter',
          quote: 'This page made the legal need feel concrete. I understood both the pressure and the plan.'
        },
        {
          name: 'Legal Ally',
          role: 'Volunteer Advocate',
          quote: 'The breakdown between legal work, evidence, and coordination is exactly what donors need to see.'
        }
      ]
    };
  }

  return {
    about:
      'This campaign is community-led and built to fund the legal, advocacy, and evidence work needed to protect Indigenous rights in the face of active pressure. Support is directed toward real frontline needs rather than generic fundraising overhead.',
    urgency:
      'The legal and organizing window is active right now. Delays can reduce leverage, weaken filings, and put more pressure on the people already carrying the work.',
    fundUse: [
      'Legal counsel and filing support',
      'Evidence collection and documentation',
      'Community coordination and protected communications',
      'Rapid-response advocacy during critical milestones'
    ],
    outcomes: [
      'A stronger legal and advocacy position',
      'Better documented evidence and community records',
      'More durable protection for the people affected'
    ],
    timeline: sharedTimeline,
    updates: [
      { label: 'Case update', date: 'March 8, 2026', title: 'Initial legal phase underway', detail: 'The team is prioritizing immediate actions while building the full evidence and response package.' },
      { label: 'Community', date: 'March 2, 2026', title: 'Support network activated', detail: 'Organizers are coordinating people, records, and timelines needed for the next stage.' },
      { label: 'Advocacy', date: 'February 25, 2026', title: 'Public pressure strategy aligned', detail: 'Legal and campaign communications are being synchronized around key milestones.' }
    ],
    team: [
      { name: 'Lead Counsel', role: 'Legal Strategy', note: 'Owns filings, review, and procedural execution.' },
      { name: 'Community Organizer', role: 'Coordination', note: 'Keeps local leadership, witnesses, and supporters aligned.' },
      { name: 'Campaign Coordinator', role: 'Support Operations', note: 'Tracks donations, milestones, and supporter communications.' }
    ],
    budget: [
      { label: 'Legal Work', percent: 38, detail: 'Counsel time, motions, and case preparation.' },
      { label: 'Evidence', percent: 26, detail: 'Documentation, research, and specialist review.' },
      { label: 'Community Support', percent: 21, detail: 'Coordination and urgent response needs.' },
      { label: 'Advocacy', percent: 15, detail: 'Campaign communications and mobilization support.' }
    ],
    endorsements: [
      {
        name: 'Verified Supporter',
        role: 'Campaign Backer',
        quote: 'The campaign explains the problem, the response, and the cost of waiting. That makes it much easier to support.'
      },
      {
        name: 'Community Organizer',
        role: 'Local Partner',
        quote: 'It feels accountable because donors can see movement, team roles, and what the money is actually paying for.'
      }
    ]
  };
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const campaign = await getAdvocacyCampaignById(campaignId);
  if (!campaign) return notFound();

  const progress = Math.min(100, Math.round((campaign.raised / campaign.target) * 100));
  const narrative = getCampaignNarrative(campaign);

  return (
    <AdvocacyFrame title={campaign.title} subtitle={`${campaign.region} - ${campaign.supporters.toLocaleString()} supporters`}>
      <section className="overflow-hidden rounded-[28px] border border-[#d4af37]/20 bg-[#101112] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <img src={campaign.image} alt={campaign.title} className="h-72 w-full object-cover" />
        <div className="p-5 md:p-6">
          <p className="text-sm leading-7 text-gray-300">{campaign.summary}</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/40">
            <div className="h-full bg-[#d4af37]" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-[#d4af37]">${campaign.raised.toLocaleString()} raised</span>
            <span className="text-gray-300">Target ${campaign.target.toLocaleString()}</span>
          </div>
          <CampaignActionPanel campaignId={campaign.id} campaignTitle={campaign.title} />
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#d4af37]">!</div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">About This Project</p>
                <h2 className="text-2xl font-semibold text-white">Why this campaign matters</h2>
              </div>
            </div>
            <p className="max-w-3xl text-base leading-8 text-gray-300">{narrative.about}</p>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[26px] border border-[#d4af37]/15 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Why Support Now</p>
              <p className="mt-4 text-sm leading-7 text-gray-300">{narrative.urgency}</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Where the Funds Go</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {narrative.fundUse.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Campaign Updates</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">What supporters should know right now</h2>
              </div>
              <div className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/8 px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#d4af37]/70">
                Active
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {narrative.updates.map((update, index) => (
                <div key={update.title} className="grid gap-4 rounded-2xl border border-white/6 bg-black/20 p-5 md:grid-cols-[140px_1fr]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/60">{update.label}</p>
                    <p className="mt-2 text-sm text-gray-500">{update.date}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{update.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-300">{update.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Meet The Team</p>
              <div className="mt-5 space-y-4">
                {narrative.team.map((member) => (
                  <div key={member.name} className="rounded-xl border border-white/6 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-white">{member.name}</h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#d4af37]/60">{member.role}</p>
                      </div>
                      <div className="h-11 w-11 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.35),rgba(212,175,55,0.06))]" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-gray-300">{member.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#d4af37]/15 bg-[linear-gradient(180deg,rgba(17,17,17,0.98),rgba(11,11,11,0.96))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Budget Breakdown</p>
              <div className="mt-5 space-y-4">
                {narrative.budget.map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/6 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-medium text-white">{item.label}</h3>
                      <span className="text-sm font-semibold text-[#d4af37]">{item.percent}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-[#d4af37]" style={{ width: `${item.percent}%` }} />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-gray-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Supporter Voices</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Why people are backing this campaign</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-gray-300">
                Endorsements
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {narrative.endorsements.map((endorsement) => (
                <div key={endorsement.name} className="rounded-2xl border border-white/6 bg-black/20 p-5">
                  <p className="text-sm leading-7 text-gray-200">"{endorsement.quote}"</p>
                  <div className="mt-4 border-t border-white/8 pt-4">
                    <p className="text-sm font-medium text-white">{endorsement.name}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]/60">{endorsement.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">What Success Looks Like</p>
            <div className="mt-4 space-y-3">
              {narrative.outcomes.map((item, index) => (
                <div key={item} className="rounded-xl border border-white/6 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]/60">Outcome {index + 1}</p>
                  <p className="mt-2 text-sm leading-7 text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d4af37]/15 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_60%),#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">What Happens Next</p>
            <div className="mt-5 space-y-4">
              {narrative.timeline.map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-sm font-semibold text-[#d4af37]">
                      {index + 1}
                    </div>
                    {index < narrative.timeline.length - 1 ? <div className="mt-2 h-8 w-px bg-[#d4af37]/20" /> : null}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </AdvocacyFrame>
  );
}
