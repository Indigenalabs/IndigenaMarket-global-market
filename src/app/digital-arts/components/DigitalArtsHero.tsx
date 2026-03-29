import Link from 'next/link';

type Action = { href: string; label: string; tone?: 'primary' | 'secondary' };

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  chips?: string[];
  actions?: Action[];
  premiumLabel?: string;
};

export default function DigitalArtsHero({
  eyebrow,
  title,
  description,
  image,
  chips = [],
  actions = [],
  premiumLabel = 'Sponsored Feature'
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#d4af37]/25 bg-[#101010]">
      <div className="relative min-h-[320px] md:min-h-[380px]">
        <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/35" />
        <div className="absolute left-0 top-0 rounded-br-xl border-b border-r border-[#d4af37]/45 bg-black/70 px-3 py-1.5 text-xs font-medium text-[#d4af37]">
          {premiumLabel}
        </div>
        <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">{eyebrow}</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold text-white md:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm text-gray-200 md:text-base">{description}</p>
          {chips.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs text-gray-100">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          {actions.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {actions.map((action) => (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className={
                    action.tone === 'secondary'
                      ? 'rounded-full border border-[#d4af37]/40 bg-black/30 px-4 py-2 text-sm text-[#d4af37] transition-colors hover:bg-[#d4af37]/10'
                      : 'rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#f4d370]'
                  }
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

