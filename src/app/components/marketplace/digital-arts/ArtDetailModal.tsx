'use client';

import { useState } from 'react';
import { 
  X, Heart, Share2, Flag, Clock, Gavel, ShoppingCart, 
  Verified, Globe, Palette, Brush, Layers, History,
  ChevronLeft, ChevronRight, User,
  Shield, CheckCircle, AlertTriangle, Tag, RefreshCw,
  Wallet, Loader2, QrCode, ArrowUpRight
} from 'lucide-react';
import ArtistMiniCard from './ArtistMiniCard';

interface Artwork {
  id: string;
  title: string;
  creator: string;
  creatorAvatar?: string;
  creatorBio?: string;
  price: number;
  currency: string;
  image: string;
  likes: number;
  views: number;
  isVerified: boolean;
  isAuction: boolean;
  currentBid?: number;
  auctionEnds?: string;
  nation: string;
  style: string;
  medium: string;
  edition: string;
  description?: string;
  story?: string;
  createdAt?: string;
  // Cultural provenance fields
  clanPermission?: string;
  elderEndorsement?: string;
  isSacred?: boolean;
  culturalProtocol?: string;
  ipfsHash?: string;
  xrplTxId?: string;
}

interface ArtDetailModalProps {
  artwork: Artwork;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  onBuy?: (id: string) => Promise<void> | void;
  onBid?: (id: string, amount: number) => Promise<void> | void;
}

export default function ArtDetailModal({ 
  artwork, 
  isOpen, 
  onClose,
  onLike,
  onShare,
  onBuy,
  onBid
}: ArtDetailModalProps) {
  type TabType = 'details' | 'provenance' | 'history' | 'offers' | 'resale';
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [bidAmount, setBidAmount] = useState(artwork.currentBid ? artwork.currentBid + 10 : artwork.price + 10);
  const [isLiked, setIsLiked] = useState(false);
  // Artist mini-card
  const [showArtistCard, setShowArtistCard] = useState(false);
  // XRPL transaction state
  type TxState = 'idle' | 'connecting' | 'qr' | 'signing' | 'success' | 'error';
  const [txState, setTxState] = useState<TxState>('idle');
  const [txHash, setTxHash] = useState('');
  // Resale listing state
  const [isOwned] = useState(false); // would come from wallet check in production
  const [resalePrice, setResalePrice] = useState(artwork.price);
  const [royaltyNote] = useState(10); // 10% creator royalty on resales
  const [listingState, setListingState] = useState<'idle' | 'listed' | 'loading'>('idle');

  if (!isOpen) return null;

  // ── XRPL transaction stub ──────────────────────────────────────────────────
  async function initiateXrplTransaction(type: 'buy' | 'bid', amount: number) {
    try {
      setTxState('connecting');
      setTxHash('');
      if (type === 'buy') {
        await onBuy?.(artwork.id);
      } else {
        await onBid?.(artwork.id, amount);
      }
      setTxHash(`TX_${type.toUpperCase()}_${artwork.id}_${Date.now().toString(36).toUpperCase()}`);
      setTxState('success');
    } catch {
      setTxState('error');
    }
  }

  function resetTx() { setTxState('idle'); setTxHash(''); }

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(artwork.id);
  };

  const handleShare = () => {
    onShare?.(artwork.id);
  };

  const handleBuy = () => {
    initiateXrplTransaction('buy', artwork.price);
  };

  const handleBid = () => {
    initiateXrplTransaction('bid', bidAmount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl my-4 bg-[#141414] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Close Button - Fixed position */}
        <button 
          onClick={onClose}
          className="fixed top-6 right-6 z-[60] w-12 h-12 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors border border-white/20"
        >
          <X size={24} />
        </button>

        {/* Image Section */}
        <div className="relative w-full md:w-1/2 bg-[#0a0a0a] flex items-center justify-center p-4 min-h-[300px] md:min-h-[500px]">
          <img 
            src={artwork.image}
            alt={artwork.title}
            className="max-w-full max-h-[50vh] md:max-h-[70vh] object-contain rounded-lg"
          />
          
          {/* Image Navigation (if multiple) */}
          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <ChevronRight size={20} />
          </button>

          {/* Edition Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-[#d4af37] text-black text-sm font-semibold rounded-full">
            {artwork.edition}
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 flex flex-col max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-[#d4af37]/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{artwork.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full">
                    {artwork.nation}
                  </span>
                  <span className="px-2 py-1 bg-[#DC143C]/10 text-[#DC143C] text-xs rounded-full">
                    {artwork.style}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleLike}
                  className={`p-2 rounded-full transition-colors ${
                    isLiked ? 'bg-[#DC143C] text-white' : 'bg-[#0a0a0a] text-gray-400 hover:text-[#DC143C]'
                  }`}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 bg-[#0a0a0a] rounded-full text-gray-400 hover:text-[#d4af37] transition-colors"
                >
                  <Share2 size={20} />
                </button>
                <button className="p-2 bg-[#0a0a0a] rounded-full text-gray-400 hover:text-white transition-colors">
                  <Flag size={20} />
                </button>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-xl">
              <button
                onClick={() => setShowArtistCard(true)}
                className="w-12 h-12 bg-[#d4af37]/20 rounded-full flex items-center justify-center hover:bg-[#d4af37]/30 transition-colors flex-shrink-0"
              >
                <User size={24} className="text-[#d4af37]" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowArtistCard(true)}
                    className="text-white font-semibold hover:text-[#d4af37] transition-colors"
                  >
                    {artwork.creator}
                  </button>
                  {artwork.isVerified && (
                    <Verified size={16} className="text-[#d4af37]" />
                  )}
                </div>
                <span className="text-gray-400 text-sm">Digital Artist</span>
              </div>
              <button className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] text-sm font-medium rounded-full hover:bg-[#d4af37]/20 transition-colors">
                Follow
              </button>
            </div>
            {showArtistCard && (
              <ArtistMiniCard
                name={artwork.creator}
                isVerified={artwork.isVerified}
                onClose={() => setShowArtistCard(false)}
              />
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#d4af37]/10 overflow-x-auto">
            {(['details', 'provenance', 'history', 'offers', 'resale'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-3 py-3 text-xs font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? 'text-[#d4af37] border-b-2 border-[#d4af37]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'provenance' ? 'Provenance' : tab === 'resale' ? 'Resale' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Cultural Story */}
                <div>
                  <h3 className="text-white font-semibold mb-2">Cultural Significance</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {artwork.story || `This ${artwork.style.toLowerCase()} artwork draws inspiration from traditional ${artwork.nation} symbolism and cultural motifs. The artist has woven ancestral stories into a contemporary digital medium, preserving heritage while embracing modern expression.`}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                      <Globe size={14} />
                      Nation/Tribe
                    </div>
                    <span className="text-white font-medium">{artwork.nation}</span>
                  </div>
                  <div className="p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                      <Palette size={14} />
                      Style
                    </div>
                    <span className="text-white font-medium">{artwork.style}</span>
                  </div>
                  <div className="p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                      <Brush size={14} />
                      Medium
                    </div>
                    <span className="text-white font-medium">{artwork.medium}</span>
                  </div>
                  <div className="p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                      <Layers size={14} />
                      Edition
                    </div>
                    <span className="text-white font-medium">{artwork.edition}</span>
                  </div>
                </div>

                {/* Views & Likes */}
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span>{artwork.views.toLocaleString()} views</span>
                  <span>{artwork.likes.toLocaleString()} likes</span>
                  <span>Minted on XRPL</span>
                </div>
              </div>
            )}

            {/* ── CULTURAL PROVENANCE TAB ─────────────────────────────────── */}
            {activeTab === 'provenance' && (
              <div className="space-y-4">
                {/* Certificate header */}
                <div className="flex items-center gap-3 p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl">
                  <Shield size={28} className="text-[#d4af37] flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">Certificate of Authenticity</p>
                    <p className="text-gray-400 text-xs">Verified on-chain · Issued by Indigena Market</p>
                  </div>
                  <CheckCircle size={18} className="text-green-400 ml-auto flex-shrink-0" />
                </div>

                {/* Sacred flag */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                  artwork.isSacred
                    ? 'bg-[#DC143C]/10 border-[#DC143C]/30'
                    : 'bg-[#0a0a0a] border-[#d4af37]/10'
                }`}>
                  {artwork.isSacred
                    ? <AlertTriangle size={16} className="text-[#DC143C]" />
                    : <CheckCircle size={16} className="text-green-400" />}
                  <div>
                    <p className="text-white text-sm font-medium">
                      {artwork.isSacred ? 'Ceremonially Sensitive Content' : 'Non-Sacred — Open for Trade'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {artwork.isSacred
                        ? 'This artwork contains sacred cultural elements. Display and resale require consent.'
                        : 'This artwork has been cleared for open commercial exchange by the artist and community.'}
                    </p>
                  </div>
                </div>

                {/* Provenance grid */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Globe size={14} className="text-[#d4af37]" />
                      Nation / Community
                    </div>
                    <span className="text-white font-medium text-sm">{artwork.nation}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Shield size={14} className="text-[#d4af37]" />
                      Clan Permission
                    </div>
                    <span className="text-white font-medium text-sm">
                      {artwork.clanPermission || 'Granted by Bear Clan Council'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Verified size={14} className="text-[#d4af37]" />
                      Elder Endorsement
                    </div>
                    <span className="text-white font-medium text-sm">
                      {artwork.elderEndorsement || 'Elder Maria Swiftwind'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Tag size={14} className="text-[#d4af37]" />
                      Cultural Protocol
                    </div>
                    <span className="text-white font-medium text-sm">
                      {artwork.culturalProtocol || 'Standard IP Agreement v2'}
                    </span>
                  </div>
                </div>

                {/* On-chain anchors */}
                <div className="p-3 bg-[#0a0a0a] rounded-lg space-y-2">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">On-Chain Record</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">XRPL Tx ID</span>
                    <span className="text-[#d4af37] text-xs font-mono truncate max-w-[160px]">
                      {artwork.xrplTxId || `XRPL_${artwork.id}_PENDING`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">IPFS Metadata</span>
                    <span className="text-[#d4af37] text-xs font-mono truncate max-w-[160px]">
                      {artwork.ipfsHash || `Qm${artwork.id}abc...def`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg">
                  <History size={16} className="text-[#d4af37]" />
                  <div className="flex-1">
                    <p className="text-white text-sm">Minted</p>
                    <p className="text-gray-400 text-xs">{artwork.createdAt || '2 days ago'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg">
                  <ShoppingCart size={16} className="text-[#d4af37]" />
                  <div className="flex-1">
                    <p className="text-white text-sm">Listed for sale</p>
                    <p className="text-gray-400 text-xs">1 day ago</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <div className="text-center py-8">
                <p className="text-gray-400">No offers yet</p>
                <p className="text-gray-500 text-sm mt-1">Be the first to make an offer</p>
              </div>
            )}

            {/* ── RESALE / SECONDARY MARKET TAB ─────────────────────────── */}
            {activeTab === 'resale' && (
              <div className="space-y-4">
                {isOwned ? (
                  <>
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <p className="text-green-400 font-semibold text-sm">You own this artwork</p>
                      <p className="text-gray-400 text-xs mt-1">List it on the secondary market below.</p>
                    </div>

                    {/* Royalty notice */}
                    <div className="flex items-start gap-3 p-3 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-lg">
                      <RefreshCw size={14} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
                      <p className="text-gray-400 text-xs">
                        <span className="text-[#d4af37] font-semibold">{royaltyNote}% creator royalty</span> will be sent to {artwork.creator} automatically on every resale via XRPL.
                      </p>
                    </div>

                    {/* Set resale price */}
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Your Listing Price ({artwork.currency})</label>
                      <input
                        type="number"
                        value={resalePrice}
                        onChange={e => setResalePrice(Number(e.target.value))}
                        className="w-full bg-[#141414] border border-[#d4af37]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Platform fee: 8% ({(resalePrice * 0.08).toFixed(2)} {artwork.currency})</span>
                        <span>Creator royalty: {(resalePrice * royaltyNote / 100).toFixed(2)} {artwork.currency}</span>
                      </div>
                    </div>

                    <button
                      disabled={listingState === 'loading'}
                      onClick={async () => {
                        setListingState('loading');
                        await new Promise(r => setTimeout(r, 1500));
                        setListingState('listed');
                      }}
                      className="w-full py-3 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {listingState === 'loading'
                        ? <><Loader2 size={16} className="animate-spin" /> Listing...</>
                        : listingState === 'listed'
                        ? <><CheckCircle size={16} /> Listed Successfully!</>
                        : <><Tag size={16} /> List for Resale</>}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <RefreshCw size={32} className="text-gray-600 mx-auto" />
                    <p className="text-gray-400 font-medium">Secondary Market</p>
                    <p className="text-gray-500 text-sm">
                      Purchase this artwork first to list it for resale.
                      All resales automatically pay a <span className="text-[#d4af37]">{royaltyNote}% royalty</span> to the original creator.
                    </p>
                    <div className="mt-4 p-3 bg-[#0a0a0a] rounded-lg text-left space-y-2">
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Resale Economics</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Creator royalty</span>
                        <span className="text-[#d4af37] font-medium">{royaltyNote}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Platform fee</span>
                        <span className="text-white font-medium">8%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">You receive</span>
                        <span className="text-green-400 font-medium">82%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Purchase/Bid Section */}
          <div className="p-6 border-t border-[#d4af37]/10 bg-[#0a0a0a]">

            {/* ── XRPL Transaction overlay ───────────────────────────────── */}
            {txState !== 'idle' && (
              <div className="space-y-4">
                {txState === 'connecting' && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 size={32} className="text-[#d4af37] animate-spin" />
                    <p className="text-white font-medium">Connecting to Xumm Wallet...</p>
                    <p className="text-gray-500 text-xs">Please open your Xumm app</p>
                  </div>
                )}
                {txState === 'qr' && (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="w-28 h-28 bg-white rounded-xl flex items-center justify-center">
                      <QrCode size={80} className="text-black" />
                    </div>
                    <p className="text-white font-medium text-sm">Scan with Xumm to approve</p>
                    <div className="flex items-center gap-2 text-[#d4af37] text-xs">
                      <Loader2 size={12} className="animate-spin" />
                      Waiting for signature...
                    </div>
                  </div>
                )}
                {txState === 'signing' && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Wallet size={32} className="text-[#d4af37]" />
                    <p className="text-white font-medium">Broadcasting to XRPL...</p>
                    <Loader2 size={20} className="text-[#d4af37] animate-spin" />
                  </div>
                )}
                {txState === 'success' && (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <CheckCircle size={40} className="text-green-400" />
                    <p className="text-white font-bold">Transaction Confirmed!</p>
                    <div className="flex items-center gap-2 p-2 bg-[#141414] rounded-lg w-full">
                      <ArrowUpRight size={14} className="text-[#d4af37] flex-shrink-0" />
                      <span className="text-[#d4af37] text-xs font-mono truncate">{txHash}</span>
                    </div>
                    <button onClick={resetTx} className="text-gray-400 text-sm hover:text-white transition-colors">
                      Close
                    </button>
                  </div>
                )}
                {txState === 'error' && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <AlertTriangle size={32} className="text-[#DC143C]" />
                    <p className="text-white font-medium">Transaction Failed</p>
                    <button onClick={resetTx} className="px-4 py-2 bg-[#141414] border border-[#d4af37]/30 rounded-lg text-[#d4af37] text-sm hover:bg-[#d4af37]/10 transition-colors">
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}

            {txState === 'idle' && (
              artwork.isAuction ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Current Bid</p>
                      <p className="text-2xl font-bold text-[#d4af37]">{artwork.currentBid} {artwork.currency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Auction Ends</p>
                      <div className="flex items-center gap-1 text-[#DC143C]">
                        <Clock size={16} />
                        <span className="font-medium">{artwork.auctionEnds}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="flex-1 bg-[#141414] border border-[#d4af37]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                      placeholder="Enter bid amount"
                    />
                    <button 
                      onClick={handleBid}
                      className="px-6 py-3 bg-[#DC143C] text-white font-semibold rounded-lg hover:bg-[#ff1a1a] transition-colors flex items-center gap-2"
                    >
                      <Gavel size={18} />
                      Place Bid
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs text-center">
                    Signing via <span className="text-[#d4af37]">Xumm</span> · XRPL NFT Offer
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Price</p>
                      <p className="text-2xl font-bold text-white">{artwork.price} {artwork.currency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Platform Fee</p>
                      <p className="text-sm text-gray-500">8% ({(artwork.price * 0.08).toFixed(2)} {artwork.currency})</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleBuy}
                    className="w-full py-3 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2"
                  >
                    <Wallet size={18} />
                    Buy with Xumm
                  </button>
                  <button className="w-full py-3 bg-[#141414] text-[#d4af37] font-semibold rounded-lg border border-[#d4af37]/30 hover:border-[#d4af37] transition-colors">
                    Make Offer
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



