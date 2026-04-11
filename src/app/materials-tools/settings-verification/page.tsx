import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import MaterialsToolsSettingsClient from '@/app/materials-tools/components/MaterialsToolsSettingsClient';

export default function SettingsVerificationPage() {
  return (
    <MaterialsToolsFrame
      title="Settings & Verification"
      subtitle="Manage supplier verification, tool access, proof lanes, and Materials & Tools launch readiness."
    >
      <MaterialsToolsSettingsClient />
    </MaterialsToolsFrame>
  );
}
