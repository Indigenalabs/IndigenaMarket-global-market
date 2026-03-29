'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Users, TrendingUp, Wallet } from 'lucide-react';

interface Stat {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { icon: <ImageIcon size={24} />, value: 12547, suffix: '', label: 'NFTs Created' },
  { icon: <Users size={24} />, value: 3420, suffix: '', label: 'Artists' },
  { icon: <TrendingUp size={24} />, value: 2.5, suffix: 'M', label: 'Volume (INDI)' },
  { icon: <Wallet size={24} />, value: 8900, suffix: '+', label: 'Collectors' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    return num.toString();
  };

  return (
    <span className="text-3xl md:text-4xl font-bold secondary-gradient">
      {formatNumber(count)}{suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <section className="py-8 px-6 bg-[#0f0f0f] border-y border-[#d4af37]/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                {stat.icon}
              </div>
              <div>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
