'use client';

import { useEffect, useState } from 'react';
import { buildLaunchReadinessExportUrl, fetchLaunchReadiness } from '@/app/lib/launchReadinessApi';
import type { LaunchReadinessSnapshot } from '@/app/lib/launchReadiness';

export default function LaunchReadinessClient() {
  const [snapshot, setSnapshot] = useState<LaunchReadinessSnapshot | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchLaunchReadiness()
      .then(setSnapshot)
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load launch readiness.'));
  }, []);

  if (!snapshot) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-[#111111] p-5 text-sm text-gray-300">
        {feedback || 'Loading launch readiness...'}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Overall status" value={snapshot.overallStatus === 'ready' ? 'Ready' : 'Warning'} />
        <MetricCard label="Passed checks" value={`${snapshot.score.passed}/${snapshot.score.total}`} />
        <MetricCard
          label="Audit status"
          value={snapshot.auditSummary?.clean ? 'Clean' : snapshot.auditSummary ? 'Issues present' : 'No audit summary'}
        />
        <MetricCard label="Last launch report" value={snapshot.lastLaunchReport?.overallStatus || 'Not generated yet'} />
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={buildLaunchReadinessExportUrl('csv')}
          className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]"
        >
          Export CSV
        </a>
        <a
          href={buildLaunchReadinessExportUrl('json')}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
        >
          Open JSON
        </a>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Readiness groups</h2>
          <div className="mt-4 space-y-4">
            {snapshot.groups.map((group) => (
              <article key={group.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{group.label}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {group.passed}/{group.total} checks passing
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${
                      group.passed === group.total ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'
                    }`}
                  >
                    {group.passed === group.total ? 'ready' : 'needs attention'}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {group.checks.map((check) => (
                    <div key={check.key} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
                      <span className="text-gray-300">{check.label}</span>
                      <span className={check.ok ? 'text-emerald-300' : 'text-amber-200'}>{check.value}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
            <h2 className="text-lg font-semibold text-white">Runtime posture</h2>
            <div className="mt-4 grid gap-3 text-sm text-gray-300">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Node env: {snapshot.runtime.nodeEnv}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Internal app API: {snapshot.runtime.useAppApi ? 'enabled' : 'disabled'}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Supabase: {snapshot.runtime.supabaseConfigured ? 'configured' : 'not configured'}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Mock fallback: {snapshot.runtime.mockFallbackEnabled ? 'enabled' : 'disabled'}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Tourism mocks: {snapshot.runtime.tourismMocksEnabled ? 'enabled' : 'disabled'}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Runtime persistence: {snapshot.runtime.runtimePersistenceAllowed ? 'enabled' : 'disabled'}</div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
            <h2 className="text-lg font-semibold text-white">Audit coverage</h2>
            {snapshot.auditSummary ? (
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  Routes visited: {snapshot.auditSummary.visitedRoutes}/{snapshot.auditSummary.totalManifestRoutes}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  Missing dynamic patterns: {snapshot.auditSummary.missingDynamicPatterns}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  Full audit issues: {snapshot.auditSummary.issueCount}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  Commerce issues: {snapshot.auditSummary.commerceIssueCount} | Modal issues: {snapshot.auditSummary.modalIssueCount}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-400">No audit summary has been generated yet. Run the release gate or launch report script.</p>
            )}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
            <h2 className="text-lg font-semibold text-white">Recommended next action</h2>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              {snapshot.overallStatus === 'ready'
                ? 'Launch checks are green. Keep the release gate required on main and refresh the launch report before each production rollout.'
                : 'Address the non-passing checks, rerun the release gate, and regenerate the launch report before production deployment.'}
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
