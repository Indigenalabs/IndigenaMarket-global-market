'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MarketTrendsChartProps {
  timeRange?: string;
}

const marketData = {
  '24h': {
    volume: 45600,
    volumeChange: +12.5,
    sales: 234,
    salesChange: +8.3,
    avgPrice: 195,
    avgPriceChange: -2.1,
    activeBuyers: 1890,
    activeBuyersChange: +15.2,
    dataPoints: [
      { time: '00:00', volume: 1200, price: 185 },
      { time: '04:00', volume: 800, price: 182 },
      { time: '08:00', volume: 2100, price: 188 },
      { time: '12:00', volume: 3500, price: 195 },
      { time: '16:00', volume: 4200, price: 198 },
      { time: '20:00', volume: 3800, price: 195 },
      { time: '23:59', volume: 2800, price: 192 }
    ]
  },
  '7d': {
    volume: 312000,
    volumeChange: +23.8,
    sales: 1567,
    salesChange: +18.5,
    avgPrice: 199,
    avgPriceChange: +4.5,
    activeBuyers: 8900,
    activeBuyersChange: +22.1,
    dataPoints: [
      { time: 'Mon', volume: 38000, price: 185 },
      { time: 'Tue', volume: 42000, price: 188 },
      { time: 'Wed', volume: 35000, price: 192 },
      { time: 'Thu', volume: 48000, price: 195 },
      { time: 'Fri', volume: 52000, price: 198 },
      { time: 'Sat', volume: 58000, price: 202 },
      { time: 'Sun', volume: 40000, price: 199 }
    ]
  },
  '30d': {
    volume: 1450000,
    volumeChange: +45.2,
    sales: 6789,
    salesChange: +32.1,
    avgPrice: 214,
    avgPriceChange: +12.8,
    activeBuyers: 23400,
    activeBuyersChange: +38.5,
    dataPoints: [
      { time: 'Week 1', volume: 280000, price: 185 },
      { time: 'Week 2', volume: 320000, price: 192 },
      { time: 'Week 3', volume: 380000, price: 205 },
      { time: 'Week 4', volume: 470000, price: 214 }
    ]
  }
};

export default function MarketTrendsChart({ timeRange = '24h' }: MarketTrendsChartProps) {
  const [activeMetric, setActiveMetric] = useState<'volume' | 'price'>('volume');
  const data = marketData[timeRange as keyof typeof marketData] || marketData['24h'];

  const maxVolume = Math.max(...data.dataPoints.map(d => d.volume));
  const maxPrice = Math.max(...data.dataPoints.map(d => d.price));
  const minPrice = Math.min(...data.dataPoints.map(d => d.price));

  const stats = [
    { 
      label: 'Volume', 
      value: data.volume >= 1000000 
        ? `${(data.volume / 1000000).toFixed(2)}M` 
        : data.volume >= 1000 
          ? `${(data.volume / 1000).toFixed(0)}K` 
          : data.volume,
      change: data.volumeChange,
      suffix: ' INDI'
    },
    { label: 'Sales', value: data.sales.toLocaleString(), change: data.salesChange, suffix: '' },
    { label: 'Avg Price', value: data.avgPrice, change: data.avgPriceChange, suffix: ' INDI' },
    { label: 'Active Buyers', value: data.activeBuyers >= 1000 ? `${(data.activeBuyers / 1000).toFixed(1)}K` : data.activeBuyers, change: data.activeBuyersChange, suffix: '' }
  ];

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
            <BarChart3 size={18} className="text-[#d4af37]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Market Trends</h3>
            <p className="text-xs text-gray-400">Platform-wide trading activity</p>
          </div>
        </div>
        
        {/* Metric Toggle */}
        <div className="flex items-center bg-[#0a0a0a] rounded-lg p-1">
          <button
            onClick={() => setActiveMetric('volume')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              activeMetric === 'volume'
                ? 'bg-[#d4af37] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => setActiveMetric('price')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              activeMetric === 'price'
                ? 'bg-[#d4af37] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Avg Price
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#0a0a0a] rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-white">{stat.value}{stat.suffix}</p>
              <div className={`flex items-center gap-0.5 text-xs ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(stat.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative h-48 bg-[#0a0a0a] rounded-lg p-4">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-4 bottom-8 flex flex-col justify-between text-xs text-gray-500">
          <span>{activeMetric === 'volume' ? (maxVolume / 1000).toFixed(0) + 'K' : maxPrice}</span>
          <span>{activeMetric === 'volume' ? (maxVolume / 2000).toFixed(0) + 'K' : ((maxPrice + minPrice) / 2).toFixed(0)}</span>
          <span>{activeMetric === 'volume' ? '0' : minPrice}</span>
        </div>

        {/* Chart Area */}
        <div className="ml-12 h-full flex items-end justify-between gap-2">
          {data.dataPoints.map((point, index) => {
            const value = activeMetric === 'volume' ? point.volume : point.price;
            const max = activeMetric === 'volume' ? maxVolume : maxPrice;
            const min = activeMetric === 'volume' ? 0 : minPrice;
            const height = ((value - min) / (max - min)) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                {/* Bar */}
                <div 
                  className="w-full bg-gradient-to-t from-[#d4af37] to-[#d4af37]/50 rounded-t transition-all hover:from-[#f4e4a6] hover:to-[#d4af37] cursor-pointer relative group"
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#141414] border border-[#d4af37]/30 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {activeMetric === 'volume' 
                      ? `${(value / 1000).toFixed(1)}K INDI` 
                      : `${value} INDI`
                  }
                  </div>
                </div>
                {/* X-axis label */}
                <span className="text-xs text-gray-500">{point.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#d4af37]/10">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#d4af37] rounded" />
            <span>{activeMetric === 'volume' ? 'Trading Volume' : 'Average Price'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={12} />
          <span>Updated 5 min ago</span>
        </div>
      </div>
    </div>
  );
}
