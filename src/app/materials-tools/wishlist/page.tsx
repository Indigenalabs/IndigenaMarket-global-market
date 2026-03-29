import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import MaterialsToolsActionPanel from '@/app/materials-tools/components/MaterialsToolsActionPanel';
import MaterialsToolsPremiumPlacementCard from '@/app/materials-tools/components/MaterialsToolsPremiumPlacementCard';
import { MATERIALS_TOOLS_PLACEMENTS } from '@/app/materials-tools/components/premiumPlacements';

export default function WishlistPage() {
  return (
    <MaterialsToolsFrame title="Material Sourcing Wishlist" subtitle="Post what your studio needs so suppliers and co-ops can respond with stock, substitutes, or custom runs.">
      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Wishlist marketplace</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Turn unmet demand into visible sourcing opportunities.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d5cab8]">Artists can post exactly what they are seeking, including quantity, material constraints, and protocol needs. Suppliers and co-op organizers can then respond with listings, custom bundles, or pooled runs.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {MATERIALS_TOOLS_PLACEMENTS.slice(0, 3).map((placement) => (
          <MaterialsToolsPremiumPlacementCard key={placement.id} title={placement.title} headline={placement.headline} copy={placement.copy} image={placement.image} href="/materials-tools/wishlist" />
        ))}
      </section>
      <MaterialsToolsActionPanel variant="wishlist" title="New sourcing wishlist post" />
    </MaterialsToolsFrame>
  );
}
