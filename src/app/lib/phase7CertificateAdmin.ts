import { createHash } from 'node:crypto';
import { listCourseCertificates, updateCourseCertificateStatus } from '@/app/lib/courseCertificates';
import { ensureXrplTrustRecordForAsset, updateXrplTrustRecord } from '@/app/lib/xrplTrustLayer';
import type { CourseCertificateRecord } from '@/app/lib/courseCertificates';
import type { XrplTrustStatus } from '@/app/lib/xrplTrustLayer';

function buildCertificateAnchorFields(seed: string, verificationUrl: string) {
  const digest = createHash('sha256').update(seed).digest('hex').toUpperCase();
  return {
    xrplTransactionHash: digest.slice(0, 64),
    xrplTokenId: `XRPL-CERT-${digest.slice(0, 16)}`,
    xrplLedgerIndex: String(parseInt(digest.slice(0, 8), 16)),
    anchorUri: `${verificationUrl}${verificationUrl.includes('?') ? '&' : '?'}anchor=${digest.slice(0, 12).toLowerCase()}`
  };
}

export async function applyPhase7CertificateAdminAction(certificateId: string, action: 'revoke' | 'reissue') {
  const existing = (await listCourseCertificates(500)).find((entry) => entry.certificateId === certificateId);
  if (!existing) return null;

  let trustRecordId = existing.trustRecordId;
  let trustStatus: XrplTrustStatus = action === 'revoke' ? 'revoked' : 'verified';
  let anchorFields = {
    xrplTransactionHash: existing.xrplTransactionHash || '',
    xrplTokenId: existing.xrplTokenId || '',
    xrplLedgerIndex: existing.xrplLedgerIndex || '',
    anchorUri: existing.anchorUri || existing.verificationUrl
  };

  if (action === 'reissue') {
    anchorFields = buildCertificateAnchorFields(
      `${existing.certificateId}:${existing.courseId}:${existing.studentActorId}:${Date.now()}`,
      existing.verificationUrl
    );
    const trustRecord = await ensureXrplTrustRecordForAsset({
      actorId: existing.studentActorId,
      profileSlug: existing.studentActorId,
      assetType: 'course_certificate',
      assetId: existing.certificateId,
      assetTitle: `${existing.courseId} certificate`,
      trustType: 'certificate',
      status: 'verified',
      xrplTransactionHash: anchorFields.xrplTransactionHash,
      xrplTokenId: anchorFields.xrplTokenId,
      xrplLedgerIndex: anchorFields.xrplLedgerIndex,
      anchorUri: anchorFields.anchorUri,
      metadata: {
        source: 'course-certificates-admin',
        adminAction: 'reissue',
        courseId: existing.courseId,
        certificateId: existing.certificateId
      }
    });
    trustRecordId = trustRecord.id;
    trustStatus = trustRecord.status;
  } else if (existing.trustRecordId) {
    const trustRecord = await updateXrplTrustRecord({
      id: existing.trustRecordId,
      status: 'revoked',
      metadata: {
        source: 'course-certificates-admin',
        adminAction: 'revoke',
        courseId: existing.courseId,
        certificateId: existing.certificateId
      }
    });
    trustRecordId = trustRecord?.id || existing.trustRecordId;
    trustStatus = trustRecord?.status || 'revoked';
  }

  const updated = await updateCourseCertificateStatus({
    certificateId,
    status: action === 'revoke' ? 'cancelled' : 'issued',
    reissued: action === 'reissue',
    trustRecordId,
    trustStatus,
    xrplTransactionHash: anchorFields.xrplTransactionHash,
    xrplTokenId: anchorFields.xrplTokenId,
    xrplLedgerIndex: anchorFields.xrplLedgerIndex,
    anchorUri: anchorFields.anchorUri
  });

  return (
    updated ||
    (await listCourseCertificates(500)).find((entry) => entry.certificateId === certificateId) || {
      ...existing,
      status: action === 'revoke' ? 'cancelled' : 'issued',
      trustRecordId,
      trustStatus,
      xrplTransactionHash: anchorFields.xrplTransactionHash,
      xrplTokenId: anchorFields.xrplTokenId,
      xrplLedgerIndex: anchorFields.xrplLedgerIndex,
      anchorUri: anchorFields.anchorUri
    }
  ) as CourseCertificateRecord;
}
