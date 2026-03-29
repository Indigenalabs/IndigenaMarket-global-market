import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import MaterialsToolsActionPanel from '@/app/materials-tools/components/MaterialsToolsActionPanel';

export default function ElderApprovalPage() {
  return (
    <MaterialsToolsFrame title="Request Elder Approval for Sacred Materials" subtitle="Submit sourcing or access requests for materials that require higher cultural authority.">
      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6 text-sm leading-7 text-[#d5cab8]">This route handles sensitive material approvals where listing visibility alone is not enough. It should collect use case, requester role, community relationship, and the exact material being requested.</article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6 text-sm leading-7 text-[#d7f0f2]">Approval decisions should become visible trust signals on the related listing while keeping restricted context private.</article>
      </section>
      <MaterialsToolsActionPanel variant="elder-approval" title="Sacred material approval request" />
    </MaterialsToolsFrame>
  );
}
