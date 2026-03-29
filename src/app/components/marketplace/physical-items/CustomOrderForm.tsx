'use client';

import { useState } from 'react';
import { X, Send, Package, Ruler, Palette, Clock, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { submitCustomWorkRequest } from '@/app/lib/customWorkApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

interface CustomOrderFormProps {
  makerName: string;
  category: string;
  basePrice: number;
  currency: string;
  onClose: () => void;
  onSubmit?: (data: CustomOrderData) => void;
}

export interface CustomOrderData {
  buyerName: string;
  buyerEmail: string;
  description: string;
  size: string;
  materials: string[];
  colorNotes: string;
  deadline: string;
  budget: number;
  referenceImages: string;
  specialInstructions: string;
}

const MATERIAL_OPTIONS: Record<string, string[]> = {
  beadwork: ['Glass beads', 'Czech seed beads', 'Sinew thread', 'Deer hide backing', 'Velvet backing'],
  pottery: ['Red clay', 'White slip', 'Matte glaze', 'Polished finish', 'Natural burnish'],
  weaving: ['Churro wool', 'Merino wool', 'Cotton warp', 'Natural dyes', 'Synthetic dyes'],
  jewelry: ['Sterling silver', 'Gold fill', 'Turquoise', 'Coral', 'Shell', 'Copper'],
  regalia: ['Eagle feathers (synthetic)', 'Deer hide', 'Elk hide', 'Cedar bark', 'Abalone shell'],
  carving: ['Red cedar', 'Yellow cedar', 'Alder', 'Yellow ochre paint', 'Natural pigments'],
  textiles: ['Merino wool', 'Cashmere', 'Organic cotton', 'Cedar bark strips', 'Nettle fibre'],
};

const DEADLINE_OPTIONS = [
  { value: '2w', label: '2 weeks (+50% rush fee)' },
  { value: '1m', label: '1 month (standard)' },
  { value: '2m', label: '2 months (preferred)' },
  { value: '3m', label: '3 months (comfortable)' },
  { value: 'flex', label: 'Flexible — maker decides' },
];

export default function CustomOrderForm({ makerName, category, basePrice, currency, onClose, onSubmit }: CustomOrderFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);

  const materials = MATERIAL_OPTIONS[category.toLowerCase()] ?? MATERIAL_OPTIONS['beadwork'];

  const [form, setForm] = useState<CustomOrderData>({
    buyerName: '',
    buyerEmail: '',
    description: '',
    size: '',
    materials: [],
    colorNotes: '',
    deadline: '2m',
    budget: basePrice,
    referenceImages: '',
    specialInstructions: '',
  });

  const toggleMaterial = (m: string) => {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.includes(m)
        ? prev.materials.filter((x) => x !== m)
        : [...prev.materials, m],
    }));
  };

  const handleSubmit = () => {
    const complete = async () => {
      await requireWalletAction('submit a custom order request');
      onSubmit?.(form);
      await submitCustomWorkRequest({
        channel: 'physical-items',
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
        requestedFor: makerName,
        title: `Custom ${category} order`,
        description: form.description,
        budget: form.budget,
        deadline: form.deadline,
        referenceUrl: form.referenceImages,
        specialInstructions: form.specialInstructions,
        matchedCreators: [makerName]
      }).catch(() => undefined);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    };
    void complete();
  };

  const canAdvance1 = form.description.trim().length > 10;
  const canAdvance2 = form.size.trim().length > 0 && form.deadline.length > 0;
  const canSubmit = form.buyerName.trim().length > 1 && /\S+@\S+\.\S+/.test(form.buyerEmail);

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#141414] border border-[#d4af37]/30 rounded-2xl p-10 max-w-sm w-full text-center">
          <CheckCircle size={52} className="text-[#d4af37] mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Request Sent!</h2>
          <p className="text-gray-400 text-sm">
            {makerName} will review your custom order request and respond within 48 hours.
          </p>
          <div className="mt-6 px-4 py-2 bg-[#d4af37]/10 rounded-lg text-[#d4af37] text-sm">
            Check your messages for updates
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141414] border border-[#d4af37]/30 rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold text-lg">Custom Order Request</h2>
            <p className="text-gray-400 text-xs mt-0.5">to {makerName}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s ? 'bg-[#d4af37] text-black' :
                step > s ? 'bg-green-500 text-black' :
                'bg-white/10 text-gray-400'
              }`}>{step > s ? '✓' : s}</div>
              {s < 3 && <div className={`flex-1 h-px w-12 mx-1 ${step > s ? 'bg-green-500' : 'bg-white/10'}`} />}
            </div>
          ))}
          <span className="ml-3 text-gray-400 text-xs">
            {step === 1 ? 'Description' : step === 2 ? 'Specs & Timeline' : 'Budget & Notes'}
          </span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Package size={14} className="text-[#d4af37]" /> Describe your vision
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder={`What would you like ${makerName} to create for you? Be as specific as possible.`}
                className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/60 resize-none"
              />
              <p className="text-gray-600 text-xs mt-1">{form.description.length}/500</p>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Palette size={14} className="text-[#d4af37]" /> Preferred materials
              </label>
              <div className="flex flex-wrap gap-2">
                {materials.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMaterial(m)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                      form.materials.includes(m)
                        ? 'bg-[#d4af37]/20 border-[#d4af37]/60 text-[#d4af37]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >{m}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Ruler size={14} className="text-[#d4af37]" /> Size / Dimensions
              </label>
              <input
                type="text"
                value={form.size}
                onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                placeholder='e.g. "12" x 8", medium, fits wrist 6.5"'
                className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Palette size={14} className="text-[#d4af37]" /> Colour notes
              </label>
              <input
                type="text"
                value={form.colorNotes}
                onChange={(e) => setForm((p) => ({ ...p, colorNotes: e.target.value }))}
                placeholder='e.g. "Earth tones, turquoise accent, no red"'
                className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Clock size={14} className="text-[#d4af37]" /> Needed by
              </label>
              <div className="relative">
                <select
                  value={form.deadline}
                  onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                  className="w-full appearance-none bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]/60"
                >
                  {DEADLINE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="px-6 py-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={form.buyerName}
                onChange={(e) => setForm((p) => ({ ...p, buyerName: e.target.value }))}
                placeholder="Your name"
                className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/60"
              />
              <input
                type="email"
                value={form.buyerEmail}
                onChange={(e) => setForm((p) => ({ ...p, buyerEmail: e.target.value }))}
                placeholder="Email for maker updates"
                className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1.5">
                Your budget ({currency})
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={basePrice}
                  max={basePrice * 4}
                  step={10}
                  value={form.budget}
                  onChange={(e) => setForm((p) => ({ ...p, budget: Number(e.target.value) }))}
                  className="flex-1 accent-[#d4af37]"
                />
                <span className="text-[#d4af37] font-bold text-lg w-20 text-right">{form.budget} {currency}</span>
              </div>
              <p className="text-gray-600 text-xs mt-1">Base price: {basePrice} {currency}</p>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1.5">
                Reference image URL (optional)
              </label>
              <input
                type="text"
                value={form.referenceImages}
                onChange={(e) => setForm((p) => ({ ...p, referenceImages: e.target.value }))}
                placeholder="https://example.com/reference.jpg"
                className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1.5">
                Special instructions
              </label>
              <textarea
                rows={3}
                value={form.specialInstructions}
                onChange={(e) => setForm((p) => ({ ...p, specialInstructions: e.target.value }))}
                placeholder="Anything else the maker should know…"
                className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/60 resize-none"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
              <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-300 text-xs">
                Custom orders require a 25% deposit via INDI token on acceptance. Maker has 48 hrs to accept.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-between">
          {step > 1 ? (
            <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="text-gray-400 hover:text-white text-sm transition-colors">
              ← Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              disabled={step === 1 ? !canAdvance1 : !canAdvance2}
              className="px-5 py-2 bg-[#d4af37] text-black text-sm font-semibold rounded-lg hover:bg-[#e5c84a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-5 py-2 bg-[#d4af37] text-black text-sm font-semibold rounded-lg hover:bg-[#e5c84a] transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} /> Send Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
