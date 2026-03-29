'use client';

import React, { useState } from 'react';
import {
  X, Heart, ShoppingCart, MapPin, Shield, CheckCircle,
  ChevronLeft, ChevronRight, Star, Package, Quote, AlertTriangle,
  Award, Hash, MessageCircle, ClipboardList, ThumbsUp
} from 'lucide-react';
import HubShippingWidget from './HubShippingWidget';
import ArtistMiniCard from '../digital-arts/ArtistMiniCard';
import ReviewsSection from './ReviewsSection';
import CustomOrderForm from './CustomOrderForm';
import VariantSelector, { Variant } from './VariantSelector';
import AskMakerChat from './AskMakerChat';
import SimilarItems from './SimilarItems';
import SacredItemGate from './SacredItemGate';
import OfferNegotiation from './OfferNegotiation';

export interface PhysicalItem {
  id: string;
  title: string;
  maker: string;
  makerAvatar: string;
  price: number;
  currency: string;
  images: string[];
  nation: string;
  category: string;
  material: string;
  dimensions: string;
  weight: string;
  isVerified: boolean;
  isHandmade: boolean;
  inStock: boolean;
  stockCount: number;
  hubName: string;
  hubCity: string;
  hubOnline: boolean;
  shipsInternational: boolean;
  likes: number;
  views: number;
  hasARPreview: boolean;
  isSacred: boolean;
  storyQuote: string;
  storyFull: string;
  elderEndorsement?: string;
  certificationNumber: string;
  xrplTxId: string;
  ipfsHash: string;
  rating: number;
  reviewCount: number;
}

interface ItemDetailModalProps {
  item: PhysicalItem;
  onClose: () => void;
  allItems?: PhysicalItem[];
  onAddToCart?: (item: PhysicalItem) => void;
}

type TabId = 'details' | 'reviews' | 'story' | 'shipping' | 'provenance';

// Demo variant groups per category
function getVariantGroups(category: string): { type: Variant['type']; label: string; variants: Variant[] }[] {
  if (category === 'jewelry') return [
    { type: 'size', label: 'Wrist Size', variants: [
      { id: 's1', type: 'size', label: 'XS (6")', value: 'xs', inStock: true },
      { id: 's2', type: 'size', label: 'S (6.5")', value: 's', inStock: true },
      { id: 's3', type: 'size', label: 'M (7")', value: 'm', inStock: true, stockCount: 2 },
      { id: 's4', type: 'size', label: 'L (7.5")', value: 'l', inStock: false },
    ]},
    { type: 'color', label: 'Stone Colour', variants: [
      { id: 'c1', type: 'color', label: 'Turquoise', value: 'turquoise', inStock: true },
      { id: 'c2', type: 'color', label: 'Coral', value: 'coral', inStock: true, priceAdjust: 15 },
      { id: 'c3', type: 'color', label: 'Natural', value: 'natural', inStock: true },
    ]},
  ];
  if (category === 'textiles' || category === 'weaving') return [
    { type: 'size', label: 'Size', variants: [
      { id: 's1', type: 'size', label: 'Small (60×40cm)', value: 'sm', inStock: true },
      { id: 's2', type: 'size', label: 'Medium (90×60cm)', value: 'md', inStock: true, priceAdjust: 40 },
      { id: 's3', type: 'size', label: 'Large (120×80cm)', value: 'lg', inStock: true, priceAdjust: 90 },
    ]},
    { type: 'color', label: 'Colourway', variants: [
      { id: 'c1', type: 'color', label: 'Earth Tones', value: 'brown', inStock: true },
      { id: 'c2', type: 'color', label: 'Desert Sky', value: 'blue', inStock: true },
      { id: 'c3', type: 'color', label: 'Natural Undyed', value: 'natural', inStock: false },
    ]},
  ];
  return [];
}

export default function ItemDetailModal({ item, onClose, allItems = [], onAddToCart }: ItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('details');
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showMakerCard, setShowMakerCard] = useState(false);
  const [showCustomOrder, setShowCustomOrder] = useState(false);
  const [showAskMaker, setShowAskMaker] = useState(false);
  const [variantPrice, setVariantPrice] = useState(0);
  const [sacredGatePassed, setSacredGatePassed] = useState(false);
  const [showSacredGate, setShowSacredGate] = useState(false);

  const variantGroups = getVariantGroups(item.category);
  const effectivePrice = item.price + variantPrice;

  const tabs: { id: TabId; label: string; icon?: React.ReactNode }[] = [
    { id: 'details', label: 'Details' },
    { id: 'reviews', label: `Reviews (${item.reviewCount})` },
    { id: 'story', label: 'Story' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'provenance', label: 'Provenance' },
  ];

  const handleAddToCart = () => {
    onAddToCart?.(item);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleVariantChange = (selected: Record<string, Variant>) => {
    const adj = Object.values(selected).reduce((s, v) => s + (v.priceAdjust ?? 0), 0);
    setVariantPrice(adj);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-6 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 w-full max-w-4xl overflow-hidden flex flex-col"
          style={{ maxHeight: 'min(85vh, 700px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/20 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-[#d4af37]" />
              <span className="text-white font-semibold truncate max-w-xs">{item.title}</span>
              {item.isVerified && (
                <span className="px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] text-xs rounded-full flex items-center gap-1">
                  <CheckCircle size={10} />
                  Verified Maker
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#d4af37]/10 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div 
            className="overflow-y-auto flex-1 min-h-0 p-6" 
            style={{ 
              scrollbarWidth: 'thin', 
              scrollbarColor: 'rgba(212,175,55,0.3) transparent',
            }}
          >

            {/* ── TAB: DETAILS ── */}
            {activeTab === 'details' && (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0a0a0a] mb-3">
                    <img
                      src={item.images[activeImage]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImage((i) => (i - 1 + item.images.length) % item.images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => setActiveImage((i) => (i + 1) % item.images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                    {item.isSacred && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-[#DC143C]/80 text-white text-xs rounded-full">
                        <AlertTriangle size={11} />
                        Sacred Item
                      </div>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {item.images.length > 1 && (
                    <div className="flex gap-2">
                      {item.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            activeImage === i ? 'border-[#d4af37]' : 'border-transparent'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full">{item.nation}</span>
                    <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-full capitalize">{item.category}</span>
                    {item.isHandmade && (
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">Handmade</span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-1">{item.title}</h2>

                  <button
                    onClick={() => setShowMakerCard(true)}
                    className="text-[#d4af37] text-sm font-medium hover:underline mb-3 block"
                  >
                    by {item.maker}
                  </button>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(item.rating) ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'}
                      />
                    ))}
                    <span className="text-gray-400 text-sm">{item.rating} ({item.reviewCount} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-[#d4af37]">{effectivePrice}</span>
                    <span className="text-[#d4af37] text-lg">INDI</span>
                    {variantPrice !== 0 && (
                      <span className="text-gray-500 text-sm line-through">{item.price} base</span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="flex items-center gap-2 mb-4">
                    {item.inStock ? (
                      <span className="flex items-center gap-1.5 text-green-400 text-sm">
                        <CheckCircle size={14} />
                        {item.stockCount} remaining
                      </span>
                    ) : (
                      <span className="text-[#DC143C] text-sm">Out of stock</span>
                    )}
                  </div>

                  {/* Specs */}
                  <div className="space-y-2 mb-5 p-3 bg-[#0a0a0a] rounded-xl">
                    {[
                      { label: 'Material', value: item.material },
                      { label: 'Dimensions', value: item.dimensions },
                      { label: 'Weight', value: item.weight },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Variants */}
                  {variantGroups.length > 0 && (
                    <div className="mb-5">
                      <VariantSelector
                        groups={variantGroups}
                        currency={item.currency}
                        onSelectionChange={handleVariantChange}
                      />
                    </div>
                  )}

                  {/* Hub snippet */}
                  <div className="mb-5">
                    <HubShippingWidget
                      hubName={item.hubName}
                      hubCity={item.hubCity}
                      hubOnline={item.hubOnline}
                      shipsInternational={item.shipsInternational}
                      compact
                    />
                  </div>

                  {/* Quantity + Cart */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center border border-[#d4af37]/30 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 text-white hover:bg-[#d4af37]/10 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-white text-sm">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(item.stockCount, q + 1))}
                        className="w-9 h-9 text-white hover:bg-[#d4af37]/10 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (item.isSacred && !sacredGatePassed) { setShowSacredGate(true); return; }
                        handleAddToCart();
                      }}
                      disabled={!item.inStock}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
                        addedToCart
                          ? 'bg-green-500 text-white'
                          : item.inStock
                          ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6] hover:shadow-lg hover:shadow-[#d4af37]/30'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart size={16} />
                      {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => setLiked((l) => !l)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${
                        liked
                          ? 'bg-[#DC143C]/20 border-[#DC143C] text-[#DC143C]'
                          : 'border-[#d4af37]/20 text-gray-400 hover:text-[#DC143C] hover:border-[#DC143C]/50'
                      }`}
                    >
                      <Heart size={18} fill={liked ? '#DC143C' : 'none'} />
                    </button>
                  </div>

                  {/* Buy Now */}
                  {item.inStock && (
                    <button
                      onClick={() => {
                        if (item.isSacred && !sacredGatePassed) {
                          setShowSacredGate(true);
                          return;
                        }
                        handleAddToCart();
                        onClose();
                      }}
                      className="w-full py-3 bg-[#0a0a0a] border border-[#d4af37]/30 rounded-xl text-[#d4af37] font-semibold hover:bg-[#d4af37]/10 transition-colors"
                    >
                      Buy Now — {effectivePrice * quantity} INDI
                    </button>
                  )}

                  {/* Secondary actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setShowAskMaker(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <MessageCircle size={14} /> Ask Maker
                    </button>
                    <button
                      onClick={() => setShowCustomOrder(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <ClipboardList size={14} /> Custom Order
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <ThumbsUp size={14} /> Reviews
                    </button>
                  </div>

                  {/* Offer Negotiation */}
                  <div className="mt-4">
                    <OfferNegotiation
                      itemId={item.id}
                      itemTitle={item.title}
                      currentPrice={effectivePrice}
                      currency={item.currency}
                      makerName={item.maker}
                    />
                  </div>
                </div>
              </div>

              {/* Similar Items — below main 2-col grid */}
              {allItems && allItems.length > 1 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <SimilarItems
                    currentItem={item}
                    allItems={allItems}
                    onSelect={() => onClose()}
                  />
                </div>
              )}
              </>
            )}

            {/* ── TAB: REVIEWS ── */}
            {activeTab === 'reviews' && (
              <ReviewsSection
                itemId={item.id}
                itemTitle={item.title}
                makerName={item.maker}
                averageRating={item.rating}
                reviewCount={item.reviewCount}
              />
            )}

            {/* ── TAB: STORY CARD ── */}
            {activeTab === 'story' && (
              <div className="max-w-2xl mx-auto">
                {/* Sacred flag */}
                {item.isSacred && (
                  <div className="flex items-center gap-3 p-4 bg-[#DC143C]/10 border border-[#DC143C]/30 rounded-xl mb-6">
                    <AlertTriangle size={20} className="text-[#DC143C]" />
                    <div>
                      <p className="text-[#DC143C] font-semibold text-sm">Sacred Cultural Item</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        This item carries cultural and spiritual significance. Please treat it with respect.
                      </p>
                    </div>
                  </div>
                )}

                {/* Maker photo */}
                <div className="relative rounded-xl overflow-hidden mb-6 h-48">
                  <img
                    src={item.makerAvatar}
                    alt={`${item.maker} at work`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div>
                      <p className="text-white font-semibold">{item.maker}</p>
                      <p className="text-[#d4af37] text-sm flex items-center gap-1">
                        <MapPin size={12} />
                        {item.nation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Story text */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Quote size={18} className="text-[#d4af37]" />
                    The Maker&apos;s Story
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{item.storyFull}</p>
                </div>

                {/* Elder endorsement */}
                {item.elderEndorsement && (
                  <div className="p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={16} className="text-[#d4af37]" />
                      <span className="text-[#d4af37] text-sm font-semibold">Elder Endorsement</span>
                    </div>
                    <p className="text-gray-300 text-sm italic">&ldquo;{item.elderEndorsement}&rdquo;</p>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: SHIPPING & HUB ── */}
            {activeTab === 'shipping' && (
              <div className="max-w-lg mx-auto">
                <HubShippingWidget
                  hubName={item.hubName}
                  hubCity={item.hubCity}
                  hubOnline={item.hubOnline}
                  shipsInternational={item.shipsInternational}
                />
              </div>
            )}

            {/* ── TAB: PROVENANCE ── */}
            {activeTab === 'provenance' && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                  <Shield size={20} className="text-[#d4af37]" />
                  <h3 className="text-white font-bold text-lg">Cultural Provenance</h3>
                </div>

                {/* Certificate rows */}
                <div className="space-y-3 mb-6">
                  {[
                    { label: 'Nation / Community', value: item.nation },
                    { label: 'Maker', value: item.maker },
                    { label: 'Certification Number', value: item.certificationNumber },
                    { label: 'Category', value: item.category },
                    { label: 'Sacred Status', value: item.isSacred ? 'Sacred Item' : 'Non-Sacred' },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-[#d4af37]/10"
                    >
                      <span className="text-gray-400 text-sm">{label}</span>
                      <span className={`text-sm font-medium ${
                        label === 'Sacred Status' && item.isSacred ? 'text-[#DC143C]' : 'text-white'
                      }`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Elder endorsement */}
                {item.elderEndorsement && (
                  <div className="p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={16} className="text-[#d4af37]" />
                      <span className="text-[#d4af37] text-sm font-semibold">Elder Endorsement</span>
                    </div>
                    <p className="text-gray-300 text-sm italic">&ldquo;{item.elderEndorsement}&rdquo;</p>
                  </div>
                )}

                {/* On-chain anchors */}
                <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#d4af37]/10">
                  <p className="text-[#d4af37] text-sm font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle size={14} />
                    Authenticity Anchored On-Chain
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">XRPL Tx ID</span>
                      <span className="text-gray-300 text-xs font-mono truncate max-w-[200px]">{item.xrplTxId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">IPFS Hash</span>
                      <span className="text-gray-300 text-xs font-mono truncate max-w-[200px]">{item.ipfsHash}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#d4af37]/10 flex items-center gap-2 text-xs text-gray-500">
                    <Hash size={12} />
                    Verified by Indigena Market Cultural Certification Program
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maker Mini Card */}
      {showMakerCard && (
        <ArtistMiniCard
          name={item.maker}
          nation={item.nation}
          isVerified={item.isVerified}
          onClose={() => setShowMakerCard(false)}
        />
      )}

      {/* Ask Maker Chat */}
      {showAskMaker && (
        <AskMakerChat
          makerName={item.maker}
          makerAvatar={item.makerAvatar}
          nation={item.nation}
          itemTitle={item.title}
          onClose={() => setShowAskMaker(false)}
        />
      )}

      {/* Custom Order Form */}
      {showCustomOrder && (
        <CustomOrderForm
          makerName={item.maker}
          category={item.category}
          basePrice={item.price}
          currency={item.currency}
          onClose={() => setShowCustomOrder(false)}
        />
      )}

      {/* Sacred Item Gate */}
      {showSacredGate && (
        <SacredItemGate
          itemTitle={item.title}
          makerName={item.maker}
          nation={item.nation}
          onConfirm={() => { setSacredGatePassed(true); setShowSacredGate(false); handleAddToCart(); }}
          onCancel={() => setShowSacredGate(false)}
        />
      )}
    </>
  );
}
