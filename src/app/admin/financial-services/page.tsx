import AdminAccessDenied from '@/app/admin/AdminAccessDenied';
import AdminSessionControls from '@/app/admin/AdminSessionControls';
import FinancialServicesOpsClient from '@/app/admin/financial-services/FinancialServicesOpsClient';
import { requirePlatformAdminPageAccess } from '@/app/lib/platformAdminAuth';

export const metadata = {
  title: 'Financial Services Ops | Indigena Global Market'
};

export default async function FinancialServicesOpsPage() {
  const auth = await requirePlatformAdminPageAccess();
  if (auth.error) return <AdminAccessDenied title="Financial services admin access required" />;
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">Financial Services</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-400">Review instant payout demand, BNPL applications, tax-report purchases, and service-fee throughput.</p>
            </div>
            <AdminSessionControls />
          </div>
        </section>
        <FinancialServicesOpsClient />
      </div>
    </main>
  );
}
