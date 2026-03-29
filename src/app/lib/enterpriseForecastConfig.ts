import type { EnterpriseInquiryRecord } from '@/app/lib/enterpriseApi';

export type EnterpriseStageWeightMap = Record<EnterpriseInquiryRecord['contractStage'], number>;

export const DEFAULT_ENTERPRISE_STAGE_WEIGHTS: EnterpriseStageWeightMap = {
  lead: 0.15,
  discovery: 0.25,
  proposal: 0.4,
  negotiation: 0.7,
  won: 1,
  lost: 0
};
