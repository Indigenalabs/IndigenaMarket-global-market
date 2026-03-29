import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import { getAdvocacyPublicData, getAdvocacyResourceById } from '@/app/lib/advocacyLegalPublicData';

type ResourceNarrative = {
  about: string;
  forWho: string[];
  includes: string[];
  useCases: string[];
  whyItMatters: string;
  howToUse: string[];
  nextAction: {
    title: string;
    description: string;
    href: string;
    cta: string;
  };
};

function getResourceNarrative(resource: {
  id: string;
  kind: 'guide' | 'template' | 'webinar' | 'case-law' | 'glossary';
}): ResourceNarrative {
  const byId: Record<string, ResourceNarrative> = {
    'guide-rights-at-checkpoints': {
      about:
        'This field-ready guide helps community members respond clearly and safely during checkpoint interactions. It is designed for quick use under pressure, with escalation steps, rights language, and legal-support prompts that reduce confusion in the moment.',
      forWho: ['Community members on the move', 'Land defenders and support crews', 'Families preparing emergency response kits'],
      includes: ['Quick-reference rights card', 'Escalation sequence', 'Contact prompts for legal hotline use', 'Short plain-language checkpoint script'],
      useCases: ['Carry in vehicles or travel kits', 'Use in training circles and safety briefings', 'Share with frontline volunteers before actions'],
      whyItMatters:
        'People often need support in high-pressure situations before they have time to call a lawyer. This resource closes that gap by giving a clear first-response framework.',
      howToUse: ['Read once before travel', 'Highlight emergency steps', 'Keep a copy in your phone and glovebox'],
      nextAction: {
        title: 'Build a fuller response kit',
        description: 'After this guide, the next useful step is reviewing the live legal-response training so your team can coordinate beyond the first contact moment.',
        href: '/advocacy-legal/resource/webinar-pipeline-response',
        cta: 'Open Response Training'
      }
    },
    'template-artist-license': {
      about:
        'This licensing template gives artists and collectives a stronger starting point when negotiating use of Indigenous work. It is built to protect against vague permissions, unapproved derivative use, and weak revocation language.',
      forWho: ['Artists and collectives', 'Creator managers', 'Community arts coordinators'],
      includes: ['Editable licensing clauses', 'ICIP protection prompts', 'Revocation language', 'Approved-use boundary examples'],
      useCases: ['Licensing artwork to brands or institutions', 'Setting terms before exhibition partnerships', 'Reviewing unsafe contract language before signing'],
      whyItMatters:
        'Too many creators are pushed into agreements that look standard but quietly strip away cultural control. This template helps rebalance that negotiation.',
      howToUse: ['Duplicate the template', 'Adjust approved uses and term length', 'Review with legal counsel before execution'],
      nextAction: {
        title: 'Pair this with specialist support',
        description: 'Templates are stronger when they are reviewed in context. The next move is connecting with an ICIP specialist or rights attorney.',
        href: '/advocacy-legal/attorneys',
        cta: 'Browse Attorneys'
      }
    },
    'webinar-pipeline-response': {
      about:
        'This training breaks down how communities can respond quickly and safely when pipeline notices or related legal alerts arrive. It combines legal framing, evidence prep, and communications discipline into one response workflow.',
      forWho: ['Land defenders', 'Community legal organizers', 'Rapid response teams'],
      includes: ['Recorded training session', 'Evidence checklist', 'Media-safe statement prompts', 'Response planning worksheet'],
      useCases: ['Urgent campaign preparation', 'Volunteer legal-response training', 'Leadership briefings before hearings'],
      whyItMatters:
        'Early response quality can shape the whole legal and public strategy. This webinar helps teams move faster without creating avoidable exposure.',
      howToUse: ['Watch as a team', 'Assign owners for each checklist item', 'Turn the worksheet into your first response plan'],
      nextAction: {
        title: 'Turn training into action',
        description: 'Once your team has the workflow, the next step is checking active campaigns or submitting legal help if your community is in an active response window.',
        href: '/advocacy-legal/campaigns',
        cta: 'View Active Campaigns'
      }
    },
    'case-law-hub': {
      about:
        'This hub organizes Indigenous rights precedents by treaty theme, jurisdiction, and outcome so advocates and researchers can find useful patterns without digging through disconnected sources.',
      forWho: ['Researchers and advocates', 'Policy teams', 'Legal professionals supporting communities'],
      includes: ['Indexed precedent summaries', 'Outcome filters', 'Thematic tags', 'Searchable case reference structure'],
      useCases: ['Preparing legal briefs', 'Researching comparable cases', 'Building community education materials'],
      whyItMatters:
        'Useful precedent exists, but it is often fragmented and hard to navigate. A clearer starting point makes legal strategy and community education more effective.',
      howToUse: ['Search by theme or jurisdiction', 'Save comparable matters', 'Pull summaries into briefing notes'],
      nextAction: {
        title: 'Move from research to strategy',
        description: 'Once you have comparable cases, the next step is working with a legal professional or community team to turn precedent into action.',
        href: '/advocacy-legal/submit-case',
        cta: 'Request Legal Help'
      }
    }
  };

  const byKind: Record<ResourceNarrative['about'] extends string ? string : never, ResourceNarrative> = {
    guide: {
      about:
        'This resource is designed to turn complex legal information into something practical and usable in the real world.',
      forWho: ['Community members', 'Frontline volunteers', 'Organizers who need quick clarity'],
      includes: ['Plain-language guidance', 'Action prompts', 'Practical next steps'],
      useCases: ['Training', 'Field use', 'Emergency preparation'],
      whyItMatters:
        'Information only helps if people can use it when the moment arrives.',
      howToUse: ['Review it in advance', 'Share it with your team', 'Keep it accessible during live situations'],
      nextAction: {
        title: 'Keep building your toolkit',
        description: 'The best next move is opening a related advocacy resource so the user leaves with a more complete response set.',
        href: '/advocacy-legal/resources/know-your-rights',
        cta: 'Explore More Guides'
      }
    },
    template: {
      about:
        'This template is meant to save time and give users a stronger starting position before formal review or negotiation.',
      forWho: ['Creators', 'Collectives', 'Community administrators'],
      includes: ['Editable language', 'Boundary clauses', 'Review checkpoints'],
      useCases: ['Drafting agreements', 'Negotiation prep', 'Internal review'],
      whyItMatters:
        'Starting from a stronger draft reduces the chance of accepting terms that create long-term risk.',
      howToUse: ['Duplicate the file', 'Edit the specifics', 'Run it past counsel before signing'],
      nextAction: {
        title: 'Pressure-test the draft',
        description: 'Templates are a starting point. The next useful step is reviewing it with a legal or rights specialist before use.',
        href: '/advocacy-legal/attorneys',
        cta: 'Find a Specialist'
      }
    },
    webinar: {
      about:
        'This session combines training and tactical guidance so teams can move faster with more confidence during active legal moments.',
      forWho: ['Community response teams', 'Organizers', 'Legal support volunteers'],
      includes: ['Recorded instruction', 'Action framework', 'Support materials'],
      useCases: ['Rapid onboarding', 'Training circles', 'Response planning'],
      whyItMatters:
        'A shared response method reduces confusion and helps teams act in a more coordinated way.',
      howToUse: ['Watch with your team', 'Pause for discussion', 'Assign follow-up actions immediately'],
      nextAction: {
        title: 'Take the next action',
        description: 'Once the team understands the workflow, move into active advocacy, legal support, or campaign coordination.',
        href: '/advocacy-legal/action-center',
        cta: 'Open Action Center'
      }
    },
    'case-law': {
      about:
        'This legal research resource helps users find relevant precedent and patterns more efficiently.',
      forWho: ['Researchers', 'Advocates', 'Law and policy teams'],
      includes: ['Searchable case structure', 'Thematic indexing', 'Comparative references'],
      useCases: ['Research', 'Brief drafting', 'Issue education'],
      whyItMatters:
        'Faster access to comparable matters improves both legal preparation and community understanding.',
      howToUse: ['Search by issue', 'Compare outcomes', 'Pull key references into briefs and notes'],
      nextAction: {
        title: 'Connect precedent to a live matter',
        description: 'Once you have the research, the next step is applying it to a community issue, campaign, or legal request.',
        href: '/advocacy-legal/submit-case',
        cta: 'Start a Case Intake'
      }
    },
    glossary: {
      about:
        'This glossary helps users understand legal and advocacy language without getting lost in technical wording.',
      forWho: ['First-time users', 'Community members', 'Educators and facilitators'],
      includes: ['Defined terms', 'Plain-language explanations', 'Context notes'],
      useCases: ['Training', 'Orientation', 'Self-study'],
      whyItMatters:
        'Understanding terminology helps people participate more confidently in legal and advocacy processes.',
      howToUse: ['Read alongside the related resource', 'Save terms for later review', 'Use it in workshops and onboarding'],
      nextAction: {
        title: 'Go one layer deeper',
        description: 'The glossary works best when paired with a practical guide, template, or training resource.',
        href: '/advocacy-legal/resources/know-your-rights',
        cta: 'Open Related Resource'
      }
    }
  };

  return byId[resource.id] || byKind[resource.kind];
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  const resource = await getAdvocacyResourceById(resourceId);
  if (!resource) return notFound();

  const narrative = getResourceNarrative(resource);
  const publicData = await getAdvocacyPublicData();
  const relatedResources = publicData.resources
    .filter((item) => item.id !== resource.id && (item.kind === resource.kind || item.audience === resource.audience || item.language === resource.language))
    .slice(0, 3);

  return (
    <AdvocacyFrame title={resource.title} subtitle={`${resource.audience} - ${resource.language}`}>
      <section className="grid gap-7 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-6">
          <article className="overflow-hidden rounded-[28px] border border-[#d4af37]/20 bg-[#101112] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <img src={resource.image} alt={resource.title} className="h-72 w-full object-cover" />
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">
                <span>{resource.kind}</span>
                <span className="h-1 w-1 rounded-full bg-[#d4af37]/50" />
                <span>{resource.audience}</span>
              </div>
              <p className="mt-4 text-base leading-8 text-gray-300">{resource.summary}</p>
            </div>
          </article>

          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#d4af37]">i</div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">About This Resource</p>
                <h2 className="text-2xl font-semibold text-white">What it gives the user</h2>
              </div>
            </div>
            <p className="max-w-3xl text-base leading-8 text-gray-300">{narrative.about}</p>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[26px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Who This Is For</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {narrative.forWho.map((item) => (
                  <span key={item} className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/8 px-4 py-2 text-sm text-gray-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[26px] border border-[#d4af37]/15 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Why It Matters</p>
              <p className="mt-4 text-sm leading-7 text-gray-300">{narrative.whyItMatters}</p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[26px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">What Is Included</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {narrative.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#d4af37]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-[#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Best Use Cases</p>
              <div className="mt-4 space-y-3">
                {narrative.useCases.map((item, index) => (
                  <div key={item} className="rounded-xl border border-white/6 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]/60">Use Case {index + 1}</p>
                    <p className="mt-2 text-sm leading-7 text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0f1012] p-7 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Related Resources</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Keep building the toolkit</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {relatedResources.map((item) => (
                <Link
                  key={item.id}
                  href={`/advocacy-legal/resource/${item.id}`}
                  className="group rounded-2xl border border-white/8 bg-black/20 p-5 transition-all hover:border-[#d4af37]/30 hover:bg-black/30"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]/60">{item.kind}</p>
                  <h3 className="mt-3 text-lg font-medium text-white group-hover:text-[#f4d370]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-300">{item.summary}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-gray-500">{item.audience}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22)]">
            <h3 className="text-lg font-semibold text-white">Resource Actions</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-300">
              <p>Kind: {resource.kind}</p>
              <p>Audience: {resource.audience}</p>
              <p>Language: {resource.language}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Open / Download</button>
              <button className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">Save to Library</button>
            </div>
          </article>

          <section className="rounded-[28px] border border-[#d4af37]/15 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_60%),#0f1012] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">How To Use It Well</p>
            <div className="mt-5 space-y-4">
              {narrative.howToUse.map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-sm font-semibold text-[#d4af37]">
                      {index + 1}
                    </div>
                    {index < narrative.howToUse.length - 1 ? <div className="mt-2 h-8 w-px bg-[#d4af37]/20" /> : null}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.98),rgba(10,10,10,0.95))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Recommended Next Action</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{narrative.nextAction.title}</h3>
            <p className="mt-3 text-sm leading-7 text-gray-300">{narrative.nextAction.description}</p>
            <Link
              href={narrative.nextAction.href}
              className="mt-5 inline-flex rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#f4d370]"
            >
              {narrative.nextAction.cta}
            </Link>
          </section>
        </aside>
      </section>
    </AdvocacyFrame>
  );
}
