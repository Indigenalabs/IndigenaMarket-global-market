import Link from 'next/link';
import { categoryMeta, getProductsForCategory, type MaterialsToolsCategoryId } from '@/app/materials-tools/data/pillar10Data';
import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import { MaterialCard } from '@/app/materials-tools/components/MaterialsToolsCards';

export default function CategoryPageShell({
  categoryId,
  title,
  overview,
  nextHref,
  nextLabel
}: {
  categoryId: MaterialsToolsCategoryId;
  title?: string;
  overview: string;
  nextHref: string;
  nextLabel: string;
}) {
  const meta = categoryMeta[categoryId];
  const items = getProductsForCategory(categoryId);

  return (
    <MaterialsToolsFrame title={title || meta.label} subtitle={meta.description}>
      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <article className="overflow-hidden rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09]">
          <img src={meta.image} alt={meta.label} className="h-64 w-full object-cover" />
          <div className="space-y-4 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Category overview</p>
            <h2 className="text-3xl font-semibold text-white">{title || meta.label}</h2>
            <p className="text-sm leading-7 text-[#d5cab8]">{overview}</p>
          </div>
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Best for</p>
          <div className="mt-4 space-y-3 text-sm text-[#d7f0f2]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Studios sourcing traceable inputs with protocol-aware origin stories.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Educators or co-ops trying to buy consistently without generic wholesale suppliers.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Artists who need context, substitutions, and supplier trust before placing an order.</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/materials-tools/marketplace" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">Browse Marketplace</Link>
            <Link href={nextHref} className="rounded-full border border-[#1d6b74]/40 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">{nextLabel}</Link>
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Listings in this category</h3>
          <span className="text-xs text-[#bcae99]">{items.length} live mock listings</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => <MaterialCard key={item.id} item={item} />)}
        </div>
      </section>
    </MaterialsToolsFrame>
  );
}

