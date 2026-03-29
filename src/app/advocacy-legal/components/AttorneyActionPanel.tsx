'use client';

import { useState } from 'react';
import { requestConsultation } from '@/app/lib/advocacyLegalClientStore';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

export default function AttorneyActionPanel({ attorneyId, attorneyName }: { attorneyId: string; attorneyName: string }) {
  const [contactEmail, setContactEmail] = useState('');
  const [caseSummary, setCaseSummary] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [submitting, setSubmitting] = useState<'consultation' | 'pro-bono-review' | null>(null);

  const submit = async (type: 'consultation' | 'pro-bono-review') => {
    if (!contactEmail.trim() || !caseSummary.trim()) {
      setStatus({ type: 'error', message: 'Contact email and case summary are required.' });
      return;
    }
    setSubmitting(type);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction(type === 'consultation' ? 'request a legal consultation' : 'request a pro bono legal review');
      await requestConsultation({
        attorneyId,
        attorneyName,
        type,
        caseSummary: caseSummary.trim(),
        contactEmail: contactEmail.trim()
      });
      setStatus({ type: 'success', message: `${type === 'consultation' ? 'Consultation' : 'Pro bono review'} request sent.` });
      setCaseSummary('');
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Request failed.' });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-[#d4af37]/20 bg-black/20 p-4">
      <h4 className="text-sm font-semibold text-white">Request legal support</h4>
      <input
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        type="email"
        placeholder="Contact email"
        className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
      />
      <textarea
        value={caseSummary}
        onChange={(e) => setCaseSummary(e.target.value)}
        placeholder="Case summary"
        className="h-28 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
      />
      <div className="flex flex-wrap gap-2">
        <button disabled={Boolean(submitting)} onClick={() => void submit('consultation')} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-60">{submitting === 'consultation' ? 'Sending...' : 'Request Consultation'}</button>
        <button disabled={Boolean(submitting)} onClick={() => void submit('pro-bono-review')} className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-60">{submitting === 'pro-bono-review' ? 'Sending...' : 'Request Pro Bono Review'}</button>
      </div>
      {status.type !== 'idle' ? <p className={`text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>{status.message}</p> : null}
    </div>
  );
}
