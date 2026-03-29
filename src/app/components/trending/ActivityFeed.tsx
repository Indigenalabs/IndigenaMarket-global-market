'use client';

import { Activity, ShoppingCart, Gavel, Tag, Heart, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface ActivityFeedProps {
  limit?: number;
}

const activities = [
  {
    id: 'act-1',
    type: 'sale',
    item: {
      title: 'Sacred Buffalo Spirit',
      image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=100&h=100&fit=crop'
    },
    from: 'LakotaDreams',
    to: 'Collector123',
    price: 450,
    currency: 'INDI',
    time: '2 min ago'
  },
  {
    id: 'act-2',
    type: 'bid',
    item: {
      title: 'Thunderbird Rising',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop'
    },
    from: 'ArtEnthusiast',
    price: 520,
    currency: 'INDI',
    time: '5 min ago'
  },
  {
    id: 'act-3',
    type: 'listing',
    item: {
      title: 'Northern Lights Spirit',
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=100&h=100&fit=crop'
    },
    from: 'ArcticVisions',
    price: 350,
    currency: 'INDI',
    time: '8 min ago'
  },
  {
    id: 'act-4',
    type: 'offer',
    item: {
      title: 'Medicine Wheel',
      image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=100&h=100&fit=crop'
    },
    from: 'NativeCollector',
    to: 'PlainsElder',
    price: 680,
    currency: 'INDI',
    time: '12 min ago'
  },
  {
    id: 'act-5',
    type: 'like',
    item: {
      title: 'Dreamcatcher Collection',
      image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=100&h=100&fit=crop'
    },
    from: 'ArtLover99',
    time: '15 min ago'
  },
  {
    id: 'act-6',
    type: 'sale',
    item: {
      title: 'Eagle Feather Ceremony',
      image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=100&h=100&fit=crop'
    },
    from: 'HopiVision',
    to: 'SacredCollector',
    price: 380,
    currency: 'INDI',
    time: '18 min ago'
  },
  {
    id: 'act-7',
    type: 'bid',
    item: {
      title: 'Coastal Wolf Pack',
      image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=100&h=100&fit=crop'
    },
    from: 'WolfEnthusiast',
    price: 580,
    currency: 'INDI',
    time: '22 min ago'
  },
  {
    id: 'act-8',
    type: 'listing',
    item: {
      title: 'Desert Rose Collection',
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=100&h=100&fit=crop'
    },
    from: 'SouthwestJewelry',
    price: 280,
    currency: 'INDI',
    time: '25 min ago'
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'sale':
      return <ShoppingCart size={14} className="text-green-400" />;
    case 'bid':
      return <Gavel size={14} className="text-[#d4af37]" />;
    case 'listing':
      return <Tag size={14} className="text-blue-400" />;
    case 'offer':
      return <Activity size={14} className="text-purple-400" />;
    case 'like':
      return <Heart size={14} className="text-red-400" />;
    default:
      return <Activity size={14} className="text-gray-400" />;
  }
};

const getActivityText = (activity: typeof activities[0]) => {
  switch (activity.type) {
    case 'sale':
      return (
        <>
          <span className="text-white font-medium">{activity.from}</span>
          <span className="text-gray-400"> sold to </span>
          <span className="text-white font-medium">{activity.to}</span>
          <span className="text-gray-400"> for </span>
          <span className="text-[#d4af37] font-bold">{activity.price} {activity.currency}</span>
        </>
      );
    case 'bid':
      return (
        <>
          <span className="text-white font-medium">{activity.from}</span>
          <span className="text-gray-400"> placed a bid of </span>
          <span className="text-[#d4af37] font-bold">{activity.price} {activity.currency}</span>
        </>
      );
    case 'listing':
      return (
        <>
          <span className="text-white font-medium">{activity.from}</span>
          <span className="text-gray-400"> listed for </span>
          <span className="text-[#d4af37] font-bold">{activity.price} {activity.currency}</span>
        </>
      );
    case 'offer':
      return (
        <>
          <span className="text-white font-medium">{activity.from}</span>
          <span className="text-gray-400"> offered </span>
          <span className="text-[#d4af37] font-bold">{activity.price} {activity.currency}</span>
          <span className="text-gray-400"> to </span>
          <span className="text-white font-medium">{activity.to}</span>
        </>
      );
    case 'like':
      return (
        <>
          <span className="text-white font-medium">{activity.from}</span>
          <span className="text-gray-400"> liked this item</span>
        </>
      );
    default:
      return null;
  }
};

export default function ActivityFeed({ limit = 8 }: ActivityFeedProps) {
  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
            <Activity size={18} className="text-[#d4af37]" />
          </div>
          <h3 className="text-lg font-bold text-white">Live Activity</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.slice(0, limit).map((activity) => (
          <div 
            key={activity.id}
            className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#1a1a1a] transition-colors group"
          >
            {/* Icon */}
            <div className="w-8 h-8 bg-[#141414] rounded-lg flex items-center justify-center flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>

            {/* Item Image */}
            <img 
              src={activity.item.image}
              alt={activity.item.title}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                {getActivityText(activity)}
              </p>
              <p className="text-xs text-gray-500 truncate">{activity.item.title}</p>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
              <Clock size={12} />
              {activity.time}
            </div>
          </div>
        ))}
      </div>

      {/* View All */}
      <Link 
        href="/activity"
        className="flex items-center justify-center gap-1 w-full mt-4 py-2 text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
      >
        View all activity
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
