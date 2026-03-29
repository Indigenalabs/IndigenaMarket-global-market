import Link from 'next/link';
import { listCommunityEvents } from '@/app/lib/eventTicketing';

export default async function CommunityEventsPage() {
  const events = await listCommunityEvents();
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Ticketing & Events</p>
            <h1 className="mt-2 text-4xl font-semibold">Community events, workshops, and livestreams</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">Ticketing is now a first-class revenue lane with per-ticket fees, livestream access, VIP add-ons, and host payout visibility.</p>
          </div>
          <Link href="/community/events/create" className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black">Host an event</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/community/events/${event.id}`} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111111] transition hover:border-[#d4af37]/35">
              <img src={event.image} alt={event.title} className="h-48 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-[#d4af37]">
                  <span>{event.eventType}</span>
                  <span>•</span>
                  <span>{event.eventMode}</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold">{event.title}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-400">{event.description}</p>
                <p className="mt-4 text-sm text-gray-300">{new Date(event.startsAt).toLocaleString()}</p>
                <p className="mt-1 text-sm text-gray-500">{event.location}</p>
                <p className="mt-4 text-sm font-medium text-[#d4af37]">{event.basePrice === 0 ? 'Free registration' : `${event.currency} ${event.basePrice.toFixed(2)} + VIP options`}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
