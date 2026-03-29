'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, MapPin, UserRoundPlus } from 'lucide-react';
import type { ProfileConnection } from '@/app/profile/data/profileShowcase';
import { fetchProfileConnections } from '@/app/lib/profileApi';

export default function ProfileConnectionsClient({
  slug,
  kind,
  initialConnections
}: {
  slug: string;
  kind: 'followers' | 'following';
  initialConnections: ProfileConnection[];
}) {
  const [connections, setConnections] = useState(initialConnections);

  useEffect(() => {
    let cancelled = false;
    fetchProfileConnections(slug, kind)
      .then((data) => {
        if (!cancelled) setConnections(data.connections);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [kind, slug]);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-[#d4af37]/15 bg-[#101010] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
        <Link
          href={`/profile/${slug}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-sm text-gray-300 hover:border-[#d4af37]/35 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to profile
        </Link>
        <p className="mt-5 text-xs uppercase tracking-[0.24em] text-[#d4af37]">{kind === 'followers' ? 'Followers' : 'Following'}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          {kind === 'followers' ? 'People following this creator' : 'People this creator follows'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9d4cb]">
          This is the social layer around the storefront: collectors, collaborators, suppliers, and peers connected to the creator.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {connections.map((connection) => (
          <Link
            key={`${connection.relationship}-${connection.actorId}`}
            href={`/profile/${connection.slug}`}
            className="rounded-[28px] border border-white/10 bg-[#101010] p-5 transition-all hover:-translate-y-0.5 hover:border-[#d4af37]/30 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-start gap-4">
              <img src={connection.avatar} alt={connection.displayName} className="h-16 w-16 rounded-[20px] object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-medium text-white">{connection.displayName}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#B51D19]/15 px-2 py-1 text-[11px] text-[#ff7a75]">
                    <BadgeCheck size={12} />
                    {connection.verificationLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#d4af37]">{connection.username}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin size={12} />
                  {connection.location}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-300">{connection.bioShort}</p>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <span>{connection.nation}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1">
                <UserRoundPlus size={12} />
                {kind === 'followers' ? 'Follower' : 'Following'}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
