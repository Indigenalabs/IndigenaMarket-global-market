import { notFound } from 'next/navigation';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';
import { SurfaceHero, SurfaceListStrip, SurfacePage } from '@/app/components/phase-surfaces/SurfaceSystem';

export default async function CommunityVerificationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPlatformAccountBySlug(slug);
  if (!data) notFound();
  const verification = data.verification;
  return (
    <SurfacePage tone="community">
      <SurfaceHero
        tone="community"
        eyebrow="Verification"
        title={`${data.account.displayName} verification status`}
        description="Representative approval, treasury review, and elder endorsement are intentionally tracked as separate authorities so community selling power is explicit."
        image={data.account.banner}
        stats={[
          { label: 'Representatives', value: verification?.representativeReviewStatus || 'draft' },
          { label: 'Treasury', value: verification?.treasuryReviewStatus || 'draft' },
          { label: 'Elder endorsement', value: verification?.elderEndorsementStatus || 'draft' },
          { label: 'Overall', value: data.account.verificationStatus }
        ]}
      />
      <section className="space-y-5">
        <SurfaceListStrip eyebrow="Authority proof" title="Submitted basis for representation" description={verification?.authorityProof || 'No authority proof submitted yet.'} />
        <SurfaceListStrip eyebrow="Community references" title="References on record" description={verification?.communityReferences.join(' | ') || 'No community references recorded yet.'} />
        <SurfaceListStrip eyebrow="Governance notes" title="Review notes" description={verification?.notes || 'No governance notes yet.'} />
      </section>
    </SurfacePage>
  );
}
