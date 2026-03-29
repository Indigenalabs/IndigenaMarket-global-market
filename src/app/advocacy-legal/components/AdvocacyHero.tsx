import Link from 'next/link';

export default function AdvocacyHero({
  title,
  description,
  image,
  ctaPrimary = '/advocacy-legal/marketplace',
  ctaSecondary = '/advocacy-legal/emergency-defense-fund',
  premiumLabel
}: {
  title: string;
  description: string;
  image: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  premiumLabel?: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#d4af37]/25 bg-[#111112]">
      <div className="relative min-h-[320px] md:min-h-[380px]">
        <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />
        {premiumLabel ? (
          <div className="absolute left-0 top-0 rounded-br-xl border-b border-r border-[#d4af37]/45 bg-black/70 px-3 py-1.5 text-xs text-[#d4af37]">
            {premiumLabel}
          </div>
        ) : null}
        <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Rights. Protection. Sovereignty.</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold text-white md:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm text-gray-200 md:text-base">{description}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href={ctaPrimary} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
              Explore Services
            </Link>
            <Link href={ctaSecondary} className="rounded-full border border-[#d4af37]/40 bg-black/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
              Emergency Fund
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

