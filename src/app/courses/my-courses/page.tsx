'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen, Play, Award, Clock, Search, Filter,
  ChevronRight, Star, Calendar, TrendingUp, CheckCircle,
  BarChart3, Flame, Download, RotateCcw, Lock
} from 'lucide-react';
import Link from 'next/link';
import {
  fetchCourseById,
  fetchMyCourseEnrollments,
  fetchMyCourseReceipts,
  type CourseEnrollmentRecord,
  type CourseEnrollmentReceipt
} from '@/app/lib/coursesMarketplaceApi';

interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  timeSpent: string;
  lastAccessed: string;
  rating: number;
  category: string;
  certificateEarned: boolean;
  nextLesson: string;
  nextLessonId: string;
}

const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: '1',
    title: 'Navajo Weaving Masterclass',
    instructor: 'Maria Begay',
    thumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=340&fit=crop',
    progress: 65,
    totalLessons: 24,
    completedLessons: 16,
    duration: '18h 30m',
    timeSpent: '11h 20m',
    lastAccessed: '2 hours ago',
    rating: 0,
    category: 'Traditional Arts',
    certificateEarned: false,
    nextLesson: 'Crystal Style Weaving',
    nextLessonId: 'l12'
  },
  {
    id: '2',
    title: 'Cherokee Pottery: Ancient Techniques',
    instructor: 'Chief Running Water',
    thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=340&fit=crop',
    progress: 100,
    totalLessons: 18,
    completedLessons: 18,
    duration: '12h 15m',
    timeSpent: '12h 15m',
    lastAccessed: '3 days ago',
    rating: 5,
    category: 'Ceramics',
    certificateEarned: true,
    nextLesson: '',
    nextLessonId: ''
  },
  {
    id: '3',
    title: 'Lakota Beadwork Fundamentals',
    instructor: 'Winona Thunderbird',
    thumbnail: 'https://images.unsplash.com/photo-1609504173369-d7a237d76a9d?w=600&h=340&fit=crop',
    progress: 30,
    totalLessons: 20,
    completedLessons: 6,
    duration: '14h 00m',
    timeSpent: '4h 10m',
    lastAccessed: '1 week ago',
    rating: 0,
    category: 'Jewelry & Beadwork',
    certificateEarned: false,
    nextLesson: 'Pattern Charting Basics',
    nextLessonId: 'l7'
  },
  {
    id: '4',
    title: 'Inuit Carving: Stone & Bone',
    instructor: 'Nanook Iqaluk',
    thumbnail: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&h=340&fit=crop',
    progress: 10,
    totalLessons: 15,
    completedLessons: 2,
    duration: '10h 45m',
    timeSpent: '1h 05m',
    lastAccessed: '2 weeks ago',
    rating: 0,
    category: 'Sculpture',
    certificateEarned: false,
    nextLesson: 'Choosing the Right Stone',
    nextLessonId: 'l3'
  }
];

const achievements = [
  { label: '7-Day Streak', icon: Flame, color: 'text-orange-400', earned: true },
  { label: 'First Course', icon: Star, color: 'text-[#d4af37]', earned: true },
  { label: 'Fast Learner', icon: TrendingUp, color: 'text-blue-400', earned: true },
  { label: 'Master Level', icon: Award, color: 'text-purple-400', earned: false },
  { label: '5 Certificates', icon: Award, color: 'text-green-400', earned: false },
  { label: '100h Learned', icon: Clock, color: 'text-pink-400', earned: false },
];

function ProgressBar({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  const color = value === 100 ? 'bg-green-500' : value >= 50 ? 'bg-[#d4af37]' : 'bg-[#DC143C]';
  return (
    <div className={`w-full ${height} bg-[#0a0a0a] rounded-full overflow-hidden`}>
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function MyCoursesPage() {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [receipts, setReceipts] = useState<CourseEnrollmentReceipt[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [receiptsError, setReceiptsError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>(mockEnrolledCourses);
  const [usingMockFallback, setUsingMockFallback] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const toHoursLabel = (minutes: number) => {
    const safe = Math.max(0, Number(minutes || 0));
    const hours = Math.floor(safe / 60);
    const mins = safe % 60;
    return `${hours}h ${String(mins).padStart(2, '0')}m`;
  };

  const mapEnrollmentToCard = async (enrollment: CourseEnrollmentRecord): Promise<EnrolledCourse> => {
    const course = await fetchCourseById(enrollment.courseId);
    const completedLessons = Number(enrollment.progress?.completedModules?.length || 0);
    const totalLessons = Math.max(Number(course?.modules?.length || 0), completedLessons, 1);
    const percent = Math.max(0, Math.min(100, Number(enrollment.progress?.percentComplete || 0)));
    const thumbnail = String(course?.thumbnailUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=340&fit=crop');
    const title = String(course?.title || enrollment.title || 'Untitled Course');
    const instructor = course?.creatorAddress
      ? `Creator ${course.creatorAddress.slice(-4).toUpperCase()}`
      : 'Indigenous Instructor';
    const category = String(course?.category || course?.categoryId || enrollment.categoryId || 'Courses');
    const lastAccessed = enrollment.progress?.lastAccessed
      ? new Date(enrollment.progress.lastAccessed).toLocaleDateString()
      : 'Recently';
    return {
      id: enrollment.courseId,
      title,
      instructor,
      thumbnail,
      progress: percent,
      totalLessons,
      completedLessons,
      duration: toHoursLabel(Number(course?.estimatedDuration || 0)),
      timeSpent: toHoursLabel(Math.round((Number(course?.estimatedDuration || 0) * percent) / 100)),
      lastAccessed,
      rating: Number(course?.averageRating || 0),
      category,
      certificateEarned: Boolean(enrollment.completed || enrollment.certificateNftId),
      nextLesson: percent < 100 ? 'Resume lesson' : '',
      nextLessonId: String(enrollment.progress?.currentLessonId || '')
    };
  };

  useEffect(() => {
    let active = true;
    const loadEnrollments = async () => {
      setCoursesLoading(true);
      try {
        const rows = await fetchMyCourseEnrollments(100);
        if (!active) return;
        if (!rows || rows.length === 0) {
          setEnrolledCourses(mockEnrolledCourses);
          setUsingMockFallback(true);
          return;
        }
        const mapped = await Promise.all(rows.map((row) => mapEnrollmentToCard(row)));
        if (!active) return;
        if (mapped.length > 0) {
          setEnrolledCourses(mapped);
          setUsingMockFallback(false);
        } else {
          setEnrolledCourses(mockEnrolledCourses);
          setUsingMockFallback(true);
        }
      } catch {
        if (!active) return;
        setEnrolledCourses(mockEnrolledCourses);
        setUsingMockFallback(true);
      } finally {
        if (active) setCoursesLoading(false);
      }
    };
    void loadEnrollments();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setReceiptsLoading(true);
      setReceiptsError(null);
      try {
        const data = await fetchMyCourseReceipts(100);
        if (!active) return;
        setReceipts(data);
      } catch {
        if (!active) return;
        setReceipts([]);
        setReceiptsError('Unable to load receipts.');
      } finally {
        if (active) setReceiptsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const stats = [
    { label: 'Enrolled Courses', value: String(enrolledCourses.length), icon: BookOpen, color: 'text-[#d4af37]' },
    { label: 'Completed', value: String(enrolledCourses.filter((c) => c.progress === 100).length), icon: CheckCircle, color: 'text-green-400' },
    { label: 'Hours Learned', value: `${enrolledCourses.reduce((sum, c) => sum + ((Number(c.totalLessons || 0) * 30 * Number(c.progress || 0)) / 100), 0).toFixed(0)}h`, icon: Clock, color: 'text-blue-400' },
    { label: 'Certificates', value: String(enrolledCourses.filter((c) => c.certificateEarned).length), icon: Award, color: 'text-[#DC143C]' }
  ];

  const handleDownloadReceipt = (receipt: CourseEnrollmentReceipt) => {
    const lines = [
      'INDIGENA COURSE RECEIPT',
      `Receipt ID: ${receipt.receiptId}`,
      `Course ID: ${receipt.courseId}`,
      `Amount: ${receipt.amount} ${receipt.currency}`,
      `Status: ${receipt.status || 'issued'}`,
      `Issued At: ${receipt.createdAt ? new Date(receipt.createdAt).toISOString() : ''}`
    ];
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${receipt.receiptId || 'course-receipt'}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const filtered = enrolledCourses
    .filter(c => {
      if (filter === 'in-progress') return c.progress > 0 && c.progress < 100;
      if (filter === 'completed') return c.progress === 100;
      return true;
    })
    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.instructor.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'progress') return b.progress - a.progress;
      if (sort === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <>
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">My Learning Journey</h1>
              <p className="text-gray-400 text-sm">
                Track your progress across all enrolled courses {coursesLoading ? '- syncing live data...' : usingMockFallback ? '- preview data' : '- live'}
              </p>
            </div>
            <Link href="/courses" className="flex items-center gap-2 text-[#d4af37] hover:text-[#f4e4a6] text-sm transition-colors">
              <BookOpen size={16} /> Browse More Courses
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(stat => (
              <div key={stat.label} className="bg-[#141414] rounded-xl p-4 border border-[#d4af37]/20">
                <div className="flex items-center gap-3">
                  <stat.icon size={20} className={stat.color} />
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-gray-400 text-xs">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <section className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-white font-semibold">Learning Community</h2>
                <p className="text-sm text-gray-400">
                  Join milestone-based study groups and discussions tied to your course progress.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/courses/study-groups" className="px-3 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-sm hover:bg-[#d4af37]/10 transition-colors">
                  Study Groups
                </Link>
                <Link href="/community" className="px-3 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-sm hover:bg-[#d4af37]/10 transition-colors">
                  Community Hub
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="p-3 bg-[#0a0a0a] border border-[#d4af37]/10 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Early Learners</p>
                <p className="text-white font-semibold mt-1">{enrolledCourses.filter((c) => c.progress < 30).length} courses under 30%</p>
              </div>
              <div className="p-3 bg-[#0a0a0a] border border-[#d4af37]/10 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Active Cohorts</p>
                <p className="text-white font-semibold mt-1">{enrolledCourses.filter((c) => c.progress >= 30 && c.progress < 100).length} courses in progress</p>
              </div>
              <div className="p-3 bg-[#0a0a0a] border border-[#d4af37]/10 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Mentor Eligible</p>
                <p className="text-white font-semibold mt-1">{enrolledCourses.filter((c) => c.progress === 100).length} completed courses</p>
              </div>
            </div>
          </section>

          <div className="flex gap-6">
            {/* Main Course List */}
            <div className="flex-1 min-w-0">
              {/* Search & Filters */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search your courses..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-[#d4af37]/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="flex items-center bg-[#141414] border border-[#d4af37]/20 rounded-lg overflow-hidden">
                  {(['all', 'in-progress', 'completed'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-4 py-2 text-sm transition-colors ${filter === f ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
                    >
                      {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-gray-500" />
                  <select value={sort} onChange={e => setSort(e.target.value)}
                    className="bg-[#141414] border border-[#d4af37]/20 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="recent">Recently Accessed</option>
                    <option value="progress">By Progress</option>
                    <option value="title">By Title</option>
                  </select>
                </div>
              </div>

              {/* Course Cards */}
              <div className="space-y-4">
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No courses match your filter</p>
                  </div>
                )}

                {filtered.map(course => (
                  <div key={course.id} className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden hover:border-[#d4af37]/40 transition-all group">
                    <div className="flex gap-0">
                      {/* Thumbnail */}
                      <div className="relative w-52 flex-shrink-0 hidden sm:block">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#d4af37]/90 flex items-center justify-center">
                            <Play size={18} className="text-black ml-0.5" />
                          </div>
                        </div>
                        {course.progress === 100 && (
                          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle size={16} className="text-white" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <span className="text-xs text-[#d4af37] mb-1 block">{course.category}</span>
                            <h3 className="text-white font-semibold text-lg leading-tight">{course.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">by {course.instructor}</p>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-xs flex-shrink-0">
                            <Clock size={12} />{course.lastAccessed}
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-400">{course.completedLessons}/{course.totalLessons} lessons</span>
                            <span className={`font-semibold ${course.progress === 100 ? 'text-green-400' : 'text-[#d4af37]'}`}>{course.progress}%</span>
                          </div>
                          <ProgressBar value={course.progress} />
                        </div>

                        {/* Meta & Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock size={11} />{course.timeSpent} spent</span>
                            <span className="flex items-center gap-1"><BarChart3 size={11} />{course.duration} total</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {course.certificateEarned && (
                              <Link href={`/courses/certificate/${course.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-xs hover:bg-green-500/20 transition-colors"
                              >
                                <Award size={12} /> Certificate
                              </Link>
                            )}

                            {course.progress === 100 ? (
                              <Link href={`/courses/learn/${course.id}`}
                                className="flex items-center gap-2 px-4 py-1.5 bg-[#141414] border border-[#d4af37]/30 text-gray-300 rounded-lg text-sm hover:border-[#d4af37] transition-colors"
                              >
                                <RotateCcw size={14} /> Review
                              </Link>
                            ) : (
                              <Link href={`/courses/learn/${course.id}`}
                                className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all"
                              >
                                <Play size={14} /> Continue
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Next Lesson */}
                        {course.nextLesson && (
                          <div className="mt-3 pt-3 border-t border-[#d4af37]/10 flex items-center gap-2 text-xs text-gray-500">
                            <ChevronRight size={12} className="text-[#d4af37]" />
                            <span>Up next: <span className="text-gray-300">{course.nextLesson}</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* My Course Receipts */}
              <section className="mt-8 bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Download size={16} className="text-[#d4af37]" />
                    My Course Receipts
                  </h3>
                  <span className="text-xs text-gray-400">{receipts.length} receipts</span>
                </div>

                {receiptsLoading && (
                  <p className="text-sm text-gray-400">Loading receipts...</p>
                )}
                {receiptsError && (
                  <p className="text-sm text-amber-400">{receiptsError}</p>
                )}

                {!receiptsLoading && !receiptsError && receipts.length === 0 && (
                  <p className="text-sm text-gray-500">No receipts yet. Enroll in a paid course to generate receipts.</p>
                )}

                {!receiptsLoading && receipts.length > 0 && (
                  <div className="space-y-2">
                    {receipts.map((receipt) => (
                      <div
                        key={receipt.receiptId}
                        className="flex items-center justify-between gap-3 p-3 bg-[#0a0a0a] border border-[#d4af37]/10 rounded-lg"
                      >
                        <div>
                          <p className="text-sm text-white font-medium">{receipt.receiptId}</p>
                          <p className="text-xs text-gray-500">
                            Course {receipt.courseId} • {receipt.amount} {receipt.currency} • {receipt.status || 'issued'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownloadReceipt(receipt)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-xs hover:bg-[#d4af37]/10 transition-colors"
                        >
                          <Download size={12} />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar: Streak + Achievements */}
            <div className="w-72 flex-shrink-0 space-y-5">
              {/* Weekly Streak */}
              <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Flame size={18} className="text-orange-400" /> Weekly Streak
                </h3>
                <div className="flex justify-between mb-4">
                  {['M','T','W','T','F','S','S'].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${i < 5 ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-[#0a0a0a] text-gray-600'}`}>
                        {i < 5 ? <CheckCircle size={14} /> : <Lock size={12} />}
                      </div>
                      <span className="text-gray-500 text-xs">{day}</span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[#d4af37] font-bold text-xl">7 Days 🔥</p>
                <p className="text-center text-gray-400 text-xs mt-1">Keep it up! You&apos;re on fire</p>
              </div>

              {/* Learning Stats */}
              <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-400" /> This Week
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Lessons completed</span>
                    <span className="text-white font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Time spent</span>
                    <span className="text-white font-semibold">5h 40m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Quizzes passed</span>
                    <span className="text-white font-semibold">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">XP earned</span>
                    <span className="text-[#d4af37] font-semibold">+420 XP</span>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Award size={18} className="text-[#d4af37]" /> Achievements
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {achievements.map((ach, i) => (
                    <div key={i} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${ach.earned ? 'bg-[#0a0a0a]' : 'bg-[#0a0a0a] opacity-40'}`}>
                      <ach.icon size={20} className={ach.earned ? ach.color : 'text-gray-600'} />
                      <span className="text-xs text-center text-gray-400 leading-tight">{ach.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Schedule */}
              <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-purple-400" /> Upcoming Sessions
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="text-center flex-shrink-0">
                      <p className="text-[#d4af37] font-bold text-lg leading-none">26</p>
                      <p className="text-gray-500 text-xs">FEB</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Live Weaving Q&A</p>
                      <p className="text-gray-500 text-xs">Maria Begay • 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="text-center flex-shrink-0">
                      <p className="text-[#d4af37] font-bold text-lg leading-none">03</p>
                      <p className="text-gray-500 text-xs">MAR</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Beadwork Workshop</p>
                      <p className="text-gray-500 text-xs">Winona Thunderbird • 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
