'use client';

import { useState } from 'react';
import { MapPin, Truck, Clock, Package, CheckCircle } from 'lucide-react';

interface HubShippingWidgetProps {
  hubName: string;
  hubCity: string;
  hubOnline: boolean;
  shipsInternational: boolean;
  compact?: boolean;
}

export default function HubShippingWidget({
  hubName,
  hubCity,
  hubOnline,
  shipsInternational,
  compact = false,
}: HubShippingWidgetProps) {
  const [fulfillment, setFulfillment] = useState<'hub' | 'direct'>('hub');

  const domesticDays = fulfillment === 'hub' ? '5–14' : '7–21';
  const intlDays = fulfillment === 'hub' ? '14–28' : '21–45';

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${hubOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
        <MapPin size={13} className="text-[#d4af37]" />
        <span className="text-gray-400 truncate">
          {hubName} Hub, {hubCity}
        </span>
        <span className="text-gray-600">•</span>
        <Clock size={13} className="text-gray-500" />
        <span className="text-gray-400">{domesticDays}d</span>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-[#d4af37]/20 p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Truck size={18} className="text-[#d4af37]" />
        Shipping & Fulfillment
      </h3>

      {/* Hub Status */}
      <div className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg mb-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <MapPin size={20} className="text-[#d4af37]" />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#141414] ${
            hubOnline ? 'bg-green-500' : 'bg-gray-500'
          }`} />
        </div>
        <div>
          <p className="text-white font-medium text-sm">{hubName} Hub</p>
          <p className="text-gray-400 text-xs">{hubCity} • {hubOnline ? 'Active' : 'Offline'}</p>
        </div>
        {hubOnline && (
          <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
            Ready to ship
          </span>
        )}
      </div>

      {/* Fulfillment Toggle */}
      <div className="mb-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Fulfillment Method</p>
        <div className="flex rounded-lg overflow-hidden border border-[#d4af37]/20">
          <button
            onClick={() => setFulfillment('hub')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              fulfillment === 'hub'
                ? 'bg-[#d4af37] text-black'
                : 'bg-[#141414] text-gray-400 hover:text-white'
            }`}
          >
            Hub Managed
          </button>
          <button
            onClick={() => setFulfillment('direct')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              fulfillment === 'direct'
                ? 'bg-[#d4af37] text-black'
                : 'bg-[#141414] text-gray-400 hover:text-white'
            }`}
          >
            Direct from Maker
          </button>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between py-2 border-b border-[#d4af37]/10">
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <Clock size={14} />
            Domestic Delivery
          </span>
          <span className="text-white text-sm font-medium">{domesticDays} business days</span>
        </div>
        {shipsInternational && (
          <div className="flex items-center justify-between py-2 border-b border-[#d4af37]/10">
            <span className="text-gray-400 text-sm flex items-center gap-2">
              <Clock size={14} />
              International Delivery
            </span>
            <span className="text-white text-sm font-medium">{intlDays} business days</span>
          </div>
        )}
      </div>

      {/* Notices */}
      <div className="space-y-2">
        {shipsInternational && (
          <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded-lg">
            <Package size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-yellow-400 text-xs">
              International orders may be subject to import duties and taxes determined by your local customs authority.
            </p>
          </div>
        )}
        <div className="flex items-start gap-2 p-2 bg-[#d4af37]/5 rounded-lg">
          <CheckCircle size={14} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
          <p className="text-gray-400 text-xs">
            Returns accepted within 14 days of delivery. Item must be unused and in original packaging.
          </p>
        </div>
      </div>
    </div>
  );
}
