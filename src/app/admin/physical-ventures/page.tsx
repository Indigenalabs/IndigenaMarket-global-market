import AdminAccessDenied from '@/app/admin/AdminAccessDenied';
import PhysicalVenturesOpsClient from '@/app/admin/physical-ventures/PhysicalVenturesOpsClient';
import { requirePlatformAdminPageAccess } from '@/app/lib/platformAdminAuth';

export const metadata = {
  title: 'Physical Ventures | Indigena Global Market'
};

export default async function PhysicalVenturesPage() {
  const auth = await requirePlatformAdminPageAccess();
  if (auth.error) return <AdminAccessDenied title="Physical ventures admin access required" />;
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <h1 className="text-2xl font-semibold text-white">Physical Ventures</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-400">Operate direct venture products like seeds, foods, dyes, conservation fees, and tool rentals as a social enterprise layer.</p>
        </section>
        <PhysicalVenturesOpsClient />
      </div>
    </main>
  );
}
