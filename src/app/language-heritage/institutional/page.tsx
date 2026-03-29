'use client';

import { useEffect, useMemo, useState } from 'react';
import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageCardGrid from '../components/HeritageCardGrid';
import HeritageHeroBanner from '../components/HeritageHeroBanner';
import { fetchSubscriptionEntitlements } from '@/app/lib/profileApi';
import { createEnterpriseInquiry } from '@/app/lib/enterpriseApi';
import {
  fetchInstitutionalArchiveSeats,
  saveInstitutionalArchiveSeat,
  type InstitutionalArchiveSeat
} from '@/app/lib/languageHeritageApi';

export default function Page() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'researcher' | 'viewer'>('researcher');
  const [seats, setSeats] = useState<InstitutionalArchiveSeat[]>([]);
  const [seatLimit, setSeatLimit] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasInstitutionalAccess, setHasInstitutionalAccess] = useState(false);
  const [inquiry, setInquiry] = useState({ name: '', email: '', organization: '', scope: '', budget: '', detail: '' });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([fetchSubscriptionEntitlements(), fetchInstitutionalArchiveSeats()])
      .then((results) => {
        if (cancelled) return;
        const entitlementResult = results[0];
        if (entitlementResult.status === 'fulfilled') {
          setHasInstitutionalAccess(entitlementResult.value.accessPlanIds.includes('institutional-archive'));
        }
        const seatResult = results[1];
        if (seatResult.status === 'fulfilled') {
          setSeats(seatResult.value.seats);
          setSeatLimit(seatResult.value.seatLimit);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeSeats = useMemo(() => seats.filter((seat) => seat.status !== 'revoked').length, [seats]);

  async function handleAddSeat() {
    try {
      setSaving(true);
      setFeedback('');
      const result = await saveInstitutionalArchiveSeat({ email, role });
      setSeats((current) => [result.seat, ...current.filter((seat) => seat.email !== result.seat.email)]);
      setSeatLimit(result.seatLimit);
      setEmail('');
      setFeedback('Institutional seat saved.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save institutional seat.');
    } finally {
      setSaving(false);
    }
  }

  async function handleInquiry() {
    try {
      setSubmittingInquiry(true);
      setFeedback('');
      await createEnterpriseInquiry({ channel: 'institutional-access', ...inquiry });
      setInquiry({ name: '', email: '', organization: '', scope: '', budget: '', detail: '' });
      setFeedback('Institutional inquiry submitted.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to submit institutional inquiry.');
    } finally {
      setSubmittingInquiry(false);
    }
  }

  return (
    <LanguageHeritageFrame title="Institutional Access Portal" subtitle="Plans for universities, museums, and research institutions.">
      <HeritageHeroBanner
        eyebrow="Institution Access"
        title="Enterprise-Grade Heritage Access"
        description="Provision access for universities, museums, and libraries with usage controls, reporting, and community-led permissions."
        image="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1400&h=700&fit=crop"
        chips={['Bulk Licensing', 'Usage Reporting', 'API Ready']}
        actions={[
          { href: '/language-heritage/consulting', label: 'Talk to Partnerships' },
          { href: '/subscription', label: 'Upgrade plan', tone: 'secondary' }
        ]}
      />

      {hasInstitutionalAccess ? (
        <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#d4af37]">Seat control</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Institutional accounts</h2>
              <p className="mt-1 text-sm text-gray-400">{activeSeats}/{seatLimit || 50} seats assigned</p>
            </div>
            <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300">
              {loading ? 'Loading seats...' : `${Math.max((seatLimit || 50) - activeSeats, 0)} seats remaining`}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr,0.9fr,auto]">
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="researcher@institution.org" className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35" />
            <select value={role} onChange={(event) => setRole(event.target.value as typeof role)} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35">
              <option value="admin">Admin</option>
              <option value="researcher">Researcher</option>
              <option value="viewer">Viewer</option>
            </select>
            <button onClick={handleAddSeat} disabled={saving || !email.trim()} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60">
              {saving ? 'Saving...' : 'Add seat'}
            </button>
          </div>

          {feedback ? <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{feedback}</div> : null}

          <div className="mt-4 space-y-3">
            {seats.map((seat) => (
              <div key={seat.id} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{seat.email}</p>
                    <p className="mt-1 text-xs text-gray-400">{seat.role} · {seat.status}</p>
                  </div>
                  <span className="text-xs text-[#d4af37]">{seat.createdAt.slice(0, 10)}</span>
                </div>
              </div>
            ))}
            {!loading && seats.length === 0 ? <p className="text-sm text-gray-400">No institutional seats assigned yet.</p> : null}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-[#d4af37]/25 bg-[#101010] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Institutional gate</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Institutional Archive plan required</h2>
          <p className="mt-2 text-sm leading-7 text-gray-300">
            Seat management, audit exports, and shared institutional access controls only unlock on the Institutional Archive plan.
          </p>
          <div className="mt-4">
            <a href="/subscription" className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
              Upgrade archive access
            </a>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-white/10 bg-[#101010] p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">B2B intake</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Institutional inquiry</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input value={inquiry.name} onChange={(event) => setInquiry((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35" />
          <input value={inquiry.email} onChange={(event) => setInquiry((current) => ({ ...current, email: event.target.value }))} placeholder="Work email" className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35" />
          <input value={inquiry.organization} onChange={(event) => setInquiry((current) => ({ ...current, organization: event.target.value }))} placeholder="Institution" className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35" />
          <input value={inquiry.scope} onChange={(event) => setInquiry((current) => ({ ...current, scope: event.target.value }))} placeholder="Seat count / archive scope" className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35" />
          <input value={inquiry.budget} onChange={(event) => setInquiry((current) => ({ ...current, budget: event.target.value }))} placeholder="Budget" className="rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35 md:col-span-2" />
          <textarea value={inquiry.detail} onChange={(event) => setInquiry((current) => ({ ...current, detail: event.target.value }))} placeholder="Describe archive access, reporting, licensing, or governance needs." className="min-h-28 rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35 md:col-span-2" />
        </div>
        <div className="mt-4">
          <button onClick={handleInquiry} disabled={submittingInquiry || !inquiry.name || !inquiry.email || !inquiry.detail} className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60">
            {submittingInquiry ? 'Submitting...' : 'Submit institutional inquiry'}
          </button>
        </div>
      </section>

      <HeritageCardGrid
        title="Institution Readiness"
        columns={3}
        items={[
          { title: 'Governance Controls', meta: 'Role-based access + protocol consent logs', badge: 'Compliance' },
          { title: 'Audit Exports', meta: 'Downloadable access and citation history', badge: 'Audit' },
          { title: 'SLA Coverage', meta: 'Dedicated partner support queue', badge: 'Support' }
        ]}
      />
    </LanguageHeritageFrame>
  );
}
