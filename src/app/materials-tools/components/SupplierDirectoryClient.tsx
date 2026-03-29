'use client';

import { useEffect, useState } from 'react';
import { SupplierCard } from '@/app/materials-tools/components/MaterialsToolsCards';
import MaterialsToolsPremiumPlacementCard from '@/app/materials-tools/components/MaterialsToolsPremiumPlacementCard';
import { MATERIALS_TOOLS_PLACEMENTS } from '@/app/materials-tools/components/premiumPlacements';
import { suppliers, type Supplier } from '@/app/materials-tools/data/pillar10Data';
import { fetchMaterialsToolsSuppliers } from '@/app/lib/materialsToolsApi';

export default function SupplierDirectoryClient() {
  const [items, setItems] = useState<Supplier[]>(suppliers);
  const [source, setSource] = useState<'api' | 'mock'>('mock');

  useEffect(() => {
    let mounted = true;
    void fetchMaterialsToolsSuppliers('', 1, 24).then((page) => {
      if (!mounted) return;
      setItems(page.items);
      setSource(page.source);
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Supplier directory</h3>
          <span className="text-xs text-[#bcae99]">Source: {source === 'api' ? 'Live API' : 'Mock fallback'}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => <SupplierCard key={item.id} item={item} />)}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {MATERIALS_TOOLS_PLACEMENTS.slice(2, 5).map((placement) => (
          <MaterialsToolsPremiumPlacementCard key={placement.id} title={placement.title} headline={placement.headline} copy={placement.copy} image={placement.image} href="/materials-tools/suppliers" />
        ))}
      </section>
    </>
  );
}
