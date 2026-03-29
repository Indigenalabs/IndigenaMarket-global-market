import Link from 'next/link';
import LandFoodFrame from '../../components/LandFoodFrame';
import { getService } from '../../data/pillar8Data';

export default async function LandStewardshipServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  const service = getService(serviceId);

  return (
    <LandFoodFrame title={service.title} subtitle={`${service.provider} • ${service.nation}`}>
      <section className="grid gap-5 lg:grid-cols-[1.3fr,1fr]">
        <article className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#10110f]">
          <img src={service.image} alt={service.title} className="h-[420px] w-full object-cover" />
        </article>
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">Service Detail</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{service.title}</h2>
          <p className="mt-2 text-sm text-gray-300">{service.summary}</p>
          <p className="mt-4 text-sm text-gray-300">Rate: <span className="text-[#d4af37]">{service.rateLabel}</span></p>
          <p className="mt-2 text-sm text-gray-300">Service Type: <span className="text-white">{service.serviceType}</span></p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/land-food/wholesale-inquiry" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Request Proposal</Link>
            <Link href="/land-food/stewardship-application" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">Join as Provider</Link>
          </div>
        </article>
      </section>
    </LandFoodFrame>
  );
}
