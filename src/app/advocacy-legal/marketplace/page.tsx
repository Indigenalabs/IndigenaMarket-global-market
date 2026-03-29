import AdvocacyFrame from '../components/AdvocacyFrame';
import AdvocacyLegalMarketplace from '@/app/components/marketplace/AdvocacyLegalMarketplace';

export default function AdvocacyLegalMarketplacePage() {
  return (
    <AdvocacyFrame title="Browse All Services & Resources" subtitle="Discover legal professionals, campaigns, and rights resources.">
      <section className="space-y-6">
        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Marketplace Overview</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">A protection marketplace built for action, not just discovery</h2>
            <p className="mt-4 max-w-4xl text-sm leading-8 text-gray-300">
              This marketplace brings together legal professionals, active defense campaigns, and practical resources in one place so users can move from problem to action without getting lost between disconnected pages. The goal is to make rights protection feel navigable, trustworthy, and alive.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#d4af37]/15 bg-[#101112] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Best Ways To Use This Page</p>
            <div className="mt-4 space-y-3">
              {[
                'Search by the issue you are actually facing',
                'Switch between attorneys, campaigns, and resources',
                'Use trust cues and urgency labels to decide where to go next'
              ].map((item, index) => (
                <div key={item} className="rounded-xl border border-white/8 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]/60">Step {index + 1}</p>
                  <p className="mt-2 text-sm text-gray-200">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <AdvocacyLegalMarketplace />
      </section>
    </AdvocacyFrame>
  );
}
