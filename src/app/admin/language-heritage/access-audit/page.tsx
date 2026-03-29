import ArchiveAccessAuditClient from '@/app/admin/language-heritage/access-audit/ArchiveAccessAuditClient';
import AdminAccessDenied from '@/app/admin/AdminAccessDenied';
import { requirePlatformAdminPageAccess } from '@/app/lib/platformAdminAuth';

export const metadata = {
  title: 'Archive Access Audit | Indigena Global Market'
};

export default async function ArchiveAccessAuditPage() {
  const auth = await requirePlatformAdminPageAccess();
  if (auth.error) return <AdminAccessDenied title="Archive audit access required" />;
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <h1 className="text-2xl font-semibold text-white">Archive Access Audit</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-400">
            Review server-approved heritage downloads, citation exports, and library bundle access. This is the operational
            audit surface for archive revenue enforcement.
          </p>
        </section>

        <ArchiveAccessAuditClient />
      </div>
    </main>
  );
}
