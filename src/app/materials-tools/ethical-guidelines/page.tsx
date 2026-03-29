import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';

export default function EthicalGuidelinesPage() {
  return (
    <MaterialsToolsFrame title="Ethical Harvesting Guidelines & Resources" subtitle="Understand harvest permits, sustainability standards, and cultural restrictions before sourcing sensitive materials.">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          'What can be publicly sold and what requires extra permissions.',
          'How to document harvest date, location, and stewardship method responsibly.',
          'How to avoid extractive sourcing patterns when buying from communities.'
        ].map((item) => (
          <article key={item} className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-5 text-sm leading-7 text-[#d5cab8]">{item}</article>
        ))}
      </section>
    </MaterialsToolsFrame>
  );
}

