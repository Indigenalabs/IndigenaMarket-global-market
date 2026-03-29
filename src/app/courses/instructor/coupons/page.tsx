'use client';

import { useState } from 'react';
import { 
  Ticket,
  Plus,
  Copy,
  Calendar,
  Users,
  TrendingUp,
  MoreVertical,
  Trash2,
  CheckCircle,
  X
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount: string;
  discountType: 'percentage' | 'fixed';
  course: string;
  uses: number;
  maxUses: number | null;
  expiresAt: string;
  status: 'active' | 'expired' | 'disabled';
  revenue: number;
}

const coupons: Coupon[] = [
  {
    id: '1',
    code: 'WEAVE20',
    discount: '20%',
    discountType: 'percentage',
    course: 'Navajo Weaving Masterclass',
    uses: 45,
    maxUses: 100,
    expiresAt: 'Dec 31, 2024',
    status: 'active',
    revenue: 1340
  },
  {
    id: '2',
    code: 'LANGUAGE50',
    discount: '50 INDI',
    discountType: 'fixed',
    course: 'Lakota Language Fundamentals',
    uses: 23,
    maxUses: 50,
    expiresAt: 'Nov 30, 2024',
    status: 'active',
    revenue: 890
  },
  {
    id: '3',
    code: 'SUMMER2024',
    discount: '30%',
    discountType: 'percentage',
    course: 'All Courses',
    uses: 156,
    maxUses: null,
    expiresAt: 'Sep 1, 2024',
    status: 'expired',
    revenue: 4200
  },
];

export default function CouponsPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'expired': return 'bg-gray-500/20 text-gray-400';
      case 'disabled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Coupons & Discounts</h1>
            <p className="text-gray-400 text-sm">Create and manage promotional codes</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
          >
            <Plus size={18} />
            Create Coupon
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Ticket size={20} className="text-[#d4af37]" />
              <span className="text-2xl font-bold text-white">{coupons.length}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Coupons</p>
          </div>
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Users size={20} className="text-[#d4af37]" />
              <span className="text-2xl font-bold text-white">224</span>
            </div>
            <p className="text-gray-400 text-sm">Total Uses</p>
          </div>
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={20} className="text-[#d4af37]" />
              <span className="text-2xl font-bold text-white">6,430</span>
            </div>
            <p className="text-gray-400 text-sm">Revenue from Coupons</p>
          </div>
        </div>

        {/* Coupons List */}
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg">
                    <span className="text-[#d4af37] font-mono font-bold">{coupon.code}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(coupon.status)}`}>
                    {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => copyCode(coupon.code)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#0a0a0a] rounded-lg text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                  >
                    {copiedCode === coupon.code ? (
                      <><CheckCircle size={14} /> Copied</>
                    ) : (
                      <><Copy size={14} /> Copy</>
                    )}
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Discount</p>
                  <p className="text-white font-medium">{coupon.discount} {coupon.discountType === 'percentage' ? 'OFF' : ''}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Course</p>
                  <p className="text-white font-medium">{coupon.course}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Uses</p>
                  <p className="text-white font-medium">{coupon.uses}{coupon.maxUses ? `/${coupon.maxUses}` : ''}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Revenue</p>
                  <p className="text-[#d4af37] font-medium">{coupon.revenue} INDI</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#d4af37]/10 text-sm text-gray-400">
                <Calendar size={14} />
                <span>Expires: {coupon.expiresAt}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
