import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="fibers-textile-materials"
      title="Fibers & Textile Materials"
      overview="This category is for weaving studios, fibre artists, and regalia makers needing yarns, bark cloth, flax, and fibre-ready bundles that come with preparation context."
      nextHref="/materials-tools/rentals"
      nextLabel="Find textile tool libraries"
    />
  );
}

