import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import RentalStewardDashboardClient from '@/app/materials-tools/components/RentalStewardDashboardClient';

export default function RentalStewardDashboardPage() {
  return (
    <MaterialsToolsFrame
      title="Tool Library Steward Dashboard"
      subtitle="Review orientation-bound bookings, release confirmed slots, and keep the waitlist moving."
    >
      <RentalStewardDashboardClient />
    </MaterialsToolsFrame>
  );
}
