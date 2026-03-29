import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="printmaking-tools"
      title="Printmaking Tools"
      overview="Printmakers often work around scarce equipment. This category pairs printmaking tools with access routes like shared presses, repair support, and group orders."
      nextHref="/materials-tools/rentals"
      nextLabel="Find shared presses"
    />
  );
}

