'use client';

import { useState } from 'react';
import { Clock, Tag, ArrowRight, Bell, Check } from 'lucide-react';

const newCollections = [
  {
    id: '1',
    makerName: 'WeavingWoman',
    collectionName: 'Spring Equinox Collection 2025',
    description: '12 new hand-woven pieces using spring wildflower dyes. Limited release and each piece numbered and certified.',
    image: 'https://images.unsplash.com/photo-1605218427368-35b0f996d2e6?w=800&h=400&fit=crop',
    itemCount: 12,
    launchDate: 'March 20, 2025',
    priceFrom: 280,
    nation: 'Navajo',
    tags: ['Weaving', 'Seasonal', 'Limited']
  },
  {
    id: '2',
    makerName: 'Maria Redfeather',
    collectionName: 'Night Sky Ceremony Set',
    description: 'A ceremonial beadwork collection honoring the winter solstice.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=400&fit=crop',
    itemCount: 7,
    launchDate: 'April 5, 2025',
    priceFrom: 350,
    nation: 'Navajo',
    tags: ['Beadwork', 'Ceremony', 'Sacred']
  }
];

export default function NewCollectionLaunch() {
  const [notified, setNotified] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setNotified((prev) => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return s;
    });

  return (
    <div className="col-span-full mb-2">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-semibold text-[#d4af37]">New Collection Launch</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {newCollections.map((c) => (
          <div
            key={c.id}
            className="group relative overflow-hidden rounded-2xl border border-[#d4af37]/25 bg-[#141414] transition-all hover:border-[#d4af37]/60"
          >
            <div className="relative h-36 overflow-hidden">
              <img
                src={c.image}
                alt={c.collectionName}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />

              <div className="absolute right-2 top-2 flex gap-1">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] text-gray-300 backdrop-blur-sm"
                  >
                    <Tag size={8} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4">
              <p className="mb-0.5 text-xs font-medium text-[#d4af37]">by {c.makerName} | {c.nation}</p>
              <h3 className="mb-1 line-clamp-1 text-sm font-bold text-white">{c.collectionName}</h3>
              <p className="mb-3 line-clamp-2 text-xs text-gray-400">{c.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {c.launchDate}
                  </span>
                  <span>{c.itemCount} pieces from {c.priceFrom} INDI</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggle(c.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      notified.has(c.id)
                        ? 'border border-green-600/30 bg-green-600/20 text-green-400'
                        : 'border border-[#d4af37]/30 bg-[#0a0a0a] text-[#d4af37] hover:bg-[#d4af37]/10'
                    }`}
                  >
                    {notified.has(c.id) ? <Check size={11} /> : <Bell size={11} />}
                    {notified.has(c.id) ? 'Notified' : 'Notify Me'}
                  </button>
                  <a
                    href={`/profile/${encodeURIComponent(c.makerName)}`}
                    className="flex items-center gap-1 rounded-lg bg-[#d4af37] px-2.5 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#f4e4a6]"
                  >
                    Preview
                    <ArrowRight size={10} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
