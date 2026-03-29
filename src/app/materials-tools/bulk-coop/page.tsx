import Link from 'next/link';
import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import { CoopShowcase } from '@/app/materials-tools/components/MaterialsToolsCards';
import MaterialsToolsPremiumPlacementCard from '@/app/materials-tools/components/MaterialsToolsPremiumPlacementCard';
import MaterialsToolsActionPanel from '@/app/materials-tools/components/MaterialsToolsActionPanel';
import { MATERIALS_TOOLS_PLACEMENTS } from '@/app/materials-tools/components/premiumPlacements';

export default function BulkCoopPage() {
  return (
    <MaterialsToolsFrame title="Bulk Buying Co-op" subtitle="Collective purchasing for artists, studios, schools, and community production hubs.">
      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Co-op portal</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Lower costs through grouped demand, not isolated orders.</h2>
          <p className="mt-4 text-sm leading-7 text-[#d5cab8]">The co-op portal helps artists combine demand for beads, loom parts, packaging, and other high-friction inputs so pricing, freight, and minimum order requirements become more manageable.</p>
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">What you can do here</p>
          <div className="mt-4 space-y-3 text-sm text-[#d7f0f2]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Join a live group order already building momentum.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Start a new order around a category your studio needs repeatedly.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Track commitments and order deadlines before procurement closes.</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/materials-tools/coop-dashboard" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">Open co-op dashboard</Link>
            <Link href="/materials-tools/wishlist" className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">Post demand wishlist</Link>
          </div>
        </article>
      </section>
      <CoopShowcase />
      <section className="grid gap-4 md:grid-cols-3">
        {MATERIALS_TOOLS_PLACEMENTS.slice(5, 7).map((placement) => (
          <MaterialsToolsPremiumPlacementCard key={placement.id} title={placement.title} headline={placement.headline} copy={placement.copy} image={placement.image} href="/materials-tools/bulk-coop" />
        ))}
      </section>
      <MaterialsToolsActionPanel variant="coop-commit" title="Co-op order commitment" />
    </MaterialsToolsFrame>
  );
}
