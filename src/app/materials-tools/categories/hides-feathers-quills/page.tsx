import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="hides-feathers-quills"
      title="Hides, Feathers & Quills"
      overview="Highly sensitive sourcing needs more than a listing card. This category emphasizes ethical sourcing, cultural restrictions, and clear origin documentation before artists commit."
      nextHref="/materials-tools/elder-approval"
      nextLabel="Request elder approval"
    />
  );
}

