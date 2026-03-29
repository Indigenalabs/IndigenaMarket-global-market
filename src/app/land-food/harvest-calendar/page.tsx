import LandFoodFrame from '../components/LandFoodFrame';
import { products, seasonOrder, seasonalAvailabilityMap } from '../data/pillar8Data';

export default function HarvestCalendarPage() {
  const availability = seasonalAvailabilityMap();
  return (
    <LandFoodFrame title="Harvest Calendar & Seasonal Availability" subtitle="Track seasonal product windows and forecast supply.">
      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Seasonal Supply Heatmap</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {availability.map((entry) => (
            <article key={entry.month} className="rounded-lg border border-white/10 bg-black/25 p-3 text-center">
              <p className="text-xs text-gray-400">{entry.month}</p>
              <p className="mt-1 text-lg font-semibold text-white">{entry.activeListings}</p>
              <p className="text-[11px] text-[#d4af37]">active listings</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Product Season Matrix</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-white/10 bg-black/30 px-3 py-2 text-left text-gray-300">Product</th>
                {seasonOrder.map((m) => (
                  <th key={m} className="border border-white/10 bg-black/30 px-2 py-2 text-gray-400">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="border border-white/10 px-3 py-2 text-white">{product.title}</td>
                  {seasonOrder.map((m) => {
                    const active = product.seasonalMonths.includes(m);
                    return (
                      <td key={`${product.id}-${m}`} className="border border-white/10 px-2 py-2 text-center">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-white/15'}`} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LandFoodFrame>
  );
}
