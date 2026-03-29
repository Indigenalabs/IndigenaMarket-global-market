'use client';

import { useState } from 'react';
import { 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
  MoreVertical,
  Calendar,
  User,
  BookOpen,
  Star,
  Award,
  ChevronDown,
  Download,
  Send
} from 'lucide-react';
import Link from 'next/link';

interface CourseReview {
  id: string;
  title: string;
  instructor: {
    name: string;
    avatar: string;
    email: string;
  };
  category: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  priority: 'high' | 'medium' | 'low';
  lessons: number;
  duration: string;
  price: number;
  verificationTier: string;
  reviewNotes?: string;
}

// Mock review data
const reviewData: CourseReview[] = [
  {
    id: '1',
    title: 'Advanced Navajo Weaving: Storm Pattern',
    instructor: {
      name: 'Maria Begay',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      email: 'maria.begay@email.com'
    },
    category: 'Traditional Arts',
    submittedAt: '2 hours ago',
    status: 'pending',
    priority: 'high',
    lessons: 18,
    duration: '8h 30m',
    price: 299,
    verificationTier: 'Platinum'
  },
  {
    id: '2',
    title: 'Cherokee Language: Beginner to Intermediate',
    instructor: {
      name: 'David White',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      email: 'david.white@email.com'
    },
    category: 'Language Preservation',
    submittedAt: '5 hours ago',
    status: 'pending',
    priority: 'medium',
    lessons: 32,
    duration: '12h 45m',
    price: 199,
    verificationTier: 'Gold'
  },
  {
    id: '3',
    title: 'Traditional Indigenous Cooking',
    instructor: {
      name: 'Lisa Redbird',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      email: 'lisa.redbird@email.com'
    },
    category: 'Cultural Heritage',
    submittedAt: '1 day ago',
    status: 'needs_revision',
    priority: 'medium',
    lessons: 15,
    duration: '6h 20m',
    price: 149,
    verificationTier: 'Silver',
    reviewNotes: 'Please add more context about the cultural significance of each dish.'
  },
  {
    id: '4',
    title: 'Beadwork for Beginners',
    instructor: {
      name: 'Jennifer Tallbear',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      email: 'jennifer.t@email.com'
    },
    category: 'Traditional Arts',
    submittedAt: '2 days ago',
    status: 'approved',
    priority: 'low',
    lessons: 12,
    duration: '5h 30m',
    price: 99,
    verificationTier: 'Bronze'
  },
  {
    id: '5',
    title: 'Indigenous Business Ethics',
    instructor: {
      name: 'Robert Blackhawk',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      email: 'robert.b@email.com'
    },
    category: 'Business',
    submittedAt: '3 days ago',
    status: 'rejected',
    priority: 'high',
    lessons: 8,
    duration: '4h 15m',
    price: 249,
    verificationTier: 'Gold',
    reviewNotes: 'Content does not meet our quality standards. Please revise and resubmit.'
  },
];

export default function CourseReviewQueuePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<CourseReview | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const filteredCourses = reviewData.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || course.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    pending: reviewData.filter(c => c.status === 'pending').length,
    approved: reviewData.filter(c => c.status === 'approved').length,
    rejected: reviewData.filter(c => c.status === 'rejected').length,
    needsRevision: reviewData.filter(c => c.status === 'needs_revision').length,
  };

  const handleApprove = () => {
    alert(`Course "${selectedCourse?.title}" approved!`);
    setSelectedCourse(null);
    setReviewNote('');
  };

  const handleReject = () => {
    alert(`Course "${selectedCourse?.title}" rejected with feedback.`);
    setSelectedCourse(null);
    setReviewNote('');
  };

  const handleRequestRevision = () => {
    alert(`Revision requested for "${selectedCourse?.title}".`);
    setSelectedCourse(null);
    setReviewNote('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Course Review Queue</h1>
            <p className="text-gray-400 text-sm">Review and approve submitted courses</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/20 transition-colors text-sm">
              <Download size={16} />
              Export Queue
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: '#f59e0b' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: '#22c55e' },
            { label: 'Needs Revision', value: stats.needsRevision, icon: AlertCircle, color: '#DC143C' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#6b7280' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#141414] rounded-xl p-5 border border-[#d4af37]/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + '20' }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search courses or instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-[#141414] border border-[#d4af37]/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#141414] border border-[#d4af37]/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="needs_revision">Needs Revision</option>
              <option value="rejected">Rejected</option>
            </select>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#141414] border border-[#d4af37]/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Review Queue */}
        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-[#d4af37]/10 bg-[#0a0a0a]">
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Course</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Instructor</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Details</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Priority</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Submitted</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-[#0a0a0a]/50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-white font-medium">{course.title}</p>
                      <p className="text-gray-400 text-sm">{course.category}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={course.instructor.avatar} alt={course.instructor.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="text-white text-sm">{course.instructor.name}</p>
                        <p className="text-gray-500 text-xs">{course.instructor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-400">
                      <p>{course.lessons} lessons • {course.duration}</p>
                      <p className="text-[#d4af37]">{course.price} INDI</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      course.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {course.priority.charAt(0).toUpperCase() + course.priority.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      course.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      course.status === 'needs_revision' ? 'bg-[#DC143C]/20 text-[#DC143C]' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {course.status === 'needs_revision' ? 'Needs Revision' : 
                       course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-sm">
                    {course.submittedAt}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedCourse(course)}
                        className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      {course.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => {
                              setSelectedCourse(course);
                              setReviewNote('');
                            }}
                            className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedCourse(course);
                              setReviewNote('');
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Review Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
          <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/30 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#d4af37]/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedCourse.title}</h3>
                  <p className="text-gray-400">{selectedCourse.category}</p>
                </div>
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Instructor Info */}
              <div className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-lg">
                <img 
                  src={selectedCourse.instructor.avatar}
                  alt={selectedCourse.instructor.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="text-white font-medium">{selectedCourse.instructor.name}</p>
                  <p className="text-gray-400 text-sm">{selectedCourse.instructor.email}</p>
                </div>
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-[#0a0a0a] rounded-lg text-center">
                  <BookOpen size={20} className="text-[#d4af37] mx-auto mb-2" />
                  <p className="text-white font-medium">{selectedCourse.lessons}</p>
                  <p className="text-gray-400 text-xs">Lessons</p>
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-lg text-center">
                  <Clock size={20} className="text-[#d4af37] mx-auto mb-2" />
                  <p className="text-white font-medium">{selectedCourse.duration}</p>
                  <p className="text-gray-400 text-xs">Duration</p>
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-lg text-center">
                  <Award size={20} className="text-[#d4af37] mx-auto mb-2" />
                  <p className="text-white font-medium">{selectedCourse.verificationTier}</p>
                  <p className="text-gray-400 text-xs">Tier</p>
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-lg text-center">
                  <Star size={20} className="text-[#d4af37] mx-auto mb-2" />
                  <p className="text-white font-medium">{selectedCourse.price} INDI</p>
                  <p className="text-gray-400 text-xs">Price</p>
                </div>
              </div>

              {/* Preview Placeholder */}
              <div>
                <h4 className="text-white font-medium mb-3">Course Preview</h4>
                <div className="aspect-video bg-[#0a0a0a] rounded-lg border border-dashed border-[#d4af37]/30 flex items-center justify-center">
                  <p className="text-gray-400">Course content preview would appear here</p>
                </div>
              </div>

              {/* Previous Review Notes */}
              {selectedCourse.reviewNotes && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-amber-400" />
                    <span className="text-amber-400 font-medium">Previous Review Notes</span>
                  </div>
                  <p className="text-gray-300">{selectedCourse.reviewNotes}</p>
                </div>
              )}

              {/* Review Notes Input */}
              {selectedCourse.status === 'pending' && (
                <div>
                  <h4 className="text-white font-medium mb-3">Review Notes</h4>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add your review notes or feedback for the instructor..."
                    rows={4}
                    className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedCourse.status === 'pending' && (
              <div className="p-6 border-t border-[#d4af37]/20 flex justify-end gap-3">
                <button 
                  onClick={handleReject}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button 
                  onClick={handleRequestRevision}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors"
                >
                  <AlertCircle size={16} />
                  Request Revision
                </button>
                <button 
                  onClick={handleApprove}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
                >
                  <CheckCircle size={16} />
                  Approve Course
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
