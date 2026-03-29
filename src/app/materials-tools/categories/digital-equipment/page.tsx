import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="digital-equipment"
      title="Digital Equipment"
      overview="For creators blending analog and digital practice, this category covers capture, digitization, tablets, and studio equipment with ownership and rental paths."
      nextHref="/materials-tools/rentals"
      nextLabel="See digital rentals"
    />
  );
}

