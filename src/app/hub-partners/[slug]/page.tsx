const PARTNERS: Record<string, { name: string; category: string; summary: string; cta: string }> = {
  nativeship: {
    name: 'NativeShip Pro',
    category: 'Logistics Partner',
    summary: 'Hub-to-hub shipping support for maker inventory, relay fulfillment, and domestic dispatch.',
    cta: 'Apply the offer in the logistics workspace.'
  },
  fedex: {
    name: 'FedEx Indigenous',
    category: 'International Shipping',
    summary: 'Cross-border shipping support for cultural goods with customs documentation guidance.',
    cta: 'Review cross-border coverage in logistics.'
  },
  craftinsure: {
    name: 'CraftInsure',
    category: 'Insurance Partner',
    summary: 'Transit coverage for fragile and high-value cultural goods moving through platform logistics.',
    cta: 'Start a protection quote from logistics.'
  },
  hubexpress: {
    name: 'HubExpress',
    category: 'Express Relay',
    summary: 'Fast-track routing between regional hubs for time-sensitive orders and event inventory.',
    cta: 'Book express handling in logistics.'
  }
};

export default async function HubPartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = PARTNERS[slug] || {
    name: 'Hub Partner',
    category: 'Operations Partner',
    summary: 'Partner detail page for platform logistics, insurance, and fulfillment support.',
    cta: 'Contact platform operations for setup.'
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#d4af37]/20 bg-[#141414] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">{partner.category}</p>
        <h1 className="mt-4 text-4xl font-semibold">{partner.name}</h1>
        <p className="mt-5 text-base leading-8 text-gray-300">{partner.summary}</p>
        <div className="mt-8 rounded-2xl border border-[#d4af37]/15 bg-[#0a0a0a] p-5 text-sm text-gray-300">
          {partner.cta}
        </div>
      </div>
    </main>
  );
}
