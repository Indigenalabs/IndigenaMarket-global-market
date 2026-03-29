export type HeritagePremiumPlacement = {
  id: string;
  label: string;
  fallbackPrice: string;
  description: string;
  image: string;
  cta: string;
};

export const HERITAGE_PREMIUM_PLACEMENTS: HeritagePremiumPlacement[] = [
  {
    id: 'heritage_featured_banner',
    label: 'Hero Banner Premium',
    fallbackPrice: '$280/week',
    description: 'Primary hero campaign shown across Pillar 7 landing and marketplace.',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=600&fit=crop',
    cta: 'Reserve Banner'
  },
  {
    id: 'heritage_speaker_spotlight',
    label: 'Featured Keepers Spotlight',
    fallbackPrice: '$220/week',
    description: 'Feature recognized Elders and verified keepers in profile spotlight modules.',
    image: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=1200&h=600&fit=crop',
    cta: 'Book Spotlight'
  },
  {
    id: 'heritage_sponsored_card',
    label: 'Sponsored Listings Injection',
    fallbackPrice: '$150/week',
    description: 'Injected sponsored cards inside listing discovery feed.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&h=600&fit=crop',
    cta: 'Sponsor Card'
  },
  {
    id: 'heritage_category_boost',
    label: 'Trending Strip Placement',
    fallbackPrice: '$90/week',
    description: 'Boost visibility in trending rows and discovery strips.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=600&fit=crop',
    cta: 'Boost Category'
  },
  {
    id: 'heritage_newsletter_feature',
    label: 'Sticky Announcement Banner',
    fallbackPrice: '$300/send',
    description: 'Top sticky banner slot for platform-wide announcements in Pillar 7.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop',
    cta: 'Book Sticky Slot'
  },
  {
    id: 'heritage_institution_partner',
    label: 'Live Sessions Rail Sponsor',
    fallbackPrice: '$180/week',
    description: 'Sponsor the live sessions and bundle lane modules.',
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&h=600&fit=crop',
    cta: 'Join Partners'
  },
  {
    id: 'heritage_seasonal_takeover',
    label: 'Territory Map Takeover',
    fallbackPrice: '$240/week',
    description: 'Premium placement over territory visibility / map storytelling section.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=600&fit=crop',
    cta: 'Book Takeover'
  }
];

export function getHeritagePremiumPlacement(id: string) {
  return HERITAGE_PREMIUM_PLACEMENTS.find((placement) => placement.id === id) || null;
}
