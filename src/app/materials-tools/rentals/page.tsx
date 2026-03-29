import Link from 'next/link';
import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import { RentalCard } from '@/app/materials-tools/components/MaterialsToolsCards';
import MaterialsToolsPremiumPlacementCard from '@/app/materials-tools/components/MaterialsToolsPremiumPlacementCard';
import MaterialsToolsActionPanel from '@/app/materials-tools/components/MaterialsToolsActionPanel';
import { MATERIALS_TOOLS_PLACEMENTS } from '@/app/materials-tools/components/premiumPlacements';
import { rentals } from '@/app/materials-tools/data/pillar10Data';

export default function ToolRentalDirectoryPage() {
  return (
    <MaterialsToolsFrame title="Tool Rental & Lending Libraries" subtitle="High-cost equipment access through community hubs, maker spaces, and library-style networks.">
      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Tool library directory</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Rent what you need before you carry the full ownership cost.</h2>
          <p className="mt-4 text-sm leading-7 text-[#d5cab8]">Tool libraries make expensive studio infrastructure reachable. This page helps artists compare hubs by equipment type, access model, and booking availability.</p>
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Good fit for</p>
          <div className="mt-4 space-y-3 text-sm text-[#d7f0f2]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Artists testing a new medium before a major equipment purchase.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Communities wanting a shared equipment strategy instead of duplicated costs.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Studios needing occasional access to kilns, presses, scanners, or bench bundles.</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/materials-tools/tool-library-application" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">Apply for membership</Link>
            <Link href="/materials-tools/rental-steward-dashboard" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">Open steward dashboard</Link>
            <Link href="/materials-tools/marketplace" className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">Back to marketplace</Link>
          </div>
        </article>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {rentals.map((item) => <RentalCard key={item.id} item={item} />)}
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MATERIALS_TOOLS_PLACEMENTS.slice(4, 7).map((placement) => (
          <MaterialsToolsPremiumPlacementCard key={placement.id} title={placement.title} headline={placement.headline} copy={placement.copy} image={placement.image} href="/materials-tools/rentals" />
        ))}
      </section>
      <MaterialsToolsActionPanel variant="tool-library" title="Tool library membership application" />
    </MaterialsToolsFrame>
  );
}
