'use client';

import { useEffect, useState } from 'react';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import { readAdvocacyAdminState, saveAdvocacyAdminState } from '@/app/lib/advocacyLegalClientStore';

export default function SettingsVerificationPage() {
  const [wallet, setWallet] = useState('');
  const [adminSigned, setAdminSigned] = useState(false);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    const state = readAdvocacyAdminState();
    setWallet(state.wallet);
    setAdminSigned(state.adminSigned);
  }, []);

  const save = () => {
    saveAdvocacyAdminState(wallet, adminSigned);
    setSaved('Advocacy ops signing preferences saved.');
  };

  return (
    <AdvocacyFrame title="Settings & Verification" subtitle="Manage profile access, legal credentials, and signed admin actions.">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5">
          <h3 className="text-sm font-semibold text-white">Verification Status</h3>
          <p className="mt-2 text-sm text-gray-300">Professional License: Verified</p>
          <p className="mt-1 text-sm text-gray-300">Elder Council Endorsement: Pending</p>
        </article>
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">Ops Signing</h3>
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Admin or legal ops wallet"
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={adminSigned} onChange={(e) => setAdminSigned(e.target.checked)} className="h-4 w-4 accent-[#d4af37]" />
            Enable signed admin actions for legal ops
          </label>
          <button onClick={save} className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
            Save Ops Settings
          </button>
          {saved ? <p className="text-sm text-emerald-300">{saved}</p> : null}
        </article>
      </section>
    </AdvocacyFrame>
  );
}
