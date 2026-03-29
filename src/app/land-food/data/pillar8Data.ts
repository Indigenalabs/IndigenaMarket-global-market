export type LandFoodCategoryId =
  | 'traditional-foods'
  | 'heirloom-seeds-plants'
  | 'natural-materials-dyes'
  | 'value-added-products'
  | 'gift-bundle-boxes';

export type VerificationTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type LandFoodProduct = {
  id: string;
  title: string;
  producerId: string;
  producerName: string;
  nation: string;
  category: LandFoodCategoryId;
  price: number;
  currency: 'USD';
  image: string;
  stockLabel: string;
  harvestWindow: string;
  verified: boolean;
  verificationTier: VerificationTier;
  summary: string;
  stewardshipSharePercent: number;
  seasonalMonths: string[];
  traceability: {
    lotCode: string;
    harvestRegion: string;
    harvestingMethod: string;
    qrCodeLabel: string;
  };
  certifications: string[];
};

export type Producer = {
  id: string;
  name: string;
  nation: string;
  region: string;
  verified: boolean;
  verificationTier: VerificationTier;
  avatar: string;
  cover: string;
  specialties: string[];
  bio: string;
  yearlyStewardshipRevenue: number;
};

export type ConservationProject = {
  id: string;
  title: string;
  nation: string;
  location: string;
  carbonCredits: number;
  biodiversityScore: number;
  progressPercent: number;
  fundingRaisedUsd: number;
  fundingTargetUsd: number;
  image: string;
  summary: string;
};

export type StewardshipService = {
  id: string;
  title: string;
  provider: string;
  nation: string;
  rateLabel: string;
  image: string;
  summary: string;
  serviceType: 'tek-consulting' | 'restoration' | 'education';
};

export const categoryMeta: Record<LandFoodCategoryId, { label: string; description: string; image: string }> = {
  'traditional-foods': {
    label: 'Traditional Foods',
    description: 'Wild-harvested and heritage food staples grounded in Indigenous food systems.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&h=900&fit=crop'
  },
  'heirloom-seeds-plants': {
    label: 'Heirloom Seeds & Plants',
    description: 'Community-protected seed lines and native starts for regenerative growing.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&h=900&fit=crop'
  },
  'natural-materials-dyes': {
    label: 'Natural Materials & Dyes',
    description: 'Plant-based dyes, fibers, clays, and craft materials harvested with protocol.',
    image: 'https://images.unsplash.com/photo-1517356714739-3d1db2f10c78?w=1600&h=900&fit=crop'
  },
  'value-added-products': {
    label: 'Value-Added Products',
    description: 'Milled flours, preserves, spice blends, and shelf-ready community products.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=900&fit=crop'
  },
  'gift-bundle-boxes': {
    label: 'Gift & Bundle Boxes',
    description: 'Curated seasonal bundles for families, institutions, and wholesale buyers.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&h=900&fit=crop'
  }
};

export const producers: Producer[] = [
  {
    id: 'prd-1',
    name: 'Red River Food Sovereignty Co-op',
    nation: 'Ojibwe',
    region: 'Minnesota, US',
    verified: true,
    verificationTier: 'platinum',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=1400&h=700&fit=crop',
    specialties: ['Wild rice', 'Maple products', 'Seed stewardship'],
    bio: 'Community-run food hub connecting growers, harvesters, and youth apprentices.',
    yearlyStewardshipRevenue: 186000
  },
  {
    id: 'prd-2',
    name: 'Te Awa Regenerative Collective',
    nation: 'Maori',
    region: 'Aotearoa NZ',
    verified: true,
    verificationTier: 'gold',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&h=700&fit=crop',
    specialties: ['Native grains', 'Kaitiakitanga consulting', 'Forest restoration'],
    bio: 'Land and food producers integrating cultural protocol with measurable biodiversity outcomes.',
    yearlyStewardshipRevenue: 143000
  },
  {
    id: 'prd-3',
    name: 'Desert Seed Keepers',
    nation: 'Tohono Oodham',
    region: 'Arizona, US',
    verified: true,
    verificationTier: 'gold',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1400&h=700&fit=crop',
    specialties: ['Tepary beans', 'Blue corn', 'Dryland farming education'],
    bio: 'Intergenerational seed and harvest network preserving drought-resilient varieties.',
    yearlyStewardshipRevenue: 112000
  }
];

export const products: LandFoodProduct[] = [
  {
    id: 'lf-101',
    title: 'Stone-Ground Blue Corn Flour',
    producerId: 'prd-3',
    producerName: 'Desert Seed Keepers',
    nation: 'Tohono Oodham',
    category: 'value-added-products',
    price: 18,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1625944525533-473f1f45b6c5?w=1200&h=900&fit=crop',
    stockLabel: 'In Stock',
    harvestWindow: 'Year-round milling',
    verified: true,
    verificationTier: 'gold',
    summary: 'Small-batch flour milled from community-grown blue corn with full traceability.',
    stewardshipSharePercent: 22,
    seasonalMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    traceability: {
      lotCode: 'DSK-BLUE-2407',
      harvestRegion: 'Sonoran Desert Uplands',
      harvestingMethod: 'Dryland regenerative cultivation + stone milling',
      qrCodeLabel: 'Scan lot history'
    },
    certifications: ['Community Verified', 'Dryland Traditional Farming']
  },
  {
    id: 'lf-102',
    title: 'Wild Rice Harvest Pack',
    producerId: 'prd-1',
    producerName: 'Red River Food Sovereignty Co-op',
    nation: 'Ojibwe',
    category: 'traditional-foods',
    price: 26,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=1200&h=900&fit=crop',
    stockLabel: 'Limited',
    harvestWindow: 'Late Summer',
    verified: true,
    verificationTier: 'platinum',
    summary: 'Hand-harvested and traditionally processed wild rice with origin metadata.',
    stewardshipSharePercent: 28,
    seasonalMonths: ['Aug', 'Sep', 'Oct'],
    traceability: {
      lotCode: 'RRFSC-WR-2409',
      harvestRegion: 'Red Lake Wetland Zone',
      harvestingMethod: 'Hand canoe harvest + low-heat finishing',
      qrCodeLabel: 'Scan harvest route'
    },
    certifications: ['Community Verified', 'Wetland Stewardship Protocol']
  },
  {
    id: 'lf-103',
    title: 'Heirloom Tepary Bean Seed Kit',
    producerId: 'prd-3',
    producerName: 'Desert Seed Keepers',
    nation: 'Tohono Oodham',
    category: 'heirloom-seeds-plants',
    price: 34,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=1200&h=900&fit=crop',
    stockLabel: 'In Stock',
    harvestWindow: 'Planting: Spring',
    verified: true,
    verificationTier: 'gold',
    summary: 'Seed bundle with planting guide and dryland stewardship instructions.',
    stewardshipSharePercent: 25,
    seasonalMonths: ['Mar', 'Apr', 'May'],
    traceability: {
      lotCode: 'DSK-TPR-2403',
      harvestRegion: 'San Xavier Plateau',
      harvestingMethod: 'Seed selection from heirloom drought-resilient lines',
      qrCodeLabel: 'Scan seed lineage'
    },
    certifications: ['Heirloom Seed Stewardship', 'Community Verified']
  },
  {
    id: 'lf-104',
    title: 'Native Plant Dye Collection',
    producerId: 'prd-2',
    producerName: 'Te Awa Regenerative Collective',
    nation: 'Maori',
    category: 'natural-materials-dyes',
    price: 42,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=900&fit=crop',
    stockLabel: 'In Stock',
    harvestWindow: 'Seasonal blend',
    verified: true,
    verificationTier: 'gold',
    summary: 'Natural dye powders and bark extracts for textile and art applications.',
    stewardshipSharePercent: 20,
    seasonalMonths: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    traceability: {
      lotCode: 'TAW-DYE-2411',
      harvestRegion: 'Waikato River Banks',
      harvestingMethod: 'Selective bark + plant harvest under kaitiakitanga plans',
      qrCodeLabel: 'Scan dye provenance'
    },
    certifications: ['Natural Dye Protocol', 'Community Verified']
  },
  {
    id: 'lf-105',
    title: 'Seasonal Sovereignty Gift Box',
    producerId: 'prd-1',
    producerName: 'Red River Food Sovereignty Co-op',
    nation: 'Ojibwe',
    category: 'gift-bundle-boxes',
    price: 65,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&h=900&fit=crop',
    stockLabel: 'Preorder',
    harvestWindow: 'Quarterly release',
    verified: true,
    verificationTier: 'platinum',
    summary: 'Curated food + seed + story bundle supporting regional food sovereignty programs.',
    stewardshipSharePercent: 30,
    seasonalMonths: ['Mar', 'Jun', 'Sep', 'Dec'],
    traceability: {
      lotCode: 'RRFSC-BOX-24Q4',
      harvestRegion: 'Multi-community sourcing',
      harvestingMethod: 'Quarterly curated seasonal procurement',
      qrCodeLabel: 'Scan bundle traceability'
    },
    certifications: ['Community Verified', 'Food Sovereignty Program Linked']
  }
];

export const projects: ConservationProject[] = [
  {
    id: 'cp-1',
    title: 'Wetland Carbon Guardianship Program',
    nation: 'Ojibwe',
    location: 'Great Lakes Territory',
    carbonCredits: 18400,
    biodiversityScore: 91,
    progressPercent: 64,
    fundingRaisedUsd: 420000,
    fundingTargetUsd: 650000,
    image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1400&h=900&fit=crop',
    summary: 'Wetland restoration and long-term carbon sequestration monitored by community rangers.'
  },
  {
    id: 'cp-2',
    title: 'Native Forest Regeneration Corridor',
    nation: 'Maori',
    location: 'North Island',
    carbonCredits: 11200,
    biodiversityScore: 95,
    progressPercent: 48,
    fundingRaisedUsd: 290000,
    fundingTargetUsd: 600000,
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1400&h=900&fit=crop',
    summary: 'Indigenous-led corridor restoration connecting fragmented habitats and river systems.'
  }
];

export const services: StewardshipService[] = [
  {
    id: 'sv-1',
    title: 'TEK Land Planning Advisory',
    provider: 'Te Awa Regenerative Collective',
    nation: 'Maori',
    rateLabel: '$220/hour',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&h=900&fit=crop',
    summary: 'Protocol-aware ecological planning for governments, NGOs, and land managers.',
    serviceType: 'tek-consulting'
  },
  {
    id: 'sv-2',
    title: 'Regenerative Agriculture Field Training',
    provider: 'Desert Seed Keepers',
    nation: 'Tohono Oodham',
    rateLabel: '$1,200/workshop',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1400&h=900&fit=crop',
    summary: 'Hands-on training in drought-resilient cultivation and seasonal stewardship.',
    serviceType: 'education'
  },
  {
    id: 'sv-3',
    title: 'Watershed Restoration Deployment Team',
    provider: 'Red River Food Sovereignty Co-op',
    nation: 'Ojibwe',
    rateLabel: '$4,500/sprint',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&h=900&fit=crop',
    summary: 'On-country restoration teams for native planting and invasive species management.',
    serviceType: 'restoration'
  }
];

export const seasonOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getProducer(id: string) {
  return producers.find((x) => x.id === id) || producers[0];
}

export function getProduct(id: string) {
  return products.find((x) => x.id === id) || products[0];
}

export function getProject(id: string) {
  return projects.find((x) => x.id === id) || projects[0];
}

export function getService(id: string) {
  return services.find((x) => x.id === id) || services[0];
}

export function productsByCategory(category: LandFoodCategoryId) {
  return products.filter((x) => x.category === category);
}

export function seasonalAvailabilityMap() {
  const availability = new Map<string, number>();
  seasonOrder.forEach((m) => availability.set(m, 0));
  products.forEach((product) => {
    product.seasonalMonths.forEach((m) => availability.set(m, (availability.get(m) || 0) + 1));
  });
  return seasonOrder.map((month) => ({ month, activeListings: availability.get(month) || 0 }));
}

export function regenerativeEconomySummary() {
  const stewardshipAvg = Math.round(products.reduce((acc, p) => acc + p.stewardshipSharePercent, 0) / products.length);
  const projectedCommunityFlow = products.reduce((acc, p) => acc + p.price * (p.stewardshipSharePercent / 100), 0);
  const totalCredits = projects.reduce((acc, p) => acc + p.carbonCredits, 0);
  return {
    stewardshipAvg,
    projectedCommunityFlow: Number(projectedCommunityFlow.toFixed(2)),
    totalCredits,
    verifiedProducers: producers.filter((p) => p.verified).length
  };
}
