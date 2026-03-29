import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="textile-weaving-tools"
      title="Textile & Weaving Tools"
      overview="This route is for weaving collectives and solo makers trying to source looms, heddles, spindles, and setup-ready kits with less friction and better context."
      nextHref="/materials-tools/bulk-coop"
      nextLabel="Join a weaving co-op"
    />
  );
}

