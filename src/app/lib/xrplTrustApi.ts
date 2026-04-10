import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { XrplTrustAssetType, XrplTrustRecord, XrplTrustStatus, XrplTrustType } from '@/app/lib/xrplTrustLayer';

export async function fetchMyXrplTrustRecords(profileSlug = ''): Promise<XrplTrustRecord[]> {
  const suffix = profileSlug ? `?profileSlug=${encodeURIComponent(profileSlug)}` : '';
  const res = await fetchWithTimeout(`/api/trust/xrpl/records/me${suffix}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'XRPL trust records request failed'));
  const json = await res.json();
  return ((json?.data ?? json) || []) as XrplTrustRecord[];
}

export async function createMyXrplTrustRecord(input: {
  profileSlug?: string;
  assetType: XrplTrustAssetType;
  assetId: string;
  assetTitle: string;
  trustType: XrplTrustType;
  status?: XrplTrustStatus;
  xrplTransactionHash?: string;
  xrplTokenId?: string;
  xrplLedgerIndex?: string;
  anchorUri?: string;
  metadata?: Record<string, unknown>;
}): Promise<XrplTrustRecord> {
  const res = await fetchWithTimeout('/api/trust/xrpl/records/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create-record',
      profileSlug: input.profileSlug || '',
      assetType: input.assetType,
      assetId: input.assetId,
      assetTitle: input.assetTitle,
      trustType: input.trustType,
      status: input.status || 'draft',
      xrplTransactionHash: input.xrplTransactionHash || '',
      xrplTokenId: input.xrplTokenId || '',
      xrplLedgerIndex: input.xrplLedgerIndex || '',
      anchorUri: input.anchorUri || '',
      metadata: input.metadata || {}
    })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Creating XRPL trust record failed'));
  const json = await res.json();
  return (json?.data ?? json) as XrplTrustRecord;
}

export async function updateMyXrplTrustRecord(input: {
  recordId: string;
  profileSlug?: string;
  status?: XrplTrustStatus;
  xrplTransactionHash?: string;
  xrplTokenId?: string;
  xrplLedgerIndex?: string;
  anchorUri?: string;
  metadata?: Record<string, unknown>;
}): Promise<XrplTrustRecord> {
  const res = await fetchWithTimeout('/api/trust/xrpl/records/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recordId: input.recordId,
      profileSlug: input.profileSlug || '',
      status: input.status,
      xrplTransactionHash: input.xrplTransactionHash,
      xrplTokenId: input.xrplTokenId,
      xrplLedgerIndex: input.xrplLedgerIndex,
      anchorUri: input.anchorUri,
      metadata: input.metadata
    })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Updating XRPL trust record failed'));
  const json = await res.json();
  return (json?.data ?? json) as XrplTrustRecord;
}

export async function fetchXrplTrustRecordForAsset(input: {
  assetType: XrplTrustAssetType;
  assetId: string;
  trustType?: XrplTrustType;
}): Promise<XrplTrustRecord | null> {
  const params = new URLSearchParams({
    assetType: input.assetType,
    assetId: input.assetId
  });
  if (input.trustType) params.set('trustType', input.trustType);
  const res = await fetchWithTimeout(`/api/trust/xrpl/records/asset?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'XRPL trust asset lookup failed'));
  const json = await res.json();
  return ((json?.data ?? json) || null) as XrplTrustRecord | null;
}
