import Link from 'next/link';
import { notFound } from 'next/navigation';
import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import { MaterialCard } from '@/app/materials-tools/components/MaterialsToolsCards';
import ProductOrderPanel from '@/app/materials-tools/components/ProductOrderPanel';
import { getOriginStoryByProductId, getProductById, products } from '@/app/materials-tools/data/pillar10Data';

export default async function MaterialProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const item = getProductById(productId);
  if (!item) notFound();
  const story = getOriginStoryByProductId(productId);

  return (
    <MaterialsToolsFrame title={item.title} subtitle={`${item.supplierName} • ${item.nation} • ${item.leadTime}`}>
      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="overflow-hidden rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09]">
          <img src={item.image} alt={item.title} className="h-[420px] w-full object-cover" />
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Listing snapshot</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{item.title}</h2>
          <p className="mt-4 text-sm leading-7 text-[#d7f0f2]">{item.summary}</p>
          <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d7f0f2]">
            <div className="flex items-center justify-between"><span>Price</span><span className="text-[#f4c766]">${item.price} {item.currency}</span></div>
            <div className="flex items-center justify-between"><span>Stock</span><span className="text-white">{item.stockLabel}</span></div>
            <div className="flex items-center justify-between"><span>Lead time</span><span className="text-white">{item.leadTime}</span></div>
            <div className="flex items-center justify-between"><span>Origin</span><span className="text-white">{item.traceability.originRegion}</span></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="#order-panel" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">
              Request Quote
            </Link>
            <Link href={`/materials-tools/origin/${item.id}`} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">
              Open origin story
            </Link>
            <Link href="/materials-tools/wishlist" className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">
              Request alternate lot
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">About this material / tool</p>
          <p className="mt-4 text-sm leading-7 text-[#d5cab8]">This listing now moves beyond catalog copy. It gives buyers enough sourcing, protocol, and freight context to turn a studio need into a trackable order.</p>
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Traceability</p>
          <div className="mt-4 space-y-3 text-sm text-[#d7f0f2]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Harvest date: {item.traceability.harvestDate}</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Method: {item.traceability.method}</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Origin story: {item.traceability.qrLabel}</div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Origin batch narrative</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{story?.originTitle || 'Batch-linked provenance record ready'}</h3>
          <p className="mt-4 text-sm leading-7 text-[#d5cab8]">
            {story?.originSummary || 'Every materials listing should move with enough provenance and chain-of-custody context that buyers can trust what they are sourcing.'}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">
              Batch code
              <div className="mt-2 text-white">{story?.batchCode || 'Preview batch'}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">
              Steward
              <div className="mt-2 text-white">{story?.stewardName || item.supplierName}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">
              QR destination
              <div className="mt-2 text-white">{story?.qrDestinationLabel || item.traceability.qrLabel}</div>
            </div>
          </div>
        </article>
        <ProductOrderPanel productId={item.id} leadTime={item.leadTime} unitPrice={item.price} />
      </section>

      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Related listings</h3>
          <Link href="/materials-tools/marketplace" className="text-xs text-[#9fe5ea] hover:underline">Back to marketplace</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {products.filter((product) => product.id !== item.id).slice(0, 3).map((product) => <MaterialCard key={product.id} item={product} />)}
        </div>
      </section>
    </MaterialsToolsFrame>
  );
}
