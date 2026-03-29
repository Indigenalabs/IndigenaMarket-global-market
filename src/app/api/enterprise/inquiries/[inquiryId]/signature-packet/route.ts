import { NextResponse } from 'next/server';
import { createEnterpriseSignaturePacketPdf } from '@/app/lib/enterpriseDocuments';
import { listEnterpriseInquiries } from '@/app/lib/enterpriseInquiries';
import { listEnterpriseSignatures } from '@/app/lib/enterpriseSignatures';

export async function GET(_: Request, context: { params: Promise<{ inquiryId: string }> }) {
  const { inquiryId } = await context.params;
  const inquiries = await listEnterpriseInquiries();
  const inquiry = inquiries.find((entry) => entry.id === inquiryId);
  if (!inquiry) return NextResponse.json({ message: 'Inquiry not found.' }, { status: 404 });

  const signatures = await listEnterpriseSignatures(inquiryId);
  const pdf = createEnterpriseSignaturePacketPdf(inquiry, signatures);
  const filenameBase = `signature-packet-${inquiry.organization || inquiry.name || inquiry.id}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filenameBase || inquiry.id}.pdf"`
    }
  });
}
