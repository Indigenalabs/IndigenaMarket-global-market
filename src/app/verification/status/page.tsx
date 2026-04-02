import VerificationStatusClient from '@/app/verification/VerificationStatusClient';

export const metadata = {
  title: 'Verification Status | Indigena Global Market'
};

export default async function VerificationStatusPage({
  searchParams
}: {
  searchParams: Promise<{ profileSlug?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <VerificationStatusClient profileSlug={params.profileSlug || ''} />
      </div>
    </main>
  );
}
