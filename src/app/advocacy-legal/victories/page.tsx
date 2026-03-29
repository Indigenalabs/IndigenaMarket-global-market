import AdvocacyFrame from '../components/AdvocacyFrame';
import { VictoryCard, usePillar9Data } from '../components/AdvocacyCards';

export default function CompletedCasesVictoriesPage() {
  const { victories } = usePillar9Data();
  return (
    <AdvocacyFrame title="Completed Cases & Victories" subtitle="Impact gallery of legal wins and restored rights outcomes.">
      <section className="grid gap-4 md:grid-cols-2">
        {victories.map((item) => <VictoryCard key={item.id} item={item} />)}
      </section>
    </AdvocacyFrame>
  );
}

