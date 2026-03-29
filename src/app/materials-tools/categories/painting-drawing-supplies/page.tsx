import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="painting-drawing-supplies"
      title="Painting & Drawing Supplies"
      overview="Artists need dependable consumables, but also surfaces and pigment stories that align with their practice. This category keeps that entire decision chain in one place."
      nextHref="/materials-tools/wishlist"
      nextLabel="Post a sourcing request"
    />
  );
}

