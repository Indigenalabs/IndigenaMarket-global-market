import Link from 'next/link';
import { notFound } from 'next/navigation';
import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import { MaterialCard, RentalCard } from '@/app/materials-tools/components/MaterialsToolsCards';
import { getOriginStoryByProductId, getSupplierById, products, rentals } from '@/app/materials-tools/data/pillar10Data';

export default async function SupplierProfilePage({ params }: { params: Promise<{ supplierId: string }> }) {
  const { supplierId } = await params;
  const supplier = getSupplierById(supplierId);
  if (!supplier) notFound();

  const supplierProducts = products.filter((item) => item.supplierId === supplier.id);
  const matchingRentals = rentals.filter((item) => item.hubName === supplier.name);

  return (
    <MaterialsToolsFrame title={supplier.name} subtitle={`${supplier.nation} • ${supplier.region}`}>
      <section className="overflow-hidden rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09]">
        <img src={supplier.cover} alt={supplier.name} className="h-72 w-full object-cover" />
        <div className="grid gap-4 p-6 lg:grid-cols-[0.8fr,1.2fr]">
          <div className="flex items-start gap-4">
            <img src={supplier.avatar} alt={supplier.name} className="h-24 w-24 rounded-full object-cover" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Supplier profile</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{supplier.name}</h2>
              <p className="mt-3 text-sm leading-7 text-[#d5cab8]">{supplier.bio}</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">Response time: <span className="text-white">{supplier.responseTime}</span></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">Fulfillment score: <span className="text-[#9fe5ea]">{supplier.fulfillmentScore}</span></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">Specialties: <span className="text-white">{supplier.specialties.join(', ')}</span></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">Verification: <span className="text-[#f4c766]">{supplier.verificationTier}</span></div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {supplierProducts.map((item) => <MaterialCard key={item.id} item={item} />)}
      </section>

      <section className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8fd7dc]">Traceability and proof lanes</h3>
          <span className="text-xs text-[#d7f0f2]">System-linked origin records</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {supplierProducts.slice(0, 4).map((item) => {
            const story = getOriginStoryByProductId(item.id);
            return (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-base font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.traceability.originRegion} • {item.traceability.harvestDate}</p>
                <p className="mt-3 text-sm text-[#d7f0f2]">
                  {story ? `${story.batchCode} • ${story.proofDocuments.length} proof documents ready for batch review.` : 'Origin record available from the listing traceability lane.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/materials-tools/origin/${item.id}`} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">
                    Open origin record
                  </Link>
                  <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-[#d5cab8]">{item.certifications.join(', ')}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {matchingRentals.length > 0 ? <section className="grid gap-4 md:grid-cols-3">{matchingRentals.map((item) => <RentalCard key={item.id} item={item} />)}</section> : null}

      <section className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-5">
        <div className="flex flex-wrap gap-2">
          <Link href="/materials-tools/verified-supplier-application" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">Apply as supplier</Link>
          <Link href="/materials-tools/marketplace" className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">Back to marketplace</Link>
        </div>
      </section>
    </MaterialsToolsFrame>
  );
}

