import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="beads-findings"
      title="Beads & Findings"
      overview="A dense category for studios that need consistency, colour matching, and wholesale-friendly restocks while still buying from Indigenous-run supply channels."
      nextHref="/materials-tools/bulk-coop"
      nextLabel="Join a bulk order"
    />
  );
}

