'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchPhysicalVenturesDashboard, updatePhysicalVentureApi } from '@/app/lib/physicalVenturesApi';
import type { PhysicalVenturesDashboard, PhysicalVentureRecord } from '@/app/lib/physicalVentures';

export default function PhysicalVenturesOpsClient() {
  const [data, setData] = useState<PhysicalVenturesDashboard>({ ventures: [] });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchPhysicalVenturesDashboard().then(setData).catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load physical ventures ops.'));
  }, []);

  const totals = useMemo(() => data.ventures.reduce((sum, entry) => sum + entry.revenueAmount, 0), [data]);

  async function update(id: string, status: PhysicalVentureRecord['status']) {
    const json = await updatePhysicalVentureApi({ id, status });
    setData((current) => ({ ventures: current.ventures.map((entry) => entry.id === id ? json.record : entry) }));
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Venture revenue</p><p className="mt-2 text-2xl font-semibold text-white">${totals.toFixed(2)}</p></div>
      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <h2 className="text-lg font-semibold text-white">Orders</h2>
        <div className="mt-4 space-y-3">
          {data.ventures.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.title}</p>
                  <p className="text-xs text-gray-500">{entry.ventureType} · {entry.quantity} qty · ${entry.revenueAmount.toFixed(2)} · markup {(entry.markupRate * 100).toFixed(0)}%</p>
                </div>
                <select value={entry.status} onChange={(e) => void update(entry.id, e.target.value as PhysicalVentureRecord['status'])} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['ordered', 'active', 'completed'].map((status) => <option key={status} value={status}>{status}</option>)}
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
