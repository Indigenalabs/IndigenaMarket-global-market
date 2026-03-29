import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import CoopDashboardClient from '@/app/materials-tools/components/CoopDashboardClient';

export default function CoopDashboardPage() {
  return (
    <MaterialsToolsFrame title="Co-op Member Dashboard" subtitle="Track open runs, commitment windows, pooled freight milestones, and the orders your studio has already joined.">
      <CoopDashboardClient />
    </MaterialsToolsFrame>
  );
}
