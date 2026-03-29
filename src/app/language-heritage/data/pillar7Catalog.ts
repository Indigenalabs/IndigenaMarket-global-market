export type HeritageAccessLevel = 'public' | 'community' | 'restricted' | 'elder-approved';

export type Pillar7Category = {
  id: string;
  name: string;
  iconEmoji: string;
  description: string;
  accessLevel: HeritageAccessLevel;
  priceRange: { min: number; max: number; unit: string };
  tags: string[];
};

export const PILLAR7_CATEGORIES: Pillar7Category[] = [
  {
    id: 'language-learning-materials',
    name: 'Language Learning Materials',
    iconEmoji: '??',
    description: 'Primers, dictionaries, phrasebooks, grammar, workbooks, and flashcard sets.',
    accessLevel: 'public',
    priceRange: { min: 10, max: 200, unit: 'per item' },
    tags: ['primers', 'dictionaries', 'phrasebooks', 'grammar']
  },
  {
    id: 'audio-video-resources',
    name: 'Audio & Video Language Resources',
    iconEmoji: '???',
    description: 'Audio lessons, storytelling, pronunciation guides, and immersion recordings.',
    accessLevel: 'community',
    priceRange: { min: 5, max: 150, unit: 'per resource' },
    tags: ['audio', 'video', 'storytelling', 'pronunciation']
  },
  {
    id: 'digital-tools-apps',
    name: 'Digital Language Tools & Apps',
    iconEmoji: '??',
    description: 'Language apps, games, dictionary tools, and interactive learning experiences.',
    accessLevel: 'public',
    priceRange: { min: 0, max: 100, unit: 'per user' },
    tags: ['apps', 'games', 'dictionary', 'ar']
  },
  {
    id: 'oral-history-storytelling',
    name: 'Oral History & Storytelling',
    iconEmoji: '???',
    description: 'Elder interviews, family histories, place-name narratives, and seasonal stories.',
    accessLevel: 'community',
    priceRange: { min: 10, max: 1000, unit: 'per collection' },
    tags: ['elder', 'oral history', 'family', 'place names']
  },
  {
    id: 'music-language-preservation',
    name: 'Music for Language Preservation',
    iconEmoji: '??',
    description: 'Traditional songs, chants, language-learning tracks, and lyric resources.',
    accessLevel: 'restricted',
    priceRange: { min: 5, max: 150, unit: 'per release' },
    tags: ['songs', 'chants', 'lyrics', 'music videos']
  },
  {
    id: 'written-literature',
    name: 'Written Literature & Publications',
    iconEmoji: '??',
    description: 'Children books, poetry, journals, historical texts, and community publications.',
    accessLevel: 'public',
    priceRange: { min: 5, max: 150, unit: 'per publication' },
    tags: ['books', 'poetry', 'journals', 'historical docs']
  },
  {
    id: 'curriculum-education',
    name: 'Curriculum & Educational Materials',
    iconEmoji: '??',
    description: 'School units, teacher guides, assessments, and language nest resources.',
    accessLevel: 'community',
    priceRange: { min: 50, max: 2000, unit: 'per unit' },
    tags: ['curriculum', 'teacher guides', 'assessment', 'school']
  },
  {
    id: 'archive-preservation-services',
    name: 'Archive & Digital Preservation Services',
    iconEmoji: '???',
    description: 'Digitization, metadata creation, transcription, translation, and archive setup.',
    accessLevel: 'community',
    priceRange: { min: 20, max: 50000, unit: 'per service' },
    tags: ['digitization', 'metadata', 'transcription', 'translation']
  },
  {
    id: 'training-capacity',
    name: 'Training & Capacity Building',
    iconEmoji: '??',
    description: 'Language teacher training, documentation workshops, and archive management.',
    accessLevel: 'public',
    priceRange: { min: 200, max: 3000, unit: 'per training' },
    tags: ['training', 'teacher', 'workshop', 'capacity']
  },
  {
    id: 'community-immersion',
    name: 'Community Immersion Experiences',
    iconEmoji: '???',
    description: 'Language camps, elder-led circles, intensive weeks, and family retreats.',
    accessLevel: 'community',
    priceRange: { min: 50, max: 3000, unit: 'per experience' },
    tags: ['immersion', 'camp', 'conversation circles', 'retreat']
  },
  {
    id: 'sacred-protocol-materials',
    name: 'Sacred & Protocol-Controlled Materials',
    iconEmoji: '??',
    description: 'Ceremonial language and sacred stories with elder-approved access controls.',
    accessLevel: 'elder-approved',
    priceRange: { min: 0, max: 0, unit: 'by arrangement' },
    tags: ['sacred', 'ceremonial', 'restricted', 'protocol']
  },
  {
    id: 'research-academic-services',
    name: 'Research & Academic Services',
    iconEmoji: '??',
    description: 'Linguistic consulting, peer review, guest lecturing, and ethical permitting.',
    accessLevel: 'public',
    priceRange: { min: 200, max: 50000, unit: 'per project' },
    tags: ['research', 'consulting', 'peer review', 'academic']
  },
  {
    id: 'knowledge-systems',
    name: 'Indigenous Knowledge Systems',
    iconEmoji: '??',
    description: 'Traditional ecological, medicinal, climate, and astronomical language resources.',
    accessLevel: 'community',
    priceRange: { min: 50, max: 500, unit: 'per resource' },
    tags: ['tek', 'medicinal', 'astronomy', 'climate']
  },
  {
    id: 'heritage-sites-land-knowledge',
    name: 'Cultural Heritage Sites & Land-Based Knowledge',
    iconEmoji: '???',
    description: 'Place-name documentation, site interpretation, mapping, and management plans.',
    accessLevel: 'community',
    priceRange: { min: 100, max: 50000, unit: 'per project' },
    tags: ['place names', 'mapping', 'site recording', 'land-based']
  },
  {
    id: 'repatriation-restitution',
    name: 'Repatriation & Cultural Restitution',
    iconEmoji: '??',
    description: 'Provenance research, protocol development, negotiation support, and digital return.',
    accessLevel: 'community',
    priceRange: { min: 500, max: 50000, unit: 'per service' },
    tags: ['repatriation', 'provenance', 'negotiation', 'protocol']
  },
  {
    id: 'folklore-oral-traditions',
    name: 'Folklore & Oral Traditions',
    iconEmoji: '??',
    description: 'Folktales, proverbs, ballads, game songs, and humorous tales.',
    accessLevel: 'public',
    priceRange: { min: 10, max: 150, unit: 'per collection' },
    tags: ['folktales', 'proverbs', 'ballads', 'lullabies']
  },
  {
    id: 'language-technology',
    name: 'Language Technology & Tools',
    iconEmoji: '??',
    description: 'Keyboard layouts, fonts, spellcheckers, text-to-speech, and corpus development.',
    accessLevel: 'public',
    priceRange: { min: 0, max: 500000, unit: 'per product' },
    tags: ['keyboard', 'font', 'speech', 'corpus']
  },
  {
    id: 'consulting-professional-services',
    name: 'Consulting & Professional Services',
    iconEmoji: '??',
    description: 'Policy advisory, ICIP rights, cultural protocols, and strategic planning services.',
    accessLevel: 'public',
    priceRange: { min: 100, max: 50000, unit: 'per engagement' },
    tags: ['icip', 'policy', 'impact assessment', 'strategy']
  }
];

export const PILLAR7_CATEGORY_MAP = Object.fromEntries(PILLAR7_CATEGORIES.map((category) => [category.id, category]));

export function getPillar7CategoryIdFromLabel(label: string): string | null {
  const value = label.trim().toLowerCase();
  for (const category of PILLAR7_CATEGORIES) {
    if (category.id === value) return category.id;
    if (category.name.toLowerCase() === value) return category.id;
  }
  return null;
}

export function matchesPillar7Category(searchable: string, categoryId: string): boolean {
  if (!categoryId || categoryId === 'all') return true;
  const category = PILLAR7_CATEGORY_MAP[categoryId];
  if (!category) return false;
  const normalized = searchable.toLowerCase();
  if (normalized.includes(category.name.toLowerCase())) return true;
  return category.tags.some((tag) => normalized.includes(tag.toLowerCase()));
}
