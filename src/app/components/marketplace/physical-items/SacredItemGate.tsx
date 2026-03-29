'use client';

import { useState } from 'react';
import { AlertTriangle, Shield, Check, X, ChevronRight } from 'lucide-react';

interface SacredItemGateProps {
  itemTitle: string;
  makerName: string;
  nation: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const questions = [
  {
    id: 'indigenous',
    label: 'I identify as an Indigenous person or have direct Indigenous heritage',
  },
  {
    id: 'ceremonial',
    label: 'This item is intended for ceremonial, spiritual, or cultural use — not decoration',
  },
  {
    id: 'protocol',
    label: 'I understand and will respect the cultural protocols associated with this item',
  },
  {
    id: 'no_resell',
    label: 'I will not resell or commercialise this sacred item',
  },
];

export default function SacredItemGate({ itemTitle, makerName, nation, onConfirm, onCancel }: SacredItemGateProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const allChecked = questions.every((q) => checked.has(q.id));

  const toggle = (id: string) =>
    setChecked((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const handleConfirm = () => {
    if (!allChecked) return;
    setSubmitted(true);
    setTimeout(onConfirm, 800);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141414] rounded-2xl border border-[#DC143C]/40 w-full max-w-lg shadow-2xl shadow-[#DC143C]/10">

        {/* Header */}
        <div className="p-5 border-b border-[#DC143C]/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#DC143C]/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-[#DC143C]" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Sacred Item — Cultural Protocol Required</h2>
                <p className="text-gray-400 text-sm">{nation} Nation · by {makerName}</p>
              </div>
            </div>
            <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Item name */}
          <div className="p-3 bg-[#DC143C]/10 border border-[#DC143C]/20 rounded-xl mb-4">
            <p className="text-[#DC143C] text-xs font-semibold mb-0.5">Item requiring confirmation</p>
            <p className="text-white text-sm font-medium">{itemTitle}</p>
          </div>

          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            This item holds cultural and spiritual significance to the {nation} people. 
            Before purchasing, please confirm the following so the maker can ensure this piece reaches the right hands:
          </p>

          {/* Checkboxes */}
          <div className="space-y-3 mb-5">
            {questions.map((q) => (
              <label key={q.id} className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => toggle(q.id)}
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    checked.has(q.id)
                      ? 'bg-[#d4af37] border-[#d4af37]'
                      : 'border-gray-600 group-hover:border-[#d4af37]'
                  }`}
                >
                  {checked.has(q.id) && <Check size={11} className="text-black" />}
                </div>
                <span className="text-gray-300 text-sm leading-relaxed">{q.label}</span>
              </label>
            ))}
          </div>

          {/* Elder note */}
          <div className="flex items-start gap-2 p-3 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl mb-5">
            <Shield size={14} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
            <p className="text-gray-400 text-xs leading-relaxed">
              This confirmation is reviewed by the maker and, in some cases, an elder from the {nation} Nation. 
              Misrepresentation is a violation of cultural trust and platform terms.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 bg-[#0a0a0a] border border-white/10 text-gray-400 font-medium rounded-xl hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!allChecked || submitted}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-xl transition-all ${
                allChecked && !submitted
                  ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {submitted ? (
                <span className="flex items-center gap-2">
                  <Check size={14} />
                  Confirmed
                </span>
              ) : (
                <>
                  Confirm & Continue
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>

          {!allChecked && (
            <p className="text-center text-gray-600 text-xs mt-2">
              Please confirm all {questions.length} statements above to proceed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
