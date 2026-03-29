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
          <h2 className="mt-2 text-2xl font-semibold text-white">Use stronger starting documents before you negotiate or sign</h2>
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

export default function LegalTemplatesContractsLibraryPage() {
  return (
    <ResourceCategoryShell
      title="Legal Templates & Contracts Library"
      subtitle="ICIP-safe agreements, releases, and licensing templates."
      eyebrow="Templates Library"
      intro="These resources are for users who need a stronger draft before legal review. They are especially useful when creators, collectives, or organizations are being asked to sign quickly and need better boundary language."
      statLabel="Best for"
      statValue="Artists, collectives, cultural managers, and community administrators"
      guidance="Treat templates as a stronger starting point, not the final legal answer. Use them to improve the baseline, then review with a specialist when the stakes are high."
      kind="template"
    />
  );
}
