'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  value: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
};

export default function AnimatedCounter({
  value,
  durationMs = 1200,
  prefix = '',
  suffix = '',
  compact = false
}: Props) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start: number | null = null;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  const formatted = useMemo(() => {
    return compact ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(displayValue) : displayValue.toLocaleString();
  }, [compact, displayValue]);

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
