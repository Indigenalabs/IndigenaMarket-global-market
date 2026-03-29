import Link from 'next/link';
import { notFound } from 'next/navigation';
import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import { RentalCard } from '@/app/materials-tools/components/MaterialsToolsCards';
import RentalBookingPanel from '@/app/materials-tools/components/RentalBookingPanel';
import { getRentalById, rentalBookings, rentals } from '@/app/materials-tools/data/pillar10Data';

export default async function RentalListingPage({ params }: { params: Promise<{ rentalId: string }> }) {
  const { rentalId } = await params;
  const rental = getRentalById(rentalId);
  if (!rental) notFound();
  const bookingQueue = rentalBookings.filter((item) => item.rentalId === rental.id);

  return (
    <MaterialsToolsFrame title={rental.title} subtitle={`${rental.hubName} • ${rental.location}`}>
      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="overflow-hidden rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09]">
          <img src={rental.image} alt={rental.title} className="h-[420px] w-full object-cover" />
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Rental listing</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{rental.title}</h2>
          <p className="mt-4 text-sm leading-7 text-[#d7f0f2]">{rental.summary}</p>
          <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d7f0f2]">
            <div className="flex items-center justify-between"><span>Hub</span><span className="text-white">{rental.hubName}</span></div>
            <div className="flex items-center justify-between"><span>Rate</span><span className="text-[#f4c766]">{rental.dailyRateLabel}</span></div>
            <div className="flex items-center justify-between"><span>Availability</span><span className="text-white">{rental.availability}</span></div>
            <div className="flex items-center justify-between"><span>Type</span><span className="text-white">{rental.equipmentType}</span></div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d7f0f2]">Orientation required before first access on specialized equipment.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d7f0f2]">Deposits protect shared assets and return protocols keep the tool library healthy.</div>
          </div>
        </article>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Booking rules</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">Reserve at least 5 days ahead for high-demand weekends.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">Shared rigs require an orientation or returning-member signoff.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">Deposits convert into confirmed access once the steward approves the slot.</div>
          </div>
        </article>
        <RentalBookingPanel rentalId={rental.id} availability={rental.availability} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Upcoming calendar lane</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {['Morning access block', 'Afternoon access block', 'Full-day supervised access'].map((slot) => {
              const taken = bookingQueue.find((item) => item.sessionWindow.toLowerCase().includes(slot.split(' ')[0].toLowerCase()));
              return (
                <article key={slot} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{slot}</p>
                  <p className="mt-2 text-base font-semibold text-white">{taken ? 'Occupied / steward review' : 'Open for hold'}</p>
                  <p className="mt-3 text-sm leading-6 text-[#d5cab8]">
                    {taken ? `${taken.bookingDate} • ${taken.accessStatus}` : 'No conflicting reservation is currently blocking this lane.'}
                  </p>
                </article>
              );
            })}
          </div>
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Steward approval queue</p>
          <div className="mt-4 space-y-3">
            {bookingQueue.length ? bookingQueue.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-base font-semibold text-white">{item.bookingDate}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.sessionWindow}</p>
                <p className="mt-3 text-sm text-[#d7f0f2]">{item.depositLabel}</p>
                <p className="mt-2 text-sm text-[#9fe5ea]">{item.accessStatus}</p>
              </article>
            )) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d7f0f2]">
                No current steward review items. This queue will surface confirms, waitlists, and return checks as bookings arrive.
              </div>
            )}
          </div>
        </article>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {rentals.filter((item) => item.id !== rental.id).slice(0, 3).map((item) => <RentalCard key={item.id} item={item} />)}
      </section>
      <section className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-5">
        <div className="flex flex-wrap gap-2">
          <Link href="/materials-tools/tool-library-application" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">Open membership application</Link>
          <Link href="/materials-tools/rental-steward-dashboard" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">Open steward dashboard</Link>
          <Link href="/materials-tools/orders" className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">View booking ledger</Link>
        </div>
      </section>
    </MaterialsToolsFrame>
  );
}
