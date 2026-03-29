'use client';

import React, { Suspense, useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Palette, Upload, Tag,
  Globe, Shield, DollarSign, Eye, Send, Sparkles,
  Image as ImageIcon, Video, Music, FileText, X,
  ChevronDown, Info, Star, Layers, Gavel, ShoppingCart,
  Lock, Users, Crown, AlertCircle, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import SimpleModeDock from '@/app/components/SimpleModeDock';
import VoiceInputButton from '@/app/components/VoiceInputButton';
import { assertLegacyListingPublishAllowed, fetchPublicProfile, updateProfileOffering } from '@/app/lib/profileApi';
import type { ProfileOffering } from '@/app/profile/data/profileShowcase';

// Category definitions
// Hiring or service categories -> Freelancing pillar (/freelancing)
// Education or learning categories -> Courses pillar (/courses)
const CATEGORIES = [
  {
    id: 'digital_painting', name: 'Digital Painting & Illustration', icon: '🎨',
    subcategories: ['Digital Paintings', 'Commissioned Illustrations', 'Custom Portraits', "Children's Book Illustration", 'Editorial Illustration', 'Concept Art', 'Graphic Recording', 'NFT Collections']
  },
  {
    id: '3d_modeling', name: '3D Modeling & Sculpture', icon: '🗿',
    subcategories: ['3D Character Modeling', 'Cultural Artifact Scanning', '3D Environment Design', 'Digital Sculpture', '3D Printable Art', 'Metaverse Architecture', 'AR Filter/Effect Creation']
  },
  {
    id: 'animation', name: 'Animation & Motion Graphics', icon: '🎬',
    subcategories: ['2D Animation', '3D Animation', 'Motion Graphics', 'Stop Motion Animation', 'Whiteboard Animation', 'Animated GIF Creation', 'Title Sequence Design']
  },
  {
    id: 'film_video', name: 'Film, Video & Documentary', icon: '🎥',
    subcategories: ['Documentary Filmmaking', 'Short Film Production', 'Video Editing', 'Color Grading', 'Sound Design', 'Drone Cinematography', 'Music Video Production', 'Archival Footage Restoration']
  },
  {
    id: 'photography', name: 'Photography & Digital Imaging', icon: '📷',
    subcategories: ['Fine Art Photography', 'Portrait Photography', 'Event Photography', 'Product Photography', 'Cultural Documentation', 'Photo Restoration', 'Digital Compositing', 'Stock Photography']
  },
  {
    id: 'game_design', name: 'Game Design & Development', icon: '🎮',
    subcategories: ['Game Art', 'Game Design', 'Indigenous Storytelling in Games', 'Sound Design for Games', 'Game Writing', 'VR/AR Game Experiences']
  },
  {
    id: 'vr_ar', name: 'Virtual & Augmented Reality', icon: '🥽',
    subcategories: ['VR Experience Design', 'AR App Development', '360° Video Production', 'Virtual Gallery Tours', 'AR Art Placement', 'Cultural Site Reconstruction', 'VR Training Simulations']
  },
  {
    id: 'digital_fashion', name: 'Digital Fashion & Textile Design', icon: '👗',
    subcategories: ['Digital Textile Design', 'Virtual Fashion Design', '3D Garment Visualization', 'Digital Print Design', 'Fashion Illustration', 'Cultural Pattern Licensing', 'Digital Mood Boards']
  },
  {
    id: 'music_audio', name: 'Music & Audio Production', icon: '🎵',
    subcategories: ['Music Production', 'Composition', 'Sound Healing Recordings', 'Field Recording', 'Podcast Production', 'Audio Storytelling', 'Traditional Music Digitization', 'Beat Making']
  },
  {
    id: 'nft_blockchain', name: 'NFT & Blockchain Art', icon: '⛓️',
    subcategories: ['NFT Art Creation', 'Collection Curation', 'Smart Contract Development', 'Digital Wampum / Token Design', 'Provenance Documentation', 'Metaverse Gallery Curation', 'DAO Art Governance']
  },
  {
    id: 'ai_generative', name: 'AI & Generative Art', icon: '🤖',
    subcategories: ['AI Art Creation', 'Generative Art Programming', 'AI Training with Cultural Data', 'Prompt Engineering', 'Interactive AI Installations', 'Cultural AI Ethics Consulting']
  },
];

// Categories redirected to other pillars
const REDIRECT_CATEGORIES = [
  { id: 'graphic_design',      name: 'Graphic Design & Branding',         icon: '✏️', pillar: 'Freelancing', href: '/freelancing' },
  { id: 'web_ux',              name: 'Web & UX Design',                    icon: '🌐', pillar: 'Freelancing', href: '/freelancing' },
  { id: 'social_media',        name: 'Social Media & Content Creation',    icon: '📱', pillar: 'Freelancing', href: '/freelancing' },
  { id: 'digital_archive',     name: 'Digital Archive & Preservation',     icon: '🗄️', pillar: 'Freelancing', href: '/freelancing' },
  { id: 'licensing_ip',        name: 'Licensing & IP Management',          icon: '⚖️', pillar: 'Freelancing', href: '/freelancing' },
  { id: 'educational_content', name: 'Educational Digital Content',        icon: '🎓', pillar: 'Courses',     href: '/courses'     },
];

const NATIONS = [
  'Lakota', 'Navajo', 'Haida', 'Cree', 'Ojibwe', 'Hopi', 'Cherokee', 'Anishinaabe',
  'Blackfoot', 'Mohawk', 'Karuk', 'Māori', 'Haudenosaunee', 'Inuit', 'Sámi',
  'Dene', 'Métis', 'Coast Salish', 'Tlingit', 'Tsimshian', 'Secwépemc', 'Nlaka\'pamux',
  'Wiradjuri', 'Arrernte', 'Yolŋu', 'Kaurna', 'Mapuche', 'Quechua', 'Aymara',
  'Other / Prefer not to say'
];

const TK_LABELS = [
  { id: 'tk_attribution', label: 'TK Attribution', desc: 'Acknowledge Traditional Knowledge origins' },
  { id: 'tk_non_commercial', label: 'TK Non-Commercial', desc: 'Free for non-commercial use only' },
  { id: 'tk_community_use', label: 'TK Community Use Only', desc: 'Restricted to community members' },
  { id: 'tk_seasonal', label: 'TK Seasonal', desc: 'Appropriate only during certain seasons' },
  { id: 'tk_women_general', label: 'TK Women General', desc: 'Created by and for women' },
  { id: 'tk_men_general', label: 'TK Men General', desc: 'Created by and for men' },
  { id: 'tk_secret_sacred', label: 'TK Secret/Sacred', desc: 'Secret or sacred - restricted access' },
  { id: 'none', label: 'No TK Label', desc: 'No traditional knowledge restrictions' },
];

// Form state types
interface ListingForm {
  // Step 1: Category
  categoryId: string;
  subcategory: string;
  listingType: 'instant' | 'commission' | 'auction' | 'licensing';

  // Step 2: Details
  title: string;
  description: string;
  price: string;
  currency: 'INDI' | 'XRP' | 'USD';
  startingBid: string;
  buyNowPrice: string;
  licenseType: 'personal' | 'commercial' | 'exclusive' | 'royalty_free';
  deliveryDays: string;
  revisions: string;
  tags: string[];
  tagInput: string;

  // Step 3: Media
  imageUrls: string[];
  imageInput: string;
  videoUrl: string;
  audioUrl: string;
  previewUrl: string;
  fileFormats: string[];
  resolution: string;

  // Step 4: Cultural
  nation: string;
  language: string;
  tkLabel: string;
  sacredStatus: 'public' | 'community' | 'restricted' | 'sacred';
  storyContext: string;
  communityConsent: boolean;
  elderEndorsed: boolean;
}

const defaultForm: ListingForm = {
  categoryId: '', subcategory: '', listingType: 'instant',
  title: '', description: '', price: '', currency: 'INDI',
  startingBid: '', buyNowPrice: '', licenseType: 'commercial',
  deliveryDays: '7', revisions: '2', tags: [], tagInput: '',
  imageUrls: [], imageInput: '', videoUrl: '', audioUrl: '', previewUrl: '',
  fileFormats: [], resolution: '',
  nation: '', language: '', tkLabel: 'none', sacredStatus: 'public',
  storyContext: '', communityConsent: false, elderEndorsed: false,
};

// Step progress bar
const STEPS = [
  { num: 1, label: 'Category' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'Media' },
  { num: 4, label: 'Cultural' },
  { num: 5, label: 'Review' },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              current > step.num
                ? 'bg-[#d4af37] text-black'
                : current === step.num
                  ? 'bg-[#d4af37]/20 border-2 border-[#d4af37] text-[#d4af37]'
                  : 'bg-white/5 border border-white/10 text-gray-500'
            }`}>
              {current > step.num ? <Check size={16} /> : step.num}
            </div>
            <span className={`text-xs font-medium ${current === step.num ? 'text-[#d4af37]' : 'text-gray-500'}`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-5 transition-all ${current > step.num + 1 || (current > step.num) ? 'bg-[#d4af37]/50' : 'bg-white/10'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Step 1: Category and Type
function Step1({ form, update, simpleMode = false }: { form: ListingForm; update: (k: Partial<ListingForm>) => void; simpleMode?: boolean }) {
  const selected = CATEGORIES.find(c => c.id === form.categoryId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">{simpleMode ? 'What are you sharing?' : 'Choose your category'}</h2>
        <p className="text-gray-400 text-sm">{simpleMode ? 'Choose the kind of work.' : 'Select the type of digital art you want to list.'}</p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => update({ categoryId: cat.id, subcategory: '' })}
            className={`rounded-2xl border transition-all hover:border-[#d4af37]/50 ${
              form.categoryId === cat.id
                ? 'border-[#d4af37] bg-[#d4af37]/10'
                : 'border-white/10 bg-[#141414]'
            } ${simpleMode ? 'min-h-[108px] p-4 text-center' : 'p-3 text-left'}`}
          >
            <div className={`${simpleMode ? 'text-2xl mb-2' : 'text-xl mb-1'}`}>{cat.icon}</div>
            <p className={`${simpleMode ? 'text-sm font-semibold leading-tight' : 'text-xs font-medium leading-tight'} ${form.categoryId === cat.id ? 'text-[#d4af37]' : 'text-gray-300'}`}>
              {cat.name}
            </p>
          </button>
        ))}
      </div>

      {/* Redirect section */}
      <div className="pt-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Looking for something else? These belong in other pillars:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {REDIRECT_CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex items-start gap-2.5 p-3 rounded-xl border border-white/5 bg-[#0a0a0a] hover:border-white/20 transition-all group"
            >
              <span className="text-lg">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs font-medium leading-tight group-hover:text-gray-200 transition-colors">{cat.name}</p>
                <span className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-xs font-semibold ${
                  cat.pillar === 'Freelancing'
                    ? 'bg-[#d4af37]/10 text-[#d4af37]'
                    : 'bg-blue-500/10 text-blue-400'
                }`}>
                  <ExternalLink size={9} />
                  {cat.pillar}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {selected && (
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
            Subcategory <span className="text-[#DC143C]">*</span>
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

      {/* Listing type */}
      {form.subcategory && (
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
            {simpleMode ? 'How do you want to share it?' : 'Listing Type'} <span className="text-[#DC143C]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: 'instant', label: 'Instant Purchase', icon: ShoppingCart, desc: 'Buyers purchase immediately at a fixed price' },
              { id: 'commission', label: 'Commission', icon: Palette, desc: 'Clients hire you for a custom project' },
              { id: 'auction', label: 'Auction', icon: Gavel, desc: 'Set a starting bid, highest wins' },
              { id: 'licensing', label: 'Licensing', icon: Shield, desc: 'License your art for commercial use' },
            ] as const).map(type => (
              <button
                key={type.id}
                onClick={() => update({ listingType: type.id })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  form.listingType === type.id
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-white/10 bg-[#141414] hover:border-white/20'
                }`}
              >
                <type.icon size={20} className={form.listingType === type.id ? 'text-[#d4af37]' : 'text-gray-400'} />
                <p className={`font-semibold text-sm mt-2 ${form.listingType === type.id ? 'text-[#d4af37]' : 'text-white'}`}>{type.label}</p>
                <p className="text-gray-500 text-xs mt-1">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Step 2: Details
function Step2({ form, update, simpleMode = false }: { form: ListingForm; update: (k: Partial<ListingForm>) => void; simpleMode?: boolean }) {
  const addTag = () => {
    const t = form.tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      update({ tags: [...form.tags, t], tagInput: '' });
    }
  };

  const pricingReady = form.listingType === 'auction'
    ? !!form.startingBid.trim()
    : !!form.price.trim();

  if (simpleMode) {
    return (
      <div className="space-y-4">
        <SimpleQuestionCard step="Question 1" title="What do you want to call it?" detail="Give your work a clear name.">
          <input
            value={form.title}
            onChange={e => update({ title: e.target.value })}
            placeholder={form.listingType === 'commission' ? 'Custom digital portrait' : 'Lakota Spirit Series - 1 of 1'}
            maxLength={80}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]"
          />
          <VoiceInputButton label="Say the title" onTranscript={(transcript) => update({ title: transcript })} />
        </SimpleQuestionCard>

        {form.title.trim() ? (
          <SimpleQuestionCard step="Question 2" title="What should people know?" detail="Describe the work in plain language.">
            <textarea
              value={form.description}
              onChange={e => update({ description: e.target.value })}
              placeholder="Tell people what it is, how you made it, and what they will receive."
              rows={4}
              maxLength={1000}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37] resize-none"
            />
            <VoiceInputButton label="Say the description" onTranscript={(transcript) => update({ description: transcript })} />
          </SimpleQuestionCard>
        ) : null}

        {form.title.trim() && form.description.trim() ? (
          <SimpleQuestionCard step="Question 3" title="How will this be sold?" detail="Set the price or starting bid.">
            {form.listingType === 'auction' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <input type="number" value={form.startingBid} onChange={e => update({ startingBid: e.target.value })} placeholder="Starting bid" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
                <input type="number" value={form.buyNowPrice} onChange={e => update({ buyNowPrice: e.target.value })} placeholder="Buy now price (optional)" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              </div>
            ) : (
              <input type="number" value={form.price} onChange={e => update({ price: e.target.value })} placeholder="Price" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            )}
            <div className="flex gap-2">
              {(['INDI', 'XRP', 'USD'] as const).map(cur => (
                <button key={cur} onClick={() => update({ currency: cur })} className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${form.currency === cur ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-white/20'}`}>
                  {cur}
                </button>
              ))}
            </div>
          </SimpleQuestionCard>
        ) : null}

        {form.description.trim() && pricingReady ? (
          <SimpleQuestionCard step="Question 4" title="Any extra details?" detail="Add timing, revisions, or search words if you want.">
            {form.listingType === 'commission' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <input value={form.deliveryDays} onChange={e => update({ deliveryDays: e.target.value })} placeholder="Delivery days" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
                <input value={form.revisions} onChange={e => update({ revisions: e.target.value })} placeholder="Revisions" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
              </div>
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
              <button onClick={addTag} className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30 transition-colors">Add</button>
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
        <p className="text-gray-400 text-sm">Describe your offering clearly to attract the right clients.</p>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
          Title <span className="text-[#DC143C]">*</span>
        </label>
        <input
          value={form.title}
          onChange={e => update({ title: e.target.value })}
          placeholder={form.listingType === 'commission' ? 'e.g., Custom Digital Portrait in Formline Style' : 'e.g., Lakota Spirit Series - 1 of 1 Digital Painting'}
          maxLength={80}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition-colors"
        />
        <p className="text-gray-600 text-xs mt-1 text-right">{form.title.length}/80</p>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
          Description <span className="text-[#DC143C]">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => update({ description: e.target.value })}
          placeholder="Describe your work, process, what clients will receive, and any cultural context you wish to share..."
          rows={4}
          maxLength={1000}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
        />
        <p className="text-gray-600 text-xs mt-1 text-right">{form.description.length}/1000</p>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        {form.listingType === 'auction' ? (
          <>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Starting Bid</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  value={form.startingBid}
                  onChange={e => update({ startingBid: e.target.value })}
                  placeholder="50"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Buy Now Price (optional)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  value={form.buyNowPrice}
                  onChange={e => update({ buyNowPrice: e.target.value })}
                  placeholder="500"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
              Price <span className="text-[#DC143C]">*</span>
            </label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="number"
                value={form.price}
                onChange={e => update({ price: e.target.value })}
                placeholder={form.listingType === 'licensing' ? '500' : '150'}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        )}

        {/* Currency */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Currency</label>
          <div className="flex gap-2">
            {(['INDI', 'XRP', 'USD'] as const).map(cur => (
              <button
                key={cur}
                onClick={() => update({ currency: cur })}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                  form.currency === cur
                    ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]'
                    : 'border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-white/20'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Commission extras */}
      {form.listingType === 'commission' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Delivery (days)</label>
            <input
              type="number"
              value={form.deliveryDays}
              onChange={e => update({ deliveryDays: e.target.value })}
              min={1}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Revisions included</label>
            <input
              type="number"
              value={form.revisions}
              onChange={e => update({ revisions: e.target.value })}
              min={0}
              max={10}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>
      )}

      {/* Licensing type */}
      {form.listingType === 'licensing' && (
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">License Type</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: 'personal', label: 'Personal Use', desc: 'Non-commercial, personal only' },
              { id: 'commercial', label: 'Commercial', desc: 'Can be used in products/ads' },
              { id: 'exclusive', label: 'Exclusive Rights', desc: 'Buyer gets sole rights' },
              { id: 'royalty_free', label: 'Royalty Free', desc: 'One-time fee, unlimited use' },
            ] as const).map(lic => (
              <button
                key={lic.id}
                onClick={() => update({ licenseType: lic.id })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.licenseType === lic.id
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-white/10 bg-[#0a0a0a] hover:border-white/20'
                }`}
              >
                <p className={`text-sm font-medium ${form.licenseType === lic.id ? 'text-[#d4af37]' : 'text-white'}`}>{lic.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{lic.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Tags (up to 10)</label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {form.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs rounded-full">
              {tag}
              <button onClick={() => update({ tags: form.tags.filter(t => t !== tag) })}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={form.tagInput}
            onChange={e => update({ tagInput: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="e.g. lakota, formline, digital-art"
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]"
          />
          <button
            onClick={addTag}
            className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 3: Media
function Step3({ form, update, simpleMode = false }: { form: ListingForm; update: (k: Partial<ListingForm>) => void; simpleMode?: boolean }) {
  const addImage = () => {
    const url = form.imageInput.trim();
    if (url && !form.imageUrls.includes(url) && form.imageUrls.length < 8) {
      update({ imageUrls: [...form.imageUrls, url], imageInput: '' });
    }
  };

  const FILE_FORMATS = ['JPG/JPEG', 'PNG', 'SVG', 'PSD', 'AI', 'PDF', 'MP4', 'MOV', 'GIF', 'WAV', 'MP3', 'FLAC', 'GLB/GLTF', 'FBX', 'OBJ'];

  if (simpleMode) {
    return (
      <div className="space-y-4">
        <SimpleQuestionCard step="Question 1" title="Show the work" detail="Add at least one image so people can see it.">
          <div className="flex gap-2">
            <input value={form.imageInput} onChange={e => update({ imageInput: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }} placeholder="Paste image URL" className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            <button onClick={addImage} className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30 transition-colors">Add</button>
          </div>
          <VoiceInputButton label="Say the image link" onTranscript={(transcript) => update({ imageInput: transcript })} />
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
          <SimpleQuestionCard step="Question 2" title="Do you have extra preview media?" detail="Video and audio are optional.">
            <input value={form.videoUrl} onChange={e => update({ videoUrl: e.target.value })} placeholder="Video URL (optional)" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            <input value={form.audioUrl} onChange={e => update({ audioUrl: e.target.value })} placeholder="Audio URL (optional)" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            <VoiceInputButton label="Say the media link" onTranscript={(transcript) => update({ videoUrl: transcript })} />
          </SimpleQuestionCard>
        ) : null}

        {form.imageUrls.length > 0 ? (
          <SimpleQuestionCard step="Question 3" title="What files will people get?" detail="Pick the file types and add any resolution notes.">
            <div className="flex flex-wrap gap-2">
              {FILE_FORMATS.map(fmt => (
                <button key={fmt} onClick={() => update({ fileFormats: form.fileFormats.includes(fmt) ? form.fileFormats.filter(f => f !== fmt) : [...form.fileFormats, fmt] })} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${form.fileFormats.includes(fmt) ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-white/20'}`}>
                  {fmt}
                </button>
              ))}
            </div>
            <input value={form.resolution} onChange={e => update({ resolution: e.target.value })} placeholder="Resolution or dimensions (optional)" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
            <VoiceInputButton label="Say the file details" onTranscript={(transcript) => update({ resolution: transcript })} />
          </SimpleQuestionCard>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">Add media & deliverables</h2>
        <p className="text-gray-400 text-sm">Show buyers what they&apos;ll receive. At least 1 image is recommended.</p>
      </div>

      {/* Images */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
          <ImageIcon size={13} className="inline mr-1.5" />
          Preview Images (up to 8)
        </label>
        {form.imageUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {form.imageUrls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/10 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => update({ imageUrls: form.imageUrls.filter((_, idx) => idx !== i) })}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={11} className="text-white" />
                </button>
                {i === 0 && (
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[#d4af37] text-black text-xs rounded font-bold">Cover</div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={form.imageInput}
            onChange={e => update({ imageInput: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
            placeholder="Paste image URL (Unsplash, IPFS, etc.)"
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]"
          />
          <button
            onClick={addImage}
            className="px-4 py-2.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-sm rounded-xl hover:bg-[#d4af37]/30 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Video */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
          <Video size={13} className="inline mr-1.5" />
          Preview Video URL (optional)
        </label>
        <input
          value={form.videoUrl}
          onChange={e => update({ videoUrl: e.target.value })}
          placeholder="YouTube, Vimeo, or direct video URL"
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]"
        />
      </div>

      {/* Audio */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
          <Music size={13} className="inline mr-1.5" />
          Audio Preview URL (optional - for music/audio listings)
        </label>
        <input
          value={form.audioUrl}
          onChange={e => update({ audioUrl: e.target.value })}
          placeholder="SoundCloud, IPFS audio, or direct MP3 URL"
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]"
        />
      </div>

      {/* Deliverable file formats */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
          <FileText size={13} className="inline mr-1.5" />
          Deliverable File Formats
        </label>
        <div className="flex flex-wrap gap-2">
          {FILE_FORMATS.map(fmt => (
            <button
              key={fmt}
              onClick={() => {
                const curr = form.fileFormats;
                update({ fileFormats: curr.includes(fmt) ? curr.filter(f => f !== fmt) : [...curr, fmt] });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                form.fileFormats.includes(fmt)
                  ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]'
                  : 'border-white/10 bg-[#0a0a0a] text-gray-400 hover:border-white/20'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Resolution / Dimensions (optional)</label>
        <input
          value={form.resolution}
          onChange={e => update({ resolution: e.target.value })}
          placeholder="e.g. 4K (3840x2160), 300 DPI, 24-bit audio"
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]"
        />
      </div>
    </div>
  );
}

// Step 4: Cultural metadata
function Step4({ form, update, simpleMode = false }: { form: ListingForm; update: (k: Partial<ListingForm>) => void; simpleMode?: boolean }) {
  if (simpleMode) {
    return (
      <div className="space-y-4">
        <SimpleQuestionCard step="Question 1" title="Where does this work come from?" detail="Add your nation or language if you want.">
          <select value={form.nation} onChange={e => update({ nation: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]">
            <option value="">Select your nation / people</option>
            {NATIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <input value={form.language} onChange={e => update({ language: e.target.value })} placeholder="Language (optional)" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]" />
          <VoiceInputButton label="Say the language" onTranscript={(transcript) => update({ language: transcript })} />
        </SimpleQuestionCard>

        {form.nation || form.language ? (
          <SimpleQuestionCard step="Question 2" title="Does it need special protection?" detail="Choose access level and any knowledge label.">
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'public', label: 'Public' },
                { id: 'community', label: 'Community' },
                { id: 'restricted', label: 'Restricted' },
                { id: 'sacred', label: 'Sacred' }
              ] as const).map(option => (
                <button key={option.id} onClick={() => update({ sacredStatus: option.id })} className={`p-3 rounded-xl border text-sm ${form.sacredStatus === option.id ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 bg-[#0a0a0a] text-gray-300'}`}>
                  {option.label}
                </button>
              ))}
            </div>
            <select value={form.tkLabel} onChange={e => update({ tkLabel: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]">
              {TK_LABELS.map(label => <option key={label.id} value={label.id}>{label.label}</option>)}
            </select>
          </SimpleQuestionCard>
        ) : null}

        {(form.tkLabel !== 'none' || form.sacredStatus !== 'public') ? (
          <SimpleQuestionCard step="Question 3" title="Anything else people should know?" detail="Add story or protocol notes.">
            <textarea value={form.storyContext} onChange={e => update({ storyContext: e.target.value })} placeholder="Share the story or cultural context (optional)" rows={3} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] resize-none" />
            <VoiceInputButton label="Say the story" onTranscript={(transcript) => update({ storyContext: transcript })} />
            <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-300">
              <input type="checkbox" checked={form.communityConsent} onChange={e => update({ communityConsent: e.target.checked })} className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0a0a0a] text-[#d4af37] focus:ring-[#d4af37]" />
              I confirm this work can be shared here.
            </label>
          </SimpleQuestionCard>
        ) : null}
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">Cultural context</h2>
        <p className="text-gray-400 text-sm">Tell us about the cultural origins of your work. This helps buyers understand and respect the heritage behind your art.</p>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl">
        <Info size={18} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
        <p className="text-gray-300 text-sm">Cultural metadata is optional but highly recommended. It increases trust, enables proper credit, and helps protect your intellectual property.</p>
      </div>

      {/* Nation */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Nation / People</label>
        <div className="relative">
          <select
            value={form.nation}
            onChange={e => update({ nation: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] appearance-none"
          >
            <option value="">Select your nation / people</option>
            {NATIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Primary Language of Creation (optional)</label>
        <input
          value={form.language}
          onChange={e => update({ language: e.target.value })}
          placeholder="e.g. Lakota, Ojibwe, Te Reo MÄori, Cree"
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37]"
        />
      </div>

      {/* Sacred Status */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
          <Shield size={13} className="inline mr-1.5" />
          Sacred Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: 'public', label: 'Public', icon: Globe, desc: 'Available to all - no restrictions' },
            { id: 'community', label: 'Community', icon: Users, desc: 'Shared within Indigenous communities' },
            { id: 'restricted', label: 'Restricted', icon: Lock, desc: 'Limited access - protocol required' },
            { id: 'sacred', label: 'Sacred', icon: Crown, desc: 'Highest protection - elder oversight required' },
          ] as const).map(s => (
            <button
              key={s.id}
              onClick={() => update({ sacredStatus: s.id })}
              className={`p-3 rounded-xl border text-left transition-all ${
                form.sacredStatus === s.id
                  ? s.id === 'sacred' ? 'border-[#DC143C] bg-[#DC143C]/10' : 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-white/10 bg-[#0a0a0a] hover:border-white/20'
              }`}
            >
              <s.icon size={16} className={form.sacredStatus === s.id ? (s.id === 'sacred' ? 'text-[#DC143C]' : 'text-[#d4af37]') : 'text-gray-500'} />
              <p className={`text-sm font-medium mt-1.5 ${form.sacredStatus === s.id ? (s.id === 'sacred' ? 'text-[#DC143C]' : 'text-[#d4af37]') : 'text-white'}`}>{s.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* TK Label */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
          Traditional Knowledge Label
        </label>
        <div className="space-y-2">
          {TK_LABELS.map(label => (
            <button
              key={label.id}
              onClick={() => update({ tkLabel: label.id })}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                form.tkLabel === label.id
                  ? 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-white/10 bg-[#0a0a0a] hover:border-white/20'
              }`}
            >
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

      {/* Story context */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Story & Cultural Context (optional)</label>
        <textarea
          value={form.storyContext}
          onChange={e => update({ storyContext: e.target.value })}
          placeholder="Share the story behind this work - its cultural meaning, inspiration, or traditional context..."
          rows={3}
          maxLength={500}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
        />
        <p className="text-gray-600 text-xs mt-1 text-right">{form.storyContext.length}/500</p>
      </div>

      {/* Consent checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.communityConsent}
            onChange={e => update({ communityConsent: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0a0a0a] text-[#d4af37] focus:ring-[#d4af37]"
          />
          <span className="text-sm text-gray-300">I confirm I have the right to share and sell this cultural content, and it does not violate my community&apos;s protocols.</span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.elderEndorsed}
            onChange={e => update({ elderEndorsed: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0a0a0a] text-[#d4af37] focus:ring-[#d4af37]"
          />
          <span className="text-sm text-gray-300">
            <span className="flex items-center gap-1.5"><Star size={13} className="text-[#d4af37]" /> Elder-endorsed (optional) - an elder has reviewed and approved this content.</span>
          </span>
        </label>
      </div>
    </div>
  );
}

// Step 5: Review and Publish
function Step5({ form, simpleMode = false }: { form: ListingForm; simpleMode?: boolean }) {
  const cat = CATEGORIES.find(c => c.id === form.categoryId);
  const tkLabel = TK_LABELS.find(t => t.id === form.tkLabel);

  const price = form.listingType === 'auction' ? form.startingBid : form.price;
  const platformFee = price ? (Number(price) * 0.08).toFixed(2) : '0';
  const youReceive = price ? (Number(price) * 0.92).toFixed(2) : '0';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">{simpleMode ? 'Check your page' : 'Review your listing'}</h2>
        <p className="text-gray-400 text-sm">{simpleMode ? 'Check it once, then go live.' : 'Check everything looks right before publishing.'}</p>
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

        {/* Title & Description */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Listing</p>
          <p className="text-white font-semibold">{form.title || <span className="text-gray-600 italic">No title</span>}</p>
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{form.description || <span className="text-gray-600 italic">No description</span>}</p>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.tags.map(t => (
                <span key={t} className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing breakdown */}
        {price && (
          <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Pricing Breakdown</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Listed price</span>
                <span className="text-white font-semibold">{price} {form.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform fee (8%)</span>
                <span className="text-[#DC143C]">- {platformFee} {form.currency}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5">
                <span className="text-white font-semibold">You receive</span>
                <span className="text-[#d4af37] font-bold">{youReceive} {form.currency}</span>
              </div>
            </div>
          </div>
        )}

        {/* Media */}
        {form.imageUrls.length > 0 && (
          <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Media</p>
            <div className="flex gap-2">
              {form.imageUrls.slice(0, 4).map((url, i) => (
                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/10">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {form.imageUrls.length > 4 && (
                <div className="w-16 h-16 rounded-lg bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-gray-500 text-xs">
                  +{form.imageUrls.length - 4}
                </div>
              )}
            </div>
            {form.fileFormats.length > 0 && (
              <p className="text-gray-500 text-xs mt-2">Formats: {form.fileFormats.join(', ')}</p>
            )}
          </div>
        )}

        {/* Cultural */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Cultural Context</p>
          <div className="flex flex-wrap gap-2">
            {form.nation && <span className="px-2.5 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full border border-[#d4af37]/20">{form.nation}</span>}
            {form.language && <span className="px-2.5 py-1 bg-white/5 text-gray-300 text-xs rounded-full">{form.language}</span>}
            <span className={`px-2.5 py-1 text-xs rounded-full border ${
              form.sacredStatus === 'sacred' ? 'bg-[#DC143C]/10 text-[#DC143C] border-[#DC143C]/20' : 'bg-white/5 text-gray-300 border-white/10'
            }`}>{form.sacredStatus}</span>
            {tkLabel && tkLabel.id !== 'none' && <span className="px-2.5 py-1 bg-white/5 text-gray-300 text-xs rounded-full">{tkLabel.label}</span>}
            {form.elderEndorsed && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full border border-[#d4af37]/20">
                <Star size={10} /> Elder Endorsed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page
function AddDigitalArtListingContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/creator-hub';
  const simpleMode = searchParams.get('simple') === '1';
  const editOfferingId = searchParams.get('edit') || '';
  const profileSlug = searchParams.get('slug') || 'aiyana-redbird';
  const [mirrorOffering, setMirrorOffering] = useState<ProfileOffering | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ListingForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');

  const update = (partial: Partial<ListingForm>) => setForm(f => ({ ...f, ...partial }));

  useEffect(() => {
    let cancelled = false;
    if (!editOfferingId) return;
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

  // Validation per step
  const canProceed = (): boolean => {
    if (step === 1) return !!form.categoryId && !!form.subcategory;
    if (step === 2) return !!form.title.trim() && !!form.description.trim() && !!(form.price || form.startingBid);
    if (step === 3) return true; // Media is optional
    if (step === 4) return form.communityConsent;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      setError('Please complete all required fields before continuing.');
      return;
    }
    setError('');
    if (step < 5) setStep(s => s + 1);
  };

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      await assertLegacyListingPublishAllowed(profileSlug, Boolean(editOfferingId));
      await new Promise(r => setTimeout(r, 1800));
      if (editOfferingId) {
        const coverImage = form.imageUrls[0] || form.imageInput || mirrorOffering?.coverImage || '';
        const availabilityTone: ProfileOffering['availabilityTone'] =
          form.listingType === 'auction' ? 'warning' : form.listingType === 'licensing' ? 'default' : 'success';
        const availabilityLabel =
          form.listingType === 'auction'
            ? 'Bidding live'
            : form.listingType === 'commission'
              ? 'Open for commissions'
              : form.listingType === 'licensing'
                ? 'Licensing available'
                : 'Available now';
        const ctaMode: NonNullable<ProfileOffering['ctaMode']> =
          form.listingType === 'commission'
            ? 'message'
            : form.listingType === 'licensing'
              ? 'quote'
              : 'buy';

        await updateProfileOffering({
          slug: profileSlug,
          offeringId: editOfferingId,
          title: form.title.trim(),
          blurb: form.description.trim(),
          priceLabel: form.price ? `${form.currency} ${form.price}` : (form.buyNowPrice ? `${form.currency} ${form.buyNowPrice}` : mirrorOffering?.priceLabel || ''),
          status: 'Active',
          coverImage,
          ctaMode,
          ctaPreset:
            form.listingType === 'commission'
              ? 'message-first'
              : form.listingType === 'licensing'
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
            <h2 className="text-white font-bold text-2xl mb-2">Your page is live</h2>
            <p className="text-gray-400 mb-2">
              <span className="text-white font-semibold">&quot;{form.title}&quot;</span> is now live on the Indigena Digital Arts Marketplace.
            </p>
            <p className="text-gray-500 text-sm mb-8">People can now discover your work, commission you, or collect the release.</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/digital-arts"
                className="w-full py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={18} /> View marketplace
              </Link>
              <button
                onClick={() => { setPublished(false); setStep(1); setForm(defaultForm); }}
                className="w-full py-3 bg-white/5 text-gray-300 font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Add another piece
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex">
        <Sidebar isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} onPillarChange={() => {}} activePillar="digital-arts" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-[#d4af37]/20 border border-[#d4af37]/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-[#d4af37]" />
            </div>
            <div className="text-5xl mb-4">{cat?.icon}</div>
            <h2 className="text-white font-bold text-2xl mb-2">{simpleMode ? 'Your page is live' : 'Listing Published!'}</h2>
            <p className="text-gray-400 mb-2">
              <span className="text-white font-semibold">&quot;{form.title}&quot;</span> is now live on the Indigena Digital Arts Marketplace.
            </p>
            <p className="text-gray-500 text-sm mb-8">Your work is now visible to collectors, clients, and collaborators worldwide.</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/digital-arts"
                className="w-full py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={18} /> View Marketplace
              </Link>
              <button
                onClick={() => { setPublished(false); setStep(1); setForm(defaultForm); }}
                className="w-full py-3 bg-white/5 text-gray-300 font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Add Another Listing
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
                <h1 className="mt-3 text-3xl font-semibold text-white">Add digital art</h1>
                <p className="mt-2 text-sm leading-7 text-gray-300">One step at a time.</p>
              </div>
              <Link
                href={returnTo}
                className="rounded-full border border-[#d4af37]/30 px-4 py-2 text-sm text-[#d4af37]"
              >
                Back to simple home
              </Link>
            </div>
          </div>

          <div className="max-w-3xl">
            <StepBar current={step} />
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
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
                  <button
                    onClick={() => { setStep(s => s - 1); setError(''); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-300 text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft size={16} /> Go back
                  </button>
                ) : <div />}

                {step < 5 ? (
                  <button
                    onClick={handleNext}
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                      canProceed() ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]' : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-[#d4af37] text-black text-sm font-bold rounded-xl hover:bg-[#f4e4a6] transition-all disabled:opacity-70 disabled:cursor-wait"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Put it live
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <SimpleModeDock
              tips={[
                'Use the mic if typing is slow.',
                'One image is enough to start.',
                'You can fix details later.'
              ]}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} onPillarChange={() => {}} activePillar="digital-arts" />

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <Link
            href={returnTo}
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#d4af37] transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-[#d4af37]" />
            <h1 className="text-white font-bold text-lg">{simpleMode ? 'Add digital art' : 'Add Digital Art Listing'}</h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-gray-500 text-xs">
            <Upload size={13} />
            <span>Step {step} of 5</span>
          </div>
        </div>

        {/* Main content - two-column on large screens */}
        <div className="flex gap-6 p-6 max-w-5xl mx-auto">

          {/* Form column */}
          <div className="flex-1 min-w-0">
            <StepBar current={step} />

            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
              {step === 1 && <Step1 form={form} update={update} simpleMode={simpleMode} />}
              {step === 2 && <Step2 form={form} update={update} simpleMode={simpleMode} />}
              {step === 3 && <Step3 form={form} update={update} simpleMode={simpleMode} />}
              {step === 4 && <Step4 form={form} update={update} simpleMode={simpleMode} />}
              {step === 5 && <Step5 form={form} simpleMode={simpleMode} />}

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-[#DC143C]/10 border border-[#DC143C]/30 rounded-xl">
                  <AlertCircle size={15} className="text-[#DC143C] flex-shrink-0" />
                  <p className="text-[#DC143C] text-sm">{error}</p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
                {step > 1 ? (
                  <button
                    onClick={() => { setStep(s => s - 1); setError(''); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-300 text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft size={16} /> {simpleMode ? 'Go back' : 'Back'}
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button
                    onClick={handleNext}
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                      canProceed()
                        ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
                        : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {simpleMode ? 'Next' : 'Continue'} <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-[#d4af37] text-black text-sm font-bold rounded-xl hover:bg-[#f4e4a6] transition-all disabled:opacity-70 disabled:cursor-wait"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> {simpleMode ? 'Put it live' : 'Publish Listing'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar tips */}
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Tips per step */}
              <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-[#d4af37]" />
                  <p className="text-white font-semibold text-sm">
                    {step === 1 ? 'Choosing a Category' :
                     step === 2 ? 'Writing Great Listings' :
                     step === 3 ? 'Media Tips' :
                     step === 4 ? 'Cultural Context' :
                     'Publishing Tips'}
                  </p>
                </div>
                <ul className="space-y-2 text-gray-400 text-xs">
                  {step === 1 && <>
                    <li>- Choose the category that best matches your primary skill</li>
                    <li>- You can create multiple listings across different categories</li>
                    <li>- Commission listings let clients hire you for custom work</li>
                    <li>- NFT & Blockchain is perfect for tokenizing your digital art</li>
                  </>}
                  {step === 2 && <>
                    <li>- Titles with specific styles or nations perform 3x better</li>
                    <li>- Include what files the buyer receives</li>
                    <li>- Mention your process and turnaround for commissions</li>
                    <li>- Tags help buyers discover your work through search</li>
                  </>}
                  {step === 3 && <>
                    <li>- First image becomes the cover - use your best work</li>
                    <li>- Listings with 3+ images sell 2x as fast</li>
                    <li>- Add a process video to build trust with clients</li>
                    <li>- IPFS links ensure permanent, decentralized hosting</li>
                  </>}
                  {step === 4 && <>
                    <li>- Buyers pay more for work with clear cultural context</li>
                    <li>- TK Labels protect your traditional knowledge globally</li>
                    <li>- Elder-endorsed badges boost credibility significantly</li>
                    <li>- Sacred content receives special platform protections</li>
                  </>}
                  {step === 5 && <>
                    <li>- Platform fee is 8% only when you make a sale</li>
                    <li>- Listings with media get 5x more views</li>
                    <li>- You can edit your listing at any time after publishing</li>
                    <li>- Featured placements are available to boost visibility</li>
                  </>}
                </ul>
              </div>

              {/* Progress summary */}
              <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-3">Progress</p>
                <div className="space-y-2">
                  {[
                    { label: 'Category', done: !!form.categoryId && !!form.subcategory },
                    { label: 'Title & Price', done: !!form.title && !!(form.price || form.startingBid) },
                    { label: 'Description', done: form.description.length > 20 },
                    { label: 'Images', done: form.imageUrls.length > 0 },
                    { label: 'Cultural Info', done: !!form.nation || form.communityConsent },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.done ? 'bg-[#d4af37]' : 'bg-white/10'
                      }`}>
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

export default function AddDigitalArtListing() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AddDigitalArtListingContent />
    </Suspense>
  );
}

