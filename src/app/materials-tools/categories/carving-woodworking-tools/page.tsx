import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="carving-woodworking-tools"
      title="Carving & Woodworking Tools"
      overview="Tool choice affects control, learning curve, and maintenance burden. This category gathers carving kits, adzes, knives, and workshop gear with realistic maker use cases."
      nextHref="/materials-tools/services/equipment-repair-maintenance"
      nextLabel="Book repair services"
    />
  );
}

