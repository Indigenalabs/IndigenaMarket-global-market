import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';

export default function ArtistPortfolioDashboardPage() {
  return (
    <DigitalArtsFrame title="Artist Portfolio Dashboard" subtitle="Manage listings, analytics, drops, and collector communications.">
      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Active Listings', value: '18' },
          { label: 'Current Bids', value: '7' },
          { label: 'Weekly Revenue', value: '2,940 INDI' },
          { label: 'Follower Growth', value: '+6.2%' }
        ].map((item) => (
          <article key={item.label} className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">Listing Pipeline</h3>
          <div className="mt-4 space-y-3">
            {[
              ['Draft', '4'],
              ['Awaiting Moderation', '2'],
              ['Scheduled Drops', '3'],
              ['Live Auctions', '5']
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm">
                <span className="text-gray-300">{label}</span>
                <span className="text-[#d4af37]">{value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">Collector Activity Feed</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">A collector saved <span className="text-white">Ancestor Pulse</span> to watchlist.</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">New licensing inquiry for <span className="text-white">River Song Motion Set</span>.</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Bid increased on <span className="text-white">Totem City XR</span> to 570 INDI.</p>
          </div>
        </article>
      </section>
    </DigitalArtsFrame>
  );
}

