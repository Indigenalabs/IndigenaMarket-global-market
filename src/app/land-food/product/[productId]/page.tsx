import Link from 'next/link';
import LandFoodFrame from '../../components/LandFoodFrame';
import LandFoodQuickPurchasePanel from '../../components/LandFoodQuickPurchasePanel';
import { getProduct, getProducer } from '../../data/pillar8Data';

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = getProduct(productId);
  const producer = getProducer(product.producerId);

  const communityShare = Math.round(product.price * (product.stewardshipSharePercent / 100));
  const platformAndOps = Math.round(product.price - communityShare);

  return (
    <LandFoodFrame title={product.title} subtitle={`${product.nation} • ${product.producerName}`}>
      <section className="grid gap-5 lg:grid-cols-[1.4fr,1fr]">
        <article className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#10110f]">
          <img src={product.image} alt={product.title} className="h-[420px] w-full object-cover" />
        </article>
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">Product Detail • Premium Slot</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{product.title}</h2>
          <p className="mt-2 text-sm text-gray-300">{product.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {product.certifications.map((badge) => (
              <span key={badge} className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-gray-300">{badge}</span>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-300">
            <p>Price: <span className="text-[#d4af37]">${product.price} {product.currency}</span></p>
            <p>Availability: <span className="text-white">{product.stockLabel}</span></p>
            <p>Harvest Window: <span className="text-white">{product.harvestWindow}</span></p>
            <p>Verification: <span className="text-white">{product.verificationTier} tier</span></p>
          </div>
          <div className="mt-4">
            <LandFoodQuickPurchasePanel
              productId={product.id}
              productTitle={product.title}
              price={product.price}
              currency={product.currency}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/land-food/wholesale-inquiry" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Wholesale Inquiry</Link>
            <Link href="/land-food/food-sovereignty-donation" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">Support Food Programs</Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Traceability + Origin</h3>
          <div className="mt-3 space-y-2 text-sm text-gray-300">
            <p>Lot Code: <span className="text-white">{product.traceability.lotCode}</span></p>
            <p>Harvest Region: <span className="text-white">{product.traceability.harvestRegion}</span></p>
            <p>Method: <span className="text-white">{product.traceability.harvestingMethod}</span></p>
            <p>Seasonal Months: <span className="text-white">{product.seasonalMonths.join(', ')}</span></p>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
            <div className="mx-auto grid h-32 w-32 place-content-center rounded-lg border border-dashed border-[#d4af37]/40 bg-[#0b0c0a] text-center text-[11px] text-[#d4af37]">
              QR
              <br />
              {product.traceability.qrCodeLabel}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Regenerative Payment Split</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="mb-1 flex items-center justify-between text-gray-300">
                <span>Community stewardship share</span>
                <span className="text-emerald-300">${communityShare}</span>
              </div>
              <div className="h-2 rounded-full bg-black/40">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${product.stewardshipSharePercent}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-gray-300">
                <span>Operations + fulfillment</span>
                <span className="text-white">${platformAndOps}</span>
              </div>
              <div className="h-2 rounded-full bg-black/40">
                <div className="h-full rounded-full bg-[#d4af37]" style={{ width: `${100 - product.stewardshipSharePercent}%` }} />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">Designed for direct-to-community economics with transparent contribution logic.</p>
        </article>
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
        <div className="flex items-center gap-3">
          <img src={producer.avatar} alt={producer.name} className="h-14 w-14 rounded-full object-cover" />
          <div>
            <p className="text-lg font-semibold text-white">{producer.name}</p>
            <p className="text-sm text-gray-400">{producer.region}</p>
          </div>
          <Link href={`/land-food/producer/${producer.id}`} className="ml-auto rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">View Producer Profile</Link>
        </div>
      </section>
    </LandFoodFrame>
  );
}
