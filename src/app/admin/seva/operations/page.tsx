import AdminAccessDenied from '@/app/admin/AdminAccessDenied';
import SevaOperationsClient from '@/app/admin/seva/operations/SevaOperationsClient';
import { requirePlatformAdminPageAccess } from '@/app/lib/platformAdminAuth';

export const metadata = {
  title: 'Seva Impact Services | Indigena Global Market'
};

export default async function SevaOperationsPage() {
  const auth = await requirePlatformAdminPageAccess();
  if (auth.error) return <AdminAccessDenied title="Seva operations access required" />;
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <h1 className="text-2xl font-semibold text-white">Seva Impact Services</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-400">Manage project administration fees, donor tools, corporate matching programs, and impact reporting contracts.</p>
        </section>
        <SevaOperationsClient />
      </div>
    </main>
  );
}
