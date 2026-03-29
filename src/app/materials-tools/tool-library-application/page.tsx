import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import MaterialsToolsActionPanel from '@/app/materials-tools/components/MaterialsToolsActionPanel';

export default function ToolLibraryApplicationPage() {
  return (
    <MaterialsToolsFrame title="Tool Library Application / Membership" subtitle="Apply for access to rental hubs, workshop equipment, and shared studio infrastructure.">
      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Membership entry lane</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Apply once, then move through orientation, booking access, and steward approval with less friction.</h2>
          <p className="mt-4 text-sm leading-7 text-[#d5cab8]">
            Membership captures your practice, training level, preferred hub, and the equipment class you need. Once approved, the same profile can power reservations, waitlists, and return-check workflows across the network.
          </p>
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">What happens next</p>
          <div className="mt-4 space-y-3 text-sm text-[#d7f0f2]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">1. Hub stewards review your equipment profile and training needs.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">2. Orientation windows unlock for high-risk or shared specialist equipment.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">3. Approved members can move into confirmed bookings or waitlist lanes.</div>
          </div>
        </article>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Orientation lane', 'First-time members complete safety, return, and maintenance protocols before specialist tools are released.'],
          ['Waitlist lane', 'Conflicting sessions roll into a visible waitlist so the network can release cleared slots quickly.'],
          ['Return check lane', 'Every completed booking closes with steward signoff and condition notes.']
        ].map(([label, copy]) => (
          <article key={label} className="rounded-[28px] border border-white/10 bg-black/20 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{label}</p>
            <p className="mt-3 text-sm leading-7 text-[#d5cab8]">{copy}</p>
          </article>
        ))}
      </section>
      <MaterialsToolsActionPanel variant="tool-library" title="Tool library access application" />
    </MaterialsToolsFrame>
  );
}
