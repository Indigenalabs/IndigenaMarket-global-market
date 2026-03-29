import Link from 'next/link';

type HeroAction = {
  href: string;
  label: string;
  tone?: 'primary' | 'secondary';
};

export default function MaterialsToolsHero({
  eyebrow,
  title,
  description,
  image,
  chips,
  actions,
  premiumLabel
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  chips: string[];
  actions: HeroAction[];
  premiumLabel?: string;
}) {
  return (
    <section className="grid gap-4 overflow-hidden rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] lg:grid-cols-[1.15fr,0.85fr]">
      <div className="p-6 md:p-8 lg:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[#f2cb7d]">
          <span>{eyebrow}</span>
          {premiumLabel ? <span className="text-[#8fd7dc]">{premiumLabel}</span> : null}
        </div>
        <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">{title}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d7cbbb] md:text-base">{description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-[#efe4d2]">
              {chip}
            </span>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={action.tone === 'secondary'
                ? 'rounded-full border border-[#9b6b2b]/35 px-5 py-2.5 text-sm font-medium text-[#e3be83] transition hover:bg-[#9b6b2b]/12'
                : 'rounded-full bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f0c96f]'}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="relative min-h-[320px] border-t border-[#9b6b2b]/20 lg:border-l lg:border-t-0">
        <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/20 to-black/75" />
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-[#8fd7dc]">Marketplace thesis</p>
          <p className="mt-2 text-sm text-[#f5ead7]">Close the loop from harvest and fabrication to finished artwork, with trust signals visible at every step.</p>
        </div>
      </div>
    </section>
  );
}

