import LandFoodFrame from '../../components/LandFoodFrame';
import LandFoodHero from '../../components/LandFoodHero';
import { ProjectCard } from '../../components/LandFoodCards';
import { projects } from '../../data/pillar8Data';

export default function ConservationCarbonProjectsPage() {
  return (
    <LandFoodFrame title="Conservation & Carbon Projects" subtitle="Verified land stewardship projects with carbon and biodiversity outcomes.">
      <LandFoodHero
        eyebrow="Stewardship Services"
        title="Indigenous-Led Carbon and Biodiversity Projects"
        description="Partner with communities on measurable restoration, carbon sequestration, and long-term habitat protection."
        image="https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1800&h=900&fit=crop"
        chips={['Carbon Credits', 'Biodiversity Scores', 'Community Governance']}
        actions={[{ href: '/land-food/stewardship-application', label: 'Apply for Stewardship Partnership' }]}
      />
      <section className="grid gap-4 md:grid-cols-2">{projects.map((x) => <ProjectCard key={x.id} item={x} />)}</section>
    </LandFoodFrame>
  );
}
