import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import SupplierDirectoryClient from '@/app/materials-tools/components/SupplierDirectoryClient';

export default function MaterialsToolsSuppliersPage() {
  return (
    <MaterialsToolsFrame title="Supplier Directory" subtitle="View community suppliers, tool hubs, and material collectives across the network.">
      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">View all suppliers / communities</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Traceable supplier relationships, not anonymous wholesale catalogs.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d5cab8]">Browse suppliers by specialty, response quality, and verification tier so artists can source with confidence and understand who is behind the materials they buy.</p>
      </section>
      <SupplierDirectoryClient />
    </MaterialsToolsFrame>
  );
}
