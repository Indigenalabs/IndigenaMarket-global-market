import { NextResponse } from 'next/server';
import { getEnterpriseArtifactById } from '@/app/lib/enterpriseArtifacts';
import { createEnterpriseArtifactPdf } from '@/app/lib/enterpriseDocuments';
import { listEnterpriseInquiries } from '@/app/lib/enterpriseInquiries';

export async function GET(_: Request, context: { params: Promise<{ artifactId: string }> }) {
  const { artifactId } = await context.params;
  const artifact = await getEnterpriseArtifactById(artifactId);
  if (!artifact) return NextResponse.json({ message: 'Artifact not found.' }, { status: 404 });

  const inquiries = await listEnterpriseInquiries();
  const inquiry = inquiries.find((entry) => entry.id === artifact.inquiryId);
  if (!inquiry) return NextResponse.json({ message: 'Linked inquiry not found.' }, { status: 404 });

  const pdf = createEnterpriseArtifactPdf(inquiry, artifact);
  const filenameBase = `${artifact.kind}-${artifact.title || artifact.id}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filenameBase || artifact.id}.pdf"`
    }
  });
}
