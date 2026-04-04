'use client';

import { useState } from 'react';
import { clearAdminSession, clearAdminSessionLocalState } from '@/app/lib/financialServicesApi';

export default function AdminSessionControls() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function signOut() {
    setBusy(true);
    setMessage('');
    try {
      await clearAdminSession();
      clearAdminSessionLocalState();
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign out of admin session');
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={busy}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-red-400/40 hover:text-[#f3deb1] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Signing out...' : 'Sign out admin session'}
      </button>
      {message ? <p className="text-sm text-[#f3deb1]">{message}</p> : null}
    </div>
  );
}
