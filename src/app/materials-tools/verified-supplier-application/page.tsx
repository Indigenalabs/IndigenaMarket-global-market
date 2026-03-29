import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import MaterialsToolsActionPanel from '@/app/materials-tools/components/MaterialsToolsActionPanel';

export default function VerifiedSupplierApplicationPage() {
  return (
    <MaterialsToolsFrame title="Become a Verified Supplier" subtitle="Apply to sell materials, tools, rentals, or equipment with community verification and traceability standards.">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6 text-sm leading-7 text-[#d5cab8]">Supplier verification should cover community connection, material origin documentation, fulfillment readiness, and sustainability evidence.</article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6 text-sm leading-7 text-[#d7f0f2]">This route is also where suppliers should understand the benefit: stronger trust, better placement, and cleaner co-op participation.</article>
      </section>
      <MaterialsToolsActionPanel variant="supplier-application" title="Verified supplier application" />
    </MaterialsToolsFrame>
  );
}
