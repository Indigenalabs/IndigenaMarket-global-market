import AdminAccessDenied from '@/app/admin/AdminAccessDenied';
import GovernanceOpsClient from '@/app/admin/governance/GovernanceOpsClient';
import { requirePlatformAdminPageAccess } from '@/app/lib/platformAdminAuth';

export const metadata = {
  title: 'Governance Controls | Indigena Global Market'
};

export default async function GovernanceOpsPage() {
  const auth = await requirePlatformAdminPageAccess(['admin', 'platform_ops', 'governance_admin', 'compliance_admin', 'data_governance']);
  if (auth.error) return <AdminAccessDenied title="Governance admin access required" />;
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <h1 className="text-2xl font-semibold text-white">Governance Controls</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-400">Review compliance profiles, approve data-use consents, and audit policy-sensitive actions across the revenue systems.</p>
        </section>
        <GovernanceOpsClient />
      </div>
    </main>
  );
}