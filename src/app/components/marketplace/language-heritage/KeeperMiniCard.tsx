'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Heart, MapPin, Star, UserPlus, UserCheck, X } from 'lucide-react';

type KeeperMiniCardProps = {
  name: string;
  nation: string;
  bio: string;
  avatar: string;
  followers: number;
  rating: number;
  collections: number;
  verified?: boolean;
  onClose: () => void;
};

export default function KeeperMiniCard({
  name,
  nation,
  bio,
  avatar,
  followers,
  rating,
  collections,
  verified = false,
  onClose
}: KeeperMiniCardProps) {
  const [following, setFollowing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div ref={cardRef} className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#d4af37]/25 bg-[#141414] shadow-2xl">
        <div className="h-20 w-full bg-gradient-to-r from-[#2f1b00] via-[#3d2a00] to-[#2f1b00]" />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-gray-200 hover:bg-black/70"
          type="button"
          aria-label="Close keeper card"
        >
          <X size={14} />
        </button>

        <div className="-mt-10 px-5 pb-5">
          <img src={avatar} alt={name} className="h-20 w-20 rounded-full border-4 border-[#141414] object-cover shadow-lg" />
          <div className="mt-3 flex items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-1 text-lg font-semibold text-white">
                {name}
                {verified ? <BadgeCheck size={15} className="text-[#d4af37]" /> : null}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={11} />
                {nation}
              </p>
            </div>
            <button
              onClick={() => setFollowing((prev) => !prev)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                following ? 'border border-[#d4af37]/35 bg-[#d4af37]/10 text-[#d4af37]' : 'bg-[#d4af37] text-black'
              }`}
              type="button"
            >
              {following ? <UserCheck size={12} /> : <UserPlus size={12} />}
              {following ? 'Following' : 'Follow'}
            </button>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-gray-300">{bio}</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-[#0c0c0c] p-2 text-center">
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-[#d4af37]">
                <Heart size={12} />
                {followers.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Followers</p>
            </div>
            <div className="rounded-lg bg-[#0c0c0c] p-2 text-center">
              <p className="text-sm font-semibold text-white">{collections}</p>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Collections</p>
            </div>
            <div className="rounded-lg bg-[#0c0c0c] p-2 text-center">
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-yellow-300">
                <Star size={12} />
                {rating.toFixed(1)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Rating</p>
            </div>
          </div>

          <Link
            href={`/profile/${encodeURIComponent(name)}`}
            className="mt-4 block rounded-lg border border-[#d4af37]/30 bg-[#0c0c0c] px-4 py-2 text-center text-sm text-[#d4af37] hover:bg-[#d4af37]/10"
            onClick={onClose}
          >
            View Keeper Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
