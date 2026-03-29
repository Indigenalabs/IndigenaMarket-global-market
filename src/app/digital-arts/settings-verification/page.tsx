import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';

export default function SettingsAndVerificationPage() {
  return (
    <DigitalArtsFrame title="Settings & Verification" subtitle="Control account security, payout details, and creator verification status.">
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">Identity Verification</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-200">Profile verification: In Review</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Government ID uploaded</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Community endorsement letter uploaded</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Estimated approval window: 24-48 hours</p>
          </div>
        </article>

        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">Security and Payout</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Wallet connected: xrpl:rDx...A19</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Two-factor auth: Enabled</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Royalty split default: 10%</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Payout schedule: Weekly</p>
          </div>
        </article>
      </section>
    </DigitalArtsFrame>
  );
}

