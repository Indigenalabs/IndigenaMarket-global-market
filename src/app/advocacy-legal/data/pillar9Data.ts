export type Attorney = {
  id: string;
  name: string;
  nation: string;
  specialty: string;
  region: string;
  rateLabel: string;
  proBono: boolean;
  verified: 'verified' | 'elder-council' | 'pro-bono-network';
  image: string;
  bio: string;
};

export type Campaign = {
  id: string;
  title: string;
  type: 'legal-defense' | 'land-defense' | 'policy-action';
  region: string;
  raised: number;
  target: number;
  supporters: number;
  urgent: boolean;
  image: string;
  summary: string;
};

export type Resource = {
  id: string;
  title: string;
  kind: 'guide' | 'template' | 'webinar' | 'case-law' | 'glossary';
  audience: string;
  language: string;
  image: string;
  summary: string;
};

export type Victory = {
  id: string;
  title: string;
  impact: string;
  year: string;
  image: string;
  summary: string;
};

export const attorneys: Attorney[] = [
  {
    id: 'mika-redsky',
    name: 'Mika Redsky',
    nation: 'Anishinaabe',
    specialty: 'Treaty Rights & Sovereignty',
    region: 'Ontario, CA',
    rateLabel: '$240/hr',
    proBono: false,
    verified: 'verified',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop',
    bio: 'Litigation lead for treaty access and co-management frameworks.'
  },
  {
    id: 'jalen-yazzie',
    name: 'Jalen Yazzie',
    nation: 'Dine',
    specialty: 'ICIP, Licensing, Contracts',
    region: 'Arizona, US',
    rateLabel: '$210/hr',
    proBono: true,
    verified: 'pro-bono-network',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
    bio: 'Protects artists and communities from unauthorized cultural extraction.'
  },
  {
    id: 'tere-moana',
    name: 'Tere Moana',
    nation: 'Maori',
    specialty: 'Land Defense & Environmental Law',
    region: 'Aotearoa NZ',
    rateLabel: '$260/hr',
    proBono: false,
    verified: 'elder-council',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop',
    bio: 'Counsel for sacred site injunctions and marine stewardship disputes.'
  },
  {
    id: 'dario-katani',
    name: 'Dario Katani',
    nation: 'Tlicho',
    specialty: 'Repatriation & NAGPRA',
    region: 'NWT, CA',
    rateLabel: '$190/hr',
    proBono: true,
    verified: 'pro-bono-network',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop',
    bio: 'Coordinates museum negotiations and repatriation protocol compliance.'
  }
];

export const campaigns: Campaign[] = [
  {
    id: 'coastal-fishery-defense',
    title: 'Coastal Fishery Treaty Defense',
    type: 'legal-defense',
    region: 'Atlantic Coast',
    raised: 420000,
    target: 650000,
    supporters: 3841,
    urgent: true,
    image: 'https://images.unsplash.com/photo-1460411794035-42aac080490a?w=1400&h=900&fit=crop',
    summary: 'Emergency litigation fund for treaty-protected fishery access and safety enforcement.'
  },
  {
    id: 'sacred-ridge-injunction',
    title: 'Sacred Ridge Injunction Campaign',
    type: 'land-defense',
    region: 'Northern Desert',
    raised: 310000,
    target: 400000,
    supporters: 2294,
    urgent: true,
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1400&h=900&fit=crop',
    summary: 'Legal action to block extraction permits near ceremonial and burial grounds.'
  },
  {
    id: 'language-rights-bill',
    title: 'Language Rights Bill Mobilization',
    type: 'policy-action',
    region: 'National',
    raised: 95000,
    target: 150000,
    supporters: 5022,
    urgent: false,
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&h=900&fit=crop',
    summary: 'Community policy push for official language protections and school resourcing.'
  }
];

export const resources: Resource[] = [
  {
    id: 'guide-rights-at-checkpoints',
    title: 'Know Your Rights at Checkpoints',
    kind: 'guide',
    audience: 'Community Members',
    language: 'English + Cree',
    image: 'https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=1200&h=800&fit=crop',
    summary: 'Quick-reference legal rights card with escalation steps and legal hotline workflow.'
  },
  {
    id: 'template-artist-license',
    title: 'Indigenous Artist Licensing Template',
    kind: 'template',
    audience: 'Artists / Collectives',
    language: 'English',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=800&fit=crop',
    summary: 'Contract template with ICIP safeguards, revocation clauses, and approved uses.'
  },
  {
    id: 'webinar-pipeline-response',
    title: 'Rapid Legal Response to Pipeline Notices',
    kind: 'webinar',
    audience: 'Land Defenders',
    language: 'English + Maori',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=800&fit=crop',
    summary: 'Live training on injunction preparation, evidence kits, and media-safe statements.'
  },
  {
    id: 'case-law-hub',
    title: 'Indigenous Rights Case Law Hub',
    kind: 'case-law',
    audience: 'Researchers / Advocates',
    language: 'Multi-language',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=800&fit=crop',
    summary: 'Searchable precedents indexed by treaty theme, jurisdiction, and outcome.'
  }
];

export const victories: Victory[] = [
  {
    id: 'river-access-win-2024',
    title: 'River Access Treaty Win',
    impact: 'Permanent injunction against exclusion barriers',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&h=800&fit=crop',
    summary: 'Community-backed legal strategy restored ceremonial and sustenance river access.'
  },
  {
    id: 'repatriation-bundle-return',
    title: 'Ancestral Bundle Repatriation',
    impact: '23 sacred items returned with protocol safeguards',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1516542076529-1ea3854896e1?w=1200&h=800&fit=crop',
    summary: 'Cross-border legal collaboration secured a culturally supervised return process.'
  }
];

export const legalStats = {
  activeProfessionals: 312,
  liveCampaigns: 47,
  resources: 590,
  emergencyFundUsd: 2_840_000
};

