import Link from 'next/link';
import { ChevronLeft, FileText, Scale, ShieldCheck } from 'lucide-react';
import { getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

export default async function AdvocacyLegalResourcesPage() {
  const { resources } = await getAdvocacyPublicData();

  return (
    <main className="min-h-screen bg-[#0b0c0d] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/advocacy-legal" className="inline-flex items-center gap-2 text-sm text-[#d4af37] hover:underline">
          <ChevronLeft size={16} />
          Back to Advocacy & Legal
        </Link>

        <section className="mt-6 rounded-3xl border border-[#d4af37]/20 bg-[#101112] p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">Resources</p>
          <h1 className="mt-3 text-4xl font-semibold">Templates, rights guides, and practical legal tools</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
            Start with immediate-use resources for rights defense, campaign setup, consultation prep, and community response.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-[#101112] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
              <div className="inline-flex rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 p-2 text-[#d4af37]">
                <FileText size={16} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-gray-400">{item.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">
                  <Scale size={12} />
                  Legal Tool
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">
                  <ShieldCheck size={12} />
                  Immediate Use
                </span>
              </div>
              <div className="mt-6">
                <Link href={`/advocacy-legal/resource/${item.id}`} className="inline-flex rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
                  Open resource
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
