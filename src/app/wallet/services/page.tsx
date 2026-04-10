'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import WalletSessionEntry from '@/app/components/WalletSessionEntry';
import { fetchAccountSessionMe } from '@/app/lib/accountAuthClient';
import { createBnplApplicationApi, purchaseTaxReportApi, requestInstantPayoutApi } from '@/app/lib/financialServicesApi';
import { fetchMyFiatRailsSnapshot, requestMyFiatRailsReview, saveMyFiatPayoutDestination } from '@/app/lib/fiatRailsApi';
import type { FiatPayoutDestinationType, FiatRailsSnapshot } from '@/app/lib/fiatRails';

const emptySnapshot: FiatRailsSnapshot = {
  complianceProfile: null,
  destinations: [],
  readiness: {
    kycApproved: false,
    amlApproved: false,
    payoutEnabled: false,
    instantPayoutReady: false
  }
};

export default function WalletServicesPage() {
  const [actorId, setActorId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [profileSlug, setProfileSlug] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<FiatRailsSnapshot>(emptySnapshot);
  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('420');
  const [destinationLabel, setDestinationLabel] = useState('Primary bank payout');
  const [destinationType, setDestinationType] = useState<FiatPayoutDestinationType>('bank_account');
  const [accountName, setAccountName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [last4, setLast4] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const account = await fetchAccountSessionMe();
      if (!account?.actorId) {
        setActorId('');
        setWalletAddress('');
        setProfileSlug('');
        setEmail('');
        setSnapshot(emptySnapshot);
        setSelectedDestinationId('');
        return;
      }
      setActorId(account.actorId);
      setWalletAddress(account.walletAddress || '');
      setProfileSlug(account.creatorProfileSlug || '');
      setEmail(account.email || '');
      const nextSnapshot = await fetchMyFiatRailsSnapshot(account.creatorProfileSlug || '');
      setSnapshot(nextSnapshot);
      const preferred = nextSnapshot.destinations.find((entry) => entry.isDefault) || nextSnapshot.destinations[0] || null;
      setSelectedDestinationId(preferred?.id || '');
      if (preferred) {
        setDestinationLabel(preferred.label || 'Primary bank payout');
        setDestinationType(preferred.destinationType);
        setAccountName(preferred.accountName || '');
        setInstitutionName(preferred.institutionName || '');
        setLast4(preferred.last4 || '');
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load financial services.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedDestination = useMemo(
    () => snapshot.destinations.find((entry) => entry.id === selectedDestinationId) || null,
    [selectedDestinationId, snapshot.destinations]
  );

  async function saveDestination() {
    if (!actorId) return;
    if (!destinationLabel.trim()) {
      setError('Add a destination label before saving.');
      setFeedback('');
      return;
    }
    setBusyAction('save-destination');
    setFeedback('');
    setError('');
    try {
      const result = await saveMyFiatPayoutDestination({
        profileSlug,
        label: destinationLabel,
        destinationType,
        accountName,
        institutionName,
        last4,
        isDefault: true,
        metadata: { savedFrom: 'wallet-services' }
      });
      setSnapshot(result.snapshot);
      setSelectedDestinationId(result.destination.id);
      setFeedback(`Saved ${result.destination.label}. Status: ${result.destination.status}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save payout destination.');
    } finally {
      setBusyAction('');
    }
  }

  async function requestReview() {
    if (!actorId) return;
    setBusyAction('request-review');
    setFeedback('');
    setError('');
    try {
      const nextSnapshot = await requestMyFiatRailsReview({
        profileSlug,
        note: 'Wallet services review requested by the account owner.'
      });
      setSnapshot(nextSnapshot);
      setFeedback('Compliance review requested. Ops can now review KYC, AML, and payout enablement in governance/admin.');
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Unable to request compliance review.');
    } finally {
      setBusyAction('');
    }
  }

  async function requestPayout() {
    if (!actorId) return;
    const amount = Number(payoutAmount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid payout amount.');
      setFeedback('');
      return;
    }
    setBusyAction('request-payout');
    setFeedback('');
    setError('');
    try {
      const payout = await requestInstantPayoutApi({
        actorId,
        walletAddress,
        amount,
        profileSlug,
        destinationId: selectedDestinationId,
        note: 'Wallet services instant payout request'
      });
      await load();
      setFeedback(
        `Instant payout submitted. Queue status: ${payout.status}. Risk: ${payout.riskLevel}. Net ${payout.netAmount.toFixed(2)} USD${payout.reserveHoldAmount > 0 ? ` after a ${payout.reserveHoldAmount.toFixed(2)} USD reserve hold` : ''}.`
      );
    } catch (payoutError) {
      setError(payoutError instanceof Error ? payoutError.message : 'Unable to request payout.');
    } finally {
      setBusyAction('');
    }
  }

  async function applyBnpl() {
    if (!actorId) return;
    setBusyAction('bnpl');
    setFeedback('');
    setError('');
    try {
      const app = await createBnplApplicationApi({ actorId, orderId: `market-order-${actorId}`, amount: 560 });
      setFeedback(`BNPL submitted to ${app.partner}. Service fee ${app.feeAmount.toFixed(2)} USD.`);
    } catch (bnplError) {
      setError(bnplError instanceof Error ? bnplError.message : 'Unable to submit BNPL application.');
    } finally {
      setBusyAction('');
    }
  }

  async function buyTaxReport() {
    if (!actorId) return;
    setBusyAction('tax');
    setFeedback('');
    setError('');
    try {
      const report = await purchaseTaxReportApi({ actorId, taxYear: 2025 });
      setFeedback(`Tax report purchased for ${report.taxYear}. Fee ${report.feeAmount.toFixed(2)} USD.`);
    } catch (taxError) {
      setError(taxError instanceof Error ? taxError.message : 'Unable to purchase tax report.');
    } finally {
      setBusyAction('');
    }
  }

  const readinessCards = [
    { label: 'KYC', value: snapshot.readiness.kycApproved ? 'Approved' : snapshot.complianceProfile?.kycStatus || 'Pending' },
    { label: 'AML', value: snapshot.readiness.amlApproved ? 'Approved' : snapshot.complianceProfile?.amlStatus || 'Pending' },
    { label: 'Payouts', value: snapshot.readiness.payoutEnabled ? 'Enabled' : 'Review needed' },
    { label: 'Instant rail', value: snapshot.readiness.instantPayoutReady ? 'Ready' : 'Not ready' }
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Phase 6 financial rails</p>
          <h1 className="mt-2 text-4xl font-semibold">Fiat payouts, compliance, and settlement readiness</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
            This is the full Phase 6 wallet services lane. We use saved payout destinations, governance-backed compliance status,
            and ops-visible payout queue metadata instead of the old stub payout request flow.
          </p>
        </section>

        <WalletSessionEntry variant="panel" />

        {loading ? (
          <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6 text-sm text-gray-300">
            Loading your payout and compliance profile...
          </section>
        ) : null}

        {!loading && !actorId ? (
          <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6 text-sm text-gray-300">
            Sign in first. Once your account session is active, we’ll load your payout destinations, compliance profile, and service actions here.
          </section>
        ) : null}

        {!loading && actorId ? (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              {readinessCards.map((card) => (
                <div key={card.label} className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{card.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="rounded-[24px] border border-white/10 bg-[#111111] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Instant payout rail</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Request an instant payout</h2>
                    <p className="mt-2 text-sm leading-7 text-gray-400">
                      Payouts now route through saved destinations, risk thresholds, and governance review states. The finance admin queue sees the same routing metadata you choose here.
                    </p>
                  </div>
                  <Link href="/admin/financial-services" className="text-sm text-[#f3deb1] underline underline-offset-4">
                    Finance admin
                  </Link>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm text-gray-300">
                    <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Signed-in account</span>
                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white">{email || actorId}</div>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-gray-300">
                    <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Creator profile slug</span>
                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white">{profileSlug || 'No creator profile linked'}</div>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-gray-300">
                    <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Payout destination</span>
                    <select
                      value={selectedDestinationId}
                      onChange={(event) => setSelectedDestinationId(event.target.value)}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
                    >
                      <option value="">Choose a saved payout destination</option>
                      {snapshot.destinations.map((destination) => (
                        <option key={destination.id} value={destination.id}>
                          {destination.label} ({destination.destinationType.replace('_', ' ')}) {destination.last4 ? `•••• ${destination.last4}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-gray-300">
                    <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Payout amount (USD)</span>
                    <input
                      value={payoutAmount}
                      onChange={(event) => setPayoutAmount(event.target.value)}
                      inputMode="decimal"
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
                    />
                  </label>
                </div>

                {selectedDestination ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
                    <p className="font-medium text-white">Selected destination</p>
                    <p className="mt-2">
                      {selectedDestination.label} • {selectedDestination.destinationType.replace('_', ' ')}
                      {selectedDestination.last4 ? ` • •••• ${selectedDestination.last4}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Status: {selectedDestination.status} • {selectedDestination.institutionName || 'Institution pending'}
                    </p>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void requestPayout()}
                    disabled={busyAction === 'request-payout' || !selectedDestinationId}
                    className="rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm font-semibold text-[#f3deb1] transition hover:bg-[#d4af37]/20 disabled:opacity-60"
                  >
                    {busyAction === 'request-payout' ? 'Submitting...' : 'Request instant payout'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void requestReview()}
                    disabled={busyAction === 'request-review'}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:opacity-60"
                  >
                    {busyAction === 'request-review' ? 'Requesting...' : 'Request compliance review'}
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#111111] p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Payout onboarding</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Save or update a payout destination</h2>
                <div className="mt-5 space-y-4">
                  <label className="flex flex-col gap-2 text-sm text-gray-300">
                    <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Destination label</span>
                    <input value={destinationLabel} onChange={(event) => setDestinationLabel(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none" />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-gray-300">
                    <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Destination type</span>
                    <select value={destinationType} onChange={(event) => setDestinationType(event.target.value as FiatPayoutDestinationType)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none">
                      <option value="bank_account">Bank account</option>
                      <option value="payid">PayID</option>
                      <option value="debit_card">Debit card</option>
                      <option value="manual_review">Manual review</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-gray-300">
                    <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Account name</span>
                    <input value={accountName} onChange={(event) => setAccountName(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none" />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-gray-300">
                    <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Institution / provider</span>
                    <input value={institutionName} onChange={(event) => setInstitutionName(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none" />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-gray-300">
                    <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Last 4</span>
                    <input value={last4} onChange={(event) => setLast4(event.target.value.replace(/[^0-9]/g, '').slice(-4))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none" />
                  </label>
                  <button
                    type="button"
                    onClick={() => void saveDestination()}
                    disabled={busyAction === 'save-destination'}
                    className="w-full rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-60"
                  >
                    {busyAction === 'save-destination' ? 'Saving...' : 'Save payout destination'}
                  </button>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-[#111111] p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Saved destinations</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Current payout rails</h2>
                <div className="mt-4 space-y-3">
                  {snapshot.destinations.length === 0 ? (
                    <p className="text-sm text-gray-400">No payout destinations saved yet.</p>
                  ) : (
                    snapshot.destinations.map((destination) => (
                      <div key={destination.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-white">{destination.label}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {destination.destinationType.replace('_', ' ')}{destination.last4 ? ` • •••• ${destination.last4}` : ''}
                              {destination.isDefault ? ' • default' : ''}
                            </p>
                          </div>
                          <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{destination.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#111111] p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Other services</p>
                <h2 className="mt-2 text-xl font-semibold text-white">BNPL and tax reporting</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <button onClick={() => void applyBnpl()} disabled={busyAction === 'bnpl'} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-black/30 disabled:opacity-60">
                    <p className="font-medium text-white">BNPL partner lane</p>
                    <p className="mt-2 text-sm text-gray-400">Submit a larger order into the installment program.</p>
                  </button>
                  <button onClick={() => void buyTaxReport()} disabled={busyAction === 'tax'} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-black/30 disabled:opacity-60">
                    <p className="font-medium text-white">Tax report</p>
                    <p className="mt-2 text-sm text-gray-400">Buy a generated tax packet for creator accounting support.</p>
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {(feedback || error) ? (
          <section className={`rounded-[24px] border p-4 text-sm ${error ? 'border-[#DC143C]/30 bg-[#DC143C]/10 text-[#ffb7b7]' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'}`}>
            {error || feedback}
          </section>
        ) : null}
      </div>
    </main>
  );
}

