import AdvocacyFrame from '../components/AdvocacyFrame';
import { AttorneyCard } from '../components/AdvocacyCards';
import type { Attorney } from '@/app/advocacy-legal/data/pillar9Data';

type CategoryPageShellProps = {
  title: string;
  subtitle: string;
  eyebrow: string;
  description: string;
  bestFor: string[];
  guidance: string[];
  filtered: Attorney[];
};

export default function CategoryPageShell({
  title,
  subtitle,
  eyebrow,
  description,
  bestFor,
  guidance,
  filtered
}: CategoryPageShellProps) {
  return (
    <AdvocacyFrame title={title} subtitle={subtitle}>
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.97),rgba(10,10,10,0.97))] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <p className="text-xs uppercase tracking-[0.34em] text-[#d4af37]/70">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">{title}</h2>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-gray-300">{description}</p>
        </article>

        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_58%),#101112] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.34em] text-[#d4af37]/70">How To Use This Page</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]/65">Best For</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-gray-200">
                {bestFor.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]/65">Selection Guide</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-gray-200">
                {guidance.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <AttorneyCard key={item.id} item={item} />
        ))}
      </section>
    </AdvocacyFrame>
  );
}
