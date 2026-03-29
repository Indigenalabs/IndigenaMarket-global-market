import Link from 'next/link';
import LandFoodFrame from '../../components/LandFoodFrame';
import { getProject } from '../../data/pillar8Data';

export default async function ConservationProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = getProject(projectId);
  const fundingProgress = Math.min(100, Math.round((project.fundingRaisedUsd / project.fundingTargetUsd) * 100));

  return (
    <LandFoodFrame title={project.title} subtitle={`${project.location} • ${project.nation}`}>
      <section className="grid gap-5 lg:grid-cols-[1.3fr,1fr]">
        <article className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#10110f]">
          <img src={project.image} alt={project.title} className="h-[420px] w-full object-cover" />
        </article>
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">Conservation Project Detail</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{project.title}</h2>
          <p className="mt-2 text-sm text-gray-300">{project.summary}</p>
          <div className="mt-4 space-y-2 text-sm text-gray-300">
            <p>Carbon Credits: <span className="text-white">{project.carbonCredits.toLocaleString()}</span></p>
            <p>Biodiversity Score: <span className="text-white">{project.biodiversityScore}</span></p>
            <p>Progress: <span className="text-white">{project.progressPercent}%</span></p>
            <p>Funding: <span className="text-[#d4af37]">${project.fundingRaisedUsd.toLocaleString()} / ${project.fundingTargetUsd.toLocaleString()}</span></p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-black/40">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${fundingProgress}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/land-food/food-sovereignty-donation" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Co-Fund Project</Link>
            <Link href="/land-food/stewardship-application" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">Apply Similar Project</Link>
          </div>
        </article>
      </section>
    </LandFoodFrame>
  );
}
