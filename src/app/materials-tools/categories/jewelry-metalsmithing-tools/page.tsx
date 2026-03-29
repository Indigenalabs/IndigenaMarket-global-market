import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="jewelry-metalsmithing-tools"
      title="Jewelry & Metalsmithing Tools"
      overview="For jewelers and metalsmiths who need dependable bench infrastructure, this category combines studio tools with access to rental benches and maintenance services."
      nextHref="/materials-tools/rentals"
      nextLabel="Browse rental benches"
    />
  );
}

