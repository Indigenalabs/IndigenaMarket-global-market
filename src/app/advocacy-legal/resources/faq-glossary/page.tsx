import Link from 'next/link';
import AdvocacyFrame from '../../components/AdvocacyFrame';

export default function FaqGlossaryPage() {
  const glossary = [
    { term: 'ICIP', definition: 'Indigenous Cultural and Intellectual Property protections and protocols.', use: 'Used when discussing licensing, cultural use, and misuse protection.' },
    { term: 'NAGPRA', definition: 'US law governing repatriation of Native American remains and cultural items.', use: 'Most relevant for repatriation cases, institutions, and return negotiations.' },
    { term: 'Injunction', definition: 'Court order requiring activity to stop or continue under strict terms.', use: 'Often used in urgent land defense or access-rights matters.' },
    { term: 'Treaty Rights', definition: 'Legally binding rights recognized through treaties with states.', use: 'Central to access, sovereignty, and resource-use disputes.' }
  ];

  return (
    <AdvocacyFrame title="FAQ & Legal Glossary" subtitle="Plain-language legal terms and common process questions.">
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Glossary</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Learn the language before the process gets overwhelming</h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-gray-300">
            This page is here to make the legal side of advocacy less intimidating. It works best when used alongside guides, templates, and case resources so users can understand not just what a term means, but when it matters.
          </p>
        </article>

        <article className="rounded-2xl border border-[#d4af37]/15 bg-[#101112] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Next Step</p>
          <p className="mt-4 text-sm leading-7 text-gray-300">Once the terminology is clearer, move into the resource library that matches the issue you are trying to solve.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/advocacy-legal/resources/know-your-rights" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Open Rights Guides</Link>
            <Link href="/advocacy-legal/resources/legal-templates" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">Open Templates</Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {glossary.map((item) => (
          <article key={item.term} className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5">
            <p className="text-lg font-semibold text-white">{item.term}</p>
            <p className="mt-3 text-sm leading-7 text-gray-300">{item.definition}</p>
            <div className="mt-4 rounded-xl border border-white/8 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]/60">Where It Shows Up</p>
              <p className="mt-2 text-sm text-gray-200">{item.use}</p>
            </div>
          </article>
        ))}
      </section>
    </AdvocacyFrame>
  );
}
