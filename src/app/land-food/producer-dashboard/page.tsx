import LandFoodFrame from '../components/LandFoodFrame';

export default function ProducerInventoryDashboardPage() {
  return (
    <LandFoodFrame title="Producer Inventory Dashboard" subtitle="Manage SKUs, harvest windows, and wholesale readiness.">
      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Active SKUs', '42'],
          ['Low Stock Alerts', '6'],
          ['Pending Wholesale Quotes', '4'],
          ['This Month Revenue', '$9,240']
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-4"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-xl text-white">{value}</p></article>
        ))}
      </section>
    </LandFoodFrame>
  );
}
