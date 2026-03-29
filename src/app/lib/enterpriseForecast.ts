import type { EnterpriseInquiryRecord } from '@/app/lib/enterpriseApi';
import { DEFAULT_ENTERPRISE_STAGE_WEIGHTS, type EnterpriseStageWeightMap } from '@/app/lib/enterpriseForecastConfig';

export function getEnterpriseStageWeight(
  stage: EnterpriseInquiryRecord['contractStage'],
  weights: EnterpriseStageWeightMap = DEFAULT_ENTERPRISE_STAGE_WEIGHTS
) {
  return weights[stage] ?? 0;
}

export function calculateEnterpriseForecast(
  inquiries: Pick<EnterpriseInquiryRecord, 'contractStage' | 'estimatedValue'>[],
  weights: EnterpriseStageWeightMap = DEFAULT_ENTERPRISE_STAGE_WEIGHTS
) {
  return inquiries.reduce((total, entry) => {
    const value = Number(entry.estimatedValue || 0);
    return total + value * getEnterpriseStageWeight(entry.contractStage, weights);
  }, 0);
}
