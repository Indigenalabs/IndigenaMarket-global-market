'use client';

import { useMemo } from 'react';
import {
  Shield, Clock, CheckCircle, Circle, AlertCircle,
  Wallet, MessageCircle, FileText
} from 'lucide-react';
import { calculateTransactionQuote, formatMoney } from '@/app/lib/monetization';

interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'disputed';
  dueDate: string;
  completedAt?: string;
}

interface EscrowPaymentFlowProps {
  orderId: string;
  totalAmount: number;
  freelancerName: string;
  milestones: Milestone[];
  onReleaseMilestone: (milestoneId: string) => void;
  onDispute: (milestoneId: string) => void;
}

export default function EscrowPaymentFlow({
  orderId,
  totalAmount,
  freelancerName,
  milestones,
  onReleaseMilestone,
  onDispute
}: EscrowPaymentFlowProps) {
  const releasedAmount = milestones
    .filter((milestone) => milestone.status === 'completed')
    .reduce((sum, milestone) => sum + milestone.amount, 0);

  const quote = useMemo(
    () => calculateTransactionQuote({ pillar: 'freelancing', subtotal: totalAmount, escrowProtected: true }),
    [totalAmount]
  );

  const pendingAmount = totalAmount - releasedAmount;

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'in_progress': return <Clock size={16} className="text-[#d4af37]" />;
      case 'disputed': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Circle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return 'border-green-500/30 bg-green-500/10';
      case 'in_progress': return 'border-[#d4af37]/30 bg-[#d4af37]/10';
      case 'disputed': return 'border-red-500/30 bg-red-500/10';
      default: return 'border-white/10 bg-[#141414]';
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#141414]">
      <div className="border-b border-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#d4af37]" />
            <h3 className="font-semibold text-white">Escrow payment</h3>
          </div>
          <span className="font-mono text-xs text-gray-400">#{orderId}</span>
        </div>
      </div>

      <div className="border-b border-white/5 bg-[#0f0f0f] p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs text-gray-400">In escrow</p>
            <p className="text-xl font-bold text-[#d4af37]">{formatMoney(pendingAmount)}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-gray-400">Released</p>
            <p className="text-xl font-bold text-green-400">{formatMoney(releasedAmount)}</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>Payment progress</span>
            <span>{Math.round((releasedAmount / totalAmount) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div className="h-full bg-gradient-to-r from-[#d4af37] to-green-500 transition-all duration-500" style={{ width: `${(releasedAmount / totalAmount) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="border-b border-white/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Working with</span>
          <span className="font-medium text-white">{freelancerName}</span>
        </div>
      </div>

      <div className="border-b border-white/5 bg-black/10 p-4 text-sm text-gray-300">
        <div className="flex items-center justify-between">
          <span>Escrow protection fee</span>
          <span className="font-medium text-white">{formatMoney(quote.escrowFee)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span>Firekeeper fee (freelancer-funded)</span>
          <span className="font-medium text-white">{formatMoney(quote.platformFee)}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Freelancer payout estimate: {formatMoney(quote.creatorNet)} after the {Math.round(quote.effectiveCreatorRate * 100)}% platform fee. Escrow protection is billed separately to the client.
        </p>
      </div>

      <div className="p-4">
        <h4 className="mb-3 font-medium text-white">Milestones</h4>
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div key={milestone.id} className={`rounded-xl border p-4 transition-all ${getStatusColor(milestone.status)}`}>
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(milestone.status)}
                  <span className="text-sm font-medium text-white">{milestone.title}</span>
                </div>
                <span className="font-bold text-[#d4af37]">{formatMoney(milestone.amount)}</span>
              </div>

              <div className="mb-3 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  Due: {milestone.dueDate}
                </span>
                {milestone.completedAt && <span className="text-green-400">Completed: {milestone.completedAt}</span>}
              </div>

              {milestone.status === 'in_progress' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onReleaseMilestone(milestone.id)}
                    className="flex-1 rounded-lg bg-[#d4af37] py-2 text-xs font-medium text-black transition-colors hover:bg-[#f4e4a6]"
                  >
                    Release payment
                  </button>
                  <button
                    onClick={() => onDispute(milestone.id)}
                    className="rounded-lg bg-red-500/20 px-4 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                  >
                    Dispute
                  </button>
                </div>
              )}

              {milestone.status === 'pending' && <p className="text-xs text-gray-500">Waiting for previous milestone completion</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 p-4">
        <div className="flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#0f0f0f] py-2 text-sm text-gray-300 transition-colors hover:border-white/30">
            <MessageCircle size={14} />
            Message
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#0f0f0f] py-2 text-sm text-gray-300 transition-colors hover:border-white/30">
            <FileText size={14} />
            Contract
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#0f0f0f] py-2 text-sm text-gray-300 transition-colors hover:border-white/30">
            <Wallet size={14} />
            History
          </button>
        </div>
      </div>
    </div>
  );
}

