'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, ShoppingBag, Heart, Star, Package, Zap } from 'lucide-react';

interface FeedEntry {
  id: string;
  type: 'purchase' | 'save' | 'review' | 'restock' | 'new';
  user: string;
  item: string;
  nation: string;
  amount?: number;
  time: string;
}

const ICON_MAP = {
  purchase: <ShoppingBag size={12} className="text-green-400" />,
  save: <Heart size={12} className="text-[#DC143C]" />,
  review: <Star size={12} className="text-[#d4af37]" />,
  restock: <Package size={12} className="text-blue-400" />,
  new: <Zap size={12} className="text-purple-400" />,
};

const COLOR_MAP = {
  purchase: 'bg-green-500/10',
  save: 'bg-[#DC143C]/10',
  review: 'bg-[#d4af37]/10',
  restock: 'bg-blue-500/10',
  new: 'bg-purple-500/10',
};

const ACTION_LABEL: Record<FeedEntry['type'], string> = {
  purchase: 'purchased',
  save: 'saved',
  review: 'reviewed',
  restock: 'restocked',
  new: 'new listing',
};

const SEED_FEED: FeedEntry[] = [
  { id: 'a1', type: 'purchase', user: 'EarthTones22', item: 'Lakota Beadwork Bracelet', nation: 'Lakota', amount: 185, time: 'just now' },
  { id: 'a2', type: 'save', user: 'PrairieWind', item: 'Navajo Sand-Painted Pot', nation: 'Navajo', time: '1m ago' },
  { id: 'a3', type: 'review', user: 'SkyDancer', item: 'Haida Bentwood Box', nation: 'Haida', time: '3m ago' },
  { id: 'a4', type: 'new', user: 'NightSky_Collector', item: 'Blackfoot Buffalo Hide Parfleche', nation: 'Blackfoot', time: '7m ago' },
  { id: 'a5', type: 'purchase', user: 'Birchbark88', item: 'Cherokee Rivercane Basket', nation: 'Cherokee', amount: 165, time: '9m ago' },
  { id: 'a6', type: 'restock', user: 'SilverLeaf Studio', item: 'Anishinaabe Dream Catcher', nation: 'Ojibwe', time: '14m ago' },
  { id: 'a7', type: 'save', user: 'TurquoiseRiver', item: 'Zuni Turquoise Fetish', nation: 'Zuni', time: '18m ago' },
  { id: 'a8', type: 'review', user: 'Willow_Creek', item: 'Ojibwe Birchbark Basket', nation: 'Ojibwe', time: '22m ago' },
];

const NEW_EVENTS: Omit<FeedEntry, 'id' | 'time'>[] = [
  { type: 'purchase', user: 'DesertStar', item: 'Navajo Sand-Painted Pot', nation: 'Navajo', amount: 220 },
  { type: 'save', user: 'MorningDew', item: 'Zuni Turquoise Fetish', nation: 'Zuni' },
  { type: 'review', user: 'CedarSmoke', item: 'Lakota Beadwork Bracelet', nation: 'Lakota' },
  { type: 'purchase', user: 'IronWood42', item: 'Haida Bentwood Box', nation: 'Haida', amount: 340 },
  { type: 'new', user: 'NightSky_Collector', item: 'Kwakwaka\'wakw Button Blanket', nation: 'Kwakwaka\'wakw' },
];

let eventIdx = 0;

export default function PhysicalActivityFeed() {
  const [feed, setFeed] = useState<FeedEntry[]>(SEED_FEED);
  const [live, setLive] = useState(true);
  const [pulse, setPulse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate live events
  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => {
      const template = NEW_EVENTS[eventIdx % NEW_EVENTS.length];
      eventIdx++;
      const newEntry: FeedEntry = {
        ...template,
        id: `live-${Date.now()}`,
        time: 'just now',
      };
      setFeed((prev) => [newEntry, ...prev.slice(0, 19)]);
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }, 6000);
    return () => clearInterval(interval);
  }, [live]);

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#d4af37]/10">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${pulse ? 'bg-green-500/30' : 'bg-green-500/10'}`}>
            <Activity size={16} className={`transition-colors duration-300 ${pulse ? 'text-green-300' : 'text-green-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">Live Activity</h3>
              {live && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-[10px] font-medium">LIVE</span>
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs">What the community is doing right now</p>
          </div>
        </div>
        <button
          onClick={() => setLive((l) => !l)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            live
              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
              : 'bg-white/5 border-white/10 text-gray-500 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
          }`}
        >
          {live ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Feed */}
      <div
        ref={containerRef}
        className="divide-y divide-white/5 max-h-[420px] overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,55,0.2) transparent' }}
      >
        {feed.map((entry, idx) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-5 py-3 transition-all duration-300 ${idx === 0 && pulse ? 'bg-white/5' : ''}`}
          >
            {/* Icon */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${COLOR_MAP[entry.type]}`}>
              {ICON_MAP[entry.type]}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 leading-snug">
                <span className="text-white font-medium">{entry.user}</span>
                {' '}<span className="text-gray-500">{ACTION_LABEL[entry.type]}</span>{' '}
                <span className="text-[#d4af37] truncate">{entry.item}</span>
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-gray-600 text-xs">{entry.nation} Nation</span>
                {entry.amount && (
                  <span className="text-green-400 text-xs font-medium">· {entry.amount} INDI</span>
                )}
              </div>
            </div>

            {/* Time */}
            <span className="text-gray-600 text-xs flex-shrink-0">{entry.time}</span>
          </div>
        ))}
      </div>

      {/* Stats footer */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <ShoppingBag size={10} className="text-green-400" />
            {feed.filter((f) => f.type === 'purchase').length} purchases shown
          </span>
          <span className="flex items-center gap-1">
            <Heart size={10} className="text-[#DC143C]" />
            {feed.filter((f) => f.type === 'save').length} saves shown
          </span>
        </div>
        <span className="text-[#d4af37]/50 text-xs">
          {live ? 'Updates every 6s' : 'Paused'}
        </span>
      </div>
    </div>
  );
}
