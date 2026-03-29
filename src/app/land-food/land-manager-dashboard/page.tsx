import LandFoodFrame from '../components/LandFoodFrame';

export default function LandManagerDashboardPage() {
  return (
    <LandFoodFrame title="Land Manager Dashboard" subtitle="Monitor stewardship projects, credits, and biodiversity indicators.">
      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Active Projects', '8'],
          ['Credits Issued', '4,820'],
          ['Audit Items', '3'],
          ['Monthly Impact Reports', '12']
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-4"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-xl text-white">{value}</p></article>
        ))}
      </section>
    </LandFoodFrame>
  );
}
