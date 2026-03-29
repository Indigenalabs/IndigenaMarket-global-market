import type { MarketingPlacementScope } from '@/app/profile/data/marketingInventory';

export type ServeablePlacementScope = Extract<
  MarketingPlacementScope,
  | 'digital-arts'
  | 'physical-items'
  | 'courses'
  | 'freelancing'
  | 'cultural-tourism'
  | 'language-heritage'
  | 'land-food'
  | 'advocacy-legal'
  | 'materials-tools'
>;

type PlacementFeedConfig = {
  apiPath: string;
  stickyKey: string;
  heroKey: string;
  supportKeys: string[];
};

export const PLACEMENT_FEED_CONFIG: Record<ServeablePlacementScope, PlacementFeedConfig> = {
  'digital-arts': {
    apiPath: '/api/placements/page/digital-arts',
    stickyKey: 'stickyBanner',
    heroKey: 'heroPlacement',
    supportKeys: ['sponsoredCard', 'artistSpotlight', 'trendingCollections']
  },
  'physical-items': {
    apiPath: '/api/placements/page/physical-items',
    stickyKey: 'stickyBanner',
    heroKey: 'heroPlacement',
    supportKeys: ['makerFeature', 'limitedDrop', 'categoryShelf']
  },
  courses: {
    apiPath: '/api/placements/page/courses',
    stickyKey: 'stickyAnnouncement',
    heroKey: 'heroPlacement',
    supportKeys: ['promotedCourseCard', 'categoryFeaturedCourse', 'instructorSpotlight']
  },
  freelancing: {
    apiPath: '/api/placements/page/freelancing',
    stickyKey: 'stickyBanner',
    heroKey: 'heroPlacement',
    supportKeys: ['searchBoost', 'promotedServiceCard', 'servicesSpotlight']
  },
  'cultural-tourism': {
    apiPath: '/api/placements/page/cultural-tourism',
    stickyKey: 'stickyBanner',
    heroKey: 'heroBanner',
    supportKeys: ['operatorSpotlight', 'sponsoredCard', 'regionBoost']
  },
  'language-heritage': {
    apiPath: '/api/placements/page/language-heritage',
    stickyKey: 'stickyBanner',
    heroKey: 'heroPlacement',
    supportKeys: ['collectionSpotlight', 'keepersSpotlight', 'sponsoredCard']
  },
  'land-food': {
    apiPath: '/api/placements/page/land-food',
    stickyKey: 'stickyBanner',
    heroKey: 'heroBanner',
    supportKeys: ['featuredProducerSpotlight', 'sponsoredListingCard', 'projectSpotlight']
  },
  'advocacy-legal': {
    apiPath: '/api/placements/page/advocacy-legal',
    stickyKey: 'stickyBanner',
    heroKey: 'heroPlacement',
    supportKeys: ['resourceFeature', 'attorneySpotlight', 'trendingActions']
  },
  'materials-tools': {
    apiPath: '/api/placements/page/materials-tools',
    stickyKey: 'stickyBanner',
    heroKey: 'heroPlacement',
    supportKeys: ['sponsoredSupplyListing', 'supplierSpotlight', 'toolLibraryHighlight']
  }
};

export function isServeablePlacementScope(scope: MarketingPlacementScope): scope is ServeablePlacementScope {
  return scope in PLACEMENT_FEED_CONFIG;
}
