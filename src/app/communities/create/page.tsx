import CommunityAccountCreateClient from '@/app/communities/create/CommunityAccountCreateClient';

export const metadata = {
  title: 'Create Nation or Community Page | Indigena Global Market'
};

export default function CreateCommunityPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Nation and community account setup</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Create a verified nation or community page</h1>
          <p className="mt-3 text-sm leading-7 text-gray-300">Use this flow when a nation, tribe, community, or collective needs to sell on its own behalf, route revenue to a treasury, and assign verified representatives.</p>
        </section>
        <CommunityAccountCreateClient />
      </div>
    </main>
  );
}
