import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="clays-ceramic-materials"
      title="Clays & Ceramic Materials"
      overview="This category supports ceramic makers sourcing clay bodies, slips, grog, and firing materials without losing the context behind where those earth materials came from."
      nextHref="/materials-tools/rentals"
      nextLabel="Find kiln access"
    />
  );
}

