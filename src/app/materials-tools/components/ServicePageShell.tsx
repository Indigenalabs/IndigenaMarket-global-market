import Link from 'next/link';
import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import { ServiceShowcase } from '@/app/materials-tools/components/MaterialsToolsCards';

export default function ServicePageShell({
  title,
  subtitle,
  overview,
  primaryHref,
  primaryLabel
}: {
  title: string;
  subtitle: string;
  overview: string;
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <MaterialsToolsFrame title={title} subtitle={subtitle}>
      <section className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Service overview</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-[#d5cab8]">{overview}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={primaryHref} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">{primaryLabel}</Link>
            <Link href="/materials-tools/marketplace" className="rounded-full border border-[#9b6b2b]/35 px-4 py-2 text-sm text-[#f0d7aa] hover:bg-[#9b6b2b]/12">Browse everything</Link>
          </div>
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">How it helps</p>
          <div className="mt-4 space-y-3 text-sm text-[#d7f0f2]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Reduces supply friction for artists who cannot carry every tool or material cost alone.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Builds a shared supplier memory with trusted maintenance, sourcing, and cooperative buying routes.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Keeps more spending inside Indigenous maker networks instead of leaking to generic suppliers.</div>
          </div>
        </article>
      </section>

      <ServiceShowcase />
    </MaterialsToolsFrame>
  );
}

