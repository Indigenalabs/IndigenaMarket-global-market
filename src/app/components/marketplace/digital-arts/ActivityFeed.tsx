'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart, Eye, ShoppingCart, Gavel, Send, MessageCircle,
  TrendingUp, Bell, User, Clock, Filter, RefreshCw
} from 'lucide-react';

type ActivityType = 'like' | 'view' | 'purchase' | 'bid' | 'offer' | 'comment' | 'follow' | 'mint' | 'sale';

interface ActivityEvent {
  id: string;
  type: ActivityType;
  actor: string;
  actorAvatar?: string;
  artworkId?: string;
  artworkTitle?: string;
  artworkImage?: string;
  amount?: number;
  currency?: string;
  message?: string;
  timestamp: string;
  isNew?: boolean;
}

interface ActivityFeedProps {
  events?: ActivityEvent[];
  onRefresh?: () => void;
  onViewArtwork?: (artworkId: string) => void;
  filterMyArtwork?: boolean;
}

const mockEvents: ActivityEvent[] = [
  { id: '1', type: 'bid', actor: 'WolfRunner', artworkTitle: 'Sacred Buffalo Spirit', artworkImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=80&h=80&fit=crop', artworkId: '1', amount: 310, currency: 'INDI', timestamp: '2 min ago', isNew: true },
  { id: '2', type: 'like', actor: 'NativeArtLover', artworkTitle: 'Thunderbird Rising', artworkImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=80&h=80&fit=crop', artworkId: '3', timestamp: '5 min ago', isNew: true },
  { id: '3', type: 'offer', actor: 'CollectorMike', artworkTitle: 'Medicine Wheel', artworkImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=80&h=80&fit=crop', artworkId: '4', amount: 450, currency: 'INDI', timestamp: '12 min ago', isNew: true },
  { id: '4', type: 'purchase', actor: 'SpiritSeeker', artworkTitle: 'Dreamcatcher Collection', artworkImage: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=80&h=80&fit=crop', artworkId: '5', amount: 95, currency: 'INDI', timestamp: '1 hr ago' },
  { id: '5', type: 'comment', actor: 'ElderSpirit', artworkTitle: 'Sacred Buffalo Spirit', artworkId: '1', message: 'This is truly beautiful work. The symbolism is powerful.', timestamp: '2 hr ago' },
  { id: '6', type: 'follow', actor: 'ArtCollector99', timestamp: '3 hr ago' },
  { id: '7', type: 'view', actor: '128 people', artworkTitle: 'Thunderbird Rising', artworkId: '3', timestamp: '4 hr ago' },
  { id: '8', type: 'sale', actor: 'LakotaDreams', artworkTitle: 'Sky Warriors NFT', artworkId: '2', amount: 580, currency: 'INDI', timestamp: '6 hr ago' },
];

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'like': return <Heart size={14} className="text-[#DC143C]" fill="currentColor" />;
    case 'view': return <Eye size={14} className="text-blue-400" />;
    case 'purchase': return <ShoppingCart size={14} className="text-green-400" />;
    case 'bid': return <Gavel size={14} className="text-[#DC143C]" />;
    case 'offer': return <Send size={14} className="text-[#d4af37]" />;
    case 'comment': return <MessageCircle size={14} className="text-purple-400" />;
    case 'follow': return <User size={14} className="text-[#d4af37]" />;
    case 'mint': return <TrendingUp size={14} className="text-green-400" />;
    case 'sale': return <TrendingUp size={14} className="text-green-400" />;
  }
};

const getActivityText = (event: ActivityEvent) => {
  switch (event.type) {
    case 'like': return <>liked <span className="text-[#d4af37]">{event.artworkTitle}</span></>;
    case 'view': return <><span className="text-[#d4af37]">{event.actor}</span> viewed <span className="text-[#d4af37]">{event.artworkTitle}</span></>;
    case 'purchase': return <>purchased <span className="text-[#d4af37]">{event.artworkTitle}</span> for <span className="text-green-400 font-semibold">{event.amount} {event.currency}</span></>;
    case 'bid': return <>placed a bid of <span className="text-[#DC143C] font-semibold">{event.amount} {event.currency}</span> on <span className="text-[#d4af37]">{event.artworkTitle}</span></>;
    case 'offer': return <>made an offer of <span className="text-[#d4af37] font-semibold">{event.amount} {event.currency}</span> on <span className="text-[#d4af37]">{event.artworkTitle}</span></>;
    case 'comment': return <>commented on <span className="text-[#d4af37]">{event.artworkTitle}</span></>;
    case 'follow': return <>started following you</>;
    case 'mint': return <>minted a new artwork <span className="text-[#d4af37]">{event.artworkTitle}</span></>;
    case 'sale': return <>sold <span className="text-[#d4af37]">{event.artworkTitle}</span> for <span className="text-green-400 font-semibold">{event.amount} {event.currency}</span></>;
  }
};

const activityFilters: { value: ActivityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'bid', label: 'Bids' },
  { value: 'offer', label: 'Offers' },
  { value: 'purchase', label: 'Sales' },
  { value: 'like', label: 'Likes' },
  { value: 'comment', label: 'Comments' },
  { value: 'follow', label: 'Follows' },
];

export default function ActivityFeed({
  events = mockEvents,
  onRefresh,
  onViewArtwork
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);
  const newCount = events.filter(e => e.isNew).length;

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#d4af37]/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#d4af37]" />
            <h2 className="text-white font-bold">Activity Feed</h2>
            {newCount > 0 && (
              <span className="px-2 py-0.5 bg-[#DC143C] text-white text-xs rounded-full font-medium">
                {newCount} new
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {activityFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === value
                  ? 'bg-[#d4af37] text-black'
                  : 'bg-[#0a0a0a] text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="divide-y divide-[#d4af37]/10 max-h-[480px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={28} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No activity yet</p>
          </div>
        ) : (
          filtered.map((event) => (
            <div
              key={event.id}
              className={`flex items-start gap-3 p-3 hover:bg-[#1a1a1a] transition-colors ${
                event.isNew ? 'border-l-2 border-[#d4af37]' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 bg-[#0a0a0a] rounded-full flex items-center justify-center border border-[#d4af37]/20">
                  <span className="text-gray-300 text-xs font-bold">
                    {event.actor.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#141414] rounded-full flex items-center justify-center">
                  {getActivityIcon(event.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed">
                  <span className="text-white font-medium">{event.actor}</span>{' '}
                  <span className="text-gray-400">{getActivityText(event)}</span>
                </p>
                {event.message && (
                  <p className="text-gray-500 text-xs mt-1 italic truncate">
                    &ldquo;{event.message}&rdquo;
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-600 text-xs flex items-center gap-1">
                    <Clock size={10} />
                    {event.timestamp}
                  </span>
                </div>
              </div>

              {/* Artwork Thumbnail */}
              {event.artworkImage && event.artworkId && (
                <button
                  onClick={() => onViewArtwork?.(event.artworkId!)}
                  className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img
                    src={event.artworkImage}
                    alt={event.artworkTitle}
                    className="w-full h-full object-cover"
                  />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#d4af37]/10 text-center">
        <Link
          href="/digital-arts"
          className="text-[#d4af37] text-sm hover:underline"
        >
          View All Activity
        </Link>
      </div>
    </div>
  );
}
