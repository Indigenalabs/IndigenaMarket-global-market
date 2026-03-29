export type PhysicalMarketplaceCategory = {
  id: string;
  label: string;
  icon: string;
  itemTypes: string[];
};

export const PHYSICAL_MARKETPLACE_CATEGORIES: PhysicalMarketplaceCategory[] = [
  { id: 'all', label: 'All Items', icon: '🪶', itemTypes: [] },
  { id: 'carving_sculpture', label: 'Carving & Sculpture', icon: '🪵', itemTypes: ['carving'] },
  { id: 'pottery_ceramics', label: 'Pottery & Ceramics', icon: '🏺', itemTypes: ['pottery'] },
  { id: 'textiles_weaving', label: 'Textiles & Weaving', icon: '🧵', itemTypes: ['textiles', 'weaving'] },
  { id: 'jewelry', label: 'Jewelry', icon: '📿', itemTypes: ['jewelry'] },
  { id: 'basketry', label: 'Basketry', icon: '🧺', itemTypes: ['weaving'] },
  { id: 'leatherwork', label: 'Leatherwork', icon: '🦬', itemTypes: ['textiles'] },
  { id: 'featherwork', label: 'Featherwork', icon: '🪶', itemTypes: ['regalia'] },
  { id: 'beadwork_embroidery', label: 'Beadwork & Embroidery', icon: '📿', itemTypes: ['beadwork', 'textiles'] },
  { id: 'masks_regalia', label: 'Masks & Regalia', icon: '🎭', itemTypes: ['regalia'] },
  { id: 'musical_instruments', label: 'Musical Instruments', icon: '🥁', itemTypes: [] },
  { id: 'painting_surfaces', label: 'Painting on Surface', icon: '🎨', itemTypes: [] },
  { id: 'quillwork', label: 'Quillwork', icon: '🪶', itemTypes: ['beadwork'] },
  { id: 'ceremonial_sacred', label: 'Ceremonial & Sacred', icon: '🔥', itemTypes: ['regalia'] },
  { id: 'tools_utensils', label: 'Tools & Utensils', icon: '🪓', itemTypes: ['carving', 'pottery'] },
  { id: 'contemporary_fusion', label: 'Contemporary Fusion', icon: '🌿', itemTypes: ['textiles', 'carving', 'jewelry'] }
];

export function getPhysicalCategoryIdFromLabel(label: string): string {
  if (label === 'All Categories') return 'all';
  const found = PHYSICAL_MARKETPLACE_CATEGORIES.find((category) => category.label === label);
  return found?.id ?? 'all';
}

export function matchesPhysicalCategory(itemCategory: string, activeCategoryId: string): boolean {
  if (activeCategoryId === 'all') return true;
  const category = PHYSICAL_MARKETPLACE_CATEGORIES.find((entry) => entry.id === activeCategoryId);
  if (!category) return false;
  if (category.itemTypes.length === 0) return false;
  return category.itemTypes.includes(itemCategory);
}

export function countItemsForPhysicalCategory(items: Array<{ category: string }>, activeCategoryId: string): number {
  if (activeCategoryId === 'all') return items.length;
  return items.filter((item) => matchesPhysicalCategory(item.category, activeCategoryId)).length;
}



