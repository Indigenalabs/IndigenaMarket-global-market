'use client';

import { useMemo, useState } from 'react';
import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageCardGrid from '../components/HeritageCardGrid';
import HeritageHeroBanner from '../components/HeritageHeroBanner';
import { submitSacredAccessRequest } from '@/app/lib/languageHeritageApi';

const listingOptions = [
  { id: 'lh-3', label: 'Community Place Name Atlas' },
  { id: 'lh-8', label: 'ICIP Policy & Protocol Advisory Pack' },
  { id: 'lh-2', label: 'Elder Storytelling Night Archive' }
];

export default function Page() {
  const [requesterName, setRequesterName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [listingId, setListingId] = useState(listingOptions[0].id);
  const [purpose, setPurpose] = useState('language revitalization');
  const [justification, setJustification] = useState('');
  const [acknowledgedProtocols, setAcknowledgedProtocols] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  const canSubmit = useMemo(() => {
    return requesterName.trim().length > 2 && affiliation.trim().length > 2 && justification.trim().length > 20 && acknowledgedProtocols;
  }, [requesterName, affiliation, justification, acknowledgedProtocols]);

  const onSubmit = async () => {
    if (!canSubmit) {
      setStatus({ type: 'error', message: 'Complete all fields and acknowledge protocol terms.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Submitting request...' });
    try {
      const response = await submitSacredAccessRequest({
        requesterName: requesterName.trim(),
        affiliation: affiliation.trim(),
        listingId,
        purpose,
        justification: justification.trim(),
        acknowledgedProtocols
      });
      setStatus({ type: 'success', message: `Request submitted. ID: ${response.requestId} (${response.status}).` });
    } catch (error) {
      setStatus({ type: 'error', message: (error as Error).message || 'Request submission failed.' });
    }
  };

  return (
    <LanguageHeritageFrame title="Sacred Content Request Form" subtitle="Submit documented requests for restricted cultural materials.">
      <HeritageHeroBanner
        eyebrow="Protected Access"
        title="Sacred Content Request Workflow"
        description="Request restricted material access with affiliation evidence, purpose statements, and Elder-reviewed protocol compliance."
        image="https://images.unsplash.com/photo-1519817914152-22f90e8f5d7b?w=1400&h=700&fit=crop"
        chips={['Elder Approval', 'Audit Trail', 'Access Logs']}
        actions={[
          { href: '/language-heritage/sacred', label: 'Open Sacred Portal' },
          { href: '/language-heritage/community-portal', label: 'Back to Community Portal', tone: 'secondary' }
        ]}
      />

      <section className="grid gap-5 lg:grid-cols-[1.25fr,1fr]">
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Access Request Form</h2>
          <div className="mt-3 grid gap-3">
            <input
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              placeholder="Requester name"
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45"
            />
            <input
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="Community or institution affiliation"
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45"
            />
            <select
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45"
            >
              {listingOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45"
            >
              <option value="language revitalization">Language revitalization</option>
              <option value="community ceremony">Community ceremony support</option>
              <option value="approved research">Approved research project</option>
              <option value="education program">Education program</option>
            </select>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain purpose, expected use, and community benefit (minimum 20 chars)."
              className="min-h-28 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45"
            />
            <label className="flex items-center gap-2 rounded-lg border border-[#d4af37]/20 bg-black/30 px-3 py-2 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={acknowledgedProtocols}
                onChange={(e) => setAcknowledgedProtocols(e.target.checked)}
                className="h-4 w-4 accent-[#d4af37]"
              />
              I acknowledge community protocols and ICIP usage terms.
            </label>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit || status.type === 'loading'}
              className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status.type === 'loading' ? 'Submitting...' : 'Submit to Elder Review'}
            </button>
            {status.type !== 'idle' ? (
              <p className={`rounded-lg border px-3 py-2 text-sm ${status.type === 'error' ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'}`}>
                {status.message}
              </p>
            ) : null}
          </div>
        </article>

        <HeritageCardGrid
          title="Request Checklist"
          columns={2}
          items={[
            { title: 'Protocol Notice', meta: 'Read and acknowledge cultural restrictions first', badge: 'Step 1', actionLabel: 'Review' },
            { title: 'Affiliation Verification', meta: 'Confirm community or institutional identity', badge: 'Step 2', actionLabel: 'Verify' },
            { title: 'Purpose Statement', meta: 'Explain intent and materials requested', badge: 'Step 3', actionLabel: 'Submit Details' },
            { title: 'Request Status', meta: 'Track pending, approved, or rejected decisions', badge: 'Step 4', actionLabel: 'View Queue' }
          ]}
        />
      </section>

      <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-red-200">
          Access is never automatic. Sacred materials are governed by community law and Elder authority, with full decision logging.
        </p>
      </section>
    </LanguageHeritageFrame>
  );
}
