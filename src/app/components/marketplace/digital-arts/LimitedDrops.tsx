'use client';

import { useState, useEffect } from 'react';
import { Clock, Sparkles, AlertCircle, Check, Bell } from 'lucide-react';

const drops = [
  {
    id: '1',
    title: 'Winter Solstice Collection',
    artist: 'Elder Moon',
    image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=400&h=400&fit=crop',
    dropTime: new Date('2026-12-21T12:00:00.000Z'),
    totalEditions: 50,
    price: 175,
    exclusive: true
  },
  {
    id: '2',
    title: 'Powwow Regalia Digital',
    artist: 'DancingBear',
    image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=400&fit=crop',
    dropTime: new Date('2026-12-22T12:00:00.000Z'),
    totalEditions: 25,
    price: 250,
    exclusive: true
  }
];

function CountdownTimer({ targetTime }: { targetTime: Date }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const diff = Math.max(0, targetTime.getTime() - Date.now());
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calc());
    const interval = setInterval(() => {
      setTimeLeft(calc());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const hh = mounted ? String(timeLeft.hours).padStart(2, '0') : '--';
  const mm = mounted ? String(timeLeft.minutes).padStart(2, '0') : '--';
  const ss = mounted ? String(timeLeft.seconds).padStart(2, '0') : '--';

  return (
    <div className="flex items-center gap-2">
      <Clock size={16} className="text-[#DC143C]" />
      <div className="flex items-center gap-1 text-white font-mono">
        <span className="bg-[#0a0a0a] px-2 py-1 rounded">{hh}</span>
        <span className="text-gray-500">:</span>
        <span className="bg-[#0a0a0a] px-2 py-1 rounded">{mm}</span>
        <span className="text-gray-500">:</span>
        <span className="bg-[#0a0a0a] px-2 py-1 rounded">{ss}</span>
      </div>
    </div>
  );
}

function DropCard({ drop }: { drop: typeof drops[0] }) {
  const [reminded, setReminded] = useState(false);

  return (
    <div
      className="bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all group"
    >
      <div className="flex">
        {/* Image */}
        <div className="w-32 h-32 flex-shrink-0">
          <img
            src={drop.image}
            alt={drop.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-semibold group-hover:text-[#d4af37] transition-colors">
                {drop.title}
              </h4>
              <p className="text-gray-400 text-sm">by {drop.artist}</p>
            </div>
            {drop.exclusive && (
              <span className="px-2 py-0.5 bg-[#DC143C]/20 text-[#DC143C] text-xs rounded-full">
                Exclusive
              </span>
            )}
          </div>

          <div className="mt-3">
            <CountdownTimer targetTime={drop.dropTime} />
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#d4af37]/10">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400">{drop.totalEditions} editions</span>
              <span className="text-[#d4af37] font-bold">{drop.price} INDI</span>
            </div>
            <button
              onClick={() => setReminded(true)}
              disabled={reminded}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                reminded
                  ? 'bg-green-500/20 text-green-400 cursor-default'
                  : 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
              }`}
            >
              {reminded ? (
                <>
                  <Check size={14} />
                  Reminded
                </>
              ) : (
                <>
                  <Bell size={14} />
                  Remind Me
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LimitedDrops() {
  return (
    <div className="bg-gradient-to-r from-[#d4af37]/10 via-[#141414] to-[#DC143C]/10 rounded-xl border border-[#d4af37]/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center">
            <Sparkles size={20} className="text-black" />
          </div>
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              Limited Drops
              <span className="px-2 py-0.5 bg-[#d4af37] text-black text-xs rounded-full">
                Coming Soon
              </span>
            </h3>
            <p className="text-gray-400 text-sm">Exclusive timed releases from top artists</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>
    </div>
  );
}
