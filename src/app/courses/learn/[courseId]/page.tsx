'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack, 
  SkipForward,
  Settings,
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Download,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bookmark,
  Share2,
  Award,
  MoreVertical,
  Send,
  ThumbsUp,
  Flag
} from 'lucide-react';
import Link from 'next/link';
import {
  fetchCourseById,
  fetchCourseProgress,
  syncCourseProgress,
  type CourseRecord
} from '@/app/lib/coursesMarketplaceApi';

// Mock course data
const courseData = {
  id: '1',
  title: 'Navajo Weaving Masterclass',
  instructor: {
    name: 'Maria Begay',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    title: 'Master Weaver & Cultural Educator',
    bio: 'Third-generation Navajo weaver with 30+ years of experience. Featured in Smithsonian exhibitions.'
  },
  progress: 45,
  totalLessons: 24,
  completedLessons: 11,
  totalDuration: '18h 30m',
  timeSpent: '8h 15m',
  certificateUnlockAt: 100,
  modules: [
    {
      id: 'm1',
      title: 'Introduction to Navajo Weaving',
      duration: '2h 15m',
      lessons: [
        { id: 'l1', title: 'Welcome & Course Overview', duration: '8:30', type: 'video', completed: true },
        { id: 'l2', title: 'History & Cultural Significance', duration: '15:45', type: 'video', completed: true },
        { id: 'l3', title: 'Understanding the Loom', duration: '22:10', type: 'video', completed: true },
        { id: 'l4', title: 'Materials & Tools Guide', duration: '18:20', type: 'video', completed: true },
        { id: 'l5', title: 'Module 1 Quiz', duration: '10 min', type: 'quiz', completed: true }
      ]
    },
    {
      id: 'm2',
      title: 'Foundation Techniques',
      duration: '3h 45m',
      lessons: [
        { id: 'l6', title: 'Warping the Loom', duration: '28:15', type: 'video', completed: true },
        { id: 'l7', title: 'Basic Weaving Stitches', duration: '35:40', type: 'video', completed: true },
        { id: 'l8', title: 'Creating Straight Edges', duration: '25:30', type: 'video', completed: true },
        { id: 'l9', title: 'Practice Exercise: Simple Band', duration: '42:00', type: 'video', completed: true },
        { id: 'l10', title: 'Troubleshooting Common Issues', duration: '20:15', type: 'video', completed: false, current: true }
      ]
    },
    {
      id: 'm3',
      title: 'Traditional Patterns',
      duration: '4h 20m',
      lessons: [
        { id: 'l11', title: 'The Two Grey Hills Pattern', duration: '45:00', type: 'video', completed: false },
        { id: 'l12', title: 'Crystal Style Weaving', duration: '38:30', type: 'video', completed: false },
        { id: 'l13', title: 'Ganado Red Patterns', duration: '52:15', type: 'video', completed: false },
        { id: 'l14', title: 'Pattern Workbook Download', duration: '5 min', type: 'resource', completed: false }
      ]
    },
    {
      id: 'm4',
      title: 'Color & Design',
      duration: '3h 10m',
      lessons: [
        { id: 'l15', title: 'Natural Dye Preparation', duration: '40:20', type: 'video', completed: false },
        { id: 'l16', title: 'Color Theory in Weaving', duration: '28:45', type: 'video', completed: false },
        { id: 'l17', title: 'Creating Custom Palettes', duration: '33:10', type: 'video', completed: false }
      ]
    },
    {
      id: 'm5',
      title: 'Advanced Projects',
      duration: '5h 00m',
      lessons: [
        { id: 'l18', title: 'Project: Small Rug', duration: '1:15:00', type: 'video', completed: false },
        { id: 'l19', title: 'Project: Saddle Blanket', duration: '1:30:00', type: 'video', completed: false },
        { id: 'l20', title: 'Project: Wall Hanging', duration: '1:45:00', type: 'video', completed: false },
        { id: 'l21', title: 'Finishing Techniques', duration: '35:00', type: 'video', completed: false }
      ]
    }
  ],
  resources: [
    { id: 'r1', title: 'Navajo Weaving Pattern Book', type: 'pdf', size: '12.5 MB' },
    { id: 'r2', title: 'Color Dye Chart', type: 'pdf', size: '3.2 MB' },
    { id: 'r3', title: 'Loom Setup Checklist', type: 'pdf', size: '1.8 MB' },
    { id: 'r4', title: 'Supplier Contact List', type: 'pdf', size: '0.5 MB' }
  ]
};

function mapLiveCourseToPlayer(course: CourseRecord) {
  const lessons = Array.isArray(course.modules)
    ? (course.modules as Array<{
        moduleId?: string;
        title?: string;
        duration?: number;
        contentType?: string;
      }>)
    : [];
  const mappedLessons = lessons.map((lesson, index) => ({
    id: String(lesson.moduleId || `l${index + 1}`),
    title: String(lesson.title || `Lesson ${index + 1}`),
    duration: `${Math.max(1, Number(lesson.duration || 0))} min`,
    type: String(lesson.contentType || 'video'),
    completed: false,
    current: false
  }));

  return {
    id: String(course.courseId || course._id || 'course-live'),
    title: String(course.title || 'Course'),
    instructor: {
      name: String(course.creatorAddress || 'Indigenous Educator'),
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      title: 'Course Instructor',
      bio: 'Instructor profile available from live data.'
    },
    progress: 0,
    totalLessons: mappedLessons.length,
    completedLessons: 0,
    totalDuration: `${mappedLessons.reduce((sum, lesson) => sum + (Number(String(lesson.duration).replace(/[^\d]/g, '')) || 0), 0)} min`,
    timeSpent: '0m',
    certificateUnlockAt: 100,
    modules: [
      {
        id: 'm1',
        title: 'Course Content',
        duration: `${mappedLessons.length} lessons`,
        lessons: mappedLessons
      }
    ],
    resources: []
  };
}

// Mock discussion data
const discussions = [
  {
    id: 'd1',
    user: { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    content: 'What type of wool do you recommend for beginners? I\'m having trouble finding high-quality Navajo-Churro wool.',
    timestamp: '2 hours ago',
    likes: 12,
    replies: 3,
    isInstructor: false
  },
  {
    id: 'd2',
    user: { name: 'Maria Begay', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    content: 'Great question Sarah! For beginners, I recommend starting with commercially prepared wool while you master the techniques. Once comfortable, transition to Navajo-Churro. I\'ll share my supplier list in the resources section.',
    timestamp: '1 hour ago',
    likes: 28,
    replies: 0,
    isInstructor: true
  }
];

// Mock transcript
const transcript = [
  { time: '0:00', text: 'Welcome back to the Navajo Weaving Masterclass.' },
  { time: '0:08', text: 'In this lesson, we\'ll address the most common issues beginners face.' },
  { time: '0:15', text: 'First, let\'s talk about uneven tension in your warp threads.' },
  { time: '0:25', text: 'This is probably the number one problem I see in student work.' },
  { time: '0:32', text: 'When your tension is uneven, your weaving will have visible gaps and inconsistencies.' },
  { time: '0:45', text: 'The solution is to check your tension every few rows...' }
];

export default function CourseLearningPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = String(params?.courseId || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'resources' | 'discussion'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [runtimeCourse, setRuntimeCourse] = useState(courseData);
  const [currentLesson, setCurrentLesson] = useState(courseData.modules[1].lessons[4]);
  const [progress, setProgress] = useState(courseData.progress);
  const [usingMockFallback, setUsingMockFallback] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const liveCourse = await fetchCourseById(courseId);
        if (!active || !liveCourse) return;
        const mapped = mapLiveCourseToPlayer(liveCourse);
        if (!mapped.modules[0]?.lessons?.length) return;
        setRuntimeCourse(mapped);
        setCurrentLesson(mapped.modules[0].lessons[0]);
        setProgress(0);
        setUsingMockFallback(false);

        try {
          const progressResponse = await fetchCourseProgress(courseId);
          if (!active) return;
          const pct = Number(progressResponse?.progress?.percentComplete || 0);
          setProgress(Math.max(0, Math.min(100, pct)));
          const lessonId = String(progressResponse?.progress?.currentLessonId || '').trim();
          if (lessonId) {
            const flattened = mapped.modules.flatMap((m) => m.lessons);
            const found = flattened.find((x) => x.id === lessonId);
            if (found) setCurrentLesson(found);
          }
        } catch {
          // Keep live course with local progress when progress API is unavailable.
        }
      } catch {
        if (!active) return;
        setRuntimeCourse(courseData);
        setCurrentLesson(courseData.modules[1].lessons[4]);
        setProgress(courseData.progress);
        setUsingMockFallback(true);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [courseId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLessonComplete = () => {
    setProgress(prev => Math.min(prev + 4, 100));
    if (!usingMockFallback) {
      void syncCourseProgress(courseId, { currentLessonId: currentLesson.id, completedModuleId: currentLesson.id });
    }
  };

  const toggleBookmark = (lessonId: string) => {
    setBookmarks(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const allLessons = runtimeCourse.modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  return (
    <>
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/courses"
                className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors"
              >
                <ChevronLeft size={20} />
                <span className="text-sm">Back to Courses</span>
              </Link>
              <div className="h-6 w-px bg-[#d4af37]/20" />
              <h1 className="text-white font-semibold truncate max-w-md">{runtimeCourse.title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[#d4af37] text-sm font-medium">{progress}%</span>
              </div>
              
              {/* Certificate Preview */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                progress >= 100 
                  ? 'bg-[#d4af37]/20 text-[#d4af37]' 
                  : 'bg-[#0a0a0a] text-gray-500'
              }`}>
                <Award size={16} />
                <span className="text-xs">{progress >= 100 ? 'Certificate Ready' : 'Locked'}</span>
              </div>
            </div>
          </div>
        </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Video & Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Video Player */}
            <div 
              ref={videoRef}
              className="relative bg-black aspect-video flex items-center justify-center group"
            >
              {/* Placeholder Video */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
              <img 
                src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&h=675&fit=crop"
                alt="Lesson"
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
              
              {/* Play Button Overlay */}
              {!isPlaying && (
                <button 
                  onClick={() => setIsPlaying(true)}
                  className="relative z-10 w-20 h-20 rounded-full bg-[#d4af37]/90 flex items-center justify-center hover:bg-[#d4af37] hover:scale-110 transition-all"
                >
                  <Play size={32} className="text-black ml-1" />
                </button>
              )}

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer">
                  <div className="w-1/3 h-full bg-[#d4af37] rounded-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#d4af37] rounded-full" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-[#d4af37] transition-colors"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    
                    <button className="text-white hover:text-[#d4af37] transition-colors">
                      <SkipBack size={20} />
                    </button>
                    
                    <button className="text-white hover:text-[#d4af37] transition-colors">
                      <SkipForward size={20} />
                    </button>
                    
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:text-[#d4af37] transition-colors"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    
                    <span className="text-white text-sm">8:45 / {currentLesson.duration}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Playback Speed */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="text-white text-sm hover:text-[#d4af37] transition-colors"
                      >
                        {playbackSpeed}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-[#141414] border border-[#d4af37]/20 rounded-lg overflow-hidden">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                            <button
                              key={speed}
                              onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false); }}
                              className={`block w-full px-4 py-2 text-sm text-left hover:bg-[#d4af37]/10 ${
                                playbackSpeed === speed ? 'text-[#d4af37]' : 'text-white'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={toggleFullscreen}
                      className="text-white hover:text-[#d4af37] transition-colors"
                    >
                      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Info & Tabs */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Lesson Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-[#d4af37]/20 text-[#d4af37] text-xs rounded">
                        Lesson {currentIndex + 1} of {allLessons.length}
                      </span>
                      {currentLesson.completed && (
                        <span className="flex items-center gap-1 text-green-500 text-xs">
                          <CheckCircle size={12} />
                          Completed
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {currentLesson.duration}
                      </span>
                <span>{runtimeCourse.instructor.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleBookmark(currentLesson.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        bookmarks.includes(currentLesson.id)
                          ? 'bg-[#d4af37]/20 text-[#d4af37]'
                          : 'bg-[#141414] text-gray-400 hover:text-[#d4af37]'
                      }`}
                    >
                      <Bookmark size={20} />
                    </button>
                    <button className="p-2 bg-[#141414] text-gray-400 hover:text-[#d4af37] rounded-lg transition-colors">
                      <Share2 size={20} />
                    </button>
                    <button className="p-2 bg-[#141414] text-gray-400 hover:text-[#d4af37] rounded-lg transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-[#d4af37]/20 mb-6">
                  <div className="flex gap-6">
                    {[
                      { id: 'overview' as const, label: 'Overview', icon: FileText },
                      { id: 'transcript' as const, label: 'Transcript', icon: MessageCircle },
                      { id: 'resources' as const, label: 'Resources', icon: Download },
                      { id: 'discussion' as const, label: 'Discussion', icon: MessageCircle }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
                          activeTab === tab.id
                            ? 'text-[#d4af37] border-[#d4af37]'
                            : 'text-gray-400 border-transparent hover:text-white'
                        }`}
                      >
                        <tab.icon size={16} />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">About This Lesson</h3>
                        <p className="text-gray-400 leading-relaxed">
                          In this lesson, Maria addresses the most common issues beginners face when learning Navajo weaving. 
                          From uneven tension to broken warp threads, you&apos;ll learn practical solutions to keep your weaving 
                          practice moving forward smoothly.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">What You&apos;ll Learn</h3>
                        <ul className="space-y-2">
                          {[
                            'Identify and fix uneven tension issues',
                            'Prevent and repair broken warp threads',
                            'Correct edge curling problems',
                            'Maintain consistent beat throughout your piece'
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-gray-400">
                              <CheckCircle size={16} className="text-[#d4af37]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Instructor Card */}
                      <div className="bg-[#141414] rounded-xl p-4 border border-[#d4af37]/20">
                        <div className="flex items-start gap-4">
                          <img 
                    src={runtimeCourse.instructor.avatar}
                    alt={runtimeCourse.instructor.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                  <h4 className="text-white font-semibold">{runtimeCourse.instructor.name}</h4>
                  <p className="text-[#d4af37] text-sm">{runtimeCourse.instructor.title}</p>
                  <p className="text-gray-400 text-sm mt-2">{runtimeCourse.instructor.bio}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'transcript' && (
                    <div className="space-y-3">
                      {transcript.map((item, idx) => (
                        <div key={idx} className="flex gap-4 group cursor-pointer hover:bg-[#141414] p-2 rounded-lg transition-colors">
                          <span className="text-[#d4af37] text-sm font-mono w-12 flex-shrink-0">{item.time}</span>
                          <p className="text-gray-300">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'resources' && (
                    <div className="space-y-3">
                {runtimeCourse.resources.map((resource) => (
                        <div 
                          key={resource.id}
                          className="flex items-center justify-between p-4 bg-[#141414] rounded-lg border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#d4af37]/10 rounded-lg flex items-center justify-center">
                              <FileText size={20} className="text-[#d4af37]" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{resource.title}</p>
                              <p className="text-gray-400 text-sm">{resource.type.toUpperCase()} • {resource.size}</p>
                            </div>
                          </div>
                          <button className="flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/20 transition-colors">
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'discussion' && (
                    <div className="space-y-6">
                      {/* New Comment */}
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#d4af37] font-medium">You</span>
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Ask a question or share your thoughts..."
                            className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end mt-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black rounded-lg hover:bg-[#f4e4a6] transition-colors">
                              <Send size={16} />
                              Post
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Discussion List */}
                      <div className="space-y-4">
                        {discussions.map((discussion) => (
                          <div key={discussion.id} className="flex gap-3 p-4 bg-[#141414] rounded-lg">
                            <img 
                              src={discussion.user.avatar}
                              alt={discussion.user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium">{discussion.user.name}</span>
                                {discussion.isInstructor && (
                                  <span className="px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] text-xs rounded">
                                    Instructor
                                  </span>
                                )}
                                <span className="text-gray-500 text-sm">{discussion.timestamp}</span>
                              </div>
                              <p className="text-gray-300 mb-3">{discussion.content}</p>
                              <div className="flex items-center gap-4">
                                <button className="flex items-center gap-1 text-gray-400 hover:text-[#d4af37] transition-colors text-sm">
                                  <ThumbsUp size={14} />
                                  {discussion.likes}
                                </button>
                                <button className="flex items-center gap-1 text-gray-400 hover:text-[#d4af37] transition-colors text-sm">
                                  <MessageCircle size={14} />
                                  {discussion.replies} replies
                                </button>
                                <button className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">
                                  <Flag size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Course Sidebar */}
          <div className={`bg-[#141414] border-l border-[#d4af37]/20 transition-all duration-300 ${
            sidebarOpen ? 'w-96' : 'w-0 overflow-hidden'
          }`}>
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-[#d4af37]/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Course Content</h3>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{runtimeCourse.completedLessons} / {runtimeCourse.totalLessons} lessons</span>
                  <span className="text-[#d4af37]">{progress}% complete</span>
                </div>
              </div>

              {/* Modules List */}
              <div className="flex-1 overflow-y-auto">
                {runtimeCourse.modules.map((module, moduleIdx) => (
                  <div key={module.id} className="border-b border-[#d4af37]/10">
                    <div className="p-4 bg-[#0a0a0a]">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-medium text-sm">Section {moduleIdx + 1}: {module.title}</h4>
                      </div>
                      <p className="text-gray-500 text-xs">{module.lessons.length} lessons • {module.duration}</p>
                    </div>
                    
                    <div>
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                            onClick={() => {
                              setCurrentLesson(lesson);
                              if (!usingMockFallback) {
              void syncCourseProgress(courseId, { currentLessonId: lesson.id, resumePositionSec: 0 });
                              }
                            }}
                          className={`w-full flex items-center gap-3 p-3 text-left hover:bg-[#1a1a1a] transition-colors ${
                            currentLesson.id === lesson.id ? 'bg-[#d4af37]/10 border-l-2 border-[#d4af37]' : ''
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            lesson.completed 
                              ? 'bg-green-500/20 text-green-500' 
                              : currentLesson.id === lesson.id
                                ? 'bg-[#d4af37]/20 text-[#d4af37]'
                                : 'bg-[#141414] text-gray-500'
                          }`}>
                            {lesson.completed ? <CheckCircle size={12} /> : <Circle size={12} />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${
                              currentLesson.id === lesson.id ? 'text-[#d4af37]' : 'text-gray-300'
                            }`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{lesson.duration}</span>
                              {lesson.type === 'quiz' && (
                                <span className="px-1.5 py-0.5 bg-[#DC143C]/20 text-[#DC143C] text-xs rounded">Quiz</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle Sidebar Button (when closed) */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute right-4 top-20 z-10 p-2 bg-[#141414] border border-[#d4af37]/20 rounded-lg text-gray-400 hover:text-[#d4af37] transition-colors"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="bg-[#141414] border-t border-[#d4af37]/20 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button 
              disabled={!prevLesson}
              onClick={() => {
                if (!prevLesson) return;
                setCurrentLesson(prevLesson);
                if (!usingMockFallback) {
              void syncCourseProgress(courseId, { currentLessonId: prevLesson.id, resumePositionSec: 0 });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">Previous Lesson</span>
            </button>
            
            <button 
              onClick={handleLessonComplete}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
            >
              <CheckCircle size={18} />
              Mark as Complete
            </button>
            
            <button 
              disabled={!nextLesson}
              onClick={() => {
                if (!nextLesson) return;
                setCurrentLesson(nextLesson);
                if (!usingMockFallback) {
              void syncCourseProgress(courseId, { currentLessonId: nextLesson.id, resumePositionSec: 0 });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-sm">Next Lesson</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
