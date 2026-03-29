import LandFoodFrame from '../components/LandFoodFrame';

export default function LandFoodSettingsVerificationPage() {
  return (
    <LandFoodFrame title="Settings & Verification" subtitle="Verification, payout settings, and producer compliance controls.">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-4"><h3 className="text-sm text-[#d4af37]">Community Verification</h3><p className="mt-2 text-sm text-gray-300">Status: In Review • Last updated 2 days ago</p></article>
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-4"><h3 className="text-sm text-[#d4af37]">Payout Setup</h3><p className="mt-2 text-sm text-gray-300">Wallet and bank settlement profile configured.</p></article>
      </section>
    </LandFoodFrame>
  );
}
