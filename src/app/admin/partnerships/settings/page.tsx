import PartnershipsSettingsClient from '@/app/admin/partnerships/settings/PartnershipsSettingsClient';

export const metadata = {
  title: 'Partnership Settings | Indigena Global Market'
};

export default function PartnershipsSettingsPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl">
        <PartnershipsSettingsClient />
      </div>
    </main>
  );
}
