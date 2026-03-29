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
          <h2 className="mt-2 text-2xl font-semibold text-white">Train people before pressure hits</h2>
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

export default function WebinarsTrainingsSchedulePage() {
  return (
    <ResourceCategoryShell
      title="Webinars & Trainings Schedule"
      subtitle="Legal literacy workshops and action prep sessions."
      eyebrow="Training Library"
      intro="These sessions work best when a team needs shared understanding, not just solo reading. They are there to create a common response method before a legal or advocacy moment becomes chaotic."
      statLabel="Best for"
      statValue="Community response teams, legal volunteers, organizers, and leadership groups"
      guidance="Use training resources in groups where possible. Pause, assign responsibilities, and turn the material into an actual response checklist."
      kind="webinar"
    />
  );
}
