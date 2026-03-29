'use client';

import { Calendar, MapPin, Users, Clock, Star, ArrowRight, Ticket } from 'lucide-react';
import Link from 'next/link';
import { PlacementSectionHeader, placementSecondaryButtonClass } from '../placements/PremiumPlacement';

interface Event {
  id: string;
  routeId: string;
  title: string;
  type: 'workshop' | 'exhibition' | 'market' | 'festival';
  image: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  price: number;
  currency: string;
  host: string;
  hostAvatar: string;
  featured: boolean;
}

const events: Event[] = [
  {
    id: 'e1',
    routeId: 'event-1',
    title: 'Traditional Beadwork Masterclass',
    type: 'workshop',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=300&fit=crop',
    date: 'Mar 15, 2026',
    time: '2:00 PM EST',
    location: 'Virtual Event',
    attendees: 156,
    price: 75,
    currency: 'INDI',
    host: 'Maria Redfeather',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    featured: true
  },
  {
    id: 'e2',
    routeId: 'event-2',
    title: 'Indigenous Art Market NYC',
    type: 'market',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=300&fit=crop',
    date: 'Mar 22-24, 2026',
    time: '10:00 AM - 6:00 PM',
    location: 'New York, NY',
    attendees: 500,
    price: 0,
    currency: 'INDI',
    host: 'Indigena Collective',
    hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    featured: true
  },
  {
    id: 'e3',
    routeId: 'event-3',
    title: 'Sacred Geometry in Modern Art',
    type: 'exhibition',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=300&fit=crop',
    date: 'Apr 1-30, 2026',
    time: 'All Day',
    location: 'Virtual Gallery',
    attendees: 1200,
    price: 25,
    currency: 'INDI',
    host: 'Plains Gallery',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    featured: false
  }
];

function getEventTypeColor(type: string): string {
  switch (type) {
    case 'workshop': return 'bg-[#d4af37]';
    case 'exhibition': return 'bg-[#DC143C]';
    case 'market': return 'bg-green-500';
    case 'festival': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
}

function getEventTypeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function EventPromotions() {
  return (
    <section className="bg-[#0a0a0a] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <PlacementSectionHeader
          icon={Calendar}
          title="Events & Workshops"
          description="Learn, connect, and celebrate."
          meta="Sponsored event lane"
          right={
            <Link href="/community/events" className="flex items-center gap-2 text-[#d4af37] transition-colors hover:text-[#f4e4a6]">
              <span className="text-sm">View All Events</span>
              <ArrowRight size={16} />
            </Link>
          }
        />

        <div className="grid gap-6 md:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`group overflow-hidden rounded-xl border bg-[#141414] transition-all hover:shadow-xl ${
                event.featured
                  ? 'border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:shadow-[#d4af37]/10'
                  : 'border-[#d4af37]/10 hover:border-[#d4af37]/30'
              }`}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

                <div className={`absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-bold uppercase text-black ${getEventTypeColor(event.type)}`}>
                  {getEventTypeLabel(event.type)}
                </div>

                {event.featured && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#d4af37]/40 bg-[#0b0b0b]/75 px-2.5 py-1 backdrop-blur-sm">
                    <Star size={12} className="text-[#d4af37]" fill="#d4af37" />
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#d4af37]">Sponsored</span>
                  </div>
                )}

                <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 backdrop-blur-sm">
                  <span className="font-bold text-[#d4af37]">{event.price === 0 ? 'FREE' : `${event.price} ${event.currency}`}</span>
                </div>
              </div>

              <div className="p-5">
                <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[#d4af37]/70">
                  Event placement
                </p>
                <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-[#d4af37]">{event.title}</h3>

                <div className="mb-3 flex items-center gap-2">
                  <img src={event.hostAvatar} alt={event.host} className="h-6 w-6 rounded-full object-cover" />
                  <span className="text-sm text-gray-400">by {event.host}</span>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={14} className="text-[#d4af37]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={14} className="text-[#d4af37]" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={14} className="text-[#d4af37]" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users size={14} className="text-[#d4af37]" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>

                <Link
                  href={`/community/events/${event.routeId}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 py-2.5 font-medium text-[#d4af37] transition-all hover:bg-[#d4af37] hover:text-black"
                >
                  <Ticket size={16} />
                  {event.price === 0 ? 'Register Free' : 'Get Tickets'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="mb-3 text-sm text-gray-400">Have an event to share?</p>
          <Link href="/community/events/create" className={placementSecondaryButtonClass}>
            Promote Your Event
          </Link>
        </div>
      </div>
    </section>
  );
}

