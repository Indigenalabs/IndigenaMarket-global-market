const PARTNERS: Record<string, { name: string; category: string; summary: string; offer: string }> = {
  indigenouscraftsupply: {
    name: 'IndigenousCraft Supply',
    category: 'Craft Supplier',
    summary: 'Ethically sourced raw materials, supply kits, and replenishment support for verified makers.',
    offer: 'Platform makers can request inventory support through the logistics workspace.'
  },
  artpack: {
    name: 'ArtPack Indigenous',
    category: 'Packaging Partner',
    summary: 'Protective packaging kits, story-card inserts, and archival-safe materials for shipping cultural goods.',
    offer: 'Packaging bundles are available through logistics and physical ventures operations.'
  },
  nativetoolworks: {
    name: 'NativeToolworks',
    category: 'Toolmaker',
    summary: 'Traditional and modern tools for beadwork, carving, pottery, and weaving workflows.',
    offer: 'Tool bundles can be sourced through materials, logistics, and creator hub operations.'
  }
};

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = PARTNERS[slug] || {
    name: 'Platform Partner',
    category: 'Approved Vendor',
    summary: 'Partner detail page for approved maker supply and packaging vendors.',
    offer: 'Contact platform operations for partner setup details.'
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#d4af37]/20 bg-[#141414] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">{partner.category}</p>
        <h1 className="mt-4 text-4xl font-semibold">{partner.name}</h1>
        <p className="mt-5 text-base leading-8 text-gray-300">{partner.summary}</p>
        <div className="mt-8 rounded-2xl border border-[#d4af37]/15 bg-[#0a0a0a] p-5 text-sm text-gray-300">
          {partner.offer}
        </div>
      </div>
    </main>
  );
}
