import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import { MaterialCard } from '@/app/materials-tools/components/MaterialsToolsCards';
import { products } from '@/app/materials-tools/data/pillar10Data';

export default function SurplusMarketplacePage() {
  return (
    <MaterialsToolsFrame title="Surplus Marketplace" subtitle="Artist-to-artist resale for excess materials, unopened supply runs, and studio gear.">
      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Surplus exchange</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Keep useful materials in circulation instead of letting them go dormant on shelves.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d5cab8]">This marketplace helps artists re-home extra materials and equipment within the same creative economy, reducing waste while making supply access easier for other makers.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(0, 4).map((item) => <MaterialCard key={item.id} item={item} />)}
      </section>
    </MaterialsToolsFrame>
  );
}

