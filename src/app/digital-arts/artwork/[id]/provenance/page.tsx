import Link from 'next/link';
import { getArtworkById, getArtistById } from '@/app/digital-arts/data/pillar1Showcase';
import { findXrplTrustRecordByAsset } from '@/app/lib/xrplTrustLayer';

export default async function ArtworkProvenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artwork = getArtworkById(id);
  const artist = getArtistById(artwork.artistId);
  const trustRecord = await findXrplTrustRecordByAsset({
    assetType: 'digital_art',
    assetId: id,
    trustType: 'provenance'
  }).catch(() => null);

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[28px] border border-[#d4af37]/20 bg-[#101010] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Phase 7 XRPL trust layer</p>
          <h1 className="mt-3 text-3xl font-semibold">Digital art provenance</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">
            Public trust record for {artwork.title} by {artist.name}. This page exposes the XRPL provenance anchor,
            token linkage, and artwork ownership proof without requiring admin access.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/digital-arts/artwork/${id}`}
              className="rounded-full border border-[#d4af37]/30 px-4 py-2 text-sm text-[#f3deb1] hover:bg-[#d4af37]/10"
            >
              Back to artwork
            </Link>
            <div className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white">
              {trustRecord?.status || 'pending'}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <article className="overflow-hidden rounded-[28px] border border-[#d4af37]/20 bg-[#101010]">
            <img src={artwork.image} alt={artwork.title} className="h-[420px] w-full object-cover" />
          </article>
          <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101010] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Artwork</p>
            <h2 className="mt-2 text-2xl font-semibold">{artwork.title}</h2>
            <p className="mt-2 text-sm text-gray-400">
              {artist.name} · {artwork.nation} · {artwork.mediaType}
            </p>
            <p className="mt-4 text-sm leading-7 text-gray-300">{artwork.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Proof label="Edition" value={artwork.edition} />
              <Proof label="Price" value={`${artwork.price} INDI`} />
              <Proof label="Views" value={artwork.views.toLocaleString()} />
              <Proof label="Trust type" value={trustRecord?.trustType || 'provenance'} />
            </div>
          </article>
        </section>

        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101010] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">XRPL Provenance</p>
          <h2 className="mt-2 text-2xl font-semibold">Public trust record</h2>
          <p className="mt-3 text-sm leading-7 text-gray-300">
            {trustRecord
              ? 'This artwork has an anchored public trust record that can be used for provenance, authenticity review, and collector-side verification.'
              : 'This artwork does not have a published trust record yet.'}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Proof label="Trust record" value={trustRecord?.id || 'Not linked yet'} />
            <Proof label="XRPL transaction" value={trustRecord?.xrplTransactionHash || 'Pending anchor'} />
            <Proof label="Token ID" value={trustRecord?.xrplTokenId || 'Pending token'} />
            <Proof label="Ledger index" value={trustRecord?.xrplLedgerIndex || 'Pending ledger'} />
            <Proof label="Anchor URI" value={trustRecord?.anchorUri || 'Pending anchor URI'} />
            <Proof label="Status" value={trustRecord?.status || 'pending'} />
          </div>
        </section>
      </div>
    </main>
  );
}

function Proof({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 break-all text-sm text-white">{value}</p>
    </div>
  );
}
