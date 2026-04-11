'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';
import { fetchSubscriptionEntitlements, type SubscriptionEntitlementsResponse } from '@/app/lib/profileApi';
import { resolveSubscriptionCapabilities } from '@/app/lib/subscriptionCapabilities';
import type { WorkspaceRoomRecord } from '@/app/lib/workspaces';

export default function WorkspaceHubClient({ rooms }: { rooms: WorkspaceRoomRecord[] }) {
  const [entitlements, setEntitlements] = useState<SubscriptionEntitlementsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSubscriptionEntitlements()
      .then((data) => {
        if (!cancelled) setEntitlements(data);
      })
      .catch(() => {
        if (!cancelled) setEntitlements(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const capabilities = useMemo(() => resolveSubscriptionCapabilities(entitlements), [entitlements]);

  if (loading) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6 text-sm text-gray-300">
        Checking workspace access...
      </section>
    );
  }

  if (!capabilities.hasTeamWorkspace) {
    return (
      <section className="rounded-[30px] border border-[#d4af37]/20 bg-[#111111] p-6">
        <div className="inline-flex rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 p-3 text-[#d4af37]">
          <Lock size={18} />
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#d4af37]">Premium team feature</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Shared workspaces unlock on Studio or Team plans</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300">
          Phase 9 workspaces are for community launch rooms, archive collaboration, shared files, and multi-seat operating workflows.
          Upgrade to Studio / Team, Small Collective, or Community Hub to open this lane.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/subscription#team" className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
            Unlock team workspaces
          </Link>
          <Link href="/subscription#creator" className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">
            Compare creator plans
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Open rooms" value={String(rooms.filter((room) => room.status !== 'completed').length)} />
        <Metric label="Active members" value={String(rooms.reduce((sum, room) => sum + room.members.length, 0))} />
        <Metric label="Open threads" value={String(rooms.reduce((sum, room) => sum + room.threadCount, 0))} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {rooms.map((room) => (
          <article key={room.id} className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">{room.communitySlug}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{room.title}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-300">{room.summary}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-gray-300">
                {room.status}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="Tasks" value={String(room.taskCount)} compact />
              <Metric label="Files" value={String(room.fileCount)} compact />
              <Metric label="Threads" value={String(room.threadCount)} compact />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">Current focus</p>
              <p className="mt-2 text-sm text-gray-400">{room.focus}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {room.members.map((member) => (
                  <span
                    key={`${room.id}-${member.actorId}`}
                    className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-xs text-[#f3d780]"
                  >
                    {member.label} · {member.role}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href={`/workspaces/${room.slug}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/30 hover:text-[#f4d370]"
            >
              Open workspace
              <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`rounded-[22px] border border-white/10 bg-black/20 ${compact ? 'p-4' : 'p-5'}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
