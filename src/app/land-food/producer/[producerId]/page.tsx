import LandFoodFrame from '../../components/LandFoodFrame';
import { ProducerCard, ProductCard } from '../../components/LandFoodCards';
import { getProducer, products } from '../../data/pillar8Data';

export default async function ProducerProfilePage({ params }: { params: Promise<{ producerId: string }> }) {
  const { producerId } = await params;
  const producer = getProducer(producerId);
  const listings = products.filter((p) => p.producerId === producer.id);

  return (
    <LandFoodFrame title={producer.name} subtitle={`${producer.nation} • ${producer.region}`}>
      <section className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#10110f]">
        <div className="relative h-[320px]">
          <img src={producer.cover} alt={producer.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute bottom-5 left-5 flex items-end gap-4">
            <img src={producer.avatar} alt={producer.name} className="h-20 w-20 rounded-full border-2 border-[#10110f] object-cover" />
            <div>
              <p className="text-2xl font-semibold text-white">{producer.name}</p>
              <p className="text-sm text-gray-200">{producer.bio}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <ProducerCard item={producer} />
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((item) => <ProductCard key={item.id} item={item} />)}
      </section>
    </LandFoodFrame>
  );
}
