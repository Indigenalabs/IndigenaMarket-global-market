import MarketingReviewClient from '@/app/admin/marketing/review/MarketingReviewClient';

export const metadata = {
  title: 'Marketing Review | Indigena Global Market'
};

export default function MarketingReviewPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <MarketingReviewClient />
      </div>
    </main>
  );
}
