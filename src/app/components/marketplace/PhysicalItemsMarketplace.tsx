'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { getStoredWalletAddress } from '@/app/lib/walletStorage';
import {
  Grid3X3, List, Heart, Eye, MapPin, CheckCircle,
  Filter, ChevronDown, Package, Star, ShoppingCart,
  X, Sparkles
} from 'lucide-react';
import PillarArtistSpotlight from './PillarArtistSpotlight';
import PhysicalItemsStickyBanner from './PhysicalItemsStickyBanner';
import PhysicalCategoryFilter from './physical-items/PhysicalCategoryFilter';
import MakerSpotlight from './physical-items/MakerSpotlight';
import ARTryOnBadge from './physical-items/ARTryOnBadge';
import StoryCardPreview from './physical-items/StoryCardPreview';
import ItemDetailModal, { PhysicalItem } from './physical-items/ItemDetailModal';
import FeaturedMakerBanner from './physical-items/FeaturedMakerBanner';
import HubPartnerStrip from './physical-items/HubPartnerStrip';
import PromotedMakerCard from './physical-items/PromotedMakerCard';
import NewCollectionLaunch from './physical-items/NewCollectionLaunch';
import CraftSupplyBanner from './physical-items/CraftSupplyBanner';
import CartDrawer, { CartEntry } from './physical-items/CartDrawer';
import SavedItems from './physical-items/SavedItems';
import RecentlyViewed, { useRecentlyViewed } from './physical-items/RecentlyViewed';
import TrendingItems from './physical-items/TrendingItems';
import PhysicalWallet from './physical-items/PhysicalWallet';
import PhysicalSocialFeatures from './physical-items/PhysicalSocialFeatures';
import PhysicalActivityFeed from './physical-items/PhysicalActivityFeed';
import PhysicalTransactionHistory from './physical-items/PhysicalTransactionHistory';
import PhysicalSearchDiscovery from './physical-items/PhysicalSearchDiscovery';
import PhysicalFavoritesWatchlist from './physical-items/PhysicalFavoritesWatchlist';
import PhysicalLimitedDrops from './physical-items/PhysicalLimitedDrops';
import MakerCollectionManager from './physical-items/MakerCollectionManager';
import PhysicalAuctionSystem from './physical-items/PhysicalAuctionSystem';
import { getMarketplaceCardMerchandising } from './marketplaceCardMerchandising';
import { matchesPhysicalCategory, getPhysicalCategoryIdFromLabel } from '@/app/physical-items/data/pillar2Catalog';
import {
  fetchPhysicalCategoryDemandHeatmap,
  fetchPhysicalItems,
  togglePhysicalWatchlist,
  trackPhysicalMarketplaceEvent,
  type PhysicalMarketplaceItem,
} from '@/app/lib/physicalMarketplaceApi';
import { isGlobalMockFallbackEnabled } from '@/app/lib/mockMode';

const ALLOW_MOCK_FALLBACK = isGlobalMockFallbackEnabled();

// â”€â”€â”€ Mock data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const mockItems: PhysicalItem[] = [
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
    storyFull: 'This medicine bag has been crafted using a traditional pattern passed down through five generations of Navajo women in my family. Each glass bead is hand-sewn onto tanned deer hide using sinew thread. The pattern represents the four cardinal directions and the harmony between the human and spirit world. I source all materials locally when possible, and every bag takes approximately 40 hours to complete. When you receive this bag, you receive not just an object, but a piece of living tradition.',
    elderEndorsement: 'Maria carries the knowledge of our grandmothers with great care and respect. Her work honors our ways.',
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
    storyFull: 'Fired using traditional outdoor firing techniques, this vessel carries the smoke and spirit of the earth. I gather clay from the same hillside my family has used for three generations. The geometric patterns are a modern expression of ancient Hopi iconography representing water, corn, and sky. No two pieces are identical â€” each vessel is a conversation between maker and material.',
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
    storyFull: 'The Two-Grey-Hills style originates from the northeastern corner of the Navajo Nation. This rug took six months to complete on a traditional vertical loom. All wool is hand-spun from Churro sheep and dyed using plants I harvest each fall â€” sumac for brown, wild onion for gold, indigo for the deep blue-grey. The central diamond motif represents the intersection of the four sacred mountains.',
    elderEndorsement: 'Her weaving is precise and carries the old knowledge. She has earned the right to weave this pattern.',
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
    storyFull: 'Forged from 925 sterling silver using traditional lost-wax casting, this pendant features the Thunderbird in the Coast Salish ovoid design language. The turquoise inlay was sourced from the Cerrillos mine in New Mexico, traded through Indigenous networks. I learned silversmithing from my uncle who studied under a Navajo master jeweler. Each piece is hallmarked and comes with a certificate of authenticity.',
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
    storyFull: 'This pow-wow dance fan is crafted entirely from naturally molted eagle feathers collected over two years from birds in my care under a federal permit. The handle is wrapped in tanned deer hide with traditional Lakota geometric beadwork. This piece is intended for ceremonial dance use and carries a sacred status. Buyer must confirm Indigenous identity and ceremonial purpose. We do not export this item internationally out of respect for CITES regulations and cultural protocols.',
    elderEndorsement: 'These feathers were gathered with prayer and permission. The fan honors our eagle relatives.',
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
    storyFull: 'Carved from a single piece of old-growth Western red cedar salvaged from a downed tree on unceded Haudenosaunee territory. The figure depicts a guardian spirit figure in the Northwest Coast formline style. Carved using traditional adzes and knives â€” no power tools. The wood is finished with linseed oil and beeswax. This piece represents approximately 80 hours of work spanning three months.',
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
    storyFull: 'These moccasins are crafted from brain-tanned moose hide, a labor-intensive traditional tanning process I was taught by my aunt in northern Manitoba. The floral beadwork design is a classic Metis motif featuring roses and leaves in the French-influenced style that has characterized Metis craft since the 18th century. Each shoe takes approximately 30 hours to bead. The wool lining is hand-sewn for warmth. Custom sizing available on request.',
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
    storyFull: 'Carved from Arctic soapstone quarried in Nunavut, this bear sculpture is finished with traditional hand-polishing using progressively finer grits of sandpaper to achieve the characteristic warm sheen of Inuit sculpture. The bear is rendered in the powerful, minimalist style associated with Cape Dorset artists. Each piece is unique and signed on the base in syllabics.',
    certificationNumber: 'INU-2024-CV-0027',
    xrplTxId: 'H4M0I9J8K7L6F5G6H7M8A9B0C1D2E3F4A5B6C7J3',
    ipfsHash: 'QmE4R6tY0uO9wS5cD1qF3aI8zM2vL0kJ7nH6pU5bA9xW4gT',
    rating: 4.9,
    reviewCount: 36,
  },
];

// Sponsored item (premium placement)
const getWalletAddress = () => {
  if (typeof window === 'undefined') return '';
  return getStoredWalletAddress();
};
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

// â”€â”€â”€ ItemCard sub-component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  const merch = getMarketplaceCardMerchandising({
    title: item.title,
    pillarLabel: 'Physical Items',
    image: item.images[0] || '',
    coverImage: item.images[0] || '',
    galleryOrder: item.images,
    ctaMode: item.inStock ? 'buy' : 'message',
    ctaPreset: item.inStock ? 'collect-now' : 'message-first',
    availabilityLabel: item.inStock ? `${item.stockCount} left` : 'Sold out',
    availabilityTone: item.inStock && item.stockCount <= 2 ? 'warning' : item.inStock ? 'success' : 'danger',
    featured: item.isVerified,
    merchandisingRank: item.stockCount <= 2 ? 2 : 10,
    status: item.inStock ? 'Active' : 'Sold out',
    priceLabel: `${item.price} ${item.currency}`,
    blurb: item.storyQuote || item.storyFull || item.material,
  });

  return (
    <div
      onClick={() => onSelect(item)}
      className={`group bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden hover:border-[#d4af37]/50 transition-all cursor-pointer ${viewMode === 'list' ? 'flex' : ''}`}
    >
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
        <img src={merch.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent opacity-40" />
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {item.isSacred && <span className="px-2 py-0.5 bg-[#DC143C]/90 text-white text-xs rounded-full">Sacred</span>}
          {item.isHandmade && <span className="px-2 py-0.5 bg-green-600/80 text-white text-xs rounded-full">Handmade</span>}
          {merch.launchBadge && <span className="px-2 py-0.5 bg-emerald-500/90 text-white text-xs rounded-full">{merch.launchBadge}</span>}
        </div>
        {item.hasARPreview && (
          <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
            <ARTryOnBadge itemTitle={item.title} itemImage={merch.image} mockupType={item.category === 'jewelry' ? 'neck' : item.category === 'weaving' ? 'wall' : 'hand'} />
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
            <StoryCardPreview makerName={item.maker} makerAvatar={item.makerAvatar} nation={item.nation} quote={item.storyQuote} isSacred={item.isSacred} onOpenStory={() => onSelect(item)} />
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><MapPin size={11} />{item.hubCity}</span>
          {item.inStock ? <span className="text-green-400">{merch.normalized.availabilityLabel}</span> : <span className="text-[#DC143C]">{merch.normalized.availabilityLabel}</span>}
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
              onClick={(e) => { e.stopPropagation(); onSelect(item); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37] text-black text-xs font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors">
              <ShoppingCart size={13} />{merch.ctaLabel}
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

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function mapApiPhysicalItemToMarketplace(item: PhysicalMarketplaceItem): PhysicalItem {
  const id = item.itemId || item._id || `${Date.now()}`;
  const material = Array.isArray((item as { materials?: string[] }).materials)
    ? ((item as { materials?: string[] }).materials || []).join(', ')
    : 'Mixed materials';

  return {
    id,
    title: item.title || 'Untitled Item',
    maker: item.creator?.name || 'Indigenous Maker',
    makerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    price: Number(item.price || 0),
    currency: item.currency || 'INDI',
    images: item.images?.length ? item.images : ['https://images.unsplash.com/photo-1605218427368-35b0f996d2e6?w=600&h=600&fit=crop'],
    nation: item.creator?.tribalAffiliation || 'Indigenous',
    category: item.categoryId || 'other',
    material,
    dimensions: 'By listing',
    weight: 'N/A',
    isVerified: Boolean(item.authenticity?.verified || item.elderVerified),
    isHandmade: true,
    inStock: item.status !== 'sold',
    stockCount: item.status === 'sold' ? 0 : 1,
    hubName: 'Community Hub',
    hubCity: 'Global',
    hubOnline: true,
    shipsInternational: true,
    likes: 0,
    views: 0,
    hasARPreview: false,
    isSacred: false,
    storyQuote: item.description || 'Authentic handcrafted work',
    storyFull: item.description || 'Authentic handcrafted work from Indigenous creators.',
    certificationNumber: item.itemId || 'PENDING',
    xrplTxId: 'N/A',
    ipfsHash: 'N/A',
    rating: 4.8,
    reviewCount: 0,
  };
}
export default function PhysicalItemsMarketplace() {
  const [hasMounted, setHasMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeNation, setActiveNation] = useState('All Nations');
  const [arOnly, setArOnly] = useState(false);
  const [shipsIntl, setShipsIntl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<PhysicalItem | null>(null);
  const [items, setItems] = useState<PhysicalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const fetchSeq = useRef(0);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Cart state
  const [cartOpen, setCartOpen] = useState(false);
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);

  // Saved items
  const [savedEntries, setSavedEntries] = useState<{ item: PhysicalItem; savedAt: string; priceAtSave: number; notify: boolean }[]>([]);
  const [savedOpen, setSavedOpen] = useState(false);

  // Recently viewed
  const { getItems, addItem, clearItems } = useRecentlyViewed();
  const [recentItems, setRecentItems] = useState<PhysicalItem[]>(() => getItems());

  useEffect(() => {
    setHasMounted(true);
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
    setRecentItems(getItems());
    trackPhysicalMarketplaceEvent({ event: 'view', itemId: item.id, category: item.category }).catch(() => undefined);
  };

  const addToCart = (item: PhysicalItem) => {
    setCartEntries((prev) => {
      const existing = prev.find((e) => e.item.id === item.id);
      if (existing) return prev.map((e) => e.item.id === item.id ? { ...e, quantity: e.quantity + 1 } : e);
      return [...prev, { item, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const saveItem = (item: PhysicalItem) => {
    const wallet = getWalletAddress();
    if (wallet) {
      togglePhysicalWatchlist(item.id, wallet).catch(() => undefined);
    }
    trackPhysicalMarketplaceEvent({ event: 'watchlist_toggle', itemId: item.id, category: item.category }).catch(() => undefined);
    setSavedEntries((prev) => {
      if (prev.find((e) => e.item.id === item.id)) return prev;
      return [...prev, { item, savedAt: new Date().toISOString(), priceAtSave: item.price, notify: false }];
    });
  };

  const filteredItems = useMemo(() => {
    let list = [...items];
    if (activeCategory !== 'all') list = list.filter((i) => matchesPhysicalCategory(i.category, activeCategory));
    if (activeNation !== 'All Nations') list = list.filter((i) => i.nation === activeNation);
    if (arOnly) list = list.filter((i) => i.hasARPreview);
    if (shipsIntl) list = list.filter((i) => i.shipsInternational);
    if (verifiedOnly) list = list.filter((i) => i.isVerified);
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
  }, [activeCategory, activeNation, arOnly, shipsIntl, verifiedOnly, priceMin, priceMax, searchQuery, sortBy, items]);

  const clearFilters = () => {
    setActiveCategory('all');
    setActiveNation('All Nations');
    setArOnly(false);
    setShipsIntl(false);
    setVerifiedOnly(false);
    setPriceMin('');
    setPriceMax('');
    setSearchQuery('');
  };

  const hasActiveFilters = activeCategory !== 'all' || activeNation !== 'All Nations' || arOnly || shipsIntl || verifiedOnly || priceMin || priceMax || searchQuery.trim() !== '';

  useEffect(() => {
    fetchPhysicalCategoryDemandHeatmap().catch(() => undefined);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const seq = ++fetchSeq.current;
    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        setApiError(null);
        const page = await fetchPhysicalItems(
          {
            q: searchQuery || undefined,
            categoryId: activeCategory !== 'all' ? activeCategory : undefined,
            nation: activeNation !== 'All Nations' ? activeNation : undefined,
            minPrice: priceMin ? Number(priceMin) : undefined,
            maxPrice: priceMax ? Number(priceMax) : undefined,
            sort: sortBy,
            page: 1,
            limit: 120
          },
          controller.signal
        );

        if (seq !== fetchSeq.current) return;

        if (Array.isArray(page.items) && page.items.length > 0) {
          setItems(page.items.map(mapApiPhysicalItemToMarketplace));
        } else if (ALLOW_MOCK_FALLBACK) {
          setItems(mockItems);
        } else {
          setItems([]);
          setApiError('No physical listings available.');
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        if (seq !== fetchSeq.current) return;
        setApiError(ALLOW_MOCK_FALLBACK ? 'Using local data fallback' : 'Unable to load physical marketplace data.');
        setItems(ALLOW_MOCK_FALLBACK ? mockItems : []);
      } finally {
        if (seq === fetchSeq.current) setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [activeCategory, activeNation, priceMin, priceMax, searchQuery, sortBy]);

  return (
    <div className="p-6">
      {/* Premium Placement #7 â€” Sticky Announcement Banner */}
      <PhysicalItemsStickyBanner />

      {/* Placement #1 â€” Featured Maker Banner (rotating hero, $300/week) */}
      <FeaturedMakerBanner />

      {/* Maker Activity Ticker */}
      <MakerSpotlight />

      {/* Artist Spotlight */}
      <PillarArtistSpotlight pillar="physical-items" />

      {/* Cart icon in header row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Physical Items</h1>
          <p className="text-gray-400 text-sm">{filteredItems.length} handcrafted items from Indigenous makers</p>
          <Link href="/physical-items" className="text-[#d4af37] text-xs hover:underline mt-0.5 inline-block">
            View All Items &rarr;
          </Link>
          {loading && <p className="text-xs text-gray-500 mt-1">Updating items...</p>}
          {apiError && <p className="text-xs text-amber-400 mt-1">{apiError}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, makers, nations..."
              className="bg-[#141414] border border-[#d4af37]/20 rounded-lg pl-4 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] w-52"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[#141414] border border-[#d4af37]/20 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                : 'bg-[#141414] border-[#d4af37]/20 text-gray-300 hover:border-[#d4af37]/50'
            }`}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-[#d4af37] rounded-full" />
            )}
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-[#141414] rounded-lg border border-[#d4af37]/20 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Saved Items button */}
          <button
            onClick={() => setSavedOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 bg-[#141414] border border-[#d4af37]/20 rounded-lg text-gray-300 hover:text-white hover:border-[#d4af37]/50 transition-colors"
          >
            <Heart size={16} />
            {savedEntries.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#DC143C] text-white text-xs rounded-full flex items-center justify-center">{savedEntries.length}</span>
            )}
          </button>

          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 bg-[#141414] border border-[#d4af37]/20 rounded-lg text-gray-300 hover:text-white hover:border-[#d4af37]/50 transition-colors"
          >
            <ShoppingCart size={16} />
            {cartEntries.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#d4af37] text-black text-xs rounded-full flex items-center justify-center font-bold">{cartEntries.reduce((s, e) => s + e.quantity, 0)}</span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-[#141414] rounded-xl border border-[#d4af37]/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Advanced Filters</h3>
            <button onClick={clearFilters} className="text-[#d4af37] text-xs hover:underline">
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Price Range (INDI)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Verified Maker Only</label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-[#d4af37]/30 bg-[#0a0a0a] accent-[#d4af37]"
                />
                <span className="text-sm text-gray-300">Verified makers only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Placement #3 â€” Hub Partner Strip ($200/week) */}
      <HubPartnerStrip />

      {/* Search & Discovery Panel */}
      <div className="mb-6">
        <PhysicalSearchDiscovery
          onSearch={(q) => setSearchQuery(q)}
          onFilterChange={(f) => {
            setActiveCategory(getPhysicalCategoryIdFromLabel(f.category));
            setActiveNation(f.nation);
            setPriceMin(f.priceMin);
            setPriceMax(f.priceMax);
            setArOnly(false);
            setShipsIntl(f.shipsIntl);
            setVerifiedOnly(f.verifiedOnly);
          }}
        />
      </div>

      {/* Category + Secondary Filters */}
      <PhysicalCategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeNation={activeNation}
        onNationChange={setActiveNation}
        arOnly={arOnly}
        onAROnlyChange={setArOnly}
        shipsIntl={shipsIntl}
        onShipsIntlChange={setShipsIntl}
      />

      {/* Placement #5 â€” New Collection Launch ($180/week) */}
      <NewCollectionLaunch />

      {/* Limited Drops & Flash Sales */}
      <div className="mb-6">
        {hasMounted ? <PhysicalLimitedDrops /> : null}
      </div>

      {/* Grid / List â€” with Promoted Makers sidebar */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package size={48} className="text-gray-600 mb-4" />
          <p className="text-white font-semibold text-lg">No items found</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">Try adjusting your filters</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-[#d4af37] text-black text-sm font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Main grid */}
          <div className={`flex-1 min-w-0`}>

            {/* First slice: items 0â€“3 */}
            <div className={`grid gap-6 mb-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredItems.slice(0, 4).map((item) => (
                <ItemCard key={item.id} item={item} viewMode={viewMode} likedItems={likedItems} toggleLike={toggleLike} onSelect={handleSelectItem} onSave={(item, e) => { e.stopPropagation(); saveItem(item); }} />
              ))}
            </div>

            {/* Placement #2 â€” Sponsored Item Band () */}
            {filteredItems.length > 4 && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-[#d4af37]/30 relative flex min-h-[120px]">
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-[#d4af37] text-black text-xs font-bold rounded-full shadow">
                  <Sparkles size={11} />
                  Sponsored
                </div>
                <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-black/50 text-gray-400 text-[10px] rounded-full backdrop-blur-sm"></div>
                <div className="w-48 flex-shrink-0 relative bg-[#0a0a0a]">
                  <img
                    src={SPONSORED_ITEM.image}
                    alt={SPONSORED_ITEM.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141414]" />
                </div>
                <div className="flex-1 bg-[#141414] p-5 flex flex-col justify-center min-w-0">
                  <span className="text-[#d4af37] text-xs font-medium mb-1">{SPONSORED_ITEM.tag}</span>
                  <h3 className="text-white text-lg font-bold mb-1 truncate">{SPONSORED_ITEM.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{SPONSORED_ITEM.description}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-2xl font-bold text-[#d4af37]">{SPONSORED_ITEM.price}</span>
                      <span className="text-[#d4af37] text-sm ml-1">{SPONSORED_ITEM.currency}</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black text-sm font-semibold rounded-xl hover:bg-[#f4e4a6] transition-colors">
                      <ShoppingCart size={14} />
                      View Kit
                    </button>
                    <span className="text-gray-500 text-xs">by {SPONSORED_ITEM.creator}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of items */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredItems.slice(4).map((item) => (
                <ItemCard key={item.id} item={item} viewMode={viewMode} likedItems={likedItems} toggleLike={toggleLike} onSelect={handleSelectItem} onSave={(item, e) => { e.stopPropagation(); saveItem(item); }} />
              ))}
            </div>

          </div>

          {/* Placement #4 â€” Promoted Maker Sidebar ($250/week) â€” hidden on small screens */}
          <div className="hidden xl:block">
            <PromotedMakerCard />
          </div>
        </div>
      )}

      {/* Load More â€” links to View All page since all items are shown here */}
      <div className="mt-10 text-center">
        <Link
          href="/physical-items"
          className="inline-block px-8 py-3 bg-[#141414] border border-[#d4af37]/30 rounded-full text-[#d4af37] font-medium hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-all"
        >
          Browse All Items &rarr;</Link>
      </div>

      {/* Placement #6 â€” Craft Supply Partners ($120/week) */}
      <CraftSupplyBanner />

      {/* â”€â”€ Trending Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mt-10">
        <TrendingItems items={items} onItemClick={handleSelectItem} />
      </div>

      {/* â”€â”€ Community Row: Activity Feed + Social Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PhysicalActivityFeed />
        <PhysicalSocialFeatures item={selectedItem} />
      </div>

      {/* â”€â”€ Wallet + Transaction History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PhysicalWallet compact />
        <PhysicalTransactionHistory />
      </div>

      {/* â”€â”€ Live Auctions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mt-8">
        {hasMounted ? <PhysicalAuctionSystem /> : null}
      </div>

      {/* â”€â”€ Favorites Watchlist + Maker Collections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PhysicalFavoritesWatchlist
          onViewItem={handleSelectItem}
          onAddToCart={addToCart}
        />
        <MakerCollectionManager />
      </div>

      {/* Sell Your Work CTA */}
      <section className="mt-12 bg-gradient-to-r from-[#d4af37]/20 via-[#0a0a0a] to-[#DC143C]/20 rounded-2xl p-8 text-center">
        <Package size={48} className="text-[#d4af37] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Sell Your Handcrafted Work</h2>
        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          Are you an Indigenous maker? List your physical items on Indigena Market and reach a global audience that values authentic craftsmanship.
        </p>
        <a
          href="/creator-hub"
          className="inline-block px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
        >
          Open Your Shop
        </a>
      </section>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          allItems={items}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        entries={cartEntries}
        onUpdateQty={(id, qty) => setCartEntries((prev) => prev.map((e) => e.item.id === id ? { ...e, quantity: qty } : e))}
        onRemove={(id) => setCartEntries((prev) => prev.filter((e) => e.item.id !== id))}
      />

      {/* Saved Items panel */}
      {savedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSavedOpen(false)}>
          <div className="bg-[#141414] border border-[#d4af37]/30 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-white font-semibold">Saved Items ({savedEntries.length})</h2>
              <button onClick={() => setSavedOpen(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
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

      {/* Recently Viewed sticky bar */}
      <RecentlyViewed
        items={recentItems}
        onSelect={handleSelectItem}
        onClear={() => { clearItems(); setRecentItems([]); }}
      />
    </div>
  );
}






















