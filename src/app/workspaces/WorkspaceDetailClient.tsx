'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, MessagesSquare, FolderKanban, Users } from 'lucide-react';
import { fetchSubscriptionEntitlements, type SubscriptionEntitlementsResponse } from '@/app/lib/profileApi';
import { resolveSubscriptionCapabilities } from '@/app/lib/subscriptionCapabilities';
import type { WorkspaceRoomRecord } from '@/app/lib/workspaces';

export default function WorkspaceDetailClient({ room }: { room: WorkspaceRoomRecord }) {
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
        <h2 className="mt-4 text-2xl font-semibold text-white">Workspace access is premium-gated</h2>
        <p className="mt-3 text-sm leading-7 text-gray-300">
          This room is part of the Phase 9 team workspace layer. Upgrade to a Studio or Team plan to work inside shared launch,
          archive, and review rooms.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/subscription#team" className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
            Unlock workspaces
          </Link>
          <Link href="/workspaces" className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">
            Back to workspace hub
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] border border-white/10 bg-[#111111] p-6">
        <Link href="/workspaces" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#f4d370]">
          <ArrowLeft size={15} />
          Back to workspaces
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#d4af37]">{room.communitySlug}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{room.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">{room.summary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={FolderKanban} label="Tasks" value={String(room.taskCount)} />
        <Metric icon={MessagesSquare} label="Threads" value={String(room.threadCount)} />
        <Metric icon={Users} label="Members" value={String(room.members.length)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
        <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Current focus</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{room.focus}</h2>
          <div className="mt-5 space-y-3">
            <WorkspaceLane
              title="Publishing coordination"
              detail="Track listing approvals, image handoff, pricing notes, and campaign launch timing inside one room."
            />
            <WorkspaceLane
              title="Archive and protocol review"
              detail="Use shared review rooms for language-heritage releases, archive approvals, and governance notes."
            />
            <WorkspaceLane
              title="Team operating rhythm"
              detail="Keep community stewards, creators, and support leads aligned on deadlines, files, and public launch work."
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Members</p>
          <div className="mt-4 space-y-3">
            {room.members.map((member) => (
              <div key={member.actorId} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{member.label}</p>
                <p className="mt-1 text-xs text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 p-4">
            <p className="text-sm font-medium text-white">Phase 9 note</p>
            <p className="mt-2 text-sm leading-7 text-[#f3deb1]">
              This room is fully wired as a premium team workspace surface. Future phases can add live task editing and file uploads on top
              of this subscription-gated foundation.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof FolderKanban; label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
      <Icon size={18} className="text-[#d4af37]" />
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function WorkspaceLane({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-gray-400">{detail}</p>
    </div>
  );
}
