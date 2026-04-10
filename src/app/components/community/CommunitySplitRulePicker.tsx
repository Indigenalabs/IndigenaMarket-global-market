'use client';

import type { RevenueSplitRuleRecord } from '@/app/lib/platformAccounts';

type Props = {
  accountLabel?: string;
  splitRules: RevenueSplitRuleRecord[];
  selectedSplitRuleId: string;
  onSelect: (value: string) => void;
};

export default function CommunitySplitRulePicker({
  accountLabel,
  splitRules,
  selectedSplitRuleId,
  onSelect
}: Props) {
  if (!splitRules.length) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100">
        <p className="font-semibold">No active community split rules yet</p>
        <p className="mt-1 text-amber-100/80">
          This storefront can publish, but treasury routing has not been configured. Add an active split rule before going live if this listing should feed a community treasury.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af37]">Community treasury routing</p>
      <h3 className="mt-2 text-sm font-semibold text-white">
        Choose how this {accountLabel ? `${accountLabel} ` : ''}listing routes revenue
      </h3>
      <p className="mt-1 text-sm text-gray-400">
        We will attach the selected split rule to this storefront listing so publishing and later settlement use the same community treasury intent.
      </p>
      <div className="mt-4 space-y-3">
        {splitRules.map((rule) => {
          const selected = rule.id === selectedSplitRuleId;
          return (
            <button
              key={rule.id}
              type="button"
              onClick={() => onSelect(rule.id)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                selected
                  ? 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-white/10 bg-black/20 hover:border-white/25'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-sm font-semibold ${selected ? 'text-[#f3ddb1]' : 'text-white'}`}>{rule.offeringLabel}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-500">{rule.ruleType.replace('-', ' ')}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  selected ? 'bg-[#d4af37] text-black' : 'bg-white/10 text-gray-300'
                }`}>
                  {selected ? 'Selected' : rule.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-300">{rule.notes || 'Community treasury rule'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {rule.beneficiaries.map((beneficiary) => (
                  <span
                    key={beneficiary.id}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300"
                  >
                    {beneficiary.label}: {beneficiary.percentage}%
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
