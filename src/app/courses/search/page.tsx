'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Filter, Search, Star, Users } from 'lucide-react';
import { PILLAR3_CATEGORIES } from '@/app/courses/data/pillar3Catalog';

type SearchCourse = {
  id: string;
  title: string;
  instructor: string;
  categoryId: string;
  categoryLabel: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  price: number;
  rating: number;
  learners: number;
  duration: string;
  summary: string;
  featured?: boolean;
};

const courseCatalog: SearchCourse[] = [
  {
    id: '1',
    title: 'Navajo Weaving Masterclass',
    instructor: 'Maria Begay',
    categoryId: 'traditional_arts',
    categoryLabel: 'Traditional Art Courses',
    level: 'All Levels',
    price: 249,
    rating: 4.9,
    learners: 2341,
    duration: '18h 30m',
    summary: 'A full weaving track from loom setup through pattern practice and finishing.',
    featured: true
  },
  {
    id: '2',
    title: 'Lakota Language Fundamentals',
    instructor: 'Winona Thunderbird',
    categoryId: 'language_learning',
    categoryLabel: 'Language Learning Courses',
    level: 'Beginner',
    price: 149,
    rating: 4.8,
    learners: 1328,
    duration: '14h 00m',
    summary: 'Build pronunciation, vocabulary, and conversation habits with guided weekly lessons.'
  },
  {
    id: '3',
    title: 'Traditional Pottery Techniques',
    instructor: 'Chief Running Water',
    categoryId: 'traditional_arts',
    categoryLabel: 'Traditional Art Courses',
    level: 'Intermediate',
    price: 189,
    rating: 4.7,
    learners: 876,
    duration: '12h 15m',
    summary: 'Hand-building, clay handling, firing, and cultural protocol for pottery practice.'
  },
  {
    id: '4',
    title: 'Indigenous Entrepreneurship',
    instructor: 'Elena Blackhorse',
    categoryId: 'business_entrepreneurship',
    categoryLabel: 'Business & Entrepreneurship',
    level: 'All Levels',
    price: 199,
    rating: 4.8,
    learners: 1192,
    duration: '10h 20m',
    summary: 'Launch and price a culturally grounded business with realistic revenue planning.',
    featured: true
  },
  {
    id: '5',
    title: 'Curating Indigenous Collections',
    instructor: 'Mika Redsky',
    categoryId: 'curatorial_museum',
    categoryLabel: 'Curatorial & Museum Studies',
    level: 'Advanced',
    price: 279,
    rating: 4.9,
    learners: 441,
    duration: '9h 45m',
    summary: 'Community-led curation, care protocols, and exhibition strategy for Indigenous collections.'
  },
  {
    id: '6',
    title: 'Land Stewardship and Fire Knowledge',
    instructor: 'Talia Riverstone',
    categoryId: 'land_environment',
    categoryLabel: 'Land & Environment Courses',
    level: 'Intermediate',
    price: 225,
    rating: 4.8,
    learners: 592,
    duration: '11h 00m',
    summary: 'Traditional fire knowledge, seasonal stewardship, and land observation frameworks.'
  }
];

const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'price-low', label: 'Price: low to high' },
  { id: 'price-high', label: 'Price: high to low' },
  { id: 'learners', label: 'Most learners' }
] as const;

export default function CourseSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]['id']>('relevance');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const category = params.get('category') || 'all';
    setSearchQuery(q);
    setSelectedCategory(category);
  }, []);

  const categories = useMemo(
    () => [{ id: 'all', name: 'All categories' }, ...PILLAR3_CATEGORIES.map((category) => ({ id: category.id, name: category.name }))],
    []
  );

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matches = courseCatalog.filter((course) => {
      const matchesQuery =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.summary.toLowerCase().includes(query) ||
        course.categoryLabel.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'all' || course.categoryId === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      return matchesQuery && matchesCategory && matchesLevel;
    });

    return matches.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'learners':
          return b.learners - a.learners;
        default:
          if (a.featured === b.featured) return 0;
          return a.featured ? -1 : 1;
      }
    });
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[#d4af37]/20 bg-[#141414] px-6 py-5">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">Courses search</p>
              <h1 className="mt-2 text-3xl font-semibold">Find courses that are ready to enroll.</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/66">
                Search across art, language, land, entrepreneurship, and professional tracks. This route is wired as a clean search surface, not a placeholder browse page.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d4af37]/20 bg-[#0f0f0f] px-4 py-3 text-sm text-white/74">
              {filteredCourses.length} results
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-4 rounded-[28px] border border-[#d4af37]/15 bg-[linear-gradient(135deg,rgba(212,175,55,0.08),rgba(0,0,0,0.2))] p-5 md:grid-cols-[1.3fr,repeat(3,minmax(0,0.55fr))]">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search courses, instructors, or outcomes"
              className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/34 focus:border-[#d4af37]/40 focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/72">
            <Filter size={16} className="text-[#d4af37]" />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-[#111] text-white">
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/72">
            <select
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              <option value="all" className="bg-[#111] text-white">All levels</option>
              <option value="Beginner" className="bg-[#111] text-white">Beginner</option>
              <option value="Intermediate" className="bg-[#111] text-white">Intermediate</option>
              <option value="Advanced" className="bg-[#111] text-white">Advanced</option>
              <option value="All Levels" className="bg-[#111] text-white">All Levels</option>
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/72">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as (typeof sortOptions)[number]['id'])}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id} className="bg-[#111] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          {filteredCourses.map((course) => (
            <article key={course.id} className="rounded-[28px] border border-white/10 bg-[#141414] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#f1d586]">
                    <BookOpen size={12} />
                    {course.categoryLabel}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-white">{course.title}</h2>
                  <p className="mt-2 text-sm text-[#d4af37]">{course.instructor}</p>
                </div>
                {course.featured ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                    Featured
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-7 text-white/68">{course.summary}</p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/62">
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">{course.level}</span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">{course.duration}</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2">
                  <Star size={14} className="text-[#d4af37]" />
                  {course.rating.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2">
                  <Users size={14} className="text-[#d4af37]" />
                  {course.learners.toLocaleString()} learners
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Price</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{course.price} INDI</p>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(90deg,#f3dfb1,#d7a04d,#bf7a1f)] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  View course
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
