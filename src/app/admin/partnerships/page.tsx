import PartnershipsReviewClient from '@/app/admin/partnerships/PartnershipsReviewClient';

export const metadata = {
  title: 'Partnerships Review | Indigena Global Market'
};

export default function PartnershipsReviewPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <PartnershipsReviewClient />
      </div>
    </main>
  );
}
