import AdvocacyFrame from '../../components/AdvocacyFrame';
import { ResourceCard, usePillar9Data } from '../../components/AdvocacyCards';

function ResourceCategoryShell({
  title,
  subtitle,
  eyebrow,
  intro,
  statLabel,
  statValue,
  guidance,
  kind
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  intro: string;
  statLabel: string;
  statValue: string;
  guidance: string;
  kind: 'guide' | 'template' | 'webinar' | 'case-law';
}) {
  const { resources } = usePillar9Data();
  const filtered = resources.filter((r) => r.kind === kind);

  return (
    <AdvocacyFrame title={title} subtitle={subtitle}>
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">This library is meant to help users move from confusion to action</h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-gray-300">{intro}</p>
        </article>

        <article className="rounded-2xl border border-[#d4af37]/15 bg-[#101112] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Collection Snapshot</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">{statLabel}</p>
              <p className="mt-2 text-sm text-gray-200">{statValue}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">How To Use This Page</p>
              <p className="mt-2 text-sm text-gray-200">{guidance}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => <ResourceCard key={item.id} item={item} />)}
      </section>
    </AdvocacyFrame>
  );
}

export default function KnowYourRightsGuidesPage() {
  return (
    <ResourceCategoryShell
      title="Know-Your-Rights Guides Library"
      subtitle="Printable and video rights guides for rapid community response."
      eyebrow="Rights Guides"
      intro="These guides are the first layer of legal readiness. They work best when users need fast clarity, plain-language framing, and something practical they can carry into real-world situations."
      statLabel="Best for"
      statValue="Community members, frontline volunteers, and rapid-response organizers"
      guidance="Start with the guide closest to the real situation you are facing, then move into deeper resources or legal support if the issue escalates."
      kind="guide"
    />
  );
}
