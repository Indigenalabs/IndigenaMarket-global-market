import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import AttorneyActionPanel from '../../components/AttorneyActionPanel';
import { getAdvocacyAttorneyById, getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

type AttorneyProfileNarrative = {
  headline: string;
  about: string;
  strengths: string[];
  services: string[];
  process: string[];
  outcomes: string[];
  trustSignals: { label: string; value: string }[];
  endorsements: { name: string; role: string; quote: string }[];
};

function getVerificationLabel(level: 'verified' | 'elder-council' | 'pro-bono-network') {
  if (level === 'elder-council') return 'Elder Council Verified';
  if (level === 'pro-bono-network') return 'Pro Bono Network';
  return 'Verified Indigenous Legal Professional';
}

function getAttorneyProfileNarrative(attorney: {
  id: string;
  specialty: string;
  proBono: boolean;
  region: string;
  nation: string;
  rateLabel: string;
  verified: 'verified' | 'elder-council' | 'pro-bono-network';
}): AttorneyProfileNarrative {
  const base: AttorneyProfileNarrative = {
    headline: 'Community-grounded legal support built around Indigenous rights protection.',
    about:
      'This profile is designed to help communities understand not just what this attorney does, but how they work, where they are strongest, and what kind of support relationship they are best suited for.',
    strengths: ['Rights protection strategy', 'Community-sensitive case intake', 'Evidence and documentation planning'],
    services: ['Initial consultation', 'Case triage and legal framing', 'Strategic support for active matters'],
    process: ['Submit a consultation request', 'Share the matter summary and urgency', 'Receive next-step guidance or intake follow-up'],
    outcomes: ['Clearer legal direction', 'Stronger community readiness', 'Better aligned case preparation'],
    trustSignals: [
      { label: 'Region', value: attorney.region },
      { label: 'Nation', value: attorney.nation },
      { label: 'Verification', value: getVerificationLabel(attorney.verified) },
      { label: 'Pricing', value: attorney.proBono ? 'Pro bono review available' : attorney.rateLabel }
    ],
    endorsements: [
      {
        name: 'Verified Client Partner',
        role: 'Community Organizer',
        quote: 'Clear, strategic, and grounded in community reality rather than just legal theory.'
      },
      {
        name: 'Advocacy Collaborator',
        role: 'Campaign Lead',
        quote: 'Helped turn a scattered issue into a coordinated legal response plan.'
      }
    ]
  };

  const byId: Record<string, AttorneyProfileNarrative> = {
    'mika-redsky': {
      headline: 'Treaty-rights counsel for communities defending access, sovereignty, and co-management authority.',
      about:
        'Mika works on matters where treaty interpretation, access rights, and enforcement failures collide. Her practice is strongest when a community needs disciplined legal framing, organized evidence, and a steady link between litigation strategy and community leadership.',
      strengths: ['Treaty-rights disputes', 'Sovereignty positioning', 'Access and co-management frameworks'],
      services: ['Treaty strategy consultations', 'Injunction and enforcement support', 'Rights-based evidence review'],
      process: ['Review the community issue and urgency', 'Map the treaty and enforcement posture', 'Align evidence, filings, and support actions'],
      outcomes: ['Stronger treaty-rights framing', 'Better enforcement positioning', 'More disciplined hearing preparation'],
      trustSignals: [
        { label: 'Region', value: attorney.region },
        { label: 'Nation', value: attorney.nation },
        { label: 'Verification', value: getVerificationLabel(attorney.verified) },
        { label: 'Typical Engagement', value: attorney.rateLabel }
      ],
      endorsements: [
        {
          name: 'Harper Lewis',
          role: 'Treaty Campaign Organizer',
          quote: 'Mika brings clarity quickly. She helps communities understand not only what is legally possible, but what is strategically smart.'
        },
        {
          name: 'Jordan White',
          role: 'Coastal Rights Supporter',
          quote: 'Her work feels grounded in treaty reality, not just courtroom language.'
        }
      ]
    },
    'jalen-yazzie': {
      headline: 'ICIP and licensing counsel for artists, collectives, and communities protecting cultural use.',
      about:
        'Jalen focuses on the space where culture, contracts, and misuse risk meet. The profile is strongest for creators who need licensing clarity, boundary-setting, and stronger contract language before harm becomes expensive or irreversible.',
      strengths: ['ICIP protection', 'Licensing boundaries', 'Contracts and revocation language'],
      services: ['Licensing review', 'Contract safety checks', 'Cultural-use dispute guidance'],
      process: ['Review the proposed deal or misuse issue', 'Identify weak clauses and exposure points', 'Recommend safer terms or response steps'],
      outcomes: ['Stronger contract position', 'Clearer approved-use boundaries', 'Better protection against cultural extraction'],
      trustSignals: [
        { label: 'Region', value: attorney.region },
        { label: 'Nation', value: attorney.nation },
        { label: 'Verification', value: getVerificationLabel(attorney.verified) },
        { label: 'Access Model', value: attorney.proBono ? 'Pro bono review path available' : attorney.rateLabel }
      ],
      endorsements: [
        {
          name: 'Leila Stone',
          role: 'Artist Manager',
          quote: 'Jalen spots the risky language fast and explains it in a way creators can actually use.'
        },
        {
          name: 'Ari Cole',
          role: 'Collective Coordinator',
          quote: 'This is the kind of legal profile that feels built for Indigenous creators, not retrofitted after the fact.'
        }
      ]
    },
    'tere-moana': {
      headline: 'Land-defense counsel for sacred site, environmental, and stewardship matters under active threat.',
      about:
        'Tere is strongest when land protection needs to move fast without losing cultural integrity. Her work links injunction strategy, sacred site framing, and environmental law into one response path that communities can actually act on.',
      strengths: ['Sacred site injunctions', 'Environmental law strategy', 'Marine and land stewardship disputes'],
      services: ['Land-defense consultations', 'Permit challenge support', 'Sacred site protection strategy'],
      process: ['Assess the immediate land risk', 'Review permit and evidence posture', 'Coordinate legal and protocol-safe next steps'],
      outcomes: ['Faster injunction readiness', 'Stronger sacred-site protection record', 'Better alignment between legal and cultural authority'],
      trustSignals: [
        { label: 'Region', value: attorney.region },
        { label: 'Nation', value: attorney.nation },
        { label: 'Verification', value: getVerificationLabel(attorney.verified) },
        { label: 'Typical Engagement', value: attorney.rateLabel }
      ],
      endorsements: [
        {
          name: 'Maia Ruru',
          role: 'Land Protection Organizer',
          quote: 'Tere understands how to keep sacred site issues legally strong without flattening cultural protocol.'
        },
        {
          name: 'Finn Roberts',
          role: 'Advocacy Donor',
          quote: 'The profile made it obvious this was serious land-defense counsel, not generic environmental law branding.'
        }
      ]
    },
    'dario-katani': {
      headline: 'Repatriation and NAGPRA support for communities navigating return, documentation, and institutional negotiation.',
      about:
        'Dario works where repatriation is part legal process, part protocol, and part institutional pressure. He is a strong fit for communities that need negotiation support, return planning, and documentation discipline during sensitive repatriation work.',
      strengths: ['Repatriation negotiation', 'NAGPRA process support', 'Protocol-aware return planning'],
      services: ['Museum and institution negotiation support', 'Repatriation process review', 'Return documentation strategy'],
      process: ['Review the item history and current holder', 'Assess legal and institutional leverage', 'Coordinate return pathway and protocol-sensitive next steps'],
      outcomes: ['Stronger repatriation posture', 'Clearer institution-facing strategy', 'Better protected return process'],
      trustSignals: [
        { label: 'Region', value: attorney.region },
        { label: 'Nation', value: attorney.nation },
        { label: 'Verification', value: getVerificationLabel(attorney.verified) },
        { label: 'Access Model', value: attorney.proBono ? 'Pro bono review path available' : attorney.rateLabel }
      ],
      endorsements: [
        {
          name: 'Talia Green',
          role: 'Cultural Heritage Lead',
          quote: 'Dario understands that repatriation is not only legal process. He keeps culture and return logistics connected.'
        },
        {
          name: 'Marcus King',
          role: 'Museum Liaison',
          quote: 'A steady, well-structured profile for work that often gets messy very quickly.'
        }
      ]
    }
  };

  return byId[attorney.id] || base;
}

export default async function AttorneyProfilePage({ params }: { params: Promise<{ attorneyId: string }> }) {
  const { attorneyId } = await params;
  const attorney = await getAdvocacyAttorneyById(attorneyId);
  if (!attorney) return notFound();

  const narrative = getAttorneyProfileNarrative(attorney);
  const publicData = await getAdvocacyPublicData();
  const relatedCampaigns = publicData.campaigns
    .filter((campaign) => {
      if (attorney.id === 'mika-redsky') return campaign.type === 'legal-defense';
      if (attorney.id === 'tere-moana') return campaign.type === 'land-defense';
      if (attorney.id === 'jalen-yazzie') return campaign.type === 'policy-action' || campaign.id === 'language-rights-bill';
      if (attorney.id === 'dario-katani') return campaign.type === 'legal-defense' || campaign.type === 'policy-action';
      return true;
    })
    .slice(0, 2);
  const relatedResources = publicData.resources
    .filter((resource) => {
      if (attorney.id === 'jalen-yazzie') return resource.kind === 'template';
      if (attorney.id === 'mika-redsky') return resource.kind === 'guide' || resource.kind === 'case-law';
      if (attorney.id === 'tere-moana') return resource.kind === 'webinar' || resource.kind === 'guide';
      if (attorney.id === 'dario-katani') return resource.kind === 'case-law' || resource.kind === 'guide';
      return true;
    })
    .slice(0, 2);

  return (
    <AdvocacyFrame title={attorney.name} subtitle={`${attorney.specialty} - ${attorney.nation}`}>
      <section className="grid gap-7 xl:grid-cols-[390px_1fr]">
        <aside className="space-y-6">
          <article className="overflow-hidden rounded-[28px] border border-[#d4af37]/20 bg-[#101112] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <img src={attorney.image} alt={attorney.name} className="h-96 w-full object-cover" />
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#d4af37]/70">
                <span>{getVerificationLabel(attorney.verified)}</span>
                <span className="h-1 w-1 rounded-full bg-[#d4af37]/50" />
                <span>{attorney.region}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-gray-300">{attorney.bio}</p>
              <div className="mt-5 grid gap-3">
                {narrative.trustSignals.map((signal) => (
                  <div key={signal.label} className="rounded-xl border border-white/8 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]/60">{signal.label}</p>
                    <p className="mt-2 text-sm text-gray-200">{signal.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)]">
            <h3 className="text-lg font-semibold text-white">Request legal support</h3>
            <p className="mt-2 text-sm leading-7 text-gray-300">
              Best for communities, artists, or organizers who need a first legal read, strategic next step, or a stronger case intake path.
            </p>
            <AttorneyActionPanel attorneyId={attorney.id} attorneyName={attorney.name} />
          </article>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-7">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Attorney Overview</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{narrative.headline}</h2>
            <p className="mt-4 max-w-4xl text-base leading-8 text-gray-300">{narrative.about}</p>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[26px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Core Strengths</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {narrative.strengths.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Services</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {narrative.services.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[26px] border border-[#d4af37]/15 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Likely Outcomes</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {narrative.outcomes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">How Engagement Works</p>
              <div className="mt-5 space-y-4">
                {narrative.process.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-sm font-semibold text-[#d4af37]">
                        {index + 1}
                      </div>
                      {index < narrative.process.length - 1 ? <div className="mt-2 h-8 w-px bg-[#d4af37]/20" /> : null}
                    </div>
                    <p className="pt-1 text-sm leading-7 text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Client & Partner Notes</p>
              <div className="mt-5 space-y-4">
                {narrative.endorsements.map((endorsement) => (
                  <div key={endorsement.name} className="rounded-xl border border-white/6 bg-black/20 p-4">
                    <p className="text-sm leading-7 text-gray-200">"{endorsement.quote}"</p>
                    <div className="mt-4 border-t border-white/8 pt-4">
                      <p className="text-sm font-medium text-white">{endorsement.name}</p>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]/60">{endorsement.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Relevant Campaigns</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Where this expertise fits</h3>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {relatedCampaigns.map((campaign) => (
                  <Link key={campaign.id} href={`/advocacy-legal/campaign/${campaign.id}`} className="block rounded-2xl border border-white/6 bg-black/20 p-5 transition-all hover:border-[#d4af37]/30 hover:bg-black/30">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]/60">{campaign.type}</p>
                    <h4 className="mt-2 text-lg font-medium text-white">{campaign.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-gray-300">{campaign.summary}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Recommended Resources</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Useful next reading</h3>
              </div>
              <div className="mt-5 space-y-4">
                {relatedResources.map((resource) => (
                  <Link key={resource.id} href={`/advocacy-legal/resource/${resource.id}`} className="block rounded-2xl border border-white/6 bg-black/20 p-5 transition-all hover:border-[#d4af37]/30 hover:bg-black/30">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]/60">{resource.kind}</p>
                    <h4 className="mt-2 text-lg font-medium text-white">{resource.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-gray-300">{resource.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </AdvocacyFrame>
  );
}
