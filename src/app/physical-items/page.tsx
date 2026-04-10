'use client';

import type { ReactNode } from 'react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Grid3X3, List, Heart, Eye, MapPin, CheckCircle,
  Filter, ChevronDown, Package, Star, ShoppingCart,
  X, Sparkles, ArrowLeft, Search, SlidersHorizontal, Plus,
} from 'lucide-react';
import ItemDetailModal, { PhysicalItem } from '../components/marketplace/physical-items/ItemDetailModal';
import CartDrawer, { CartEntry } from '../components/marketplace/physical-items/CartDrawer';
import SavedItems from '../components/marketplace/physical-items/SavedItems';
import ARTryOnBadge from '../components/marketplace/physical-items/ARTryOnBadge';
import StoryCardPreview from '../components/marketplace/physical-items/StoryCardPreview';
import { useRecentlyViewed } from '../components/marketplace/physical-items/RecentlyViewed';
import TrendingItems from '../components/marketplace/physical-items/TrendingItems';
import PhysicalWallet from '../components/marketplace/physical-items/PhysicalWallet';
import PhysicalSocialFeatures from '../components/marketplace/physical-items/PhysicalSocialFeatures';
import PhysicalActivityFeed from '../components/marketplace/physical-items/PhysicalActivityFeed';
import PhysicalTransactionHistory from '../components/marketplace/physical-items/PhysicalTransactionHistory';
import PhysicalLimitedDrops from '../components/marketplace/physical-items/PhysicalLimitedDrops';
import PhysicalFavoritesWatchlist from '../components/marketplace/physical-items/PhysicalFavoritesWatchlist';
import MakerCollectionManager from '../components/marketplace/physical-items/MakerCollectionManager';
import PhysicalAuctionSystem from '../components/marketplace/physical-items/PhysicalAuctionSystem';
import CommunityMarketplaceCard from '@/app/components/community/CommunityMarketplaceCard';
import CommunityMarketplaceRail from '@/app/components/community/CommunityMarketplaceRail';
import { fetchCommunityMarketplaceOffers } from '@/app/lib/communityMarketplaceApi';
import type { CommunityMarketplaceOffer } from '@/app/lib/communityMarketplace';
import { PHYSICAL_MARKETPLACE_CATEGORIES, matchesPhysicalCategory, countItemsForPhysicalCategory, getPhysicalCategoryIdFromLabel } from '@/app/physical-items/data/pillar2Catalog';

// â”€â”€â”€ Mock data (same as PhysicalItemsMarketplace) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ALL_ITEMS: PhysicalItem[] = [
  {
    id: '1',
    title: 'Hand-Beaded Medicine Bag',
    maker: 'Maria Redfeather',
    makerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    price: 185,
    currency: 'INDI',
    images: [
      'https://images.unsplash.com/photo-1605218427368-35b0f996d2e6?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1601823984263-b87b5972c2c1?w=600&h=600&fit=crop',
    ],
    nation: 'Navajo',
    category: 'beadwork',
    material: 'Glass beads, deer hide',
    dimensions: '12cm Ã— 8cm',
    weight: '85g',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 4,
    hubName: 'Phoenix',
    hubCity: 'Phoenix, AZ',
    hubOnline: true,
    shipsInternational: true,
    likes: 234,
    views: 1890,
    hasARPreview: true,
    isSacred: false,
    storyQuote: 'Each bead is a prayer. I learned this pattern from my grandmother at age seven.',
    storyFull: 'This medicine bag has been crafted using a traditional pattern passed down through five generations of Navajo women in my family.',
    elderEndorsement: 'Maria carries the knowledge of our grandmothers with great care and respect.',
    certificationNumber: 'NAV-2024-BW-0042',
    xrplTxId: 'A7F3B2C1D9E8F0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7',
    ipfsHash: 'QmX7K9mR3nH2pL8vW4jY6tB1sF5oE3dC0gA9iN8uT2qP7zM',
    rating: 4.9,
    reviewCount: 47,
  },
  {
    id: '2',
    title: 'Pueblo Pottery Vessel',
    maker: 'DesertRose Pottery',
    makerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    price: 320,
    currency: 'INDI',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1610701596061-2f18b7c52075?w=600&h=600&fit=crop',
    ],
    nation: 'Hopi',
    category: 'pottery',
    material: 'Native clay, natural pigments',
    dimensions: '22cm Ã— 18cm',
    weight: '620g',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 2,
    hubName: 'Albuquerque',
    hubCity: 'Albuquerque, NM',
    hubOnline: true,
    shipsInternational: true,
    likes: 189,
    views: 1423,
    hasARPreview: true,
    isSacred: false,
    storyQuote: 'The clay speaks to me. I only take what the earth offers freely.',
    storyFull: 'Fired using traditional outdoor firing techniques, this vessel carries the smoke and spirit of the earth.',
    certificationNumber: 'HOP-2024-PT-0018',
    xrplTxId: 'B8G4C3D2E1F9A0B1C2D3E4F5G6A7B8C9D0E1F2A3B4C5D7',
    ipfsHash: 'QmY8L0nS4oI3qM9wX5kZ7uC2tG6pF4eD1hB0jO9vU3rQ8aN',
    rating: 4.8,
    reviewCount: 31,
  },
  {
    id: '3',
    title: 'Navajo Two-Grey-Hills Rug',
    maker: 'WeavingWoman',
    makerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    price: 650,
    currency: 'INDI',
    images: [
      'https://images.unsplash.com/photo-1605218427368-35b0f996d2e6?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop',
    ],
    nation: 'Navajo',
    category: 'weaving',
    material: 'Churro wool, natural dyes',
    dimensions: '120cm Ã— 80cm',
    weight: '1.4kg',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 1,
    hubName: 'Phoenix',
    hubCity: 'Phoenix, AZ',
    hubOnline: true,
    shipsInternational: true,
    likes: 412,
    views: 3201,
    hasARPreview: true,
    isSacred: false,
    storyQuote: 'A rug takes months. The warp is the world, the weft is the story.',
    storyFull: 'The Two-Grey-Hills style originates from the northeastern corner of the Navajo Nation.',
    elderEndorsement: 'Her weaving is precise and carries the old knowledge.',
    certificationNumber: 'NAV-2024-WV-0009',
    xrplTxId: 'C9H5D4E3F2G1A0B1C2D3E4F5H6A7B8C9D0E1F2A3B4C5E8',
    ipfsHash: 'QmZ9M1oT5pJ4rN0xY6lA8vD3uH7qG5fE2iC1kP0wV4sR9bO',
    rating: 5.0,
    reviewCount: 89,
  },
  {
    id: '4',
    title: 'Sterling Silver Thunderbird Pendant',
    maker: 'SilverPath Studio',
    makerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    price: 145,
    currency: 'INDI',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1601823984263-b87b5972c2c1?w=600&h=600&fit=crop',
    ],
    nation: 'Coast Salish',
    category: 'jewelry',
    material: 'Sterling silver, turquoise',
    dimensions: '4cm Ã— 3.5cm',
    weight: '12g',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 7,
    hubName: 'Seattle',
    hubCity: 'Seattle, WA',
    hubOnline: true,
    shipsInternational: true,
    likes: 156,
    views: 2100,
    hasARPreview: true,
    isSacred: false,
    storyQuote: 'The Thunderbird protects. I carve its form so it may carry that protection forward.',
    storyFull: 'Forged from 925 sterling silver using traditional lost-wax casting.',
    certificationNumber: 'CS-2024-JW-0071',
    xrplTxId: 'D0I6E5F4G3H2B1C2D3E4F5I6A7B8C9D0E1F2A3B4C5F9',
    ipfsHash: 'QmA0N2pU6qK5sO1yZ7mB9wE4vI8rH6gF3jD2lQ1xW5tS0cP',
    rating: 4.7,
    reviewCount: 62,
  },
  {
    id: '5',
    title: 'Regalia Dance Fan (Pow-Wow)',
    maker: 'EagleFeather Works',
    makerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    price: 420,
    currency: 'INDI',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
    ],
    nation: 'Lakota',
    category: 'regalia',
    material: 'Eagle feathers (molted), beadwork, deer hide handle',
    dimensions: '55cm spread',
    weight: '220g',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 1,
    hubName: 'Denver',
    hubCity: 'Denver, CO',
    hubOnline: true,
    shipsInternational: false,
    likes: 89,
    views: 740,
    hasARPreview: false,
    isSacred: true,
    storyQuote: 'Made from molted feathers gifted to me by the eagles themselves. Nothing was taken.',
    storyFull: 'This pow-wow dance fan is crafted entirely from naturally molted eagle feathers.',
    elderEndorsement: 'These feathers were gathered with prayer and permission.',
    certificationNumber: 'LAK-2024-RG-0003',
    xrplTxId: 'E1J7F6G5H4I3C2D3E4F5J6A7B8C9D0E1F2A3B4C5G0',
    ipfsHash: 'QmB1O3qV7rL6tP2zA8nC0xF5wJ9sI7hG4kE3mR2yX6uT1dQ',
    rating: 5.0,
    reviewCount: 14,
  },
  {
    id: '6',
    title: 'Red Cedar Spirit Carving',
    maker: 'James Thundercloud',
    makerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    price: 890,
    currency: 'INDI',
    images: [
      'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1610701596061-2f18b7c52075?w=600&h=600&fit=crop',
    ],
    nation: 'Haudenosaunee',
    category: 'carving',
    material: 'Western red cedar, natural oils',
    dimensions: '45cm Ã— 12cm Ã— 10cm',
    weight: '1.1kg',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 1,
    hubName: 'Vancouver',
    hubCity: 'Vancouver, BC',
    hubOnline: true,
    shipsInternational: true,
    likes: 278,
    views: 2670,
    hasARPreview: true,
    isSacred: false,
    storyQuote: 'The figure was already inside the wood. I only removed what was not needed.',
    storyFull: 'Carved from a single piece of old-growth Western red cedar salvaged from a downed tree.',
    certificationNumber: 'HAU-2024-CV-0015',
    xrplTxId: 'F2K8G7H6I5J4D3E4F5K6A7B8C9D0E1F2A3B4C5H1',
    ipfsHash: 'QmC2P4rW8sM7uQ3aB9oD1yG6xK0tJ8iH5lF4nS3zY7vU2eR',
    rating: 4.9,
    reviewCount: 28,
  },
  {
    id: '7',
    title: 'Metis Floral Beaded Moccasins',
    maker: 'SilverBirch Crafts',
    makerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    price: 295,
    currency: 'INDI',
    images: [
      'https://images.unsplash.com/photo-1601823984263-b87b5972c2c1?w=600&h=600&fit=crop',
    ],
    nation: 'Metis',
    category: 'textiles',
    material: 'Moose hide, glass beads, wool lining',
    dimensions: 'UK 6 / EU 39',
    weight: '340g',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 1,
    hubName: 'Winnipeg',
    hubCity: 'Winnipeg, MB',
    hubOnline: true,
    shipsInternational: true,
    likes: 341,
    views: 2890,
    hasARPreview: false,
    isSacred: false,
    storyQuote: 'Metis floral beadwork is called the Flower Beadwork People tradition. It lives in every stitch.',
    storyFull: 'These moccasins are crafted from brain-tanned moose hide.',
    certificationNumber: 'MET-2024-TX-0033',
    xrplTxId: 'G3L9H8I7J6K5E4F5G6L7A8B9C0D1E2F3A4B5C6I2',
    ipfsHash: 'QmD3Q5sX9tN8vR4bC0pE2zH7yL1uK9jI6mG5oT4aZ8wV3fS',
    rating: 4.8,
    reviewCount: 55,
  },
  {
    id: '8',
    title: 'Inuit Soapstone Bear Sculpture',
    maker: 'CoastalWeaver',
    makerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    price: 540,
    currency: 'INDI',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop',
    ],
    nation: 'Inuit',
    category: 'carving',
    material: 'Arctic soapstone',
    dimensions: '18cm Ã— 11cm Ã— 9cm',
    weight: '980g',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 3,
    hubName: 'Vancouver',
    hubCity: 'Vancouver, BC',
    hubOnline: true,
    shipsInternational: true,
    likes: 198,
    views: 1560,
    hasARPreview: true,
    isSacred: false,
    storyQuote: 'Nanuk, the polar bear, is our brother. I carve him so we do not forget our kinship.',
    storyFull: 'Carved from Arctic soapstone quarried in Nunavut.',
    certificationNumber: 'INU-2024-CV-0027',
    xrplTxId: 'H4M0I9J8K7L6F5G6H7M8A9B0C1D2E3F4A5B6C7J3',
    ipfsHash: 'QmE4R6tY0uO9wS5cD1qF3aI8zM2vL0kJ7nH6pU5bA9xW4gT',
    rating: 4.9,
    reviewCount: 36,
  },
  // Extended items for the View All page
  {
    id: '9',
    title: 'Haida Bentwood Box',
    maker: 'Robert Tsimshian',
    makerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    price: 480,
    currency: 'INDI',
    images: ['https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=600&fit=crop'],
    nation: 'Haida',
    category: 'carving',
    material: 'Yellow cedar, natural pigment',
    dimensions: '30cm Ã— 20cm Ã— 20cm',
    weight: '900g',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 2,
    hubName: 'Vancouver',
    hubCity: 'Vancouver, BC',
    hubOnline: true,
    shipsInternational: true,
    likes: 310,
    views: 2100,
    hasARPreview: false,
    isSacred: false,
    storyQuote: 'Bent â€” not cut â€” from a single plank. The old way.',
    storyFull: 'Traditional Haida bentwood boxes are made by steaming a single plank of yellow cedar and bending three corners, stitching the fourth with spruce root.',
    certificationNumber: 'HAI-2024-CV-0008',
    xrplTxId: 'I5N1J0K9L8M7G6H7I8N9A0B1C2D3E4F5A6B7C8K4',
    ipfsHash: 'QmF5S7uZ1vP0xT6dE2rG4bJ9aM3wL1kK8oI7qV6cB0yX5hU',
    rating: 4.8,
    reviewCount: 22,
  },
  {
    id: '10',
    title: 'Anishinaabe Dream Catcher',
    maker: 'SkyWoman Crafts',
    makerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    price: 95,
    currency: 'INDI',
    images: ['https://images.unsplash.com/photo-1605218427368-35b0f996d2e6?w=600&h=600&fit=crop'],
    nation: 'Anishinaabe',
    category: 'beadwork',
    material: 'Willow hoop, sinew, feathers, beads',
    dimensions: '28cm diameter',
    weight: '110g',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 6,
    hubName: 'Winnipeg',
    hubCity: 'Winnipeg, MB',
    hubOnline: true,
    shipsInternational: true,
    likes: 502,
    views: 4200,
    hasARPreview: false,
    isSacred: false,
    storyQuote: 'The web catches bad dreams. Only good thoughts pass through.',
    storyFull: 'Hand-woven from willow harvested along the Red River, this dream catcher follows traditional Anishinaabe patterns.',
    certificationNumber: 'ANI-2024-BW-0055',
    xrplTxId: 'J6O2K1L0M9N8H7I8J9O0A1B2C3D4E5F6A7B8C9L5',
    ipfsHash: 'QmG6T8vA2wQ1yU7eF3sH5cK0bN4xM2lL9pJ8rW7dC1zA6iV',
    rating: 4.6,
    reviewCount: 73,
  },
  {
    id: '11',
    title: 'Cherokee Rivercane Basket',
    maker: 'RiverCane Studio',
    makerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    price: 230,
    currency: 'INDI',
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop'],
    nation: 'Cherokee',
    category: 'weaving',
    material: 'Rivercane, bloodroot dye',
    dimensions: '35cm Ã— 25cm',
    weight: '400g',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 3,
    hubName: 'Atlanta',
    hubCity: 'Atlanta, GA',
    hubOnline: true,
    shipsInternational: true,
    likes: 188,
    views: 1340,
    hasARPreview: false,
    isSacred: false,
    storyQuote: 'Rivercane baskets are nearly a lost art. I am bringing them back.',
    storyFull: 'Cherokee double-weave rivercane basketry is one of the most technically complex weaving traditions in North America.',
    certificationNumber: 'CHE-2024-WV-0022',
    xrplTxId: 'K7P3L2M1N0O9I8J9K0P1A2B3C4D5E6F7A8B9C0M6',
    ipfsHash: 'QmH7U9wB3xR2zA8fG4tI6dL1cO5yN3mM0qK9sX8eD2aB7jW',
    rating: 4.9,
    reviewCount: 19,
  },
  {
    id: '12',
    title: 'Blackfoot Buffalo Hide Parfleche',
    maker: 'NightSky Leatherworks',
    makerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    price: 375,
    currency: 'INDI',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop'],
    nation: 'Blackfoot',
    category: 'textiles',
    material: 'Buffalo rawhide, earth pigments',
    dimensions: '40cm Ã— 30cm folded',
    weight: '680g',
    isVerified: true,
    isHandmade: true,
    inStock: true,
    stockCount: 2,
    hubName: 'Calgary',
    hubCity: 'Calgary, AB',
    hubOnline: true,
    shipsInternational: true,
    likes: 145,
    views: 980,
    hasARPreview: false,
    isSacred: false,
    storyQuote: 'The buffalo gave everything. We honor that by using every part with care.',
    storyFull: 'A parfleche is a rawhide envelope used traditionally by Plains peoples to store dried food and personal belongings.',
    certificationNumber: 'BLK-2024-TX-0011',
    xrplTxId: 'L8Q4M3N2O1P0J9K0L1Q2A3B4C5D6E7F8A9B0C1N7',
    ipfsHash: 'QmI8V0xC4yS3aB9gH5uJ7eM2dP6zO4nN1rL0tY9fE3bC8kX',
    rating: 4.7,
    reviewCount: 11,
  },
];

const CATEGORIES = PHYSICAL_MARKETPLACE_CATEGORIES;

const NATIONS = ['All Nations', 'Navajo', 'Hopi', 'Coast Salish', 'Lakota', 'Haudenosaunee', 'Inuit', 'Haida', 'MÃ©tis', 'Anishinaabe', 'Cherokee', 'Blackfoot'];

const SPONSORED_ITEM = {
  id: 'sp-phys-1',
  title: 'Heritage Collection: Beadwork Starter Kit',
  creator: 'IndigenaCrafts Co.',
  price: 75,
  currency: 'INDI',
  image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop',
  badge: 'Sponsored',
  tag: 'Beadwork | Starter Kit',
  description: 'Everything you need to begin your beadwork journey â€” curated by Indigenous makers.',
};

const PAGE_SIZE = 6;

// â”€â”€â”€ Item Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ItemCard({
  item, viewMode, likedItems, toggleLike, onSelect, onSave,
}: {
  item: PhysicalItem;
  viewMode: 'grid' | 'list';
  likedItems: Set<string>;
  toggleLike: (id: string, e: React.MouseEvent) => void;
  onSelect: (item: PhysicalItem) => void;
  onSave: (item: PhysicalItem, e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={() => onSelect(item)}
      className={`group bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden hover:border-[#d4af37]/50 transition-all cursor-pointer ${viewMode === 'list' ? 'flex' : ''}`}
    >
      <div className={`relative overflow-hidden flex-shrink-0 ${viewMode === 'list' ? 'w-44' : 'aspect-square'}`}>
        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#141414] to-transparent opacity-40" />
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {item.isSacred && <span className="px-2 py-0.5 bg-[#DC143C]/90 text-white text-xs rounded-full">Sacred</span>}
          {item.isHandmade && <span className="px-2 py-0.5 bg-green-600/80 text-white text-xs rounded-full">Handmade</span>}
        </div>
        {item.hasARPreview && (
          <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
            <ARTryOnBadge
              itemTitle={item.title}
              itemImage={item.images[0]}
              mockupType={item.category === 'jewelry' ? 'neck' : item.category === 'weaving' ? 'wall' : 'hand'}
            />
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <button
            onClick={(e) => toggleLike(item.id, e)}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${likedItems.has(item.id) ? 'bg-[#DC143C]/80 text-white' : 'bg-black/50 text-white/70 hover:text-white'}`}
          >
            <Heart size={14} fill={likedItems.has(item.id) ? 'white' : 'none'} />
          </button>
        </div>
      </div>
      <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full">{item.nation}</span>
          <span className="text-gray-500 text-xs capitalize">{item.category}</span>
        </div>
        <h3 className="text-white font-semibold group-hover:text-[#d4af37] transition-colors mb-1 line-clamp-1">{item.title}</h3>
        <p className="text-gray-400 text-sm mb-2">by {item.maker}</p>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />
          <span className="text-white text-xs font-medium">{item.rating}</span>
          <span className="text-gray-500 text-xs">({item.reviewCount})</span>
        </div>
        {viewMode === 'list' && item.storyQuote && (
          <div className="mb-3">
            <StoryCardPreview
              makerName={item.maker}
              makerAvatar={item.makerAvatar}
              nation={item.nation}
              quote={item.storyQuote}
              isSacred={item.isSacred}
              onOpenStory={() => onSelect(item)}
            />
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><MapPin size={11} />{item.hubCity}</span>
          {item.inStock
            ? <span className="text-green-400">{item.stockCount} left</span>
            : <span className="text-[#DC143C]">Out of stock</span>}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xl font-bold text-[#d4af37]">{item.price}</span>
            <span className="text-[#d4af37] text-sm ml-1">INDI</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-gray-500 text-xs"><Eye size={12} />{item.views.toLocaleString()}</span>
            {item.isVerified && <CheckCircle size={14} className="text-[#d4af37]" />}
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(item); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37] text-black text-xs font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors"
            >
              <ShoppingCart size={13} />Buy
            </button>
            <button
              onClick={(e) => onSave(item, e)}
              title="Save item"
              className="flex items-center justify-center w-7 h-7 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <Heart size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Skeleton Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SkeletonCard({ viewMode }: { viewMode: 'grid' | 'list' }) {
  return (
    <div className={`bg-[#141414] rounded-xl border border-[#d4af37]/10 overflow-hidden animate-pulse ${viewMode === 'list' ? 'flex' : ''}`}>
      <div className={`bg-white/5 ${viewMode === 'list' ? 'w-44 flex-shrink-0' : 'aspect-square'}`} />
      <div className="p-4 flex-1 space-y-3">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-4 bg-white/5 rounded w-2/3" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-1/4" />
        <div className="flex justify-between mt-4">
          <div className="h-6 bg-white/5 rounded w-20" />
          <div className="h-7 bg-white/5 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Sponsored Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SponsoredCard() {
  return (
    <div className="col-span-full rounded-2xl overflow-hidden border border-[#d4af37]/30 relative flex min-h-[120px]">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-[#d4af37] text-black text-xs font-bold rounded-full shadow">
        <Sparkles size={11} />
        Sponsored
      </div>
      <div className="w-36 sm:w-44 flex-shrink-0 relative bg-[#0a0a0a]">
        <img src={SPONSORED_ITEM.image} alt={SPONSORED_ITEM.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141414]" />
      </div>
      <div className="flex-1 bg-[#141414] p-4 sm:p-5 flex flex-col justify-center min-w-0">
        <span className="text-[#d4af37] text-xs font-medium mb-1">{SPONSORED_ITEM.tag}</span>
        <h3 className="text-white text-base sm:text-lg font-bold mb-1 truncate">{SPONSORED_ITEM.title}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{SPONSORED_ITEM.description}</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="text-xl font-bold text-[#d4af37]">{SPONSORED_ITEM.price}</span>
            <span className="text-[#d4af37] text-sm ml-1">{SPONSORED_ITEM.currency}</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black text-sm font-semibold rounded-xl hover:bg-[#f4e4a6] transition-colors">
            <ShoppingCart size={14} />View Kit
          </button>
          <span className="text-gray-500 text-xs">by {SPONSORED_ITEM.creator}</span>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PhysicalItemsViewAll() {
  const [hasMounted, setHasMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [marketplaceFocus, setMarketplaceFocus] = useState<'shop' | 'drops' | 'auctions' | 'community' | 'tools'>('shop');
  const [sortBy, setSortBy] = useState('popular');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeNation, setActiveNation] = useState('All Nations');
  const [arOnly, setArOnly] = useState(false);
  const [shipsIntl, setShipsIntl] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [handmadeOnly, setHandmadeOnly] = useState(false);
  const [communityOnly, setCommunityOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [communityOffers, setCommunityOffers] = useState<CommunityMarketplaceOffer[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<PhysicalItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  // Cart state
  const [cartOpen, setCartOpen] = useState(false);
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
  const [savedEntries, setSavedEntries] = useState<{ item: PhysicalItem; savedAt: string; priceAtSave: number; notify: boolean }[]>([]);

  const { addItem } = useRecentlyViewed();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Keep --header-h CSS variable in sync so sidebar sticky offset is always accurate
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems((prev) => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); } else { s.add(id); }
      return s;
    });
  };

  const handleSelectItem = (item: PhysicalItem) => {
    setSelectedItem(item);
    addItem(item);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const itemId = new URLSearchParams(window.location.search).get('item');
    if (!itemId) return;
    const deepLinkedItem = ALL_ITEMS.find((item) => item.id === itemId);
    if (!deepLinkedItem) return;
    setMarketplaceFocus('shop');
    setSelectedItem(deepLinkedItem);
    addItem(deepLinkedItem);
  }, [addItem]);

  useEffect(() => {
    let active = true;
    fetchCommunityMarketplaceOffers({ pillar: 'physical-items' })
      .then((data) => {
        if (active) setCommunityOffers(data);
      })
      .catch(() => {
        if (active) setCommunityOffers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const addToCart = (item: PhysicalItem) => {
    setCartEntries((prev) => {
      const existing = prev.find((e) => e.item.id === item.id);
      if (existing) return prev.map((e) => e.item.id === item.id ? { ...e, quantity: e.quantity + 1 } : e);
      return [...prev, { item, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const saveItem = (item: PhysicalItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedEntries((prev) => {
      if (prev.find((e) => e.item.id === item.id)) return prev;
      return [...prev, { item, savedAt: new Date().toISOString(), priceAtSave: item.price, notify: false }];
    });
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setActiveNation('All Nations');
    setArOnly(false);
    setShipsIntl(false);
    setVerifiedOnly(false);
    setHandmadeOnly(false);
    setCommunityOnly(false);
    setPriceMin('');
    setPriceMax('');
    setSearchQuery('');
    setVisibleCount(PAGE_SIZE);
  };

  const filteredItems = useMemo(() => {
    let list = [...ALL_ITEMS];
    if (activeCategory !== 'all') list = list.filter((i) => matchesPhysicalCategory(i.category, activeCategory));
    if (activeNation !== 'All Nations') list = list.filter((i) => i.nation === activeNation);
    if (arOnly) list = list.filter((i) => i.hasARPreview);
    if (shipsIntl) list = list.filter((i) => i.shipsInternational);
    if (verifiedOnly) list = list.filter((i) => i.isVerified);
    if (handmadeOnly) list = list.filter((i) => i.isHandmade);
    if (priceMin) list = list.filter((i) => i.price >= Number(priceMin));
    if (priceMax) list = list.filter((i) => i.price <= Number(priceMax));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.maker.toLowerCase().includes(q) ||
          i.nation.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.material.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price);
    if (sortBy === 'popular') list.sort((a, b) => b.likes - a.likes);
    if (sortBy === 'newest') list.reverse();
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [activeCategory, activeNation, arOnly, shipsIntl, verifiedOnly, handmadeOnly, priceMin, priceMax, searchQuery, sortBy]);

  const filteredCommunityOffers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;
    const nationFilter = activeNation !== 'All Nations' ? activeNation.toLowerCase() : '';

    return communityOffers.filter((offer) => {
      if (q) {
        const haystack = [
          offer.title,
          offer.description,
          offer.communityName,
          offer.communityNation,
          offer.splitLabel,
          offer.pillarLabel
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (verifiedOnly && offer.communityVerificationStatus !== 'approved') return false;
      if (nationFilter && !offer.communityNation.toLowerCase().includes(nationFilter)) return false;
      if (min !== null && (offer.priceValue ?? 0) < min) return false;
      if (max !== null && (offer.priceValue ?? 0) > max) return false;
      return true;
    });
  }, [communityOffers, searchQuery, verifiedOnly, activeNation, priceMin, priceMax]);

  const mixedFeedCommunityOffers = useMemo(() => {
    if (communityOnly) return filteredCommunityOffers;
    return filteredCommunityOffers.slice(0, 3);
  }, [communityOnly, filteredCommunityOffers]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setLoading(false);
    }, 600);
  }, [loading, hasMore]);

  // IntersectionObserver for auto-load
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Reset visible count when filters change â€” wrapped in a transition to avoid cascading effect warning
  const resetAndSetCategory = (v: string) => { setActiveCategory(v); setVisibleCount(PAGE_SIZE); };
  const resetAndSetNation = (v: string) => { setActiveNation(v); setVisibleCount(PAGE_SIZE); };
  const resetAndSetSearch = (v: string) => { setSearchQuery(v); setVisibleCount(PAGE_SIZE); };
  const resetAndSetSort = (v: string) => { setSortBy(v); setVisibleCount(PAGE_SIZE); };
  const resetToggle = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, val: T) => { setter(val); setVisibleCount(PAGE_SIZE); };

  const hasActiveFilters = activeCategory !== 'all' || activeNation !== 'All Nations' || arOnly || shipsIntl || verifiedOnly || handmadeOnly || communityOnly || priceMin || priceMax;

  const categoryCount = (cat: string) => countItemsForPhysicalCategory(ALL_ITEMS, cat);

  // Inject sponsored card every 8 items
  const itemsWithSponsored = useMemo(() => {
    const result: (PhysicalItem | 'sponsored')[] = [];
    visibleItems.forEach((item, i) => {
      result.push(item);
      if ((i + 1) % 8 === 0 && i < visibleItems.length - 1) result.push('sponsored');
    });
    return result;
  }, [visibleItems]);

  const marketplaceGridCards = useMemo(() => {
    const cards: ReactNode[] = [];
    let communityCardIndex = 0;
    let physicalItemIndex = 0;

    for (const item of itemsWithSponsored) {
      if (!communityOnly && communityCardIndex < mixedFeedCommunityOffers.length && (physicalItemIndex === 0 || physicalItemIndex === 5 || physicalItemIndex === 11)) {
        const offer = mixedFeedCommunityOffers[communityCardIndex];
        cards.push(
          <CommunityMarketplaceCard
            key={`community-mixed-${offer.communitySlug}-${offer.id}`}
            offer={offer}
            mode="mixed"
            className="h-full"
          />
        );
        communityCardIndex += 1;
      }

      if (item === 'sponsored') {
        cards.push(<SponsoredCard key={`sponsored-${cards.length}`} />);
        continue;
      }

      cards.push(
        <ItemCard
          key={item.id}
          item={item}
          viewMode={viewMode}
          likedItems={likedItems}
          toggleLike={toggleLike}
          onSelect={handleSelectItem}
          onSave={saveItem}
        />
      );
      physicalItemIndex += 1;
    }

    while (!communityOnly && communityCardIndex < mixedFeedCommunityOffers.length) {
      const offer = mixedFeedCommunityOffers[communityCardIndex];
      cards.push(
        <CommunityMarketplaceCard
          key={`community-mixed-tail-${offer.communitySlug}-${offer.id}`}
          offer={offer}
          mode="mixed"
          className="h-full"
        />
      );
      communityCardIndex += 1;
    }

    return cards;
  }, [communityOnly, handleSelectItem, itemsWithSponsored, likedItems, mixedFeedCommunityOffers, saveItem, toggleLike, viewMode]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* â”€â”€ Top Bar â”€â”€ */}
      <div ref={headerRef} className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#d4af37]/15 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Back link */}
          <Link href="/" className="flex items-center gap-1.5 text-gray-400 hover:text-[#d4af37] transition-colors text-sm">
            <ArrowLeft size={16} />
            Back
          </Link>

          <div className="flex items-center gap-2">
            <Package size={20} className="text-[#d4af37]" />
            <h1 className="text-lg font-bold text-white">Browse All Physical Items</h1>
            <span className="px-2.5 py-0.5 bg-[#d4af37]/15 text-[#d4af37] text-xs rounded-full font-medium">
              {filteredItems.length} items
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => resetAndSetSearch(e.target.value)}
                placeholder="Search items, makers, nations..."
                className="bg-[#141414] border border-[#d4af37]/20 rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] w-56"
              />
              {searchQuery && (
                <button onClick={() => resetAndSetSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => resetAndSetSort(e.target.value)}
                className="appearance-none bg-[#141414] border border-[#d4af37]/20 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${sidebarOpen ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-[#141414] border-[#d4af37]/20 text-gray-300 hover:border-[#d4af37]/50'}`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-[#d4af37] rounded-full" />}
            </button>

            {/* Add Listing */}
            <Link
              href="/physical-items/add"
              className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black text-sm font-bold rounded-lg hover:bg-[#f4e4a6] transition-colors"
            >
              <Plus size={16} /> Add Item
            </Link>

            {/* View toggle */}
            <div className="flex items-center bg-[#141414] rounded-lg border border-[#d4af37]/20 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid3X3 size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
              >
                <List size={15} />
              </button>
            </div>

            {/* Saved */}
            <button
              onClick={() => setSavedOpen(true)}
              className="relative p-2 bg-[#141414] border border-[#d4af37]/20 rounded-lg text-gray-400 hover:text-white hover:border-[#d4af37]/50 transition-colors"
            >
              <Heart size={16} />
              {savedEntries.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#DC143C] text-white text-[10px] rounded-full flex items-center justify-center font-bold">{savedEntries.length}</span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 bg-[#141414] border border-[#d4af37]/20 rounded-lg text-gray-400 hover:text-white hover:border-[#d4af37]/50 transition-colors"
            >
              <ShoppingCart size={16} />
              {cartEntries.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#d4af37] text-black text-[10px] rounded-full flex items-center justify-center font-bold">{cartEntries.reduce((s, e) => s + e.quantity, 0)}</span>
              )}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => resetAndSetCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[#d4af37] text-black'
                  : 'bg-[#141414] border border-[#d4af37]/20 text-gray-400 hover:text-white hover:border-[#d4af37]/50'
              }`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.label}
              <span className={`text-xs ${activeCategory === cat.id ? 'text-black/60' : 'text-gray-600'}`}>
                ({categoryCount(cat.id)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* â”€â”€ Body â”€â”€ */}
      <div className="flex gap-0">
        {/* â”€â”€ Filter Sidebar â”€â”€ */}
        {sidebarOpen && (
          <aside
            className="w-64 flex-shrink-0 border-r border-[#d4af37]/15 p-5 space-y-6 sticky top-[var(--header-h,130px)] overflow-y-auto"
            style={{
              height: 'calc(100vh - var(--header-h, 130px))',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(212,175,55,0.2) transparent',
            }}
          >

            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-sm flex items-center gap-2">
                <Filter size={15} className="text-[#d4af37]" />
                Filters
              </span>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[#d4af37] text-xs hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {/* Nation */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Nation</label>
              <div className="relative">
                <select
                  value={activeNation}
                  onChange={(e) => resetAndSetNation(e.target.value)}
                  className="w-full appearance-none bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {NATIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Price range */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Price Range (INDI)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => { setPriceMin(e.target.value); setVisibleCount(PAGE_SIZE); }}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
                <span className="text-gray-500 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => { setPriceMax(e.target.value); setVisibleCount(PAGE_SIZE); }}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="text-xs text-gray-500 uppercase tracking-wider block">Item Attributes</label>
              {[
                { label: 'Verified Makers Only', value: verifiedOnly, set: (v: boolean) => resetToggle(setVerifiedOnly, v) },
                { label: 'AR Preview Available', value: arOnly, set: (v: boolean) => resetToggle(setArOnly, v) },
                { label: 'Ships Internationally', value: shipsIntl, set: (v: boolean) => resetToggle(setShipsIntl, v) },
                { label: 'Handmade Only', value: handmadeOnly, set: (v: boolean) => resetToggle(setHandmadeOnly, v) },
                { label: 'Community-owned listings only', value: communityOnly, set: (v: boolean) => resetToggle(setCommunityOnly, v) },
              ].map(({ label, value, set }) => (
                <label key={label} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
                  <button
                    onClick={() => set(!value)}
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${value ? 'bg-[#d4af37]' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              ))}
            </div>
          </aside>
        )}

        {/* â”€â”€ Main Content â”€â”€ */}
        <main className="flex-1 min-w-0 p-6">
          <section className="mb-6 rounded-2xl border border-[#d4af37]/20 bg-[#111111] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Buyer's lane</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Go straight to products, drops, auctions, or maker tools</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ['shop', 'Shop now'],
                  ['drops', 'Limited drops'],
                  ['auctions', 'Live auctions'],
                  ['community', 'Trending'],
                  ['tools', 'Saved + tools'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMarketplaceFocus(id as typeof marketplaceFocus)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      marketplaceFocus === id
                        ? 'bg-[#d4af37] text-black'
                        : 'border border-[#d4af37]/20 bg-[#0a0a0a] text-gray-300 hover:border-[#d4af37]/50 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {[
                { label: 'Ready to ship', value: `${filteredItems.filter((item) => item.inStock).length} items` },
                { label: 'One-of-one', value: `${filteredItems.filter((item) => item.stockCount <= 1).length} pieces` },
                { label: 'AR preview', value: `${filteredItems.filter((item) => item.hasARPreview).length} items` },
                { label: 'Community-owned', value: `${filteredCommunityOffers.length} listings` },
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{metric.label}</p>
                  <p className="mt-2 text-sm font-medium text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </section>

          <CommunityMarketplaceRail
            offers={filteredCommunityOffers}
            title="Community-owned physical items"
            subtitle="Community storefront listings now surface in the public marketplace too, while still retaining storefront ownership and treasury routing."
            emptyLabel="No community-owned physical items match the current search and filter settings."
          />

          {(!communityOnly && filteredItems.length === 0 && mixedFeedCommunityOffers.length === 0) || (communityOnly && filteredCommunityOffers.length === 0) ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <Package size={52} className="text-gray-700 mb-4" />
              <p className="text-white font-semibold text-xl mb-2">{communityOnly ? 'No community-owned items found' : 'No items found'}</p>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-[#d4af37] text-black text-sm font-semibold rounded-xl hover:bg-[#f4e4a6] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {!communityOnly ? (
                <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {marketplaceGridCards}

                  {loading && Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={`sk-${i}`} viewMode={viewMode} />
                  ))}
                </div>
              ) : null}

              {/* IntersectionObserver anchor */}
              <div ref={loadMoreRef} className="h-10 mt-6 flex items-center justify-center">
                {!communityOnly && hasMore && !loading && (
                  <button
                    onClick={loadMore}
                    className="px-8 py-2.5 bg-[#141414] border border-[#d4af37]/30 rounded-full text-[#d4af37] text-sm font-medium hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-all"
                  >
                    Load More Items
                  </button>
                )}
                {!communityOnly && !hasMore && filteredItems.length > 0 && (
                  <p className="text-gray-600 text-sm">All {filteredItems.length} items shown</p>
                )}
              </div>
            </>
          )}

          {marketplaceFocus === 'shop' ? (
            <div className="mt-8 grid gap-6 pb-8 xl:grid-cols-[1.3fr,0.7fr]">
              <TrendingItems items={ALL_ITEMS} onItemClick={handleSelectItem} />
              {hasMounted ? <PhysicalLimitedDrops /> : null}
            </div>
          ) : null}

          {marketplaceFocus === 'drops' ? (
            <div className="mt-8 space-y-8 pb-8">
              {hasMounted ? <PhysicalLimitedDrops /> : null}
              <TrendingItems items={ALL_ITEMS} onItemClick={handleSelectItem} />
            </div>
          ) : null}

          {marketplaceFocus === 'auctions' ? (
            <div className="mt-8 space-y-8 pb-8">
              {hasMounted ? <PhysicalAuctionSystem /> : null}
              <TrendingItems items={ALL_ITEMS} onItemClick={handleSelectItem} />
            </div>
          ) : null}

          {marketplaceFocus === 'community' ? (
            <div className="mt-8 grid grid-cols-1 gap-6 pb-8 xl:grid-cols-2">
              <TrendingItems items={ALL_ITEMS} onItemClick={handleSelectItem} />
              <PhysicalActivityFeed />
              <PhysicalSocialFeatures />
              <PhysicalFavoritesWatchlist
                onViewItem={handleSelectItem}
                onAddToCart={addToCart}
              />
            </div>
          ) : null}

          {marketplaceFocus === 'tools' ? (
            <div className="mt-8 grid grid-cols-1 gap-6 pb-8 xl:grid-cols-2">
              <MakerCollectionManager />
              <PhysicalWallet compact />
              <PhysicalTransactionHistory />
              <PhysicalFavoritesWatchlist
                onViewItem={handleSelectItem}
                onAddToCart={addToCart}
              />
            </div>
          ) : null}

          <section className="mt-10 rounded-2xl bg-gradient-to-r from-[#d4af37]/20 via-[#0a0a0a] to-[#DC143C]/20 p-8 text-center">
            <Package size={44} className="mx-auto mb-4 text-[#d4af37]" />
            <h2 className="mb-2 text-2xl font-bold text-white">Sell Your Handcrafted Work</h2>
            <p className="mx-auto mb-6 max-w-xl text-sm text-gray-400">
              Are you an Indigenous maker? List your physical items on Indigena Market and reach a global audience that values authentic craftsmanship.
            </p>
            <a
              href="/creator-hub"
              className="inline-block rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941f] px-6 py-3 font-semibold text-black transition-all hover:shadow-lg hover:shadow-[#d4af37]/30"
            >
              Open Your Shop
            </a>
          </section>
        </main>
      </div>

      {/* â”€â”€ Item Detail Modal â”€â”€ */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          allItems={ALL_ITEMS}
          onAddToCart={addToCart}
        />
      )}

      {/* â”€â”€ Cart Drawer â”€â”€ */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        entries={cartEntries}
        onUpdateQty={(id, qty) => setCartEntries((prev) => prev.map((e) => e.item.id === id ? { ...e, quantity: qty } : e))}
        onRemove={(id) => setCartEntries((prev) => prev.filter((e) => e.item.id !== id))}
      />

      {/* â”€â”€ Saved Items Modal â”€â”€ */}
      {savedOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSavedOpen(false)}
        >
          <div
            className="bg-[#141414] border border-[#d4af37]/30 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-white font-semibold">Saved Items ({savedEntries.length})</h2>
              <button onClick={() => setSavedOpen(false)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <SavedItems
                entries={savedEntries}
                onRemove={(id) => setSavedEntries((prev) => prev.filter((e) => e.item.id !== id))}
                onToggleNotify={(id) => setSavedEntries((prev) => prev.map((e) => e.item.id === id ? { ...e, notify: !e.notify } : e))}
                onView={(item) => { setSavedOpen(false); handleSelectItem(item); }}
                onAddToCart={(item) => { addToCart(item); setSavedOpen(false); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




