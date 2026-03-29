'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchEthicalAdsDashboard, updateEthicalAdApi } from '@/app/lib/ethicalAdvertisingApi';
import type { EthicalAdvertisingDashboard, EthicalAdvertisingRecord } from '@/app/lib/ethicalAdvertising';

export default function EthicalAdvertisingOpsClient() {
  const [data, setData] = useState<EthicalAdvertisingDashboard>({ ads: [] });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchEthicalAdsDashboard().then(setData).catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load ethical advertising ops.'));
  }, []);

  const total = useMemo(() => data.ads.reduce((sum, entry) => sum + entry.priceAmount, 0), [data]);

  async function update(id: string, status: EthicalAdvertisingRecord['status']) {
    const json = await updateEthicalAdApi({ id, status });
    setData((current) => ({ ads: current.ads.map((entry) => entry.id === id ? json.record : entry) }));
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Pipeline value</p><p className="mt-2 text-2xl font-semibold text-white">${total.toFixed(2)}</p></div>
      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <h2 className="text-lg font-semibold text-white">Advertising queue</h2>
        <div className="mt-4 space-y-3">
          {data.ads.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.creativeTitle}</p>
                  <p className="text-xs text-gray-500">{entry.adType} · {entry.partnerName} · {entry.placementScope} · ${entry.priceAmount.toFixed(2)}</p>
                </div>
                <select value={entry.status} onChange={(e) => void update(entry.id, e.target.value as EthicalAdvertisingRecord['status'])} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['submitted', 'approved', 'live', 'rejected', 'completed'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
