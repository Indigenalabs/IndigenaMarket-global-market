export type DigitalArtCategory = {
  id: string;
  label: string;
  icon: string;
};

export const DIGITAL_ART_CATEGORIES: DigitalArtCategory[] = [
  { id: 'all', label: 'All', icon: '🌍' },
  { id: 'digital_painting', label: 'Digital Painting', icon: '🎨' },
  { id: '3d_modeling', label: '3D Modeling', icon: '🗿' },
  { id: 'animation', label: 'Animation', icon: '🎬' },
  { id: 'film_video', label: 'Film & Video', icon: '🎥' },
  { id: 'photography', label: 'Photography', icon: '📷' },
  { id: 'game_design', label: 'Game Design', icon: '🎮' },
  { id: 'vr_ar', label: 'VR / AR', icon: '🥽' },
  { id: 'digital_fashion', label: 'Digital Fashion', icon: '👗' },
  { id: 'music_audio', label: 'Music & Audio', icon: '🎵' },
  { id: 'nft_blockchain', label: 'NFT & Blockchain', icon: '⛓️' },
  { id: 'ai_generative', label: 'AI & Generative', icon: '🤖' }
];

export const DIGITAL_ART_CATEGORY_MEDIUM_MAP: Record<string, string[]> = {
  digital_painting: ['Digital Painting', 'Illustration', 'Vector Art', 'Digital Collage'],
  '3d_modeling': ['3D Render', '3D Sculpture'],
  animation: ['Motion Graphics', 'Animation'],
  film_video: ['Animation', 'Motion Graphics'],
  photography: ['Photography'],
  ai_generative: ['Generative Art'],
  digital_fashion: ['Digital Fashion'],
  vr_ar: ['VR/AR'],
  nft_blockchain: ['Generative Art', 'Digital Painting'],
  music_audio: ['Digital Collage'],
  game_design: ['3D Render', 'Digital Painting']
};


