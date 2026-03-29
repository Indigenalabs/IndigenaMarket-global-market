'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';

type StickyItem = {
  id: string;
  message: string;
  cta: string;
  href: string;
};

type PlacementFeedResponse = {
  placements?: Record<
    string,
    Array<{
      id: string;
      title: string;
      cta_url?: string;
      creative?: {
        headline?: string;
        subheadline?: string;
        cta?: string;
      };
    }>
  >;
};

export default function LivePlacementStickyBanner({
  apiPath,
  stickyKey,
  fallbackItems,
  bannerClassName,
  iconClassName,
  textClassName,
  buttonClassName,
  badgeClassName,
  dismissClassName,
  dismissLabel
}: {
  apiPath: string;
  stickyKey: string;
  fallbackItems: StickyItem[];
  bannerClassName: string;
  iconClassName: string;
  textClassName: string;
  buttonClassName: string;
  badgeClassName: string;
  dismissClassName: string;
  dismissLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [liveItems, setLiveItems] = useState<StickyItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(apiPath, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: PlacementFeedResponse | null) => {
        if (cancelled || !json?.placements?.[stickyKey]?.length) return;
        const mapped = json.placements[stickyKey]
          .map((entry) => ({
            id: entry.id,
            message: entry.creative?.headline || entry.title,
            cta: entry.creative?.cta || 'View offer',
            href: entry.cta_url || '/creator-hub'
          }))
          .filter((entry) => entry.message);
        if (mapped.length) setLiveItems(mapped);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [apiPath, stickyKey]);

  const items = useMemo(() => liveItems, [liveItems]);

  useEffect(() => {
    if (dismissed || items.length <= 1) return;
    const timer = window.setInterval(() => setIndex((prev) => (prev + 1) % items.length), 8000);
    return () => window.clearInterval(timer);
  }, [dismissed, items]);

  useEffect(() => {
    setIndex(0);
  }, [items]);

  if (dismissed || items.length === 0) return null;
  const item = items[index];

  return (
    <div className={bannerClassName}>
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <Sparkles size={16} className={iconClassName} />
            <span className={badgeClassName}>Sticky placement</span>
            <span className={textClassName}>{item.message}</span>
            <Link href={item.href} className={buttonClassName}>
              {item.cta}
            </Link>
          </div>
          <button onClick={() => setDismissed(true)} className={dismissClassName} aria-label={dismissLabel} type="button">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
