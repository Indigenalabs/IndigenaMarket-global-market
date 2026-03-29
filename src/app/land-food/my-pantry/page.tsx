import Link from 'next/link';
import LandFoodFrame from '../components/LandFoodFrame';
import { ProductCard } from '../components/LandFoodCards';
import { products } from '../data/pillar8Data';

export default function MyPantryPage() {
  return (
    <LandFoodFrame title="My Pantry / Order History" subtitle="Track repeat purchases, deliveries, and seasonal restocks.">
      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Orders', '24'],
          ['Monthly Spend', '$418'],
          ['Favorite Producers', '3'],
          ['Seasonal Alerts', '5']
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-4"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-xl text-white">{value}</p></article>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{products.map((p) => <ProductCard key={p.id} item={p} />)}</section>
      <Link href="/land-food/harvest-calendar" className="inline-block rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">Open Harvest Calendar</Link>
    </LandFoodFrame>
  );
}
