'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight, Sparkles, Video, Crown } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  type: 'virtual' | 'in-person';
  location?: string;
  attendees: number;
  maxAttendees?: number;
  host: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  isFeatured?: boolean;
  sponsor?: string;
  price?: number;
}

const upcomingEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Live Beadwork Workshop',
    description: 'Join master artisan Maria Begay for a live virtual workshop on traditional Navajo beadwork techniques.',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=300&fit=crop',
    date: 'Tomorrow',
    time: '2:00 PM EST',
    type: 'virtual',
    attendees: 234,
    maxAttendees: 500,
    host: { name: 'Maria Begay', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', verified: true },
    isFeatured: true,
    sponsor: 'Heritage Arts Foundation',
    price: 25
  },
  {
    id: 'event-2',
    title: 'Indigenous Art Market',
    description: 'Annual gathering of Indigenous artists showcasing traditional and contemporary works.',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=300&fit=crop',
    date: 'Dec 15',
    time: '10:00 AM - 6:00 PM',
    type: 'in-person',
    location: 'Santa Fe, NM',
    attendees: 1200,
    host: { name: 'Native Arts Council', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', verified: true }
  },
  {
    id: 'event-3',
    title: 'Digital Art Masterclass',
    description: 'Learn to blend traditional Indigenous art with modern digital techniques.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=300&fit=crop',
    date: 'Dec 18',
    time: '7:00 PM EST',
    type: 'virtual',
    attendees: 456,
    maxAttendees: 1000,
    host: { name: 'ThunderVoice', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', verified: true },
    price: 0
  }
];

export default function EventsCalendar() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'virtual' | 'in-person'>('all');

  const filteredEvents = upcomingEvents.filter(event => 
    activeFilter === 'all' || event.type === activeFilter
  );

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
            <Calendar size={18} className="text-[#d4af37]" />
          </div>
          <h3 className="text-lg font-bold text-white">Upcoming Events</h3>
        </div>
        <Link 
          href="/community/events"
          className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'virtual', 'in-person'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter
                ? 'bg-[#d4af37] text-black'
                : 'bg-[#0a0a0a] text-gray-400 hover:text-white border border-[#d4af37]/20'
            }`}
          >
            {filter === 'all' ? 'All Events' : filter === 'virtual' ? 'Virtual' : 'In-Person'}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <div 
            key={event.id}
            className={`relative bg-[#0a0a0a] rounded-xl overflow-hidden border ${
              event.isFeatured ? 'border-[#d4af37]/40' : 'border-[#d4af37]/10'
            } hover:border-[#d4af37]/30 transition-all group`}
          >
            {/* Featured Badge */}
            {event.isFeatured && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#d4af37] text-black text-xs font-bold rounded">
                <Crown size={10} />
                FEATURED
              </div>
            )}

            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="relative sm:w-40 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
                <img 
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a] hidden sm:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent sm:hidden" />
                
                {/* Type Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white">
                  {event.type === 'virtual' ? <Video size={12} /> : <MapPin size={12} />}
                  {event.type === 'virtual' ? 'Virtual' : 'In-Person'}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                {/* Sponsor */}
                {event.sponsor && (
                  <p className="text-xs text-[#d4af37]/70 mb-1">
                    Sponsored by {event.sponsor}
                  </p>
                )}

                <h4 className="text-white font-semibold mb-1 group-hover:text-[#d4af37] transition-colors">
                  {event.title}
                </h4>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{event.description}</p>

                {/* Host */}
                <div className="flex items-center gap-2 mb-3">
                  <img 
                    src={event.host.avatar}
                    alt={event.host.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-300">{event.host.name}</span>
                  {event.host.verified && (
                    <div className="w-4 h-4 rounded-full bg-[#d4af37] flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {event.time}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {event.location}
                    </span>
                  )}
                </div>

                {/* Attendees & CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {event.attendees.toLocaleString()}
                      {event.maxAttendees && ` / ${event.maxAttendees.toLocaleString()}`}
                    </span>
                    {event.maxAttendees && (
                      <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#d4af37] rounded-full"
                          style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {event.price !== undefined && (
                      <span className="text-[#d4af37] font-bold text-sm">
                        {event.price === 0 ? 'Free' : `${event.price} INDI`}
                      </span>
                    )}
                    <Link 
                      href={`/community/events/${event.id}`}
                      className="px-4 py-2 bg-[#d4af37]/20 text-[#d4af37] text-sm font-medium rounded-lg hover:bg-[#d4af37]/30 transition-colors"
                    >
                      RSVP
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event CTA */}
      <div className="mt-4 p-4 bg-gradient-to-r from-[#d4af37]/10 via-[#141414] to-[#DC143C]/10 rounded-xl border border-[#d4af37]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
              <Sparkles size={20} className="text-[#d4af37]" />
            </div>
            <div>
              <p className="text-white font-medium">Host Your Own Event</p>
              <p className="text-gray-400 text-sm">Workshops, meetups, or live streams</p>
            </div>
          </div>
          <Link 
            href="/community/events/create"
            className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
          >
            Create Event
          </Link>
        </div>
      </div>
    </div>
  );
}
