'use client';

import { useEffect, useState } from 'react';
import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { CourseCertificateRecord } from '@/app/lib/coursesMarketplaceApi';

export default function CourseCertificatesAdminClient() {
  const [records, setRecords] = useState<CourseCertificateRecord[]>([]);
  const [feedback, setFeedback] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    const res = await fetchWithTimeout('/api/admin/courses/certificates', { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load certificates'));
    const json = (await res.json()) as { certificates?: CourseCertificateRecord[] };
    setRecords(json.certificates || []);
  }

  useEffect(() => {
    load().catch((error) => setFeedback(error instanceof Error ? error.message : 'Failed to load certificates'));
  }, []);

  async function act(certificateId: string, action: 'revoke' | 'reissue') {
    try {
      setBusyId(certificateId);
      setFeedback('');
      const res = await fetchWithTimeout('/api/admin/courses/certificates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId, action })
      });
      if (!res.ok) throw new Error(await parseApiError(res, `Failed to ${action} certificate`));
      const json = (await res.json()) as { certificate?: CourseCertificateRecord | null };
      if (json.certificate) {
        setRecords((current) => current.map((entry) => (entry.certificateId === certificateId ? json.certificate! : entry)));
        setFeedback(`${action === 'revoke' ? 'Revoked' : 'Reissued'} ${certificateId}.`);
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Certificate update failed');
    } finally {
      setBusyId('');
    }
  }

  const revenue = records.filter((entry) => entry.status === 'issued').reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Issued" value={String(records.filter((entry) => entry.status === 'issued').length)} />
        <Metric label="Pending" value={String(records.filter((entry) => entry.status === 'pending').length)} />
        <Metric label="Cancelled" value={String(records.filter((entry) => entry.status === 'cancelled').length)} />
        <Metric label="Revenue" value={`$${Math.round(revenue).toLocaleString()}`} />
      </div>
      {feedback && <p className="mt-4 text-sm text-[#f3deb1]">{feedback}</p>}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.24em] text-gray-500">
              <th className="px-3 py-3">Certificate</th>
              <th className="px-3 py-3">Course</th>
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Issued</th>
              <th className="px-3 py-3">Verify</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {records.map((entry) => (
              <tr key={entry.certificateId} className="text-gray-300">
                <td className="px-3 py-3">{entry.certificateId}</td>
                <td className="px-3 py-3">{entry.courseId}</td>
                <td className="px-3 py-3">{entry.studentActorId}</td>
                <td className="px-3 py-3">{entry.status}</td>
                <td className="px-3 py-3">{`${entry.currency} ${entry.amount}`}</td>
                <td className="px-3 py-3">{entry.issuedAt ? new Date(entry.issuedAt).toLocaleDateString() : 'n/a'}</td>
                <td className="px-3 py-3">
                  <a href={entry.verificationUrl} className="text-[#d4af37] hover:text-[#f3deb1]">
                    Open
                  </a>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => act(entry.certificateId, 'revoke')}
                      disabled={busyId === entry.certificateId || entry.status === 'cancelled'}
                      className="rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-200 disabled:opacity-50"
                    >
                      Revoke
                    </button>
                    <button
                      onClick={() => act(entry.certificateId, 'reissue')}
                      disabled={busyId === entry.certificateId}
                      className="rounded-full border border-[#d4af37]/30 px-3 py-1 text-xs text-[#f3deb1] disabled:opacity-50"
                    >
                      Reissue
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
