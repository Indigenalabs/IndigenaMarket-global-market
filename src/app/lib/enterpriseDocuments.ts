import { createBrandedPdf } from '@/app/lib/pdf';
import type { EnterpriseArtifactRecord } from '@/app/lib/enterpriseArtifacts';
import type { EnterpriseInquiryRecord } from '@/app/lib/enterpriseInquiries';
import type { EnterpriseSignatureRecord } from '@/app/lib/enterpriseSignatures';

export function createEnterpriseArtifactPdf(
  inquiry: EnterpriseInquiryRecord,
  artifact: EnterpriseArtifactRecord
) {
  const title = artifact.kind === 'proposal' ? 'Enterprise Proposal' : 'Enterprise Invoice';
  return createBrandedPdf(title, 'Indigena Global Market enterprise document', [
    {
      heading: 'Deal Summary',
      lines: [
        `Artifact: ${artifact.title}`,
        `Artifact ID: ${artifact.id}`,
        `Inquiry ID: ${inquiry.id}`,
        `Organization: ${inquiry.organization || inquiry.name}`,
        `Contact: ${inquiry.name} | ${inquiry.email}`,
        `Channel: ${inquiry.channel}`,
        `Contract stage: ${inquiry.contractStage}`,
        `Lifecycle: ${inquiry.contractLifecycleState}`
      ]
    },
    {
      heading: 'Ownership and Commercials',
      lines: [
        `Owner: ${inquiry.pipelineOwner || 'Unassigned'}`,
        `Owner role: ${inquiry.pipelineOwnerRole || 'Unassigned'}`,
        `Amount: ${artifact.currency} ${Number(artifact.amount || 0).toFixed(2)}`,
        `Status: ${artifact.status}`,
        `Issued: ${artifact.issuedAt || 'Not issued'}`,
        `Due: ${artifact.dueDate || 'Not set'}`
      ]
    },
    {
      heading: 'Scope',
      lines: [inquiry.scope || 'No scope provided.']
    },
    {
      heading: 'Detail',
      lines: [inquiry.detail || 'No detail provided.']
    },
    {
      heading: 'Document Metadata',
      lines: [`Generated: ${new Date().toISOString()}`]
    }
  ]);
}

export function createEnterpriseSignaturePacketPdf(
  inquiry: EnterpriseInquiryRecord,
  signatures: EnterpriseSignatureRecord[]
) {
  return createBrandedPdf('Enterprise Signature Packet', 'Indigena Global Market execution packet', [
    {
      heading: 'Deal Summary',
      lines: [
        `Inquiry ID: ${inquiry.id}`,
        `Organization: ${inquiry.organization || inquiry.name}`,
        `Contact: ${inquiry.name} | ${inquiry.email}`,
        `Channel: ${inquiry.channel}`,
        `Contract stage: ${inquiry.contractStage}`,
        `Lifecycle: ${inquiry.contractLifecycleState}`,
        `Owner: ${inquiry.pipelineOwner || 'Unassigned'}`,
        `Owner role: ${inquiry.pipelineOwnerRole || 'Unassigned'}`
      ]
    },
    {
      heading: 'Required Signatures',
      lines:
        signatures.length > 0
          ? signatures.flatMap((signature) => [
              `${signature.signerName} | ${signature.signerRole} | ${signature.signerEmail}`,
              `Status: ${signature.status}${signature.signedAt ? ` | Signed: ${signature.signedAt}` : ''}${signature.note ? ` | Note: ${signature.note}` : ''}`
            ])
          : ['No signature requests have been created yet.']
    },
    {
      heading: 'Scope',
      lines: [inquiry.scope || 'No scope provided.']
    },
    {
      heading: 'Detail',
      lines: [inquiry.detail || 'No detail provided.']
    },
    {
      heading: 'Packet Metadata',
      lines: [`Generated: ${new Date().toISOString()}`]
    }
  ]);
}
