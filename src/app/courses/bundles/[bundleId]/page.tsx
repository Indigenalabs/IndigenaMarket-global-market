import Link from 'next/link';
import { notFound } from 'next/navigation';

const bundlePages = {
  'b1': {
    title: 'Complete Weaving Mastery',
    summary: 'From beginner to master artisan with weaving, doll making, and sash weaving.',
    ctaHref: '/courses/bundles'
  },
  'b2': {
    title: 'Sacred Ceramics Collection',
    summary: 'Traditional pottery learning path across Cherokee, Pueblo, and Navajo ceramic practices.',
    ctaHref: '/courses/bundles'
  },
  'b3': {
    title: 'Indigenous Jewelry Master',
    summary: 'Beadwork, silverwork, and contemporary Indigenous design in one bundle.',
    ctaHref: '/courses/bundles'
  },
  'b4': {
    title: 'Complete Indigenous Arts Path',
    summary: 'The full multi-course arts track spanning weaving, pottery, jewelry, carving, and basketry.',
    ctaHref: '/courses/bundles'
  },
  'bundle-promo-1': {
    title: 'Weaving Studio Bundle',
    summary: 'A curated path for weaving, fibre preparation, and material stewardship.',
    ctaHref: '/courses/bundles'
  },
  'bundle-promo-2': {
    title: 'Language + Archive Bundle',
    summary: 'Combines live language learning with deeper archive-led practice and access.',
    ctaHref: '/language-heritage/archive'
  },
  'bundle-promo-3': {
    title: 'Creator Revenue Bundle',
    summary: 'Courses and tools focused on selling, verification, and creator operations.',
    ctaHref: '/creator-hub'
  }
} as const;

export default async function CourseBundlePromoPage({ params }: { params: Promise<{ bundleId: string }> }) {
  const { bundleId } = await params;
  const bundle = bundlePages[bundleId as keyof typeof bundlePages];
  if (!bundle) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Course bundle</p>
          <h1 className="mt-2 text-4xl font-semibold">{bundle.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">{bundle.summary}</p>
        </section>
        <section className="flex flex-wrap gap-3">
          <Link href="/courses/bundles" className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f0c96f]">View all bundles</Link>
          <Link href={bundle.ctaHref} className="rounded-full border border-white/10 px-5 py-3 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">Open related surface</Link>
        </section>
      </div>
    </main>
  );
}