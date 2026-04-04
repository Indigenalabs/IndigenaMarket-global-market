'use client';

import { useState } from 'react';
import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';

function canRecoverAdminSession() {
  if (typeof window === 'undefined') return false;
  const adminSigned = (window.localStorage.getItem('indigena_admin_signed') || '').trim().toLowerCase() === 'true';
  const jwt = (window.localStorage.getItem('indigena_user_jwt') || '').trim();
  const wallet = (window.localStorage.getItem('indigena_admin_wallet') || window.localStorage.getItem('indigena_wallet_address') || '').trim();
  return adminSigned && Boolean(jwt || wallet);
}

export default function AdminSessionRecovery() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const canRecover = canRecoverAdminSession();

  async function recover() {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetchWithTimeout('/api/admin/session', { method: 'POST' });
      if (!res.ok) throw new Error(await parseApiError(res, 'Unable to establish admin session'));
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to establish admin session');
    } finally {
      setBusy(false);
    }
  }

  if (!canRecover) return null;

  return (
    <div className="mt-5 rounded-2xl border border-[#d4af37]/20 bg-[#161616] p-4">
      <p className="text-sm text-gray-300">
        We found a signed admin identity in this browser. Re-establish the protected admin page session to continue.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void recover()}
          disabled={busy}
          className="rounded-xl bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Establishing session...' : 'Continue as admin'}
        </button>
        {message ? <p className="text-sm text-[#f3deb1]">{message}</p> : null}
      </div>
    </div>
  );
}
