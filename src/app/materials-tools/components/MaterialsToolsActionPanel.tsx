'use client';

import { useEffect, useMemo, useState } from 'react';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import {
  fetchMaterialsToolsSettingsOverview,
  submitCoopCommit,
  submitElderApprovalRequest,
  submitMaterialsWishlist,
  submitToolLibraryApplication,
  submitVerifiedSupplierApplication
} from '@/app/lib/materialsToolsApi';
import type { MaterialsToolsActionRecord } from '@/app/lib/materialsToolsOps';

type Variant = 'wishlist' | 'tool-library' | 'supplier-application' | 'elder-approval' | 'coop-commit';

function variantToActionType(variant: Variant) {
  if (variant === 'tool-library') return 'tool-library-application';
  if (variant === 'supplier-application') return 'verified-supplier-application';
  if (variant === 'elder-approval') return 'elder-approval-request';
  if (variant === 'coop-commit') return 'coop-commit';
  return 'wishlist';
}

export default function MaterialsToolsActionPanel({ variant, title }: { variant: Variant; title: string }) {
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [units, setUnits] = useState(10);
  const [latestAction, setLatestAction] = useState<MaterialsToolsActionRecord | null>(null);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMaterialsToolsSettingsOverview()
      .then((json) => {
        setLatestAction(json.overview.latestByType[variantToActionType(variant)] || null);
      })
      .catch(() => setLatestAction(null));
  }, [variant]);

  const currentReviewLabel = useMemo(() => {
    if (!latestAction) return '';
    return latestAction.reviewStatus.replace(/-/g, ' ');
  }, [latestAction]);

  const submit = async () => {
    setSubmitting(true);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction(`submit ${title.toLowerCase()}`);
      if (variant === 'wishlist') {
        await submitMaterialsWishlist({ title: primary || 'Material request', details: secondary || 'Studio sourcing request' });
      } else if (variant === 'tool-library') {
        await submitToolLibraryApplication({ studioName: primary || 'Studio application', equipmentNeed: secondary || 'Shared equipment access' });
      } else if (variant === 'supplier-application') {
        await submitVerifiedSupplierApplication({ organization: primary || 'Supplier application', specialty: secondary || 'Materials & tools' });
      } else if (variant === 'elder-approval') {
        await submitElderApprovalRequest({ materialName: primary || 'Restricted material', useCase: secondary || 'Studio/cultural use case' });
      } else {
        await submitCoopCommit({ orderId: primary || 'coop-1', units: Math.max(1, units) });
      }
      const refreshed = await fetchMaterialsToolsSettingsOverview().catch(() => null);
      if (refreshed) {
        setLatestAction(refreshed.overview.latestByType[variantToActionType(variant)] || null);
      }
      setStatus({ type: 'success', message: `${title} submitted successfully.` });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : `Unable to submit ${title.toLowerCase()}.` });
    } finally {
      setSubmitting(false);
    }
  };

  const labels = {
    wishlist: ['What are you seeking?', 'Context for suppliers or co-ops'],
    'tool-library': ['Studio or applicant name', 'Equipment need / use case'],
    'supplier-application': ['Organisation or collective name', 'Primary specialty'],
    'elder-approval': ['Material needing approval', 'Why it is being requested'],
    'coop-commit': ['Co-op order ID', 'Units to commit']
  } as const;

  return (
    <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Wallet-gated action</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
      <div className="mt-5 space-y-3">
        <input
          value={primary}
          onChange={(e) => setPrimary(e.target.value)}
          placeholder={labels[variant][0]}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/45"
        />
        {variant === 'coop-commit' ? (
          <input
            type="number"
            min={1}
            value={units}
            onChange={(e) => setUnits(Number(e.target.value || 1))}
            placeholder={labels[variant][1]}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/45"
          />
        ) : (
          <textarea
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
            placeholder={labels[variant][1]}
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/45"
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => void submit()}
        disabled={submitting}
        className="mt-5 rounded-full bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f0c96f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Sign In and submit'}
      </button>
      {latestAction ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">Current review state</p>
          <p className="mt-2 text-white">{currentReviewLabel}</p>
          <p className="mt-2 text-[#9fe5ea]">{latestAction.summaryTitle}</p>
          {latestAction.reviewNote ? <p className="mt-2 text-[#f4c766]">Ops note: {latestAction.reviewNote}</p> : null}
        </div>
      ) : null}
      {status.type !== 'idle' ? (
        <p className={`mt-3 text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>{status.message}</p>
      ) : null}
    </section>
  );
}
