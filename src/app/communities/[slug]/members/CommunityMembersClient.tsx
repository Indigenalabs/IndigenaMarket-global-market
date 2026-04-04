'use client';

import { useState } from 'react';
import type { PlatformAccountMemberRecord, PlatformAccountRecord } from '@/app/lib/platformAccounts';
import { updatePlatformAccountMembersApi } from '@/app/lib/platformAccountsApi';

const ROLES: PlatformAccountMemberRecord['role'][] = ['owner', 'representative', 'editor', 'treasurer', 'elder', 'steward'];

export default function CommunityMembersClient({
  account,
  initialMembers
}: {
  account: PlatformAccountRecord;
  initialMembers: PlatformAccountMemberRecord[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [feedback, setFeedback] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const [draft, setDraft] = useState({
    actorId: '',
    displayName: '',
    role: 'representative' as PlatformAccountMemberRecord['role']
  });

  async function saveMember() {
    if (!draft.actorId.trim() || !draft.displayName.trim()) {
      setFeedback('Representative actor id and display name are required.');
      return;
    }
    try {
      setBusyKey('create');
      setFeedback('');
      const data = await updatePlatformAccountMembersApi(account.slug, {
        action: 'upsert-member',
        actorId: draft.actorId.trim().toLowerCase(),
        displayName: draft.displayName.trim(),
        role: draft.role
      });
      setMembers(data.members);
      setDraft({ actorId: '', displayName: '', role: 'representative' });
      setFeedback('Representative saved.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save representative.');
    } finally {
      setBusyKey('');
    }
  }

  async function updateRole(member: PlatformAccountMemberRecord, role: PlatformAccountMemberRecord['role']) {
    try {
      setBusyKey(member.id);
      setFeedback('');
      const data = await updatePlatformAccountMembersApi(account.slug, {
        action: 'upsert-member',
        actorId: member.actorId,
        displayName: member.displayName,
        role
      });
      setMembers(data.members);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to update representative role.');
    } finally {
      setBusyKey('');
    }
  }

  async function removeMember(member: PlatformAccountMemberRecord) {
    try {
      setBusyKey(member.id);
      setFeedback('');
      const data = await updatePlatformAccountMembersApi(account.slug, {
        action: 'remove-member',
        memberId: member.id
      });
      setMembers(data.members);
      setFeedback('Representative removed.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to remove representative.');
    } finally {
      setBusyKey('');
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Add representative</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-gray-300">
            Actor id
            <input
              value={draft.actorId}
              onChange={(event) => setDraft((state) => ({ ...state, actorId: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              placeholder="actor-riverstone-steward"
            />
          </label>
          <label className="space-y-2 text-sm text-gray-300">
            Display name
            <input
              value={draft.displayName}
              onChange={(event) => setDraft((state) => ({ ...state, displayName: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              placeholder="Representative name"
            />
          </label>
          <label className="space-y-2 text-sm text-gray-300">
            Role
            <select
              value={draft.role}
              onChange={(event) => setDraft((state) => ({ ...state, role: event.target.value as PlatformAccountMemberRecord['role'] }))}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => void saveMember()}
            disabled={busyKey === 'create'}
            className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {busyKey === 'create' ? 'Saving...' : 'Save representative'}
          </button>
          <p className="text-sm text-gray-400">Add the people allowed to publish, edit, or route treasury work for this community account.</p>
        </div>
      </div>

      {members.map((member) => (
        <div key={member.id} className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-white">{member.displayName}</p>
              <p className="mt-1 text-sm text-gray-400">{member.actorId}</p>
              <p className="mt-3 text-sm text-gray-300">Permissions: {member.permissions.join(' | ')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={member.role}
                onChange={(event) => void updateRole(member, event.target.value as PlatformAccountMemberRecord['role'])}
                disabled={busyKey === member.id}
                className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white outline-none disabled:opacity-60"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <button
                onClick={() => void removeMember(member)}
                disabled={busyKey === member.id}
                className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-200 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
