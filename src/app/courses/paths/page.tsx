'use client';

import { useMemo, useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Clock, 
  BookOpen, 
  Users, 
  Award,
  TrendingUp,
  CheckCircle,
  Heart,
  Share2,
  ArrowRight,
  Star,
  MapPin,
  Zap,
  GraduationCap,
  X,
  SlidersHorizontal,
  Bookmark,
  Grid3X3
} from 'lucide-react';
import Link from 'next/link';
import { PILLAR3_CATEGORIES } from '../data/pillar3Catalog';

// Learning paths data
const learningPaths = [
  {
    id: '1',
    title: 'Master Beadworker',
    subtitle: 'From beginner to master artisan',
    description: 'Complete journey from basic stitches to creating gallery-worthy beadwork pieces. Learn traditional patterns, color theory, and business skills to sell your work.',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=400&fit=crop',
    category: 'traditional_arts',
    categoryColor: '#d4af37',
    level: 'Beginner to Master',
    duration: '8 months',
    weeklyCommitment: '5-10 hours',
    courses: 6,
    totalLessons: 72,
    students: 2341,
    completionRate: 89,
    rating: 4.9,
    reviews: 456,
    price: 599,
    originalPrice: 894,
    currency: 'INDI',
    verification: 'Platinum',
    instructors: [
      { name: 'Maria Begay', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
      { name: 'Lena Crow', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
      { name: 'James Ironheart', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }
    ],
    outcomes: ['Master Weaver Certificate', 'Portfolio of 12 pieces', 'Business launch skills'],
    skills: ['Traditional Stitches', 'Pattern Design', 'Color Theory', 'Material Selection', 'Pricing', 'Marketing'],
    prerequisites: 'None',
    language: 'English',
    featured: true,
    bestseller: true
  },
  {
    id: '2',
    title: 'Language Preservationist',
    subtitle: 'Save endangered Indigenous languages',
    description: 'Comprehensive training in linguistics, teaching methodologies, and digital preservation tools. Become a certified language keeper.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
    category: 'language_learning',
    categoryColor: '#4A90E2',
    level: 'Intermediate to Advanced',
    duration: '12 months',
    weeklyCommitment: '10-15 hours',
    courses: 8,
    totalLessons: 96,
    students: 892,
    completionRate: 76,
    rating: 4.8,
    reviews: 234,
    price: 899,
    originalPrice: 1299,
    currency: 'INDI',
    verification: 'Gold',
    instructors: [
      { name: 'Dr. Sarah Whitehorse', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
      { name: 'Prof. Michael Thunderbird', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
    ],
    outcomes: ['Language Keeper Certificate', 'Teaching credential', 'Digital archive skills'],
    skills: ['Linguistics', 'Curriculum Design', 'Audio Recording', 'App Development', 'Community Engagement'],
    prerequisites: 'Conversational Indigenous language',
    language: 'English, Lakota',
    featured: true,
    bestseller: false
  },
  {
    id: '3',
    title: 'Cultural Entrepreneur',
    subtitle: 'Build a business honoring traditions',
    description: 'Learn to create a successful Indigenous-owned business while maintaining cultural integrity. From idea to launch to growth.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop',
    category: 'business_entrepreneurship',
    categoryColor: '#22c55e',
    level: 'Beginner to Advanced',
    duration: '10 months',
    weeklyCommitment: '8-12 hours',
    courses: 7,
    totalLessons: 84,
    students: 1567,
    completionRate: 82,
    rating: 4.9,
    reviews: 378,
    price: 799,
    originalPrice: 1099,
    currency: 'INDI',
    verification: 'Platinum',
    instructors: [
      { name: 'Michael Thunderbird', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
      { name: 'Lisa Redfeather', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
      { name: 'David Eagle', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' }
    ],
    outcomes: ['Business Certificate', 'Complete business plan', 'Launched venture'],
    skills: ['Business Planning', 'Marketing', 'Finance', 'E-commerce', 'Cultural Branding', 'Leadership'],
    prerequisites: 'None',
    language: 'English',
    featured: false,
    bestseller: true
  },
  {
    id: '4',
    title: 'Traditional Pottery Master',
    subtitle: 'Ancient techniques, modern expression',
    description: 'Master hand-building, firing, and glazing techniques passed down through generations. Create functional and artistic pieces.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=400&fit=crop',
    category: 'traditional_arts',
    categoryColor: '#d4af37',
    level: 'Beginner to Advanced',
    duration: '6 months',
    weeklyCommitment: '4-8 hours',
    courses: 5,
    totalLessons: 60,
    students: 1123,
    completionRate: 91,
    rating: 4.7,
    reviews: 289,
    price: 449,
    originalPrice: 645,
    currency: 'INDI',
    verification: 'Gold',
    instructors: [
      { name: 'Aiyana Yazzie', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
      { name: 'Thomas Clay', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
    ],
    outcomes: ['Pottery Certificate', '20 finished pieces', 'Kiln operation skills'],
    skills: ['Hand Building', 'Wheel Throwing', 'Firing', 'Glazing', 'Design', 'Safety'],
    prerequisites: 'None',
    language: 'English',
    featured: false,
    bestseller: false
  },
  {
    id: '5',
    title: 'Indigenous Storyteller',
    subtitle: 'Preserve oral traditions digitally',
    description: 'Learn the art of storytelling, digital recording techniques, and how to build an archive for future generations.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
    category: 'cultural_knowledge',
    categoryColor: '#8b5cf6',
    level: 'All Levels',
    duration: '4 months',
    weeklyCommitment: '3-6 hours',
    courses: 4,
    totalLessons: 48,
    students: 2156,
    completionRate: 94,
    rating: 4.8,
    reviews: 567,
    price: 299,
    originalPrice: 396,
    currency: 'INDI',
    verification: 'Silver',
    instructors: [
      { name: 'Eli Whittaker', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' }
    ],
    outcomes: ['Storyteller Certificate', 'Digital archive', 'Published stories'],
    skills: ['Oral Tradition', 'Recording', 'Editing', 'Archiving', 'Performance'],
    prerequisites: 'None',
    language: 'English',
    featured: false,
    bestseller: true
  },
  {
    id: '6',
    title: 'Sustainable Land Steward',
    subtitle: 'Traditional ecological knowledge',
    description: 'Combine Indigenous land management practices with modern sustainability. Learn permaculture, seed saving, and ecosystem restoration.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
    category: 'land_environment',
    categoryColor: '#10b981',
    level: 'Intermediate',
    duration: '9 months',
    weeklyCommitment: '6-10 hours',
    courses: 6,
    totalLessons: 72,
    students: 789,
    completionRate: 85,
    rating: 4.9,
    reviews: 198,
    price: 549,
    originalPrice: 774,
    currency: 'INDI',
    verification: 'Gold',
    instructors: [
      { name: 'Thomas Greenfield', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
      { name: 'Maria Rain', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' }
    ],
    outcomes: ['Steward Certificate', 'Land management plan', 'Community project'],
    skills: ['Permaculture', 'Seed Saving', 'Water Management', 'Soil Health', 'Restoration'],
    prerequisites: 'Basic gardening experience',
    language: 'English',
    featured: true,
    bestseller: false
  }
];

const categoryById = new Map(PILLAR3_CATEGORIES.map((category) => [category.id, category]));

// Filter options
const filterOptions = {
  level: ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Master'],
  duration: ['Any Duration', 'Under 3 months', '3-6 months', '6-12 months', '1+ years'],
  category: [
    { id: 'all', name: 'All Categories', color: '#d4af37' },
    ...PILLAR3_CATEGORIES.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color
    }))
  ],
  commitment: ['Any Commitment', 'Casual (2-3 hrs/week)', 'Part-time (5-10 hrs/week)', 'Intensive (15+ hrs/week)'],
  verification: ['Any', 'Bronze+', 'Silver+', 'Gold+', 'Platinum only'],
  price: ['Any Price', 'Free', 'Under 500 INDI', '500-1000 INDI', '1000+ INDI'],
  language: ['Any Language', 'English', 'Spanish', 'Indigenous Languages', 'Bilingual']
};

// Stats
const platformStats = {
  totalPaths: 24,
  totalStudents: 15678,
  avgCompletionRate: 86,
  certificatesEarned: 8934
};

export default function LearningPathsPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [filters, setFilters] = useState({
    level: 'All Levels',
    duration: 'Any Duration',
    category: 'all',
    commitment: 'Any Commitment',
    verification: 'Any',
    price: 'Any Price',
    language: 'Any Language'
  });

  // Filter and sort paths
  const filteredPaths = useMemo(() => {
    const list = learningPaths.filter((path) => {
      const matchesSearch =
        path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === 'all' || path.category === filters.category;
      const matchesLevel = filters.level === 'All Levels' || path.level.includes(filters.level);

      return matchesSearch && matchesCategory && matchesLevel;
    });

    if (sortBy === 'price-low') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return [...list].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'completion') return [...list].sort((a, b) => b.completionRate - a.completionRate);
    if (sortBy === 'newest') return [...list].reverse();

    return [...list].sort((a, b) => b.students - a.students);
  }, [filters, searchQuery, sortBy]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      level: 'All Levels',
      duration: 'Any Duration',
      category: 'all',
      commitment: 'Any Commitment',
      verification: 'Any',
      price: 'Any Price',
      language: 'Any Language'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== 'All Levels' && v !== 'Any Duration' && v !== 'all' && v !== 'Any Commitment' && v !== 'Any' && v !== 'Any Price' && v !== 'Any Language'
  ).length;

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#d4af37]/20 via-[#0a0a0a] to-[#DC143C]/10 py-10 px-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/courses" className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">
              Courses
            </Link>
            <ArrowRight size={14} className="text-gray-500" />
            <span className="text-[#d4af37] text-sm">Learning Paths</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Sacred <span className="text-[#d4af37]">Learning Journeys</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mb-6 text-sm">
            Structured paths to master Indigenous arts, languages, and traditions. 
            Each journey is curated by master knowledge keepers.
          </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Learning Paths', value: platformStats.totalPaths },
                { label: 'Active Students', value: platformStats.totalStudents.toLocaleString() },
                { label: 'Avg Completion', value: `${platformStats.avgCompletionRate}%` },
                { label: 'Certificates', value: platformStats.certificatesEarned.toLocaleString() }
              ].map((stat) => (
                <div key={stat.label} className="bg-[#141414]/80 backdrop-blur rounded-xl p-4 border border-[#d4af37]/20">
                  <p className="text-2xl font-bold text-[#d4af37]">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Filter Sidebar */}
          {showFilters && (
            <div className="w-72 bg-[#141414] border-r border-[#d4af37]/20 p-6 overflow-y-auto flex-shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <SlidersHorizontal size={18} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 bg-[#d4af37] text-black text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </h3>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="text-xs text-[#d4af37] hover:text-[#f4e4a6]"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">Category</label>
                <div className="space-y-2">
                  {filterOptions.category.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('category', cat.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                        filters.category === cat.id
                          ? 'bg-[#d4af37]/20 text-[#d4af37]'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">Skill Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => updateFilter('level', e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {filterOptions.level.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => updateFilter('duration', e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {filterOptions.duration.map((duration) => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </div>

              {/* Commitment Filter */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">Weekly Commitment</label>
                <select
                  value={filters.commitment}
                  onChange={(e) => updateFilter('commitment', e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {filterOptions.commitment.map((commitment) => (
                    <option key={commitment} value={commitment}>{commitment}</option>
                  ))}
                </select>
              </div>

              {/* Verification Filter */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">Verification</label>
                <select
                  value={filters.verification}
                  onChange={(e) => updateFilter('verification', e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {filterOptions.verification.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">Price Range</label>
                <select
                  value={filters.price}
                  onChange={(e) => updateFilter('price', e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {filterOptions.price.map((price) => (
                    <option key={price} value={price}>{price}</option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">Language</label>
                <select
                  value={filters.language}
                  onChange={(e) => updateFilter('language', e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {filterOptions.language.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Search & Controls */}
            <div className="flex items-center gap-4 mb-6">
              {/* Toggle Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                    : 'bg-[#141414] border-[#d4af37]/20 text-gray-300 hover:border-[#d4af37]'
                }`}
              >
                <Filter size={18} />
                <span className="text-sm">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#d4af37] text-black text-xs rounded">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search paths, skills, or outcomes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#141414] border border-[#d4af37]/20 rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="completion">Completion Rate</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-[#141414] rounded-lg border border-[#d4af37]/20 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-gray-400 text-sm mb-4">
              Showing {filteredPaths.length} learning paths
            </p>

            {/* Paths Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 lg:grid-cols-2' 
                : 'grid-cols-1'
            }`}>
              {filteredPaths.map((path) => (
                <div 
                  key={path.id}
                  className={`group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all hover:shadow-lg hover:shadow-[#d4af37]/10 ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-72 flex-shrink-0' : ''}`}>
                    <img 
                      src={path.image}
                      alt={path.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {path.featured && (
                        <span className="px-2 py-1 bg-[#d4af37] text-black text-xs font-medium rounded">
                          Featured
                        </span>
                      )}
                      {path.bestseller && (
                        <span className="px-2 py-1 bg-[#DC143C] text-white text-xs font-medium rounded">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div 
                      className="absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${(categoryById.get(path.category)?.color ?? path.categoryColor)}30`,
                        color: categoryById.get(path.category)?.color ?? path.categoryColor
                      }}
                    >
                      {categoryById.get(path.category)?.name ?? path.category}
                    </div>

                    {/* Verification */}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-[#0a0a0a]/80 rounded text-xs text-[#d4af37]">
                      {path.verification}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-[#d4af37] transition-colors">
                          {path.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{path.subtitle}</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-[#DC143C] transition-colors">
                        <Bookmark size={18} />
                      </button>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{path.description}</p>

                    {/* Instructors */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {path.instructors.map((instructor, idx) => (
                          <img
                            key={idx}
                            src={instructor.avatar}
                            alt={instructor.name}
                            className="w-8 h-8 rounded-full border-2 border-[#141414] object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {path.instructors.length} instructors
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {path.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {path.courses} courses
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {path.students.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        {path.completionRate}%
                      </span>
                    </div>

                    {/* Outcomes */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {path.outcomes.map((outcome, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-xs text-[#d4af37]/80">
                          <Award size={12} />
                          {outcome}
                        </span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-[#d4af37] fill-[#d4af37]" />
                        <span className="text-white font-medium">{path.rating}</span>
                      </div>
                      <span className="text-gray-500 text-sm">({path.reviews} reviews)</span>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/10 mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#d4af37]">{path.price} INDI</span>
                        {path.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">{path.originalPrice} INDI</span>
                        )}
                        <span className="text-xs text-green-500">
                          Save {Math.round((1 - path.price / path.originalPrice) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors">
                          <Share2 size={18} />
                        </button>
                        <button className="px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all">
                          Start Path
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredPaths.length === 0 && (
              <div className="text-center py-16">
                <GraduationCap size={64} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No paths found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your filters or search query</p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
    </>
  );
}

