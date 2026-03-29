import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="pottery-ceramics-tools"
      title="Pottery & Ceramics Tools"
      overview="Pottery studios need a mix of everyday tools and expensive equipment access. This category supports both, from paddles and ribs to wheels and firing workflows."
      nextHref="/materials-tools/rentals"
      nextLabel="Open tool libraries"
    />
  );
}

