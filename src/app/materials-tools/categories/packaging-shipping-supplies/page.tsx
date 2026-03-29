import CategoryPageShell from '@/app/materials-tools/components/CategoryPageShell';

export default function Page() {
  return (
    <CategoryPageShell
      categoryId="packaging-shipping-supplies"
      title="Packaging & Shipping Supplies"
      overview="A supply chain pillar is incomplete without fulfillment. This category supports packaging, outbound shipping, storage, and protection for finished work."
      nextHref="/materials-tools/bulk-coop"
      nextLabel="Pool packaging orders"
    />
  );
}

