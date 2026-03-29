'use client';

import { useState } from 'react';
import { calculateTransactionQuote, formatMoney } from '@/app/lib/monetization';
import { createFreelanceEscrowOrder } from '@/app/lib/freelancingMarketplaceApi';
import {
  X, Shield, Clock, MessageCircle, CreditCard, ChevronRight,
  CheckCircle, AlertCircle, BadgeCheck
} from 'lucide-react';

interface PricingTier {
  name: string;
  price: number;
  deliveryDays: number;
  features: string[];
}

interface Service {
  id: string;
  title: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerNation: string;
  pricingTiers: PricingTier[];
  rating: number;
  reviewCount: number;
  responseTime: string;
  verification: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

interface QuickHireModalProps {
  service: Service;
  selectedTier: number;
  onClose: () => void;
  onComplete: () => void;
}

const verificationColors: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2'
};

export default function QuickHireModal({ service, selectedTier, onClose, onComplete }: QuickHireModalProps) {
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [projectDetails, setProjectDetails] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(() => `FR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`);
  const [paymentError, setPaymentError] = useState('');

  const currentTier = service.pricingTiers[selectedTier];
  const quote = calculateTransactionQuote({
    pillar: 'freelancing',
    subtotal: currentTier.price,
    escrowProtected: true
  });
  const total = quote.buyerTotal;

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentError('');
    try {
      const milestones = [
        {
          id: `ms-${crypto.randomUUID().slice(0, 8)}`,
          title: currentTier.name,
          amount: currentTier.price,
          status: 'in_progress',
          dueDate: deadline || new Date(Date.now() + currentTier.deliveryDays * 86400000).toISOString().slice(0, 10)
        }
      ];
      const res = await createFreelanceEscrowOrder({
        serviceId: service.id,
        amount: currentTier.price,
        currency: 'USD',
        projectDetails,
        deadline,
        freelancerName: service.freelancerName,
        serviceTitle: service.title,
        milestones
      });
      const nextOrderId = String(res?.order?.orderId || orderId);
      setOrderId(nextOrderId);
      setStep('confirmation');
      setIsProcessing(false);
      onComplete();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Escrow setup failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-[#0f0f0f] border border-[#d4af37]/30 rounded-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={service.freelancerAvatar}
              alt={service.freelancerName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="text-white font-semibold">Quick Hire</h2>
              <p className="text-gray-400 text-sm">{service.freelancerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center px-6 py-3 bg-[#141414]">
          {['details', 'payment', 'confirmation'].map((s, idx) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === s ? 'bg-[#d4af37] text-black' :
                idx < ['details', 'payment', 'confirmation'].indexOf(step) ? 'bg-green-500 text-white' :
                'bg-gray-700 text-gray-400'
              }`}>
                {idx < ['details', 'payment', 'confirmation'].indexOf(step) ? <CheckCircle size={12} /> : idx + 1}
              </div>
              {idx < 2 && <div className={`flex-1 h-0.5 mx-2 ${
                idx < ['details', 'payment', 'confirmation'].indexOf(step) ? 'bg-green-500' : 'bg-gray-700'
              }`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'details' && (
            <div className="space-y-4">
              {/* Package Selected */}
              <div className="bg-[#141414] rounded-xl p-4 border border-[#d4af37]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{currentTier.name}</span>
                  <span className="text-[#d4af37] font-bold">${currentTier.price}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={14} />
                  {currentTier.deliveryDays} days delivery
                </div>
              </div>

              {/* Project Details */}
              <div>
                <label htmlFor="quick-hire-project-details" className="text-white text-sm font-medium mb-2 block">
                  Project Details
                </label>
                <textarea
                  id="quick-hire-project-details"
                  aria-label="Project Details"
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  placeholder="Describe your project requirements..."
                  className="w-full h-32 bg-[#141414] border border-white/10 rounded-xl p-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="quick-hire-deadline" className="text-white text-sm font-medium mb-2 block">
                  Desired Deadline (optional)
                </label>
                <input
                  id="quick-hire-deadline"
                  aria-label="Desired Deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Guarantees */}
              <div className="flex items-center gap-4 text-sm text-gray-400 pt-2">
                <span className="flex items-center gap-1">
                  <Shield size={14} className="text-[#d4af37]" />
                  Money-back guarantee
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-[#d4af37]" />
                  {service.responseTime} response
                </span>
              </div>

              <button
                onClick={() => setStep('payment')}
                disabled={!projectDetails.trim()}
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-[#141414] rounded-xl p-4 border border-white/5">
                <h3 className="text-white font-medium mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{currentTier.name} Package</span>
                    <span className="text-white">{formatMoney(currentTier.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Escrow protection</span>
                    <span className="text-white">{formatMoney(quote.escrowFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Firekeeper fee (freelancer-funded)</span>
                    <span className="text-[#d4af37]">{formatMoney(quote.platformFee)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-[#d4af37] font-bold text-lg">{formatMoney(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#141414] rounded-xl p-4 border border-white/5">
                <h3 className="text-white font-medium mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 bg-[#0f0f0f] border border-[#d4af37]/30 rounded-lg hover:border-[#d4af37] transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard size={18} className="text-[#d4af37]" />
                      <span className="text-white text-sm">INDI Wallet</span>
                    </div>
                    <span className="text-[#d4af37] text-sm font-medium">Balance: $4,850</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-[#0f0f0f] border border-white/10 rounded-lg hover:border-white/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard size={18} className="text-gray-400" />
                      <span className="text-white text-sm">Credit Card</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Escrow Notice */}
              <div className="flex items-start gap-3 p-3 bg-[#d4af37]/10 rounded-lg border border-[#d4af37]/20">
                <Shield size={18} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Secure Escrow Payment</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Funds are held securely until the service is delivered and approved. Freelancer payout estimate: {formatMoney(quote.creatorNet)}.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 py-3 bg-[#141414] border border-[#d4af37]/30 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : `Pay ${formatMoney(total)}`}
                </button>
              </div>

              {paymentError ? <p className="text-sm text-red-400">{paymentError}</p> : null}
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Order Placed!</h3>
              <p className="text-gray-400 text-sm mb-6">
                Your order has been placed in escrow. {service.freelancerName} will respond within {service.responseTime}.
              </p>
              <div className="bg-[#141414] rounded-xl p-4 border border-white/5 text-left mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Order ID</span>
                  <span className="text-white font-mono text-sm">#{orderId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className="text-[#d4af37] text-sm">In Escrow</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#141414] border border-[#d4af37]/30 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/10 transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all flex items-center justify-center gap-2">
                  <MessageCircle size={16} />
                  Message Seller
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
