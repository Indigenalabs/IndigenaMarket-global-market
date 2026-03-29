'use client';

import { useState } from 'react';
import { Receipt, Package, Clock, CheckCircle, Truck, Star, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

type OrderStatus = 'delivered' | 'shipped' | 'processing' | 'refunded';

interface OrderItem {
  id: string;
  title: string;
  maker: string;
  nation: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
  status: OrderStatus;
  orderedAt: string;
  txId: string;
  trackingCode?: string;
  reviewLeft?: boolean;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  delivered: { label: 'Delivered', color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: <CheckCircle size={11} /> },
  shipped: { label: 'Shipped', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: <Truck size={11} /> },
  processing: { label: 'Processing', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: <Clock size={11} /> },
  refunded: { label: 'Refunded', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: <Receipt size={11} /> },
};

const MOCK_ORDERS: OrderItem[] = [
  {
    id: 'ord1',
    title: 'Lakota Beadwork Bracelet',
    maker: 'SilverLeaf Studio',
    nation: 'Lakota',
    image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=100&q=80',
    price: 185,
    currency: 'INDI',
    quantity: 1,
    status: 'delivered',
    orderedAt: 'Jan 14, 2026',
    txId: '0xABC...1234',
    trackingCode: 'CA123456789',
    reviewLeft: true,
  },
  {
    id: 'ord2',
    title: 'Navajo Sand-Painted Pot',
    maker: 'Red Earth Pottery',
    nation: 'Navajo',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=100&q=80',
    price: 220,
    currency: 'INDI',
    quantity: 1,
    status: 'shipped',
    orderedAt: 'Feb 1, 2026',
    txId: '0xDEF...5678',
    trackingCode: 'CA987654321',
    reviewLeft: false,
  },
  {
    id: 'ord3',
    title: 'Cherokee Rivercane Basket',
    maker: 'Birchbark Crafts',
    nation: 'Cherokee',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&q=80',
    price: 165,
    currency: 'INDI',
    quantity: 2,
    status: 'processing',
    orderedAt: 'Feb 18, 2026',
    txId: '0xGHI...9012',
    reviewLeft: false,
  },
  {
    id: 'ord4',
    title: 'Haida Bentwood Box',
    maker: 'Thunderbird Crafts',
    nation: 'Haida',
    image: 'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?w=100&q=80',
    price: 340,
    currency: 'INDI',
    quantity: 1,
    status: 'refunded',
    orderedAt: 'Dec 20, 2025',
    txId: '0xJKL...3456',
    reviewLeft: false,
  },
];

function OrderCard({ order }: { order: OrderItem }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status];
  const total = order.price * order.quantity;

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden">
      {/* Summary row */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#141414]">
          <img src={order.image} alt={order.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{order.title}</p>
          <p className="text-gray-500 text-xs">{order.maker} · {order.nation}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.color}`}>
              {cfg.icon}
              {cfg.label}
            </span>
            <span className="text-gray-600 text-xs">{order.orderedAt}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-[#d4af37] font-bold text-sm">{total}</div>
          <div className="text-gray-500 text-xs">{order.currency}</div>
          {order.quantity > 1 && <div className="text-gray-600 text-[10px]">×{order.quantity}</div>}
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="ml-2 text-gray-600 hover:text-gray-300 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/5 space-y-3">
          {/* TX ID */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Transaction ID</span>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-300 font-mono">{order.txId}</span>
              <a
                href={`https://xrpscan.com/tx/${order.txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#d4af37] transition-colors"
              >
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingCode && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Tracking Code</span>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-300 font-mono">{order.trackingCode}</span>
                <Truck size={11} className="text-blue-400" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {order.status === 'delivered' && !order.reviewLeft && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs rounded-lg hover:bg-[#d4af37]/20 transition-colors">
                <Star size={11} />
                Leave Review
              </button>
            )}
            {order.status === 'delivered' && order.reviewLeft && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle size={11} />
                Review submitted
              </span>
            )}
            {order.status === 'shipped' && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-lg hover:bg-blue-500/20 transition-colors">
                <Truck size={11} />
                Track Shipment
              </button>
            )}
            {order.status === 'processing' && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 text-xs rounded-lg hover:bg-white/10 transition-colors">
                <Clock size={11} />
                Contact Maker
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PhysicalTransactionHistory() {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = filter === 'all' ? MOCK_ORDERS : MOCK_ORDERS.filter((o) => o.status === filter);
  const totalSpent = MOCK_ORDERS
    .filter((o) => o.status !== 'refunded')
    .reduce((s, o) => s + o.price * o.quantity, 0);

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#d4af37]/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <Receipt size={16} className="text-[#d4af37]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Purchase History</h3>
            <p className="text-gray-500 text-xs">{MOCK_ORDERS.length} orders · {totalSpent} INDI total spent</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'delivered', 'shipped', 'processing', 'refunded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40'
                  : 'bg-white/5 text-gray-500 border border-transparent hover:text-gray-300'
              }`}
            >
              {f === 'all' ? `All (${MOCK_ORDERS.length})` : `${f} (${MOCK_ORDERS.filter((o) => o.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <Package size={32} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No orders with this status</p>
          </div>
        ) : (
          filtered.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>

      {/* Summary footer */}
      <div className="px-5 pb-4 border-t border-white/5 pt-3 grid grid-cols-3 gap-3">
        {[
          { label: 'Total Spent', value: `${totalSpent} INDI`, color: 'text-[#d4af37]' },
          { label: 'Makers Supported', value: new Set(MOCK_ORDERS.map((o) => o.maker)).size.toString(), color: 'text-white' },
          { label: 'Nations Supported', value: new Set(MOCK_ORDERS.map((o) => o.nation)).size.toString(), color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div className={`text-lg font-bold ${color}`}>{value}</div>
            <div className="text-gray-600 text-xs">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
