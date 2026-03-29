export type DigitalArtist = {
  id: string;
  name: string;
  nation: string;
  specialty: string;
  followers: number;
  totalSales: string;
  avatar: string;
  cover: string;
  verified: boolean;
  rank: number;
  bio: string;
};

export type DigitalArtwork = {
  id: string;
  title: string;
  artistId: string;
  artist: string;
  nation: string;
  category: 'digital-paintings' | 'photography' | '3d-art' | 'animation-motion-graphics';
  style: string;
  price: number;
  likes: number;
  views: number;
  image: string;
  mediaType: string;
  edition: string;
  auction: boolean;
  description: string;
};

export type DigitalCollection = {
  id: string;
  title: string;
  curator: string;
  artistIds: string[];
  cover: string;
  itemCount: number;
  floorPrice: number;
  volume24h: number;
  description: string;
};

export const categoryMeta: Record<DigitalArtwork['category'], { label: string; description: string; cover: string; accent: string }> = {
  'digital-paintings': {
    label: 'Digital Paintings',
    description: 'Brushwork, symbolism, and sacred visual storytelling in digital form.',
    cover: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&h=900&fit=crop',
    accent: '#d4af37'
  },
  photography: {
    label: 'Photography',
    description: 'Land, ceremony, and contemporary Indigenous life captured through powerful imagery.',
    cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=900&fit=crop',
    accent: '#f97316'
  },
  '3d-art': {
    label: '3D Art',
    description: 'Immersive sculptures, digital totems, and metaverse-ready artifacts.',
    cover: 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=1600&h=900&fit=crop',
    accent: '#22c55e'
  },
  'animation-motion-graphics': {
    label: 'Animation & Motion Graphics',
    description: 'Animated cosmologies, kinetic patterns, and ceremonial motion design.',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&h=900&fit=crop',
    accent: '#60a5fa'
  }
};

export const artists: DigitalArtist[] = [
  {
    id: 'ar-1',
    name: 'Aiyana Redbird',
    nation: 'Lakota',
    specialty: 'Spiritual Digital Paintings',
    followers: 18400,
    totalSales: '$428k',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop',
    cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&h=900&fit=crop',
    verified: true,
    rank: 1,
    bio: 'Transforms ceremonial symbols and oral teachings into contemporary digital canvases.'
  },
  {
    id: 'ar-2',
    name: 'Nodin Skywalker',
    nation: 'Anishinaabe',
    specialty: 'AI-Assisted Formline',
    followers: 13900,
    totalSales: '$315k',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&h=900&fit=crop',
    verified: true,
    rank: 2,
    bio: 'Blends ancestral geometry with generative pipelines for cultural-safe digital originals.'
  },
  {
    id: 'ar-3',
    name: 'Mika Cloud',
    nation: 'Navajo',
    specialty: 'Landscape Photography',
    followers: 9800,
    totalSales: '$190k',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
    cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=900&fit=crop',
    verified: false,
    rank: 3,
    bio: 'Captures on-country moments and seasonal transitions through cinematic photography.'
  },
  {
    id: 'ar-4',
    name: 'Tala Stone',
    nation: 'Haida',
    specialty: '3D Totemic Worlds',
    followers: 12100,
    totalSales: '$272k',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=500&fit=crop',
    cover: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1600&h=900&fit=crop',
    verified: true,
    rank: 4,
    bio: 'Builds interactive 3D cultural environments and collectible digital sculptures.'
  },
  {
    id: 'ar-5',
    name: 'Keira Flame',
    nation: 'Maori',
    specialty: 'Animation & Motion',
    followers: 11000,
    totalSales: '$248k',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop',
    cover: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1600&h=900&fit=crop',
    verified: true,
    rank: 5,
    bio: 'Designs kinetic narratives centered on language, rhythm, and intergenerational memory.'
  },
  {
    id: 'ar-6',
    name: 'Jonas Snow',
    nation: 'Inuit',
    specialty: 'Arctic Photo Essays',
    followers: 8700,
    totalSales: '$156k',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&h=900&fit=crop',
    verified: false,
    rank: 6,
    bio: 'Documents climate, kinship, and resilience through high-contrast visual storytelling.'
  }
];

export const artworks: DigitalArtwork[] = [
  {
    id: 'aw-101',
    title: 'Buffalo Sky Ceremony',
    artistId: 'ar-1',
    artist: 'Aiyana Redbird',
    nation: 'Lakota',
    category: 'digital-paintings',
    style: 'Spiritual Surrealism',
    price: 320,
    likes: 1420,
    views: 12340,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=900&fit=crop',
    mediaType: 'PNG + layered source',
    edition: '1 of 1',
    auction: true,
    description: 'A layered ceremonial visual narrative representing buffalo spirit guidance.'
  },
  {
    id: 'aw-102',
    title: 'Morning Star Glyphs',
    artistId: 'ar-2',
    artist: 'Nodin Skywalker',
    nation: 'Anishinaabe',
    category: 'digital-paintings',
    style: 'Generative Geometry',
    price: 210,
    likes: 990,
    views: 8540,
    image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200&h=900&fit=crop',
    mediaType: 'SVG + MP4 render',
    edition: '1 of 8',
    auction: false,
    description: 'Encoded star stories translated into dynamic geometric glyph compositions.'
  },
  {
    id: 'aw-103',
    title: 'Desert Breath (Photo Series)',
    artistId: 'ar-3',
    artist: 'Mika Cloud',
    nation: 'Navajo',
    category: 'photography',
    style: 'Cinematic Documentary',
    price: 95,
    likes: 740,
    views: 6700,
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=900&fit=crop',
    mediaType: 'JPG Print + Digital',
    edition: 'Open',
    auction: false,
    description: 'A photographic meditation on land light, wind, and family routes.'
  },
  {
    id: 'aw-104',
    title: 'Ice Memory',
    artistId: 'ar-6',
    artist: 'Jonas Snow',
    nation: 'Inuit',
    category: 'photography',
    style: 'Arctic Portraiture',
    price: 140,
    likes: 610,
    views: 5100,
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=900&fit=crop',
    mediaType: 'JPG + Story captions',
    edition: '1 of 25',
    auction: false,
    description: 'Portrait-led photo essay exploring winter memory and migration routes.'
  },
  {
    id: 'aw-105',
    title: 'Totem City XR',
    artistId: 'ar-4',
    artist: 'Tala Stone',
    nation: 'Haida',
    category: '3d-art',
    style: 'Immersive Sculptural',
    price: 540,
    likes: 1330,
    views: 11020,
    image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=1200&h=900&fit=crop',
    mediaType: 'GLB + Unreal scene',
    edition: '1 of 3',
    auction: true,
    description: 'A virtual city of contemporary totems with guided cultural context layers.'
  },
  {
    id: 'aw-106',
    title: 'Firekeeper Mesh',
    artistId: 'ar-4',
    artist: 'Tala Stone',
    nation: 'Haida',
    category: '3d-art',
    style: 'Digital Sculpture',
    price: 420,
    likes: 870,
    views: 7200,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=900&fit=crop',
    mediaType: 'OBJ + texture pack',
    edition: '1 of 5',
    auction: false,
    description: '3D ceremonial figure with emissive beadwork animation loops.'
  },
  {
    id: 'aw-107',
    title: 'River Song Motion Set',
    artistId: 'ar-5',
    artist: 'Keira Flame',
    nation: 'Maori',
    category: 'animation-motion-graphics',
    style: 'Kinetic Storytelling',
    price: 260,
    likes: 1010,
    views: 9300,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=900&fit=crop',
    mediaType: '4K MP4 + After Effects',
    edition: '1 of 10',
    auction: false,
    description: 'Animated river narratives designed for installations and stage visuals.'
  },
  {
    id: 'aw-108',
    title: 'Ancestor Pulse',
    artistId: 'ar-2',
    artist: 'Nodin Skywalker',
    nation: 'Anishinaabe',
    category: 'animation-motion-graphics',
    style: 'Audio-Reactive Graphics',
    price: 300,
    likes: 1180,
    views: 10400,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=900&fit=crop',
    mediaType: 'Looping MP4 + JSON',
    edition: '1 of 6',
    auction: true,
    description: 'Audio-reactive cosmology loops designed for live performance backdrops.'
  }
];

export const collections: DigitalCollection[] = [
  {
    id: 'col-1',
    title: 'Sacred Futures Vol. 1',
    curator: 'Indigena Curatorial Board',
    artistIds: ['ar-1', 'ar-2', 'ar-4'],
    cover: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1600&h=900&fit=crop',
    itemCount: 24,
    floorPrice: 120,
    volume24h: 84.2,
    description: 'Premier collection spotlighting artists blending ancestral motifs with future-facing mediums.'
  },
  {
    id: 'col-2',
    title: 'Lens of Country',
    curator: 'Mika Cloud',
    artistIds: ['ar-3', 'ar-6'],
    cover: 'https://images.unsplash.com/photo-1493244040629-496f6d136cc3?w=1600&h=900&fit=crop',
    itemCount: 18,
    floorPrice: 60,
    volume24h: 29.4,
    description: 'Photography-driven collection focused on place, memory, and intergenerational continuity.'
  },
  {
    id: 'col-3',
    title: 'Motion of Memory',
    curator: 'Keira Flame',
    artistIds: ['ar-5', 'ar-2'],
    cover: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1600&h=900&fit=crop',
    itemCount: 14,
    floorPrice: 95,
    volume24h: 41.8,
    description: 'Animated works and motion studies built for galleries, events, and immersive domes.'
  }
];

export function getArtistById(id: string) {
  return artists.find((artist) => artist.id === id) || artists[0];
}

export function getArtworkById(id: string) {
  return artworks.find((artwork) => artwork.id === id) || artworks[0];
}

export function getCollectionById(id: string) {
  return collections.find((collection) => collection.id === id) || collections[0];
}

export function getArtworksByCategory(category: DigitalArtwork['category']) {
  return artworks.filter((artwork) => artwork.category === category);
}

export function getArtworksByArtist(artistId: string) {
  return artworks.filter((artwork) => artwork.artistId === artistId);
}

