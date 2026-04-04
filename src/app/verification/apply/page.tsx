import VerificationApplyClient from '@/app/verification/VerificationApplyClient';

export const metadata = {
  title: 'Apply For Verification | Indigena Global Market'
};

export default async function VerificationApplyPage({
  searchParams
}: {
  searchParams: Promise<{ profileSlug?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <VerificationApplyClient profileSlug={params.profileSlug || ''} />
      </div>
    </main>
  );
}
