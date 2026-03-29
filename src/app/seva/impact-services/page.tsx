'use client';

import { useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { ClipboardList, HeartHandshake, LineChart, ShieldCheck } from 'lucide-react';
import { createSevaCorporateMatchApi, createSevaDonorToolApi, createSevaImpactReportApi, createSevaProjectAdminApi } from '@/app/lib/sevaImpactApi';

export default function SevaImpactServicesPage() {
  const [feedback, setFeedback] = useState('');
  const [activePillar, setActivePillar] = useState('seva');
  const [isCollapsed, setIsCollapsed] = useState(false);

  async function createProjectAdmin() {
    const record = await createSevaProjectAdminApi({ requestId: 'req-community', projectId: 'project-community', fundsManaged: 500000, donorCount: 820 });
    setFeedback(`Project admin opened for ${record.projectId}. Service fee ${record.serviceFeeAmount.toFixed(2)} USD.`);
  }

  async function createCorporateMatch() {
    const record = await createSevaCorporateMatchApi({ companyName: 'Earth Steward Alliance', projectId: 'project-community', committedAmount: 200000, matchedAmount: 25000 });
    setFeedback(`Corporate match opened with ${record.companyName}. Admin fee ${record.adminFeeAmount.toFixed(2)} USD.`);
  }

  async function createImpactReport() {
    const record = await createSevaImpactReportApi({ clientName: 'Mission Trust', projectId: 'project-community', contractAmount: 5000 });
    setFeedback(`Impact report requested for ${record.clientName}. Contract value ${record.contractAmount.toFixed(2)} USD.`);
  }

  async function activateDonorTool() {
    const record = await createSevaDonorToolApi({ actorId: 'donor-actor', projectId: 'project-community', toolType: 'matching-campaign' });
    setFeedback(`Donor tool ${record.toolType} activated for ${record.projectId}.`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar activePillar={activePillar} onPillarChange={setActivePillar} isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} />
      <main className="px-6 py-12 lg:ml-64">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="relative overflow-hidden rounded-[32px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(220,20,60,0.12),rgba(12,12,12,0.96)_38%,rgba(212,175,55,0.12))] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,20,60,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.14),transparent_28%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-medium text-[#d4af37]">
                <ShieldCheck size={13} />
                Seva impact services
              </div>
              <h1 className="mt-4 text-4xl font-semibold">Project admin, donor tools, corporate matching, reporting</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">This is the operational layer behind Seva giving: fund administration, donor reporting, corporate matching, and managed project services.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Managed projects</p><p className="mt-2 text-2xl font-semibold text-white">10%</p><p className="mt-1 text-sm text-gray-400">administration lane</p></div>
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Corporate match</p><p className="mt-2 text-2xl font-semibold text-white">5%</p><p className="mt-1 text-sm text-gray-400">admin fee</p></div>
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Operator controlled</p><p className="mt-2 text-2xl font-semibold text-white">Admin</p><p className="mt-1 text-sm text-gray-400">review and management</p></div>
              </div>
            </div>
          </section>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <button onClick={() => void createProjectAdmin()} className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(8,8,8,0.92))] p-5 text-left transition hover:border-[#d4af37]/35">
              <ClipboardList size={20} className="text-[#d4af37]" />
              <p className="mt-4 text-white font-semibold">Project admin</p>
              <p className="mt-2 text-sm leading-7 text-gray-400">10% administration for managed community projects.</p>
            </button>
            <button onClick={() => void createCorporateMatch()} className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(8,8,8,0.92))] p-5 text-left transition hover:border-[#d4af37]/35">
              <HeartHandshake size={20} className="text-[#d4af37]" />
              <p className="mt-4 text-white font-semibold">Corporate matching</p>
              <p className="mt-2 text-sm leading-7 text-gray-400">5% administration on employee and company match programs.</p>
            </button>
            <button onClick={() => void createImpactReport()} className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(8,8,8,0.92))] p-5 text-left transition hover:border-[#d4af37]/35">
              <LineChart size={20} className="text-[#d4af37]" />
              <p className="mt-4 text-white font-semibold">Impact report</p>
              <p className="mt-2 text-sm leading-7 text-gray-400">Custom reporting contracts for donors and institutions.</p>
            </button>
            <button onClick={() => void activateDonorTool()} className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(8,8,8,0.92))] p-5 text-left transition hover:border-[#d4af37]/35">
              <ShieldCheck size={20} className="text-[#d4af37]" />
              <p className="mt-4 text-white font-semibold">Donor tools</p>
              <p className="mt-2 text-sm leading-7 text-gray-400">Recurring giving, matching, and digest tooling.</p>
            </button>
          </div>
          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,16,16,0.96),rgba(8,8,8,0.92))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
            <h2 className="text-lg font-semibold text-white">Policy</h2>
            <p className="mt-3 text-sm leading-7 text-gray-400">Transparency, fiduciary controls, and donor restrictions remain operator-enforced. This surface starts service records, while review and management stay in Seva operations admin.</p>
            {feedback ? <p className="mt-4 text-sm text-[#f3deb1]">{feedback}</p> : null}
          </section>
        </div>
      </main>
    </div>
  );
}
