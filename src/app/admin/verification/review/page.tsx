import AdminAccessDenied from '@/app/admin/AdminAccessDenied';
import VerificationReviewClient from '@/app/admin/verification/review/VerificationReviewClient';
import { requirePlatformAdminPageAccess } from '@/app/lib/platformAdminAuth';

export const metadata = {
  title: 'Verification Review | Indigena Global Market'
};

export default async function VerificationReviewPage() {
  const auth = await requirePlatformAdminPageAccess();
  if (auth.error) return <AdminAccessDenied title="Verification review access required" />;

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <VerificationReviewClient />
      </div>
    </main>
  );
}
