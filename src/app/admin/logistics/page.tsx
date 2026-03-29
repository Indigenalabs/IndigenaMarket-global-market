import AdminAccessDenied from '@/app/admin/AdminAccessDenied';
import LogisticsOpsClient from '@/app/admin/logistics/LogisticsOpsClient';
import { requirePlatformAdminPageAccess } from '@/app/lib/platformAdminAuth';

export const metadata = {
  title: 'Logistics Ops | Indigena Global Market'
};

export default async function LogisticsOpsPage() {
  const auth = await requirePlatformAdminPageAccess();
  if (auth.error) return <AdminAccessDenied title="Logistics admin access required" />;
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <h1 className="text-2xl font-semibold text-white">Logistics & Operations</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-400">Manage shipping margin, insurance claims, fulfillment activity, NFC authenticity tags, and inventory-tool subscriptions.</p>
        </section>
        <LogisticsOpsClient />
      </div>
    </main>
  );
}
