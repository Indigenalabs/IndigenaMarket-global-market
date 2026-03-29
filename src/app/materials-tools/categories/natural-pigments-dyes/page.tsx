import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="natural-pigments-dyes"
      title="Natural Pigments & Dyes"
      overview="For artists working with earth colours, plant-based dye systems, and heritage palettes, this category connects raw colour to harvester story, region, and responsible extraction method."
      nextHref="/materials-tools/services/material-sourcing-consultation"
      nextLabel="Request sourcing support"
    />
  );
}

