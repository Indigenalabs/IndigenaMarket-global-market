import AdminAccessDenied from '@/app/admin/AdminAccessDenied';
import CommissionsReviewClient from '@/app/admin/commissions/CommissionsReviewClient';
import { requirePlatformAdminPageAccess } from '@/app/lib/platformAdminAuth';

export const metadata = {
  title: 'Commissions Review | Indigena Global Market'
};

export default async function CommissionsReviewPage() {
  const auth = await requirePlatformAdminPageAccess();
  if (auth.error) return <AdminAccessDenied title="Commissions admin access required" />;
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <h1 className="text-2xl font-semibold text-white">Commissions & Custom Work</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-400">
            Review incoming custom work briefs, assign creator matches, and move projects from proposal through delivery.
          </p>
        </section>
        <CommissionsReviewClient />
      </div>
    </main>
  );
}
