'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Star, Clock, Users, BookOpen, Award, Play, CheckCircle,
  ChevronDown, ChevronRight, ChevronLeft, Heart, Share2,
  Globe, BarChart3, Shield, Zap, FileText, Film, FileQuestion,
  Upload, MessageCircle, ThumbsUp, Flag, Lock
} from 'lucide-react';
import Link from 'next/link';
import { fetchCourseById, fetchCourseUserPublicProfile, type CourseRecord } from '@/app/lib/coursesMarketplaceApi';

// Mock course detail data
const mockCourse = {
  id: '1',
  title: 'Navajo Weaving Masterclass',
  subtitle: 'From beginner to master artisan — learn authentic Navajo techniques',
  description: `Master the sacred art of Navajo weaving in this comprehensive course taught by third-generation weaver Maria Begay. 
  You'll learn everything from warping the loom to completing full-size rugs using authentic traditional patterns.
  
  This course combines cultural history with hands-on technique, giving you both the skills and the deep understanding of the spiritual significance behind each pattern and color choice.`,
  instructor: {
    id: 'i1',
    name: 'Maria Begay',
    title: 'Master Weaver & Cultural Educator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    bio: 'Third-generation Navajo weaver with 30+ years of experience. Featured in Smithsonian exhibitions and the Heard Museum. Maria has taught over 2,000 students worldwide and is passionate about preserving traditional weaving for future generations.',
    rating: 4.9,
    students: 3456,
    courses: 4,
    reviews: 892
  },
  thumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&h=675&fit=crop',
  price: 249,
  originalPrice: 349,
  currency: 'INDI',
  rating: 4.9,
  reviewCount: 892,
  studentCount: 2341,
  duration: '18h 30m',
  totalLessons: 24,
  level: 'Beginner to Advanced',
  language: 'English',
  lastUpdated: 'January 2026',
  verification: 'Platinum',
  category: 'Traditional Arts',
  tags: ['Weaving', 'Navajo', 'Traditional Arts', 'Textiles'],
  includes: [
    '18.5 hours of on-demand video',
    '24 lessons across 5 modules',
    '4 downloadable resource packs',
    'Certificate of completion',
    'Full lifetime access',
    'Access on mobile & desktop',
    'Community discussion forum',
    'Direct instructor Q&A'
  ],
  objectives: [
    'Set up and warp a traditional Navajo loom',
    'Execute 8 authentic traditional weaving patterns',
    'Select and prepare natural wool and dyes',
    'Complete a full-size traditional rug project',
    'Understand cultural significance of patterns and colors',
    'Price and sell your finished pieces professionally'
  ],
  requirements: [
    'No prior weaving experience needed',
    'Basic materials list provided in first lesson',
    'A loom (instructions for building your own included)'
  ],
  modules: [
    {
      id: 'm1', title: 'Introduction to Navajo Weaving', duration: '2h 15m', lessonsCount: 5, isPreview: true,
      lessons: [
        { id: 'l1', title: 'Welcome & Course Overview', duration: '8:30', type: 'video', isFree: true },
        { id: 'l2', title: 'History & Cultural Significance', duration: '15:45', type: 'video', isFree: true },
        { id: 'l3', title: 'Understanding the Loom', duration: '22:10', type: 'video', isFree: false },
        { id: 'l4', title: 'Materials & Tools Guide', duration: '18:20', type: 'video', isFree: false },
        { id: 'l5', title: 'Module 1 Quiz', duration: '10 min', type: 'quiz', isFree: false }
      ]
    },
    {
      id: 'm2', title: 'Foundation Techniques', duration: '3h 45m', lessonsCount: 5, isPreview: false,
      lessons: [
        { id: 'l6', title: 'Warping the Loom', duration: '28:15', type: 'video', isFree: false },
        { id: 'l7', title: 'Basic Weaving Stitches', duration: '35:40', type: 'video', isFree: false },
        { id: 'l8', title: 'Creating Straight Edges', duration: '25:30', type: 'video', isFree: false },
        { id: 'l9', title: 'Practice Exercise: Simple Band', duration: '42:00', type: 'video', isFree: false },
        { id: 'l10', title: 'Troubleshooting Common Issues', duration: '20:15', type: 'video', isFree: false }
      ]
    },
    {
      id: 'm3', title: 'Traditional Patterns', duration: '4h 20m', lessonsCount: 4, isPreview: false,
      lessons: [
        { id: 'l11', title: 'The Two Grey Hills Pattern', duration: '45:00', type: 'video', isFree: false },
        { id: 'l12', title: 'Crystal Style Weaving', duration: '38:30', type: 'video', isFree: false },
        { id: 'l13', title: 'Ganado Red Patterns', duration: '52:15', type: 'video', isFree: false },
        { id: 'l14', title: 'Pattern Workbook Download', duration: '5 min', type: 'resource', isFree: false }
      ]
    },
    {
      id: 'm4', title: 'Color & Natural Dyes', duration: '3h 10m', lessonsCount: 3, isPreview: false,
      lessons: [
        { id: 'l15', title: 'Natural Dye Preparation', duration: '40:20', type: 'video', isFree: false },
        { id: 'l16', title: 'Color Theory in Weaving', duration: '28:45', type: 'video', isFree: false },
        { id: 'l17', title: 'Creating Custom Palettes', duration: '33:10', type: 'video', isFree: false }
      ]
    },
    {
      id: 'm5', title: 'Final Projects', duration: '5h 00m', lessonsCount: 4, isPreview: false,
      lessons: [
        { id: 'l18', title: 'Project: Small Rug', duration: '1:15:00', type: 'video', isFree: false },
        { id: 'l19', title: 'Project: Saddle Blanket', duration: '1:30:00', type: 'video', isFree: false },
        { id: 'l20', title: 'Project: Wall Hanging', duration: '1:45:00', type: 'video', isFree: false },
        { id: 'l21', title: 'Finishing & Selling Your Work', duration: '35:00', type: 'video', isFree: false }
      ]
    }
  ],
  reviews: [
    {
      id: 'r1', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rating: 5, date: '2 weeks ago', helpful: 45,
      content: 'This course completely changed my life. Maria is an incredible teacher who brings so much heart and cultural depth to every lesson. I\'ve already sold my first rug!',
      verifiedCompletion: true,
      reviewerWallet: ''
    },
    {
      id: 'r2', name: 'James Redcloud', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rating: 5, date: '1 month ago', helpful: 38,
      content: 'The pattern modules alone are worth 10x the price. I had no idea how much history and meaning is embedded in each design. Highly recommend to anyone interested in Indigenous arts.',
      verifiedCompletion: true,
      reviewerWallet: ''
    },
    {
      id: 'r3', name: 'Aiyana Running Deer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      rating: 4, date: '1 month ago', helpful: 22,
      content: 'Beautiful course. My only wish is that there were more lessons on advanced color theory. Everything else is absolutely perfect.',
      verifiedCompletion: false,
      reviewerWallet: ''
    }
  ],
  ratingBreakdown: { 5: 76, 4: 15, 3: 6, 2: 2, 1: 1 }
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop';

function formatMinutesToCourseDuration(totalMinutes: number) {
  if (!totalMinutes || totalMinutes <= 0) return '0h 00m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function formatModuleDuration(totalMinutes: number) {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  if (totalMinutes >= 60) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${totalMinutes}m`;
}

function mapLiveCourseToDetail(course: CourseRecord): typeof mockCourse {
  const lessons = course.modules || [];
  const grouped = new Map<string, Array<{
    id: string;
    title: string;
    duration: string;
    type: string;
    isFree: boolean;
  }>>();

  for (const lesson of lessons) {
    const moduleKey = String(lesson.moduleId || 'module_1');
    if (!grouped.has(moduleKey)) grouped.set(moduleKey, []);
    grouped.get(moduleKey)?.push({
      id: String(lesson.moduleId || '') + '-' + String(lesson.order || Date.now()),
      title: lesson.title || 'Lesson',
      duration: formatModuleDuration(Number(lesson.duration || 0)),
      type: lesson.contentType || 'text',
      isFree: Boolean(lesson.isPreview)
    });
  }

  const modules = Array.from(grouped.entries()).map(([moduleId, moduleLessons], idx) => {
    const moduleDurationMinutes = lessons
      .filter((l) => String(l.moduleId || 'module_1') === moduleId)
      .reduce((sum, l) => sum + Number(l.duration || 0), 0);
    return {
      id: moduleId,
      title: `Module ${idx + 1}`,
      duration: formatModuleDuration(moduleDurationMinutes),
      lessonsCount: moduleLessons.length,
      isPreview: moduleLessons.some((l) => l.isFree),
      lessons: moduleLessons
    };
  });

  const enrollments = Array.isArray(course.enrollments) ? course.enrollments : [];
  const completionByWallet = new Map<string, boolean>();
  for (const enrollment of enrollments) {
    const wallet = String(enrollment?.studentAddress || '').toLowerCase();
    if (!wallet) continue;
    completionByWallet.set(wallet, Boolean((enrollment as { completed?: boolean }).completed));
  }

  const ratingList = Array.isArray((course as { ratings?: Array<Record<string, unknown>> }).ratings)
    ? (course as { ratings?: Array<Record<string, unknown>> }).ratings || []
    : [];

  const reviews = ratingList.slice(0, 8).map((r, idx) => {
    const wallet = String(r.studentAddress || '').toLowerCase();
    const rating = Math.max(1, Math.min(5, Number(r.rating || 5)));
    return {
      id: `live-review-${idx + 1}`,
      name: wallet ? `Learner ${wallet.slice(-4).toUpperCase()}` : `Learner ${idx + 1}`,
      avatar: DEFAULT_AVATAR,
      rating,
      date: r.timestamp ? new Date(String(r.timestamp)).toLocaleDateString() : 'Recently',
      helpful: 0,
      content: String(r.review || 'Great course experience.'),
      verifiedCompletion: Boolean(r.verifiedCompletion || completionByWallet.get(wallet)),
      reviewerWallet: wallet
    };
  });

  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const review of reviews) {
    const key = review.rating as 1 | 2 | 3 | 4 | 5;
    ratingBreakdown[key] += 1;
  }
  const reviewCount = Math.max(reviews.length, Number((course as { ratings?: Array<Record<string, unknown>> }).ratings?.length || 0));
  const totalForPct = Math.max(1, reviews.length);
  ([5, 4, 3, 2, 1] as Array<keyof typeof ratingBreakdown>).forEach((k) => {
    ratingBreakdown[k] = Math.round((ratingBreakdown[k] / totalForPct) * 100);
  });

  const livePrice = Number(course.pricing?.amount || 0);
  return {
    ...mockCourse,
    id: String(course.courseId || course._id || mockCourse.id),
    title: course.title || mockCourse.title,
    subtitle: course.description || mockCourse.subtitle,
    description: course.description || mockCourse.description,
    instructor: {
      ...mockCourse.instructor,
      name: course.creatorAddress ? `Creator ${course.creatorAddress.slice(-4).toUpperCase()}` : mockCourse.instructor.name
    },
    thumbnail: course.thumbnailUrl || mockCourse.thumbnail,
    price: livePrice,
    originalPrice: livePrice > 0 ? Math.round(livePrice * 1.25) : 0,
    currency: String(course.pricing?.currency || 'INDI'),
    rating: Number(course.averageRating || 0) > 0 ? Number(course.averageRating) : mockCourse.rating,
    reviewCount: reviewCount || mockCourse.reviewCount,
    studentCount: enrollments.length,
    duration: formatMinutesToCourseDuration(Number(course.estimatedDuration || 0)),
    totalLessons: lessons.length || mockCourse.totalLessons,
    level: course.skillLevel || mockCourse.level,
    language: course.language || mockCourse.language,
    verification: String(course.status || mockCourse.verification),
    category: course.category || course.categoryId || mockCourse.category,
    tags: Array.isArray(course.tags) && course.tags.length > 0 ? course.tags : mockCourse.tags,
    includes: [
      `${lessons.length} lessons`,
      `${formatMinutesToCourseDuration(Number(course.estimatedDuration || 0))} of guided learning`,
      'Lifetime access',
      'Certificate of completion'
    ],
    objectives: mockCourse.objectives,
    requirements: mockCourse.requirements,
    modules: modules.length > 0 ? modules : mockCourse.modules,
    reviews: reviews.length > 0 ? reviews : mockCourse.reviews,
    ratingBreakdown: reviews.length > 0 ? ratingBreakdown : mockCourse.ratingBreakdown
  };
}

async function hydrateReviewerProfiles(course: typeof mockCourse): Promise<typeof mockCourse> {
  const wallets = Array.from(
    new Set(
      course.reviews
        .map((r) => String((r as { reviewerWallet?: string }).reviewerWallet || '').trim().toLowerCase())
        .filter(Boolean)
    )
  );
  if (wallets.length === 0) return course;

  const profileEntries = await Promise.all(
    wallets.map(async (wallet) => {
      try {
        const profile = await fetchCourseUserPublicProfile(wallet);
        return [wallet, profile] as const;
      } catch {
        return [wallet, null] as const;
      }
    })
  );
  const profileMap = new Map(profileEntries);

  return {
    ...course,
    reviews: course.reviews.map((review) => {
      const wallet = String((review as { reviewerWallet?: string }).reviewerWallet || '').trim().toLowerCase();
      const profile = wallet ? profileMap.get(wallet) : null;
      if (!profile) return review;
      return {
        ...review,
        name: profile.displayName || review.name,
        avatar: profile.avatarUrl || review.avatar
      };
    })
  };
}

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = String(params?.courseId || '');
  const [courseData, setCourseData] = useState<typeof mockCourse | null>(null);
  const [usingMockFallback, setUsingMockFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>(['m1']);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');

  useEffect(() => {
    let active = true;
    const loadCourse = async () => {
      setLoading(true);
      try {
        const live = await fetchCourseById(courseId);
        if (!active) return;
        if (live) {
          const mapped = mapLiveCourseToDetail(live);
          const hydrated = await hydrateReviewerProfiles(mapped);
          if (!active) return;
          setCourseData(hydrated);
          setUsingMockFallback(false);
        } else {
          setCourseData(null);
          setUsingMockFallback(true);
        }
      } catch {
        if (!active) return;
        setCourseData(null);
        setUsingMockFallback(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadCourse();
    return () => {
      active = false;
    };
  }, [courseId]);

  const course = courseData || mockCourse;

  const toggleModule = (id: string) =>
    setExpandedModules(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const savings = Math.max(0, Number(course.originalPrice || 0) - Number(course.price || 0));
  const savingsPct = course.originalPrice ? Math.round((savings / course.originalPrice) * 100) : 0;

  return (
    <>
      {/* Breadcrumb header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/courses" className="text-gray-400 hover:text-[#d4af37] transition-colors">Courses</Link>
            <ChevronRight size={14} className="text-gray-600" />
            <span className="text-gray-400">{course.category}</span>
            <ChevronRight size={14} className="text-gray-600" />
            <span className="text-white truncate max-w-xs">{course.title}</span>
          </div>
        </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Banner */}
        <div className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-8">
          <div className="max-w-6xl mx-auto flex gap-8 items-start">
            {/* Left: Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-[#d4af37]/20 text-[#d4af37] text-xs rounded">{course.category}</span>
                <span className="px-2 py-1 bg-[#DC143C]/20 text-[#DC143C] text-xs rounded">{course.verification}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 leading-snug">{course.title}</h1>
              {usingMockFallback && (
                <p className="text-xs text-amber-400 mb-2">Showing course preview while live content syncs.</p>
              )}
              {!usingMockFallback && loading && (
                <p className="text-xs text-gray-500 mb-2">Loading latest course details...</p>
              )}
              <p className="text-gray-400 mb-4">{course.subtitle}</p>
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-[#d4af37] fill-[#d4af37]" />
                  <span className="text-[#d4af37] font-bold text-sm">{course.rating}</span>
                  <span className="text-gray-500 text-sm">({course.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <span className="flex items-center gap-1 text-gray-400 text-sm"><Users size={13} />{course.studentCount.toLocaleString()} students</span>
                <span className="flex items-center gap-1 text-gray-400 text-sm"><Clock size={13} />{course.duration}</span>
                <span className="flex items-center gap-1 text-gray-400 text-sm"><Globe size={13} />{course.language}</span>
                <span className="flex items-center gap-1 text-gray-400 text-sm"><BarChart3 size={13} />{course.level}</span>
              </div>
              <div className="flex items-center gap-3">
                <img src={course.instructor.avatar} alt={course.instructor.name} className="w-7 h-7 rounded-full object-cover" />
                <span className="text-gray-400 text-sm">by <span className="text-[#d4af37]">{course.instructor.name}</span></span>
                <span className="text-gray-600 text-xs">· Updated {course.lastUpdated}</span>
              </div>
            </div>
            {/* Right: Thumbnail preview */}
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="relative rounded-xl overflow-hidden group cursor-pointer" style={{height: '144px'}}>
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[#d4af37]/90 flex items-center justify-center">
                    <Play size={20} className="text-black ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="text-white text-xs bg-black/60 px-2 py-0.5 rounded-full">Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="border-b border-[#d4af37]/20 mb-8">
              <div className="flex gap-6">
                {[
                  { id: 'overview' as const, label: 'Overview' },
                  { id: 'curriculum' as const, label: 'Curriculum' },
                  { id: 'instructor' as const, label: 'Instructor' },
                  { id: 'reviews' as const, label: `Reviews (${course.reviewCount})` },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'text-[#d4af37] border-[#d4af37]' : 'text-gray-400 border-transparent hover:text-white'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* What you'll learn */}
                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20">
                  <h2 className="text-xl font-bold text-white mb-4">What You&apos;ll Learn</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle size={16} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-400">
                        <span className="text-[#d4af37] mt-1">•</span>{req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">About This Course</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{course.description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {course.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#141414] border border-[#d4af37]/20 text-gray-400 rounded-full text-sm">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm">{course.modules.length} modules • {course.totalLessons} lessons • {course.duration} total</p>
                  <button onClick={() => setExpandedModules(expandedModules.length > 0 ? [] : course.modules.map(m => m.id))}
                    className="text-[#d4af37] text-sm hover:text-[#f4e4a6]">
                    {expandedModules.length > 0 ? 'Collapse all' : 'Expand all'}
                  </button>
                </div>

                {course.modules.map(module => (
                  <div key={module.id} className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
                    <button onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1a1a1a] transition-colors"
                    >
                      {expandedModules.includes(module.id) ? <ChevronDown size={18} className="text-[#d4af37] flex-shrink-0" /> : <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />}
                      <span className="flex-1 text-white font-semibold">{module.title}</span>
                      <span className="text-gray-500 text-sm">{module.lessonsCount} lessons • {module.duration}</span>
                    </button>

                    {expandedModules.includes(module.id) && (
                      <div className="border-t border-[#d4af37]/10">
                        {module.lessons.map(lesson => (
                          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#d4af37]/5 last:border-0">
                            {lesson.type === 'video' && <Film size={14} className={lesson.isFree ? 'text-[#d4af37]' : 'text-gray-500'} />}
                            {lesson.type === 'quiz' && <FileQuestion size={14} className="text-gray-500" />}
                            {lesson.type === 'resource' && <Upload size={14} className="text-gray-500" />}
                            <span className={`flex-1 text-sm ${lesson.isFree ? 'text-gray-200' : 'text-gray-400'}`}>{lesson.title}</span>
                            {lesson.isFree ? (
                              <span className="px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] text-xs rounded">Preview</span>
                            ) : (
                              <Lock size={12} className="text-gray-600" />
                            )}
                            <span className="text-gray-600 text-xs w-12 text-right">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Instructor Tab */}
            {activeTab === 'instructor' && (
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <img src={course.instructor.avatar} alt={course.instructor.name} className="w-24 h-24 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold text-[#d4af37] mb-1">{course.instructor.name}</h2>
                    <p className="text-gray-400 mb-4">{course.instructor.title}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1"><Star size={14} className="text-[#d4af37]" />{course.instructor.rating} rating</span>
                      <span className="flex items-center gap-1"><Users size={14} />{course.instructor.students.toLocaleString()} students</span>
                      <span className="flex items-center gap-1"><BookOpen size={14} />{course.instructor.courses} courses</span>
                      <span className="flex items-center gap-1"><MessageCircle size={14} />{course.instructor.reviews} reviews</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{course.instructor.bio}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Rating Summary */}
                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20 flex gap-8">
                  <div className="text-center flex-shrink-0">
                    <p className="text-6xl font-bold text-[#d4af37]">{course.rating}</p>
                    <div className="flex items-center justify-center gap-1 my-2">
                      {[1,2,3,4,5].map(s => <Star key={s} size={16} className="text-[#d4af37] fill-[#d4af37]" />)}
                    </div>
                    <p className="text-gray-400 text-sm">Course Rating</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {Object.entries(course.ratingBreakdown).reverse().map(([stars, pct]) => (
                      <div key={stars} className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                          <div className="h-full bg-[#d4af37] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center gap-1 w-8">
                          <Star size={12} className="text-[#d4af37]" />
                          <span className="text-gray-400 text-xs">{stars}</span>
                        </div>
                        <span className="text-gray-500 text-xs w-8">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {course.reviews.map(review => (
                    <div key={review.id} className="bg-[#141414] rounded-xl p-5 border border-[#d4af37]/10">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{review.name}</p>
                            {review.verifiedCompletion && (
                              <span className="px-2 py-0.5 rounded-full border border-green-500/40 bg-green-500/10 text-green-400 text-[10px] uppercase tracking-wide">
                                Verified completion
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= review.rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'} />)}</div>
                            <span className="text-gray-500 text-xs">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">{review.content}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-xs">Helpful?</span>
                        <button className="flex items-center gap-1 text-gray-400 hover:text-[#d4af37] text-xs transition-colors">
                          <ThumbsUp size={12} />{review.helpful}
                        </button>
                        <button className="text-gray-500 hover:text-gray-300 text-xs"><Flag size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Purchase Card */}
          <div className="w-72 flex-shrink-0">
            <div className="sticky top-4 bg-[#141414] rounded-2xl border border-[#d4af37]/30 overflow-hidden shadow-2xl shadow-[#d4af37]/10">
              {/* Thumbnail */}
              <div className="relative" style={{height: '152px'}}>
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#d4af37]/90 flex items-center justify-center">
                    <Play size={20} className="text-black ml-1" />
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-[#d4af37]">{course.price} INDI</span>
                  <span className="text-gray-500 line-through text-lg">{course.originalPrice} INDI</span>
                  <span className="px-2 py-0.5 bg-[#DC143C]/20 text-[#DC143C] text-sm font-medium rounded">{savingsPct}% off</span>
                </div>

                <Link href={`/courses/learn/${course.id}`}
                  className="block w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-center font-bold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all mb-3"
                >
                  Enroll Now
                </Link>

                <div className="flex gap-2 mb-4">
                  <button onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 py-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isWishlisted ? 'border-[#DC143C] text-[#DC143C] bg-[#DC143C]/10' : 'border-[#d4af37]/30 text-gray-300 hover:border-[#d4af37]'}`}
                  >
                    <Heart size={16} className={isWishlisted ? 'fill-[#DC143C]' : ''} />
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </button>
                  <button className="px-3 py-2.5 border border-[#d4af37]/30 text-gray-300 rounded-lg hover:border-[#d4af37] transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>

                <p className="text-gray-500 text-xs text-center mb-4">30-Day Money-Back Guarantee</p>

                {/* Includes */}
                <div>
                  <p className="text-white font-semibold mb-3">This course includes:</p>
                  <ul className="space-y-2">
                    {course.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle size={14} className="text-[#d4af37] flex-shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
