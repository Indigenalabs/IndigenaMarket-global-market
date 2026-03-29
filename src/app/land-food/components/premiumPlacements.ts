export type LandFoodPremiumPlacement = {
  id: string;
  label: string;
  fallbackPrice: string;
  description: string;
  image: string;
  cta: string;
};

export const LAND_FOOD_PREMIUM_PLACEMENTS: LandFoodPremiumPlacement[] = [
  {
    id: 'landfood_sticky_banner',
    label: 'Sticky Announcement Banner',
    fallbackPrice: '$300/week',
    description: 'Persistent top banner for seasonal campaigns and procurement windows.',
    image: 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=1200&h=600&fit=crop',
    cta: 'Book Sticky'
  },
  {
    id: 'landfood_hero_banner',
    label: 'Hero Banner Placement',
    fallbackPrice: '$450/week',
    description: 'Primary hero campaign shown on Land & Food discovery surfaces.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop',
    cta: 'Reserve Hero'
  },
  {
    id: 'landfood_featured_producer_spotlight',
    label: 'Featured Producer Spotlight',
    fallbackPrice: '$250/week',
    description: 'Highlight a verified producer in spotlight sections and profile rails.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=600&fit=crop',
    cta: 'Book Producer Spotlight'
  },
  {
    id: 'landfood_trending_strip',
    label: 'Trending Strip Placement',
    fallbackPrice: '$180/week',
    description: 'Inject sponsored inventory into high-intent trending demand strips.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop',
    cta: 'Boost Trending'
  },
  {
    id: 'landfood_sponsored_listing_card',
    label: 'Sponsored Listing Injection',
    fallbackPrice: '$120/week',
    description: 'Sponsored cards inserted in product discovery grids.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=600&fit=crop',
    cta: 'Sponsor Listing'
  },
  {
    id: 'landfood_project_spotlight',
    label: 'Conservation Project Spotlight',
    fallbackPrice: '$220/week',
    description: 'Feature stewardship/carbon projects in funding-focused placements.',
    image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&h=600&fit=crop',
    cta: 'Spotlight Project'
  },
  {
    id: 'landfood_institution_partner_strip',
    label: 'Institution Partner Strip',
    fallbackPrice: '$260/week',
    description: 'Dedicated strip for B2B procurement and institutional partnership campaigns.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop',
    cta: 'Join Partner Strip'
  }
];
