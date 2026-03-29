import Link from 'next/link';

type Item = {
  title: string;
  meta?: string;
  href?: string;
  badge?: string;
  actionLabel?: string;
};

type Props = {
  title: string;
  items: Item[];
  columns?: 2 | 3 | 4;
};

export default function HeritageCardGrid({ title, items, columns = 4 }: Props) {
  const colClass = columns === 4 ? 'md:grid-cols-2 xl:grid-cols-4' : columns === 3 ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2';

  return (
    <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#d4af37]">{title}</h2>
      <div className={`grid gap-3 ${colClass}`}>
        {items.map((item, index) => {
          const body = (
            <div
              className="fade-up-in group relative overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0b] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4af37]/30"
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <div className="pointer-events-none absolute -right-10 -top-8 h-20 w-20 rounded-full bg-[#d4af37]/10 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                {item.badge ? (
                  <span className="inline-flex rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d4af37]">
                    {item.badge}
                  </span>
                ) : null}
                <p className="mt-1 text-sm font-medium text-white">{item.title}</p>
                {item.meta ? <p className="mt-1 text-xs text-gray-400">{item.meta}</p> : null}
                {item.actionLabel ? <p className="mt-3 text-xs font-medium text-[#d4af37]">{item.actionLabel}</p> : null}
              </div>
            </div>
          );
          return item.href ? (
            <Link key={`${item.title}-${item.href}`} href={item.href}>{body}</Link>
          ) : (
            <div key={item.title}>{body}</div>
          );
        })}
      </div>
    </section>
  );
}
