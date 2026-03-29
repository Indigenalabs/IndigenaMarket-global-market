export interface PlacementSummaryEntry {
  typeId: string;
  price: number;
  period: string;
}

export interface PlacementCreative {
  image: string;
  headline: string;
  subheadline: string;
  cta: string;
}

export function buildPlacementSummaryMap(summary: PlacementSummaryEntry[] = []) {
  const out: Record<string, PlacementSummaryEntry> = {};
  summary.forEach((entry) => {
    out[entry.typeId] = entry;
  });
  return out;
}

export function buildPlacementCreativeMap(placements: Record<string, unknown[]> = {}) {
  const out: Record<string, PlacementCreative> = {};
  Object.entries(placements).forEach(([typeId, entries]) => {
    const first = Array.isArray(entries) ? entries[0] : null;
    const creative = (first as { creative?: Record<string, unknown> } | null)?.creative || {};
    out[typeId] = {
      image: String(creative.image || ''),
      headline: String(creative.headline || ''),
      subheadline: String(creative.subheadline || ''),
      cta: String(creative.cta || '')
    };
  });
  return out;
}

export function formatPlacementPrice(
  fallback: string,
  typeId: string,
  map: Record<string, PlacementSummaryEntry>
) {
  const found = map[typeId];
  if (!found) return fallback;
  const suffix = found.period === 'per_send' || found.period === 'per_launch' ? '' : `/${found.period}`;
  return `$${found.price}${suffix}`;
}

