import { MATERIALS_TOOLS_PREMIUM_PLACEMENTS } from '@/app/materials-tools/data/pillar10Data';

export const MATERIALS_TOOLS_PLACEMENTS = MATERIALS_TOOLS_PREMIUM_PLACEMENTS.map((slot, index) => ({
  ...slot,
  image: [
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&h=900&fit=crop'
  ][index],
  headline: [
    'Workshop season ordering is open',
    'Source verified studio inputs',
    'Own the supplier spotlight',
    'Appear in trending materials',
    'Inject a sponsored listing',
    'Promote your rental network',
    'Lead the next bulk order run'
  ][index],
  copy: [
    'Sticky callout for new harvest windows, supplier launches, and cooperative buying deadlines.',
    'Hero campaign for a supplier, toolkit drop, or category launch with full-screen storytelling.',
    'Place a trusted supplier at the top of discovery where makers compare fulfillment quality.',
    'Join the fast-moving strip for sought-after materials, studio kits, and restock alerts.',
    'Get placed in the live marketplace feed beside verified products and rentals.',
    'Push tool libraries and rental programs to artists before they commit to purchases.',
    'Feature group-buying momentum and convert artist demand into committed order volume.'
  ][index]
}));

