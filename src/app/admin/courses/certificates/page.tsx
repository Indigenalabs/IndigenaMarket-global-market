import CourseCertificatesAdminClient from '@/app/admin/courses/certificates/CourseCertificatesAdminClient';
import AdminAccessDenied from '@/app/admin/AdminAccessDenied';
import { requirePlatformAdminPageAccess } from '@/app/lib/platformAdminAuth';

export const metadata = {
  title: 'Course Certificates | Indigena Global Market'
};

export default async function CourseCertificatesAdminPage() {
  const auth = await requirePlatformAdminPageAccess();
  if (auth.error) return <AdminAccessDenied title="Certificate admin access required" />;
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <h1 className="text-2xl font-semibold text-white">Course Certificate Issuance</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-400">
            Review paid course certificate issuance records and public verification links. This is the operational review
            surface for certificate revenue in the courses pillar.
          </p>
        </section>

        <CourseCertificatesAdminClient />
      </div>
    </main>
  );
}
