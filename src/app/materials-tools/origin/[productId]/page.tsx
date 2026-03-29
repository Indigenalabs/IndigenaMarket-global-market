import Link from 'next/link';
import { notFound } from 'next/navigation';
import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import { getOriginStoryByProductId, getProductById } from '@/app/materials-tools/data/pillar10Data';

export default async function OriginStoryPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = getProductById(productId);
  const story = getOriginStoryByProductId(productId);
  if (!product || !story) notFound();

  return (
    <MaterialsToolsFrame title={`${product.title} Origin Story`} subtitle={`${story.batchCode} • ${story.stewardName}`}>
      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="overflow-hidden rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09]">
          <img src={product.image} alt={product.title} className="h-[420px] w-full object-cover" />
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Traceability destination</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{story.originTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-[#d7f0f2]">{story.originSummary}</p>
          <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d7f0f2]">
            <div className="flex items-center justify-between"><span>Batch code</span><span className="text-white">{story.batchCode}</span></div>
            <div className="flex items-center justify-between"><span>Harvest region</span><span className="text-white">{product.traceability.originRegion}</span></div>
            <div className="flex items-center justify-between"><span>Harvest date</span><span className="text-white">{product.traceability.harvestDate}</span></div>
            <div className="flex items-center justify-between"><span>QR destination</span><span className="text-[#f4c766]">{story.qrDestinationLabel}</span></div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Stewardship protocol</p>
          <p className="mt-4 text-sm leading-7 text-[#d5cab8]">{story.stewardshipProtocol}</p>
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Proof documents</p>
          <div className="mt-4 space-y-3">
            {story.proofDocuments.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d7f0f2]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.fileName || 'origin-proof-document'} {item.mimeType ? `• ${item.mimeType}` : ''}</p>
                  </div>
                  {item.downloadPath ? (
                    <Link href={item.downloadPath} className="rounded-full border border-[#1d6b74]/35 px-3 py-2 text-xs text-[#9fe5ea] hover:bg-[#1d6b74]/10">
                      Open file
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Chain of custody</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {story.chainOfCustody.map((item, index) => (
            <article key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">Step {index + 1}</p>
              <p className="mt-3 text-sm leading-7 text-[#d5cab8]">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Link href={`/materials-tools/product/${product.id}`} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">
          Back to listing
        </Link>
        <Link href="/materials-tools/orders" className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">
          View purchase ledger
        </Link>
      </section>
    </MaterialsToolsFrame>
  );
}
