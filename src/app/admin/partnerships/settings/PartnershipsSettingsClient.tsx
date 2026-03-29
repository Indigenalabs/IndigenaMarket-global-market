'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Settings2, ShieldAlert } from 'lucide-react';
import {
  fetchEnterprisePipelineSettings,
  updateEnterprisePipelineSettings,
  type EnterpriseInquiryRecord
} from '@/app/lib/enterpriseApi';
import { DEFAULT_ENTERPRISE_STAGE_WEIGHTS, type EnterpriseStageWeightMap } from '@/app/lib/enterpriseForecastConfig';

const STAGE_ORDER: EnterpriseInquiryRecord['contractStage'][] = ['lead', 'discovery', 'proposal', 'negotiation', 'won', 'lost'];

function hasAdminSession() {
  if (typeof window === 'undefined') return false;
  return (window.localStorage.getItem('indigena_admin_signed') || '').trim().toLowerCase() === 'true';
}

export default function PartnershipsSettingsClient() {
  const [adminReady, setAdminReady] = useState(false);
  const [stageWeights, setStageWeights] = useState<EnterpriseStageWeightMap>(DEFAULT_ENTERPRISE_STAGE_WEIGHTS);
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!hasAdminSession()) return;
    setAdminReady(true);
    fetchEnterprisePipelineSettings()
      .then((settings) => setStageWeights(settings.stageWeights || DEFAULT_ENTERPRISE_STAGE_WEIGHTS))
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load partnership settings.'));
  }, []);

  async function handleSave() {
    try {
      setIsSaving(true);
      setFeedback('');
      const settings = await updateEnterprisePipelineSettings(stageWeights);
      setStageWeights(settings.stageWeights || DEFAULT_ENTERPRISE_STAGE_WEIGHTS);
      setFeedback('Partnership pipeline settings updated.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save partnership settings.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!adminReady) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-[#d4af37]" />
          <div>
            <h1 className="text-xl font-semibold text-white">Admin access required</h1>
            <p className="text-sm text-gray-400">This settings view is only available to signed admin sessions.</p>
          </div>
        </div>
        <Link href="/admin/partnerships" className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to partnerships review
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Settings2 className="text-[#d4af37]" />
          <div>
            <h1 className="text-xl font-semibold text-white">Partnership Pipeline Settings</h1>
            <p className="text-sm text-gray-400">Adjust forecast weights for partnership stages without changing code.</p>
          </div>
        </div>
        <Link href="/admin/partnerships" className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to review
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {STAGE_ORDER.map((stage) => (
          <label key={stage} className="grid gap-2 text-sm text-gray-300">
            {stage}
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={stageWeights[stage]}
              onChange={(event) =>
                setStageWeights((current) => ({
                  ...current,
                  [stage]: Math.max(0, Math.min(1, Number(event.target.value || 0)))
                }))
              }
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
            />
          </label>
        ))}
      </div>

      <button
        onClick={() => void handleSave()}
        disabled={isSaving}
        className="mt-6 rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
      >
        {isSaving ? 'Saving...' : 'Save forecast settings'}
      </button>

      {feedback ? <p className="mt-4 text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
