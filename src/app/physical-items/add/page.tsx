'use client';

import React, { Suspense, useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Package, Upload,
  Globe, Shield, DollarSign, Eye, Send, Sparkles,
  Image as ImageIcon, X, ChevronDown, Info, Star,
  Gavel, ShoppingCart, Lock, Users, Crown, AlertCircle,
  ExternalLink, Ruler, Weight, Wifi, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import SimpleModeDock from '@/app/components/SimpleModeDock';
import VoiceInputButton from '@/app/components/VoiceInputButton';
import CommunityStorefrontBanner from '@/app/components/community/CommunityStorefrontBanner';
import { resolveCurrentCreatorProfileSlug } from '@/app/lib/accountAuthClient';
import { appendAccountSlugToHref } from '@/app/lib/communityStorefrontState';
import { assertLegacyListingPublishAllowed, fetchPublicProfile, updateProfileOffering } from '@/app/lib/profileApi';
import type { ProfileOffering } from '@/app/profile/data/profileShowcase';

// ── 15 Category definitions ────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'carving_sculpture', name: 'Carving & Sculpture', icon: 'Wood',
    subcategories: ['Wood Carving', 'Stone Carving', 'Ivory/Bone Carving', 'Antler/Horn Carving', 'Totem Pole Carving', 'Mask Making', 'Miniature Carving', 'Relief Carving']
  },
  {
    id: 'pottery_ceramics', name: 'Pottery & Ceramics', icon: 'Pottery',
    subcategories: ['Traditional Coil Pottery', 'Sculptural Ceramics', 'Functional Pottery', 'Raku Firing', 'Pit Firing', 'Clay Vessels', 'Ceramic Jewelry', 'Tile Making']
  },
  {
    id: 'textiles_weaving', name: 'Textiles & Weaving', icon: 'Textile',
    subcategories: ['Traditional Weaving', 'Basket Weaving', 'Blanket Making', 'Rug Weaving', 'Fiber Art', 'Natural Dyeing', 'Finger Weaving', 'Tapestry']
  },
  {
    id: 'jewelry', name: 'Jewelry Making', icon: 'Jewelry',
    subcategories: ['Beadwork Jewelry', 'Silver Smithing', 'Gold Smithing', 'Shell Jewelry', 'Seed Bead Embroidery', 'Copper/Brass Work', 'Stone Setting', 'Earrings/Pendants']
  },
  {
    id: 'basketry', name: 'Basketry', icon: 'Basket',
    subcategories: ['Coiled Basketry', 'Twined Basketry', 'Plaiting', 'Utility Baskets', 'Feast Bowls', 'Miniature Baskets', 'Basketry Trays', 'Basketry Hats']
  },
  {
    id: 'leatherwork', name: 'Leatherwork & Hide Tanning', icon: 'Hide',
    subcategories: ['Hide Tanning', 'Leather Crafting', 'Moccasin Making', 'Clothing Construction', 'Tooled Leather', 'Rawhide Work', 'Fur Work', 'Painted Hides']
  },
  {
    id: 'featherwork', name: 'Featherwork', icon: 'Feather',
    subcategories: ['War Bonnets', 'Feather Fans', 'Regalia Feathers', 'Feather Jewelry', 'Feather Painting', 'Hawaiian Featherwork', 'Andean Featherwork', 'Amazonian Headdresses']
  },
  {
    id: 'beadwork_embroidery', name: 'Beadwork & Embroidery', icon: 'Beadwork',
    subcategories: ['Loom Beadwork', 'Applique Beadwork', '3D Beaded Figures', 'Beaded Jewelry', 'Embroidered Textiles', 'Beaded Medallions', 'Beaded Cuffs/Collars', 'Regalia Beadwork']
  },
  {
    id: 'masks_regalia', name: 'Masks & Regalia', icon: 'Mask',
    subcategories: ['Ceremonial Masks', 'Transformation Masks', 'Dance Regalia', 'Headdresses', 'Rattles', 'Staffs/Wands', 'Breastplates', 'Leg/Arm Bands']
  },
  {
    id: 'musical_instruments', name: 'Musical Instruments', icon: 'Music',
    subcategories: ['Drum Making', 'Flute Making', 'Rattles', 'Bullroarers', 'Didgeridoo', 'Rainsticks', 'Clapsticks', 'Stringed Instruments']
  },
  {
    id: 'painting_surfaces', name: 'Painting on Traditional Surfaces', icon: 'Paint',
    subcategories: ['Hide Painting', 'Bark Painting', 'Rock Art Reproduction', 'Sand Painting', 'Paddle Painting', 'Shield Painting', 'Body Painting', 'Painted Pottery']
  },
  {
    id: 'quillwork', name: 'Quillwork & Porcupine Work', icon: 'Quill',
    subcategories: ['Quill Boxes', 'Quill Embroidery', 'Quill Jewelry', 'Quill Wrapped Items', 'Dyed Quillwork', 'Quill Box Lids', 'Quill Medallions']
  },
  {
    id: 'ceremonial_sacred', name: 'Ceremonial & Sacred Objects', icon: 'Sacred',
    subcategories: ['Prayer Feathers', 'Talking Sticks', 'Ceremonial Pipes', 'Smudge Bowls', 'Prayer Ties', 'Spirit Figures', 'Dreamcatchers', 'Medicine Bundles']
  },
  {
    id: 'tools_utensils', name: 'Tools & Utensils', icon: 'Tools',
    subcategories: ['Traditional Knives', 'Bow Making', 'Arrow Making', 'Adzes/Axes', 'Cooking Utensils', 'Baby Carriers', 'Food Preparation Tools', 'Water Containers']
  },
  {
    id: 'contemporary_fusion', name: 'Contemporary Fusion', icon: 'Contemporary',
    subcategories: ['Mixed Media Sculpture', 'Contemporary Ceramics', 'Fashion Design', 'Installation Art', 'Functional Art', 'Repurposed Materials Art', 'Digital Fabrication', 'Contemporary Regalia']
  },
];

const NATIONS = [
  'Lakota', 'Navajo', 'Haida', 'Cree', 'Ojibwe', 'Hopi', 'Cherokee', 'Anishinaabe',
  'Blackfoot', 'Mohawk', 'Karuk', 'Maori', 'Haudenosaunee', 'Inuit', 'Sami',
  'Dene', 'Metis', 'Coast Salish', 'Tlingit', 'Tsimshian', 'Secwepemc',
  'Wiradjuri', 'Arrernte', 'Yolngu', 'Kaurna', 'Mapuche', 'Quechua', 'Aymara',
  'Tsou', 'Wajapi', 'Girramay', 'Yup\'ik', 'Other / Prefer not to say'
];

const MATERIALS_SUGGESTIONS = [
  'Birchbark', 'Cedar', 'Pine', 'Oak', 'Walnut', 'Soapstone', 'Serpentine', 'Turquoise',
  'Abalone Shell', 'Porcupine Quills', 'Deer Hide', 'Elk Hide', 'Buffalo Hide', 'Moose Hide',
  'Sterling Silver', 'Copper', 'Brass', 'Gold', 'Glass Beads', 'Seed Beads',
  'Natural Dyes', 'Wool', 'Cotton', 'Linen', 'Sinew', 'Hemp',
  'Eagle Feathers (ethically sourced)', 'Hawk Feathers', 'Clay', 'Glaze',
  'Rawhide', 'Antler', 'Bone', 'Ivory (sustainable)', 'Bamboo', 'Rattan',
];

const TK_LABELS = [
  { id: 'none', label: 'No TK Label', desc: 'No traditional knowledge restrictions' },
  { id: 'tk_attribution', label: 'TK Attribution', desc: 'Acknowledge Traditional Knowledge origins' },
  { id: 'tk_non_commercial', label: 'TK Non-Commercial', desc: 'Free for non-commercial use only' },
  { id: 'tk_community_use', label: 'TK Community Use Only', desc: 'Restricted to community members' },
  { id: 'tk_seasonal', label: 'TK Seasonal', desc: 'Appropriate only during certain seasons' },
  { id: 'tk_secret_sacred', label: 'TK Secret/Sacred', desc: 'Secret or sacred - restricted access' },
];

// Form types
interface ItemForm {
  // Step 1
  categoryId: string;
  subcategory: string;
  listingType: 'instant' | 'auction' | 'commission' | 'reserved';
  // Step 2
  title: string;
  description: string;
  price: string;
  startingBid: string;
  buyNowPrice: string;
  currency: 'INDI' | 'XRP' | 'USD';
  stockCount: string;
  tags: string[];
  tagInput: string;
  // Step 3
  imageUrls: string[];
  imageInput: string;
  videoUrl: string;
  height: string;
  width: string;
  depth: string;
  dimensionUnit: 'cm' | 'in';
  weight: string;
  weightUnit: 'kg' | 'g' | 'lb' | 'oz';
  yearCreated: string;
  materials: string[];
  materialInput: string;
  techniques: string[];
  techniqueInput: string;
  shipsInternational: boolean;
  shipsFrom: string;
  nfcTagId: string;
  // Step 4 — Cultural
  nation: string;
  language: string;
  tkLabel: string;
  sacredStatus: 'public' | 'community' | 'restricted' | 'sacred';
  isSacred: boolean;
  storyContext: string;
  elderEndorsed: boolean;
  communityConsent: boolean;
  certificationNumber: string;
}

const defaultForm: ItemForm = {
  categoryId: '', subcategory: '', listingType: 'instant',
  title: '', description: '', price: '', startingBid: '', buyNowPrice: '',
  currency: 'INDI', stockCount: '1', tags: [], tagInput: '',
  imageUrls: [], imageInput: '', videoUrl: '',
  height: '', width: '', depth: '', dimensionUnit: 'cm',
  weight: '', weightUnit: 'kg', yearCreated: '',
  materials: [], materialInput: '', techniques: [], techniqueInput: '',
  shipsInternational: true, shipsFrom: '', nfcTagId: '',
  nation: '', language: '', tkLabel: 'none',
  sacredStatus: 'public', isSacred: false,
  storyContext: '', elderEndorsed: false, communityConsent: false,
  certificationNumber: '',
};

const STEPS = [
  { num: 1, label: 'Category' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'Physical' },
  { num: 4, label: 'Cultural' },
  { num: 5, label: 'Review' },
];

// ── Step bar ────────────────────────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              current > step.num ? 'bg-[#d4af37] text-black' :
              current === step.num ? 'bg-[#d4af37]/20 border-2 border-[#d4af37] text-[#d4af37]' :
              'bg-white/5 border border-white/10 text-gray-500'
            }`}>
              {current > step.num ? <Check size={16} /> : step.num}
            </div>
            <span className={`text-xs font-medium ${current === step.num ? 'text-[#d4af37]' : 'text-gray-500'}`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-5 transition-all ${current > step.num ? 'bg-[#d4af37]/50' : 'bg-white/10'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Step 1: Category ────────────────────────────────────────────────────────
function Step1({ form, update, simpleMode = false }: { form: ItemForm; update: (k: Partial<ItemForm>) => void; simpleMode?: boolean }) {
  const selected = CATEGORIES.find(c => c.id === form.categoryId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">{simpleMode ? 'What are you sharing?' : 'What are you listing?'}</h2>
        <p className="text-gray-400 text-sm">{simpleMode ? 'Choose the craft.' : 'Choose the craft category that best describes your handmade item.'}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => update({ categoryId: cat.id, subcategory: '' })}
            className={`rounded-2xl border transition-all hover:border-[#d4af37]/50 ${
              form.categoryId === cat.id ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/10 bg-[#141414]'
            } ${simpleMode ? 'min-h-[104px] p-4 text-center' : 'p-3 text-left'}`}
          >
            <div className={`${simpleMode ? 'text-lg mb-2 text-[#d4af37]' : 'text-xl mb-1'}`}>{cat.icon}</div>
            <p className={`${simpleMode ? 'text-sm font-semibold leading-tight' : 'text-xs font-medium leading-tight'} ${form.categoryId === cat.id ? 'text-[#d4af37]' : 'text-gray-300'}`}>
              {cat.name}
            </p>
          </button>
        ))}
      </div>

      {selected && (
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
            Specific Craft <span className="text-[#DC143C]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {selected.subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => update({ subcategory: sub })}
                className={`px-3 py-2 rounded-lg border text-left text-sm transition-all ${
                  form.subcategory === sub
                    ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]'
                    : 'border-white/10 bg-[#0a0a0a] text-gray-300 hover:border-white/30'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {form.subcategory && (
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
            {simpleMode ? 'How do people get it?' : 'Listing Type'} <span className="text-[#DC143C]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: 'instant',    label: 'Buy Now',       icon: ShoppingCart, desc: 'Fixed price, buy immediately' },
              { id: 'auction',    label: 'Auction',        icon: Gavel,        desc: 'Bidding — highest offer wins' },
              { id: 'commission', label: 'Commission',     icon: Package,      desc: 'Clients request a custom piece' },
              { id: 'reserved',   label: 'Reserved / POA', icon: Lock,         desc: 'Price on application / reserved' },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => update({ listingType: t.id })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  form.listingType === t.id ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/10 bg-[#141414] hover:border-white/20'
                }`}
              >
                <t.icon size={20} className={form.listingType === t.id ? 'text-[#d4af37]' : 'text-gray-400'} />
                <p className={`font-semibold text-sm mt-2 ${form.listingType === t.id ? 'text-[#d4af37]' : 'text-white'}`}>{t.label}</p>
                <p className="text-gray-500 text-xs mt-1">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sacred Objects notice */}
      {form.categoryId === 'ceremonial_sacred' && (
        <div className="flex items-start gap-3 p-4 bg-[#DC143C]/5 border border-[#DC143C]/20 rounded-xl">
          <Shield size={18} className="text-[#DC143C] mt-0.5 flex-shrink-0" />
          <p className="text-gray-300 text-sm">
            <span className="text-[#DC143C] font-semibold">Sacred Objects Protocol: </span>
            Items in this category require Elder Digital Signature verification before listing goes live. You will be guided through this on the cultural context step.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Listing Details ─────────────────────────────────────────────────
function Step2({ form, update, simpleMode = false }: { form: ItemForm; update: (k: Partial<ItemForm>) => void; simpleMode?: boolean }) {
  const addTag = () => {
    const t = form.tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      update({ tags: [...form.tags, t], tagInput: '' });
    }
  };

  const pricingReady = form.listingType === 'auction'
    ? !!form.startingBid.trim()
    : form.listingType === 'reserved'
      ? true
      : !!form.price.trim();

  if (simpleMode) {
    return (
      <div className="space-y-4">
        <SimpleQuestionCard step="Question 1" title="What did you make?" detail="Give the item a clear name.">
          <input value={form.title} onChange={e => update({ title: e.target.value })} placeholder="Porcupine quill medicine bag" maxLength={80} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]" />
          <VoiceInputButton label="Say the item name" onTranscript={(transcript) => update({ title: transcript })} />
        </SimpleQuestionCard>

        {form.title.trim() ? (
          <SimpleQuestionCard step="Question 2" title="What should buyers know?" detail="Describe what it is, what it is made from, and why it matters.">
            <textarea value={form.description} onChange={e => update({ description: e.target.value })} placeholder="Tell people about the item, materials, and meaning." rows={4} maxLength={1200} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37] resize-none" />
            <VoiceInputButton label="Say the description" onTranscript={(transcript) => update({ description: transcript })} />
          </SimpleQuestionCard>
        ) : null}

        {form.title.trim() && form.description.trim() ? (
          <SimpleQuestionCard step="Question 3" title="How will it be sold?" detail="Set the price or the auction start.">
            {form.listingType === 'auction' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <input type="number" value={form.startingBid} onChange={e => update({ startingBid: e.target.value })} placeholder="Starting bid" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
                <input type="number" value={form.buyNowPrice} onChange={e => update({ buyNowPrice: e.target.value })} placeholder="Buy now price (optional)" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              </div>
            ) : form.listingType === 'reserved' ? (
              <p className="rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-gray-300">This item will use request pricing. Interested buyers ask first.</p>
            ) : (
              <input type="number" value={form.price} onChange={e => update({ price: e.target.value })} placeholder="Price" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            )}
            <div className="flex gap-2">
              {(['INDI', 'XRP', 'USD'] as const).map(cur => (
                <button key={cur} onClick={() => update({ currency: cur })} className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${form.currency === cur ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-white/20'}`}>{cur}</button>
              ))}
            </div>
          </SimpleQuestionCard>
        ) : null}

        {form.description.trim() && pricingReady ? (
          <SimpleQuestionCard step="Question 4" title="How many are available?" detail="Add stock and search words if you want.">
            {form.listingType === 'instant' ? (
              <input type="number" min={1} value={form.stockCount} onChange={e => update({ stockCount: e.target.value })} placeholder="Quantity in stock" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            ) : null}
            <div className="flex flex-wrap gap-2">
              {form.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs rounded-full">
                  {tag}
                  <button onClick={() => update({ tags: form.tags.filter(t => t !== tag) })}><X size={11} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={form.tagInput} onChange={e => update({ tagInput: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Add a search word" className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              <button onClick={addTag} className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30">Add</button>
            </div>
          </SimpleQuestionCard>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">Listing details</h2>
        <p className="text-gray-400 text-sm">Tell buyers exactly what they&apos;re getting.</p>
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
          Title <span className="text-[#DC143C]">*</span>
        </label>
        <input
          value={form.title}
          onChange={e => update({ title: e.target.value })}
          placeholder="e.g., Lakota Porcupine Quillwork Medicine Bag"
          maxLength={80}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]"
        />
        <p className="text-gray-600 text-xs mt-1 text-right">{form.title.length}/80</p>
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
          Description <span className="text-[#DC143C]">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => update({ description: e.target.value })}
          placeholder="Describe the item — its creation process, materials, cultural significance, and what makes it unique..."
          rows={4}
          maxLength={1200}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37] resize-none"
        />
        <p className="text-gray-600 text-xs mt-1 text-right">{form.description.length}/1200</p>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        {form.listingType === 'auction' ? (
          <>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Starting Bid</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="number" value={form.startingBid} onChange={e => update({ startingBid: e.target.value })}
                  placeholder="100" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Buy Now (optional)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="number" value={form.buyNowPrice} onChange={e => update({ buyNowPrice: e.target.value })}
                  placeholder="1500" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              </div>
            </div>
          </>
        ) : form.listingType === 'reserved' ? (
          <div className="col-span-2 p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-sm">
            Price will be shared with interested buyers on request. Platform fee of 8% applies when sold.
          </div>
        ) : (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
              Price <span className="text-[#DC143C]">*</span>
            </label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="number" value={form.price} onChange={e => update({ price: e.target.value })}
                placeholder="350" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Currency</label>
          <div className="flex gap-2">
            {(['INDI', 'XRP', 'USD'] as const).map(cur => (
              <button key={cur} onClick={() => update({ currency: cur })}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                  form.currency === cur ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-white/20'
                }`}>
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stock */}
      {form.listingType === 'instant' && (
        <div className="w-40">
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Quantity in Stock</label>
          <input type="number" min={1} value={form.stockCount} onChange={e => update({ stockCount: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Tags (up to 10)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs rounded-full">
              {tag}
              <button onClick={() => update({ tags: form.tags.filter(t => t !== tag) })}><X size={11} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={form.tagInput} onChange={e => update({ tagInput: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="e.g. lakota, quillwork, handmade"
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
          <button onClick={addTag} className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30">Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Physical Details ─────────────────────────────────────────────────
function Step3({ form, update, simpleMode = false }: { form: ItemForm; update: (k: Partial<ItemForm>) => void; simpleMode?: boolean }) {
  const addImage = () => {
    const url = form.imageInput.trim();
    if (url && !form.imageUrls.includes(url) && form.imageUrls.length < 8) {
      update({ imageUrls: [...form.imageUrls, url], imageInput: '' });
    }
  };

  const addMaterial = (mat: string) => {
    if (mat && !form.materials.includes(mat)) {
      update({ materials: [...form.materials, mat], materialInput: '' });
    }
  };

  const addTechnique = () => {
    const t = form.techniqueInput.trim();
    if (t && !form.techniques.includes(t)) {
      update({ techniques: [...form.techniques, t], techniqueInput: '' });
    }
  };

  if (simpleMode) {
    return (
      <div className="space-y-4">
        <SimpleQuestionCard step="Question 1" title="Show the item" detail="Add at least one photo. The first one becomes the cover.">
          <div className="flex gap-2">
            <input value={form.imageInput} onChange={e => update({ imageInput: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }} placeholder="Paste photo URL" className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            <button onClick={addImage} className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30">Add</button>
          </div>
          <VoiceInputButton label="Say the photo link" onTranscript={(transcript) => update({ imageInput: transcript })} />
          {form.imageUrls.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {form.imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/10">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </SimpleQuestionCard>

        {form.imageUrls.length > 0 ? (
          <SimpleQuestionCard step="Question 2" title="What size is it?" detail="Add dimensions and weight if you know them.">
            <div className="grid gap-3 md:grid-cols-4">
              <input type="number" value={form.height} onChange={e => update({ height: e.target.value })} placeholder="Height" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              <input type="number" value={form.width} onChange={e => update({ width: e.target.value })} placeholder="Width" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              <input type="number" value={form.depth} onChange={e => update({ depth: e.target.value })} placeholder="Depth" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              <input type="number" value={form.weight} onChange={e => update({ weight: e.target.value })} placeholder="Weight" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            </div>
          </SimpleQuestionCard>
        ) : null}

        {form.imageUrls.length > 0 ? (
          <SimpleQuestionCard step="Question 3" title="What is it made from?" detail="Add materials, techniques, and shipping notes.">
            <div className="flex flex-wrap gap-2">
              {form.materials.map(material => (
                <span key={material} className="px-2.5 py-1 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-xs text-[#d4af37]">{material}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={form.materialInput} onChange={e => update({ materialInput: e.target.value })} placeholder="Material" className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              <button onClick={() => addMaterial(form.materialInput.trim())} className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30">Add</button>
            </div>
            <VoiceInputButton label="Say a material" onTranscript={(transcript) => update({ materialInput: transcript })} />
            <div className="flex gap-2">
              <input value={form.techniqueInput} onChange={e => update({ techniqueInput: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTechnique(); } }} placeholder="Technique" className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              <button onClick={addTechnique} className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30">Add</button>
            </div>
            <VoiceInputButton label="Say a technique" onTranscript={(transcript) => update({ techniqueInput: transcript })} />
            <input value={form.shipsFrom} onChange={e => update({ shipsFrom: e.target.value })} placeholder="Ships from" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            <VoiceInputButton label="Say where it ships from" onTranscript={(transcript) => update({ shipsFrom: transcript })} />
          </SimpleQuestionCard>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">Physical details & media</h2>
        <p className="text-gray-400 text-sm">Photos and physical attributes help buyers trust your item — and enable AR preview.</p>
      </div>

      {/* Images */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
          <ImageIcon size={13} className="inline mr-1.5" />
          Photos (up to 8) — first image is the cover
        </label>
        {form.imageUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {form.imageUrls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/10 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => update({ imageUrls: form.imageUrls.filter((_, idx) => idx !== i) })}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={11} className="text-white" />
                </button>
                {i === 0 && <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[#d4af37] text-black text-xs rounded font-bold">Cover</div>}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input value={form.imageInput} onChange={e => update({ imageInput: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
            placeholder="Paste image URL (IPFS, Cloudinary, Unsplash...)"
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
          <button onClick={addImage} className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30">Add</button>
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
          <Ruler size={13} className="inline mr-1.5" />
          Dimensions
        </label>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <p className="text-gray-600 text-xs mb-1">H</p>
            <input type="number" value={form.height} onChange={e => update({ height: e.target.value })} placeholder="22"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-1">W</p>
            <input type="number" value={form.width} onChange={e => update({ width: e.target.value })} placeholder="18"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-1">D</p>
            <input type="number" value={form.depth} onChange={e => update({ depth: e.target.value })} placeholder="12"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-1">Unit</p>
            <div className="flex gap-1">
              {(['cm', 'in'] as const).map(u => (
                <button key={u} onClick={() => update({ dimensionUnit: u })}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.dimensionUnit === u ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 bg-[#0a0a0a] text-gray-400'
                  }`}>{u}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weight */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
            <Weight size={13} className="inline mr-1.5" />
            Weight
          </label>
          <input type="number" value={form.weight} onChange={e => update({ weight: e.target.value })} placeholder="0.62"
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Unit</label>
          <div className="flex gap-1.5">
            {(['kg', 'g', 'lb', 'oz'] as const).map(u => (
              <button key={u} onClick={() => update({ weightUnit: u })}
                className={`flex-1 py-3 rounded-xl text-xs font-semibold border transition-all ${
                  form.weightUnit === u ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 bg-[#0a0a0a] text-gray-400'
                }`}>{u}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Year & NFC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Year Created</label>
          <input type="number" value={form.yearCreated} onChange={e => update({ yearCreated: e.target.value })} placeholder="2024"
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
            <Wifi size={13} className="inline mr-1.5" />
            NFC Tag ID (optional)
          </label>
          <input value={form.nfcTagId} onChange={e => update({ nfcTagId: e.target.value })} placeholder="ST25DV tag ID"
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
        </div>
      </div>

      {/* Materials */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Materials Used</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {MATERIALS_SUGGESTIONS.map(mat => (
            <button key={mat} onClick={() => addMaterial(mat)}
              className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                form.materials.includes(mat) ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-white/20'
              }`}>
              {mat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input value={form.materialInput} onChange={e => update({ materialInput: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(form.materialInput.trim()); } }}
            placeholder="Add custom material..."
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
          <button onClick={() => addMaterial(form.materialInput.trim())} className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30">Add</button>
        </div>
      </div>

      {/* Techniques */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Techniques</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.techniques.map(t => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs rounded-full">
              {t} <button onClick={() => update({ techniques: form.techniques.filter(x => x !== t) })}><X size={11} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={form.techniqueInput} onChange={e => update({ techniqueInput: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTechnique(); } }}
            placeholder="e.g. brain-tanning, coil-and-weld, natural dyeing"
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
          <button onClick={addTechnique} className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30">Add</button>
        </div>
      </div>

      {/* Shipping */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
            <MapPin size={13} className="inline mr-1.5" />
            Ships From
          </label>
          <input value={form.shipsFrom} onChange={e => update({ shipsFrom: e.target.value })} placeholder="e.g. Navajo Nation, AZ"
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.shipsInternational} onChange={e => update({ shipsInternational: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-[#0a0a0a] text-[#d4af37] focus:ring-[#d4af37]" />
            <span className="text-sm text-gray-300">Ships internationally</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Cultural ─────────────────────────────────────────────────────────
function Step4({ form, update, simpleMode = false }: { form: ItemForm; update: (k: Partial<ItemForm>) => void; simpleMode?: boolean }) {
  const isSacredCategory = form.categoryId === 'ceremonial_sacred';

  if (simpleMode) {
    return (
      <div className="space-y-4">
        <SimpleQuestionCard step="Question 1" title="Who made this and where is it from?" detail="Add your nation or language if you want.">
          <select value={form.nation} onChange={e => update({ nation: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]">
            <option value="">Select your nation / people</option>
            {NATIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <input value={form.language} onChange={e => update({ language: e.target.value })} placeholder="Language (optional)" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
          <VoiceInputButton label="Say the language" onTranscript={(transcript) => update({ language: transcript })} />
        </SimpleQuestionCard>

        {form.nation || form.language ? (
          <SimpleQuestionCard step="Question 2" title="Does it need special protection?" detail="Choose the access level and any knowledge label.">
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'public', label: 'Public' },
                { id: 'community', label: 'Community' },
                { id: 'restricted', label: 'Restricted' },
                { id: 'sacred', label: 'Sacred' }
              ] as const).map(option => (
                <button key={option.id} onClick={() => update({ sacredStatus: option.id, isSacred: option.id === 'sacred' || option.id === 'restricted' })} className={`p-3 rounded-xl border text-sm ${form.sacredStatus === option.id ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 bg-[#0a0a0a] text-gray-300'}`}>
                  {option.label}
                </button>
              ))}
            </div>
            <select value={form.tkLabel} onChange={e => update({ tkLabel: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]">
              {TK_LABELS.map(label => <option key={label.id} value={label.id}>{label.label}</option>)}
            </select>
          </SimpleQuestionCard>
        ) : null}

        {(form.tkLabel !== 'none' || form.sacredStatus !== 'public' || isSacredCategory) ? (
          <SimpleQuestionCard step="Question 3" title="What story or proof should go with it?" detail="Add cultural notes, certification, and your confirmation.">
            <textarea value={form.storyContext} onChange={e => update({ storyContext: e.target.value })} placeholder="Share the story or cultural context (optional)" rows={3} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] resize-none" />
            <VoiceInputButton label="Say the story" onTranscript={(transcript) => update({ storyContext: transcript })} />
            <input value={form.certificationNumber} onChange={e => update({ certificationNumber: e.target.value })} placeholder="Certification number (optional)" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            <VoiceInputButton label="Say the certificate number" onTranscript={(transcript) => update({ certificationNumber: transcript })} />
            <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-300">
              <input type="checkbox" checked={form.communityConsent} onChange={e => update({ communityConsent: e.target.checked })} className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0a0a0a] text-[#d4af37] focus:ring-[#d4af37]" />
              I confirm this item can be shared and sold here.
            </label>
          </SimpleQuestionCard>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">Cultural context & provenance</h2>
        <p className="text-gray-400 text-sm">This information protects your cultural heritage and helps buyers understand what they are collecting.</p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl">
        <Info size={18} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
        <p className="text-gray-300 text-sm">Items with cultural context sell for up to 40% more and receive our verified Indigenous maker badge.</p>
      </div>

      {/* Nation */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Nation / People</label>
        <div className="relative">
          <select value={form.nation} onChange={e => update({ nation: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] appearance-none">
            <option value="">Select your nation / people</option>
            {NATIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Language (optional)</label>
        <input value={form.language} onChange={e => update({ language: e.target.value })} placeholder="e.g. Lakota, Ojibwe, Māori"
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
      </div>

      {/* Sacred Status */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
          <Shield size={13} className="inline mr-1.5" />
          Sacred Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: 'public',     label: 'Public',      icon: Globe,  desc: 'Available to all' },
            { id: 'community',  label: 'Community',   icon: Users,  desc: 'Indigenous community members' },
            { id: 'restricted', label: 'Restricted',  icon: Lock,   desc: 'Protocol approval required' },
            { id: 'sacred',     label: 'Sacred',      icon: Crown,  desc: 'Highest protection — Elder oversight' },
          ] as const).map(s => (
            <button key={s.id} onClick={() => update({ sacredStatus: s.id, isSacred: s.id === 'sacred' || s.id === 'restricted' })}
              className={`p-3 rounded-xl border text-left transition-all ${
                form.sacredStatus === s.id
                  ? s.id === 'sacred' ? 'border-[#DC143C] bg-[#DC143C]/10' : 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-white/10 bg-[#0a0a0a] hover:border-white/20'
              }`}>
              <s.icon size={16} className={form.sacredStatus === s.id ? (s.id === 'sacred' ? 'text-[#DC143C]' : 'text-[#d4af37]') : 'text-gray-500'} />
              <p className={`text-sm font-medium mt-1.5 ${form.sacredStatus === s.id ? (s.id === 'sacred' ? 'text-[#DC143C]' : 'text-[#d4af37]') : 'text-white'}`}>{s.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* TK Label */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Traditional Knowledge Label</label>
        <div className="space-y-2">
          {TK_LABELS.map(label => (
            <button key={label.id} onClick={() => update({ tkLabel: label.id })}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                form.tkLabel === label.id ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/10 bg-[#0a0a0a] hover:border-white/20'
              }`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                form.tkLabel === label.id ? 'border-[#d4af37] bg-[#d4af37]' : 'border-gray-600'
              }`}>
                {form.tkLabel === label.id && <Check size={10} className="text-black" />}
              </div>
              <div>
                <p className={`text-sm font-medium ${form.tkLabel === label.id ? 'text-[#d4af37]' : 'text-white'}`}>{label.label}</p>
                <p className="text-gray-500 text-xs">{label.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Story */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Story & Cultural Context (optional)</label>
        <textarea value={form.storyContext} onChange={e => update({ storyContext: e.target.value })}
          placeholder="Share the story of this piece — its meaning, the traditions behind it, who taught you, what ceremony it belongs to..."
          rows={3} maxLength={600}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37] resize-none" />
        <p className="text-gray-600 text-xs mt-1 text-right">{form.storyContext.length}/600</p>
      </div>

      {/* Certification */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Certification Number (optional)</label>
        <input value={form.certificationNumber} onChange={e => update({ certificationNumber: e.target.value })}
          placeholder="e.g. NAV-2024-BW-0042"
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
      </div>

      {/* Sacred objects — Elder signature notice */}
      {(isSacredCategory || form.sacredStatus === 'sacred') && (
        <div className="flex items-start gap-3 p-4 bg-[#DC143C]/5 border border-[#DC143C]/20 rounded-xl">
          <Crown size={18} className="text-[#DC143C] mt-0.5 flex-shrink-0" />
          <p className="text-gray-300 text-sm">
            <span className="text-[#DC143C] font-semibold">Elder Digital Signature Required. </span>
            This listing will remain pending until verified by a registered Elder on the platform. You will receive a verification request link after publishing.
          </p>
        </div>
      )}

      {/* Consent checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={form.communityConsent} onChange={e => update({ communityConsent: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0a0a0a] text-[#d4af37] focus:ring-[#d4af37]" />
          <span className="text-sm text-gray-300">I confirm this item was created by me, is authentic, and its sale does not violate my community&apos;s cultural protocols.</span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={form.elderEndorsed} onChange={e => update({ elderEndorsed: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0a0a0a] text-[#d4af37] focus:ring-[#d4af37]" />
          <span className="text-sm text-gray-300 flex items-center gap-1.5">
            <Star size={13} className="text-[#d4af37]" /> Elder-endorsed — an elder has reviewed and approved this item for sale.
          </span>
        </label>
      </div>
    </div>
  );
}

// ── Step 5: Review ───────────────────────────────────────────────────────────
function Step5({ form, simpleMode = false }: { form: ItemForm; simpleMode?: boolean }) {
  const cat = CATEGORIES.find(c => c.id === form.categoryId);
  const tkLabel = TK_LABELS.find(t => t.id === form.tkLabel);
  const price = form.listingType === 'auction' ? form.startingBid : form.price;
  const platformFee = price ? (Number(price) * 0.08).toFixed(2) : '0';
  const youReceive = price ? (Number(price) * 0.92).toFixed(2) : '0';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">{simpleMode ? 'Check your page' : 'Review your listing'}</h2>
        <p className="text-gray-400 text-sm">{simpleMode ? 'Check it once, then go live.' : 'Everything look good? Hit Publish when ready.'}</p>
      </div>

      <div className="space-y-3">
        {/* Category */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Category</p>
          <div className="flex items-center gap-2">
            <span className="text-xl">{cat?.icon}</span>
            <div>
              <p className="text-white font-medium text-sm">{cat?.name}</p>
              <p className="text-gray-400 text-xs">{form.subcategory} · {form.listingType.charAt(0).toUpperCase() + form.listingType.slice(1)}</p>
            </div>
          </div>
        </div>

        {/* Title & desc */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Listing</p>
          <p className="text-white font-semibold">{form.title || <span className="text-gray-600 italic">No title</span>}</p>
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{form.description || <span className="text-gray-600 italic">No description</span>}</p>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.tags.map(t => <span key={t} className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-full">{t}</span>)}
            </div>
          )}
        </div>

        {/* Physical */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Physical Details</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {(form.height || form.width) && (
              <span className="text-gray-300">{form.height}×{form.width}{form.depth ? `×${form.depth}` : ''} {form.dimensionUnit}</span>
            )}
            {form.weight && <span className="text-gray-300">{form.weight} {form.weightUnit}</span>}
            {form.yearCreated && <span className="text-gray-300">Made {form.yearCreated}</span>}
          </div>
          {form.materials.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.materials.map(m => <span key={m} className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-full">{m}</span>)}
            </div>
          )}
        </div>

        {/* Pricing */}
        {price && (
          <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Pricing</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Listed price</span><span className="text-white font-semibold">{price} {form.currency}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Platform fee (8%)</span><span className="text-[#DC143C]">– {platformFee} {form.currency}</span></div>
              <div className="flex justify-between pt-2 border-t border-white/5"><span className="text-white font-semibold">You receive</span><span className="text-[#d4af37] font-bold">{youReceive} {form.currency}</span></div>
            </div>
          </div>
        )}

        {/* Images */}
        {form.imageUrls.length > 0 && (
          <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Photos</p>
            <div className="flex gap-2">
              {form.imageUrls.slice(0, 4).map((url, i) => (
                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {form.imageUrls.length > 4 && (
                <div className="w-16 h-16 rounded-lg bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-gray-500 text-xs">+{form.imageUrls.length - 4}</div>
              )}
            </div>
          </div>
        )}

        {/* Cultural */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Cultural Context</p>
          <div className="flex flex-wrap gap-2">
            {form.nation && <span className="px-2.5 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full border border-[#d4af37]/20">{form.nation}</span>}
            <span className={`px-2.5 py-1 text-xs rounded-full border ${form.sacredStatus === 'sacred' ? 'bg-[#DC143C]/10 text-[#DC143C] border-[#DC143C]/20' : 'bg-white/5 text-gray-300 border-white/10'}`}>{form.sacredStatus}</span>
            {tkLabel && tkLabel.id !== 'none' && <span className="px-2.5 py-1 bg-white/5 text-gray-300 text-xs rounded-full border border-white/10">{tkLabel.label}</span>}
            {form.elderEndorsed && <span className="flex items-center gap-1 px-2.5 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full border border-[#d4af37]/20"><Star size={10} /> Elder Endorsed</span>}
            {form.nfcTagId && <span className="flex items-center gap-1 px-2.5 py-1 bg-white/5 text-gray-300 text-xs rounded-full"><Wifi size={10} /> NFC Tagged</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
function AddPhysicalItemListingContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/creator-hub';
  const simpleMode = searchParams.get('simple') === '1';
  const editOfferingId = searchParams.get('edit') || '';
  const requestedProfileSlug = searchParams.get('slug') || '';
  const accountSlug = searchParams.get('accountSlug') || '';
  const returnToHref = appendAccountSlugToHref(returnTo, accountSlug || undefined);
  const [profileSlug, setProfileSlug] = useState(requestedProfileSlug);
  const [mirrorOffering, setMirrorOffering] = useState<ProfileOffering | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ItemForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');

  const update = (partial: Partial<ItemForm>) => setForm(f => ({ ...f, ...partial }));

  useEffect(() => {
    let cancelled = false;
    if (requestedProfileSlug) {
      setProfileSlug(requestedProfileSlug);
      return;
    }
    resolveCurrentCreatorProfileSlug()
      .then((slug) => {
        if (!cancelled && slug) setProfileSlug(slug);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [requestedProfileSlug]);

  useEffect(() => {
    let cancelled = false;
    if (!editOfferingId || !profileSlug) return;
    fetchPublicProfile(profileSlug)
      .then((data) => {
        if (cancelled) return;
        const offering = data.profile.offerings.find((entry) => entry.id === editOfferingId);
        if (!offering) return;
        setMirrorOffering(offering);
        const numericPrice = parseNumericPrice(offering.priceLabel);
        setForm((current) => ({
          ...current,
          title: offering.title || current.title,
          description: offering.blurb || current.description,
          price: numericPrice || current.price,
          imageUrls: offering.image ? [offering.image] : current.imageUrls,
          imageInput: offering.image || current.imageInput
        }));
        setStep(2);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [editOfferingId, profileSlug]);

  const canProceed = () => {
    if (step === 1) return !!form.categoryId && !!form.subcategory;
    if (step === 2) return !!form.title.trim() && !!form.description.trim() &&
      (form.listingType === 'reserved' || !!(form.price || form.startingBid));
    if (step === 3) return true;
    if (step === 4) return form.communityConsent;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) { setError('Please complete all required fields.'); return; }
    setError('');
    if (step < 5) setStep(s => s + 1);
  };

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      const activeProfileSlug = profileSlug || (await resolveCurrentCreatorProfileSlug());
      if (!activeProfileSlug) throw new Error('Sign in to continue.');
      if (!profileSlug) setProfileSlug(activeProfileSlug);
      await assertLegacyListingPublishAllowed(activeProfileSlug, Boolean(editOfferingId));
      await new Promise(r => setTimeout(r, 1800));
      if (editOfferingId) {
        const coverImage = form.imageUrls[0] || form.imageInput || mirrorOffering?.coverImage || '';
        const availabilityLabel =
          form.listingType === 'reserved'
            ? 'By request'
            : form.listingType === 'auction'
              ? 'Bidding live'
              : Number(form.stockCount || 0) > 0
                ? 'Available now'
                : 'Made to order';
        const availabilityTone: ProfileOffering['availabilityTone'] =
          form.listingType === 'auction' ? 'warning' : form.listingType === 'reserved' ? 'default' : 'success';
        const ctaMode: NonNullable<ProfileOffering['ctaMode']> =
          form.listingType === 'commission' || form.listingType === 'reserved'
            ? 'quote'
            : 'buy';

        await updateProfileOffering({
          slug: activeProfileSlug,
          accountSlug: accountSlug || undefined,
          offeringId: editOfferingId,
          title: form.title.trim(),
          blurb: form.description.trim(),
          priceLabel: form.price ? `${form.currency} ${form.price}` : (form.buyNowPrice ? `${form.currency} ${form.buyNowPrice}` : mirrorOffering?.priceLabel || ''),
          status: 'Active',
          coverImage,
          ctaMode,
          ctaPreset:
            form.listingType === 'commission' || form.listingType === 'reserved'
              ? 'request-quote'
              : 'collect-now',
          merchandisingRank: mirrorOffering?.merchandisingRank ?? 0,
          galleryOrder: form.imageUrls,
          launchWindowStartsAt: mirrorOffering?.launchWindowStartsAt || '',
          launchWindowEndsAt: mirrorOffering?.launchWindowEndsAt || '',
          availabilityLabel,
          availabilityTone,
          featured: mirrorOffering?.featured ?? false
        });
      }
      setPublished(true);
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Unable to publish this listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (published) {
    const cat = CATEGORIES.find(c => c.id === form.categoryId);
    if (simpleMode) {
      return (
        <div className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
          <div className="mx-auto max-w-2xl rounded-[28px] border border-[#d4af37]/20 bg-[#101010] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="w-20 h-20 bg-[#d4af37]/20 border border-[#d4af37]/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-[#d4af37]" />
            </div>
            <div className="text-5xl mb-4">{cat?.icon}</div>
            <h2 className="text-white font-bold text-2xl mb-2">Your item is live</h2>
            <p className="text-gray-400 mb-1">
              <span className="text-white font-semibold">&quot;{form.title}&quot;</span> is now live on the Indigena Physical Items Marketplace.
            </p>
            {(form.sacredStatus === 'sacred' || form.categoryId === 'ceremonial_sacred') && (
              <p className="text-[#DC143C] text-sm mt-2 mb-4">Pending Elder Digital Signature verification.</p>
            )}
            <p className="text-gray-500 text-sm mb-8">People can now find your handmade work and ask to buy it.</p>
            <div className="flex flex-col gap-3">
              <Link href="/physical-items" className="w-full py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2">
                <Eye size={18} /> View marketplace
              </Link>
              <button onClick={() => { setPublished(false); setStep(1); setForm(defaultForm); }}
                className="w-full py-3 bg-white/5 text-gray-300 font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <Sparkles size={16} /> Add another item
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex">
        <Sidebar isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} onPillarChange={() => {}} activePillar="physical-items" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-[#d4af37]/20 border border-[#d4af37]/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-[#d4af37]" />
            </div>
            <div className="text-5xl mb-4">{cat?.icon}</div>
            <h2 className="text-white font-bold text-2xl mb-2">Item Listed!</h2>
            <p className="text-gray-400 mb-1">
              <span className="text-white font-semibold">&quot;{form.title}&quot;</span> is now live on the Indigena Physical Items Marketplace.
            </p>
            {(form.sacredStatus === 'sacred' || form.categoryId === 'ceremonial_sacred') && (
              <p className="text-[#DC143C] text-sm mt-2 mb-4">Pending Elder Digital Signature verification.</p>
            )}
            <p className="text-gray-500 text-sm mb-8">Your handmade work can now be discovered by collectors and cultural institutions worldwide.</p>
            <div className="flex flex-col gap-3">
              <Link href="/physical-items" className="w-full py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2">
                <Eye size={18} /> View Marketplace
              </Link>
              <button onClick={() => { setPublished(false); setStep(1); setForm(defaultForm); }}
                className="w-full py-3 bg-white/5 text-gray-300 font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <Sparkles size={16} /> List Another Item
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (simpleMode) {
    return (
      <div className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-[28px] border border-[#d4af37]/20 bg-[#101010] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Simple mode</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Add something physical</h1>
                <p className="mt-2 text-sm leading-7 text-gray-300">One step at a time.</p>
              </div>
              <Link href={returnToHref} className="rounded-full border border-[#d4af37]/30 px-4 py-2 text-sm text-[#d4af37]">
                Back to simple home
              </Link>
            </div>
          </div>

          <div className="max-w-3xl">
            <StepBar current={step} />
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
              <CommunityStorefrontBanner accountSlug={accountSlug || undefined} returnTo={returnToHref} />
              {accountSlug ? <div className="mt-4" /> : null}
              {step === 1 && <Step1 form={form} update={update} simpleMode={simpleMode} />}
              {step === 2 && <Step2 form={form} update={update} simpleMode={simpleMode} />}
              {step === 3 && <Step3 form={form} update={update} simpleMode={simpleMode} />}
              {step === 4 && <Step4 form={form} update={update} simpleMode={simpleMode} />}
              {step === 5 && <Step5 form={form} simpleMode={simpleMode} />}

              {error && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-[#DC143C]/10 border border-[#DC143C]/30 rounded-xl">
                  <AlertCircle size={15} className="text-[#DC143C] flex-shrink-0" />
                  <p className="text-[#DC143C] text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
                {step > 1 ? (
                  <button onClick={() => { setStep(s => s - 1); setError(''); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-300 text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors">
                    <ArrowLeft size={16} /> Go back
                  </button>
                ) : <div />}

                {step < 5 ? (
                  <button onClick={handleNext}
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                      canProceed() ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]' : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}>
                    Next <ArrowRight size={16} />
                  </button>
                ) : (
                  <button onClick={handlePublish} disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-[#d4af37] text-black text-sm font-bold rounded-xl hover:bg-[#f4e4a6] disabled:opacity-70 disabled:cursor-wait transition-all">
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Publishing...</>
                    ) : (
                      <><Send size={16} /> Put it live</>
                    )}
                  </button>
                )}
              </div>
            </div>
            <SimpleModeDock
              tips={[
                'Use the mic if typing is slow.',
                'Start with one good photo.',
                'You can add more details later.'
              ]}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} onPillarChange={() => {}} activePillar="physical-items" />

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <Link href={returnToHref} className="flex items-center gap-1.5 text-gray-400 hover:text-[#d4af37] transition-colors text-sm">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex items-center gap-2">
            <Package size={18} className="text-[#d4af37]" />
            <h1 className="text-white font-bold text-lg">{simpleMode ? 'Add something physical' : 'List a Physical Item'}</h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-gray-500 text-xs">
            <Upload size={13} /><span>Step {step} of 5</span>
          </div>
        </div>

        <div className="flex gap-6 p-6 max-w-5xl mx-auto">
          {/* Form */}
          <div className="flex-1 min-w-0">
            <StepBar current={step} />
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
              <CommunityStorefrontBanner accountSlug={accountSlug || undefined} returnTo={returnToHref} />
              {accountSlug ? <div className="mt-4" /> : null}
              {step === 1 && <Step1 form={form} update={update} simpleMode={simpleMode} />}
              {step === 2 && <Step2 form={form} update={update} simpleMode={simpleMode} />}
              {step === 3 && <Step3 form={form} update={update} simpleMode={simpleMode} />}
              {step === 4 && <Step4 form={form} update={update} simpleMode={simpleMode} />}
              {step === 5 && <Step5 form={form} simpleMode={simpleMode} />}

              {error && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-[#DC143C]/10 border border-[#DC143C]/30 rounded-xl">
                  <AlertCircle size={15} className="text-[#DC143C] flex-shrink-0" />
                  <p className="text-[#DC143C] text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
                {step > 1 ? (
                  <button onClick={() => { setStep(s => s - 1); setError(''); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-300 text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors">
                    <ArrowLeft size={16} /> {simpleMode ? 'Go back' : 'Back'}
                  </button>
                ) : <div />}

                {step < 5 ? (
                  <button onClick={handleNext}
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                      canProceed() ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]' : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}>
                    {simpleMode ? 'Next' : 'Continue'} <ArrowRight size={16} />
                  </button>
                ) : (
                  <button onClick={handlePublish} disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-[#d4af37] text-black text-sm font-bold rounded-xl hover:bg-[#f4e4a6] disabled:opacity-70 disabled:cursor-wait transition-all">
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Publishing...</>
                    ) : (
                      <><Send size={16} /> {simpleMode ? 'Put it live' : 'Publish Listing'}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar tips */}
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-[#d4af37]" />
                  <p className="text-white font-semibold text-sm">
                    {step === 1 ? 'Choosing a Category' : step === 2 ? 'Writing a Great Listing' :
                     step === 3 ? 'Physical Details' : step === 4 ? 'Cultural Context' : 'Before You Publish'}
                  </p>
                </div>
                <ul className="space-y-2 text-gray-400 text-xs">
                  {step === 1 && <>
                    <li>• Choose the most specific category for your craft</li>
                    <li>• Sacred & Ceremonial items require Elder verification</li>
                    <li>• Commission listings let collectors request custom pieces</li>
                    <li>• Contemporary Fusion works for mixed-media pieces</li>
                  </>}
                  {step === 2 && <>
                    <li>• Mention the cultural tradition in your title for 3× more views</li>
                    <li>• Include what makes this piece unique or one-of-a-kind</li>
                    <li>• Describe the creation process — buyers love the story</li>
                    <li>• Tags like &quot;handmade&quot; and your nation name drive discovery</li>
                  </>}
                  {step === 3 && <>
                    <li>• First image is the cover — use natural daylight photos</li>
                    <li>• 3+ photos increase purchase likelihood by 60%</li>
                    <li>• Dimensions are required for AR preview to work</li>
                    <li>• NFC tagging enables provenance verification on delivery</li>
                  </>}
                  {step === 4 && <>
                    <li>• Cultural context can increase sale price by up to 40%</li>
                    <li>• TK Labels legally protect your traditional knowledge</li>
                    <li>• Elder endorsement badge significantly boosts trust</li>
                    <li>• Sacred items are hidden from the public until verified</li>
                  </>}
                  {step === 5 && <>
                    <li>• Platform fee is 8% only on completed sales</li>
                    <li>• You can edit your listing any time after publishing</li>
                    <li>• Sacred items activate Elder verification workflow</li>
                    <li>• Featured placement available to boost visibility</li>
                  </>}
                </ul>
              </div>

              {/* Progress */}
              <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-3">Progress</p>
                <div className="space-y-2">
                  {[
                    { label: 'Category & Craft', done: !!form.categoryId && !!form.subcategory },
                    { label: 'Title & Price',    done: !!form.title && !!(form.price || form.startingBid || form.listingType === 'reserved') },
                    { label: 'Description',      done: form.description.length > 20 },
                    { label: 'Photos',           done: form.imageUrls.length > 0 },
                    { label: 'Cultural Info',    done: !!form.nation || form.communityConsent },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-[#d4af37]' : 'bg-white/10'}`}>
                        {item.done && <Check size={9} className="text-black" />}
                      </div>
                      <span className={item.done ? 'text-gray-300' : 'text-gray-600'}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseNumericPrice(label: string) {
  const match = label.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : '';
}

function SimpleQuestionCard({
  step,
  title,
  detail,
  children
}: {
  step: string;
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#d4af37]/20 bg-[#141414] p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">{step}</p>
      <h3 className="mt-2 text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{detail}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

export default function AddPhysicalItemListing() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AddPhysicalItemListingContent />
    </Suspense>
  );
}
