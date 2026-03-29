export type RevenueFlowClass = 'commerce' | 'service' | 'donation' | 'archive-access' | 'governed-zero-fee';

export interface PillarRevenuePolicyEntry {
  pillar: string;
  transactionFeeApplies: boolean;
  zeroFeeException: boolean;
  flowClass: RevenueFlowClass;
  notes: string;
}

export const TEN_PILLAR_REVENUE_POLICY: PillarRevenuePolicyEntry[] = [
  {
    pillar: 'digital-arts',
    transactionFeeApplies: true,
    zeroFeeException: false,
    flowClass: 'commerce',
    notes: 'Buy-now, offer, and auction settlement flows are fee-bearing marketplace transactions.'
  },
  {
    pillar: 'physical-items',
    transactionFeeApplies: true,
    zeroFeeException: false,
    flowClass: 'commerce',
    notes: 'Physical checkout uses Firekeeper fee plus physical handling/protection rules.'
  },
  {
    pillar: 'courses',
    transactionFeeApplies: true,
    zeroFeeException: false,
    flowClass: 'commerce',
    notes: 'Paid enrollments and receipts are fee-bearing platform transactions.'
  },
  {
    pillar: 'freelancing',
    transactionFeeApplies: true,
    zeroFeeException: false,
    flowClass: 'service',
    notes: 'Escrow-protected service bookings are fee-bearing platform transactions.'
  },
  {
    pillar: 'cultural-tourism',
    transactionFeeApplies: true,
    zeroFeeException: false,
    flowClass: 'service',
    notes: 'Bookable tourism inventory uses fee-bearing booking flows.'
  },
  {
    pillar: 'language-heritage',
    transactionFeeApplies: true,
    zeroFeeException: false,
    flowClass: 'archive-access',
    notes: 'Paid archive and premium listing access flows are fee-bearing where the material is sold through the marketplace.'
  },
  {
    pillar: 'land-food',
    transactionFeeApplies: true,
    zeroFeeException: false,
    flowClass: 'commerce',
    notes: 'Producer-to-buyer product sales are fee-bearing marketplace transactions.'
  },
  {
    pillar: 'advocacy-legal',
    transactionFeeApplies: false,
    zeroFeeException: true,
    flowClass: 'donation',
    notes: 'Current live payment flows are donation and campaign support flows. These are governed separately and should not be charged generic marketplace transaction fees. Paid legal-service flows must be audited separately before fee activation.'
  },
  {
    pillar: 'materials-tools',
    transactionFeeApplies: true,
    zeroFeeException: false,
    flowClass: 'commerce',
    notes: 'Supply and materials ordering uses fee-bearing commerce flows.'
  },
  {
    pillar: 'seva',
    transactionFeeApplies: false,
    zeroFeeException: true,
    flowClass: 'governed-zero-fee',
    notes: 'Seva remains a deliberate 0% donation and impact exception.'
  }
];

export function getPillarRevenuePolicy(pillar: string) {
  return TEN_PILLAR_REVENUE_POLICY.find((entry) => entry.pillar === pillar) || null;
}
