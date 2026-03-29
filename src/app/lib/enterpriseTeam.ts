export type EnterpriseOwnerRole = 'sales' | 'partnerships' | 'licensing' | 'archive' | 'legal' | 'finance';

export const ENTERPRISE_OWNER_OPTIONS: Array<{ id: EnterpriseOwnerRole; label: string }> = [
  { id: 'sales', label: 'Sales' },
  { id: 'partnerships', label: 'Partnerships' },
  { id: 'licensing', label: 'Licensing' },
  { id: 'archive', label: 'Archive' },
  { id: 'legal', label: 'Legal' },
  { id: 'finance', label: 'Finance' }
];
