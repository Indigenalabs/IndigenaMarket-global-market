'use client';

import { Suspense, useEffect, useState, useRef, type ReactNode } from 'react';
import { 
  Plus, FileText, GripVertical, Trash2, Edit3, Eye, Save, Upload,
  DollarSign, Award, ChevronDown, ChevronRight, ChevronLeft, MoreVertical,
  CheckCircle, AlertCircle, Image as ImageIcon, Film, FileQuestion, X,
  Settings, BarChart3, Users, Star, TrendingUp, Wallet, Tag,
  Clock, Video, Mic, Calendar, PlayCircle, BookOpen,
  Target, List, MonitorPlay
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PILLAR3_CATEGORIES } from '../data/pillar3Catalog';
import {
  createCourseListing,
  updateCourseListing,
  submitCourseForReview,
  publishCourseListing
} from '@/app/lib/coursesMarketplaceApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import SimpleModeDock from '@/app/components/SimpleModeDock';
import VoiceInputButton from '@/app/components/VoiceInputButton';
import { resolveCurrentCreatorProfileSlug } from '@/app/lib/accountAuthClient';
import { fetchPublicProfile, updateProfileOffering } from '@/app/lib/profileApi';
import type { ProfileOffering } from '@/app/profile/data/profileShowcase';

// â”€â”€ 12 Course Category Definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Shared Pillar 3 category catalog
const COURSE_CATEGORIES = PILLAR3_CATEGORIES.map((category) => ({
  id: category.id,
  name: category.name,
  icon: category.iconEmoji,
  subcategories: category.topics
}));

const SIMPLE_COURSE_LEVELS = [
  { value: 'Beginner', label: 'Start here', icon: 'Seed' },
  { value: 'Intermediate', label: 'Build skills', icon: 'Path' },
  { value: 'Advanced', label: 'Deep practice', icon: 'Peak' },
  { value: 'All Levels', label: 'Everyone', icon: 'Circle' }
] as const;

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'text_answer';
  question: string;
  options?: string[];
  correctAnswer?: number | boolean | string;
  explanation?: string;
  points: number;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: string;
  content: string;
  videoUrl?: string;
  isPreview?: boolean;
  quizQuestions?: Question[];
  quizSettings?: {
    passingScore: number;
    allowRetakes: boolean;
    showCorrectAnswers: boolean;
    timeLimit?: number;
  };
  liveSessionData?: {
    title: string;
    description: string;
    date: string;
    time: string;
    duration: number;
    timezone: string;
    maxParticipants: number;
    meetingLink: string;
    notifyStudents: boolean;
    recordingEnabled: boolean;
  };
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

// Quiz Builder Component
function QuizBuilder({ lesson, onUpdate }: { lesson: Lesson; onUpdate: (lesson: Lesson) => void }) {
  const [questions, setQuestions] = useState<Question[]>(lesson.quizQuestions || []);
  const [settings, setSettings] = useState(lesson.quizSettings || { passingScore: 70, allowRetakes: true, showCorrectAnswers: true });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: '',
      options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
      correctAnswer: type === 'true_false' ? true : type === 'multiple_choice' ? 0 : '',
      explanation: '',
      points: 1
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    onUpdate({ ...lesson, quizQuestions: updated, quizSettings: settings });
    setEditingQuestionId(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const updated = questions.map(q => q.id === id ? { ...q, ...updates } : q);
    setQuestions(updated);
    onUpdate({ ...lesson, quizQuestions: updated, quizSettings: settings });
  };

  const deleteQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    onUpdate({ ...lesson, quizQuestions: updated, quizSettings: settings });
  };

  const updateSettings = (updates: Partial<typeof settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onUpdate({ ...lesson, quizQuestions: questions, quizSettings: newSettings });
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-4">
      {/* Settings */}
      <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#d4af37]/20">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Settings size={16} className="text-[#d4af37]" /> Quiz Settings
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Passing Score (%)</label>
            <input
              type="number"
              value={settings.passingScore}
              onChange={e => updateSettings({ passingScore: parseInt(e.target.value) || 0 })}
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded px-3 py-2 text-white text-sm"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Time Limit (minutes, optional)</label>
            <input
              type="number"
              value={settings.timeLimit || ''}
              onChange={e => updateSettings({ timeLimit: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="No limit"
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded px-3 py-2 text-white text-sm placeholder-gray-600"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowRetakes}
              onChange={e => updateSettings({ allowRetakes: e.target.checked })}
              className="w-4 h-4 rounded border-[#d4af37]/30 bg-[#141414] text-[#d4af37]"
            />
            <span className="text-gray-300 text-sm">Allow retakes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showCorrectAnswers}
              onChange={e => updateSettings({ showCorrectAnswers: e.target.checked })}
              className="w-4 h-4 rounded border-[#d4af37]/30 bg-[#141414] text-[#d4af37]"
            />
            <span className="text-gray-300 text-sm">Show correct answers after</span>
          </label>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-medium">Questions ({questions.length}) Â· {totalPoints} points</h4>
          <div className="flex gap-2">
            <button onClick={() => addQuestion('multiple_choice')} className="px-3 py-1.5 bg-[#d4af37]/10 text-[#d4af37] rounded-lg text-xs hover:bg-[#d4af37]/20 transition-colors">
              + Multiple Choice
            </button>
            <button onClick={() => addQuestion('true_false')} className="px-3 py-1.5 bg-[#d4af37]/10 text-[#d4af37] rounded-lg text-xs hover:bg-[#d4af37]/20 transition-colors">
              + True/False
            </button>
            <button onClick={() => addQuestion('text_answer')} className="px-3 py-1.5 bg-[#d4af37]/10 text-[#d4af37] rounded-lg text-xs hover:bg-[#d4af37]/20 transition-colors">
              + Text Answer
            </button>
          </div>
        </div>

        {questions.length === 0 && (
          <div className="p-8 bg-[#0a0a0a] rounded-lg border border-dashed border-[#d4af37]/30 text-center">
            <FileQuestion size={32} className="text-[#d4af37]/50 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No questions yet. Add your first question above.</p>
          </div>
        )}

        {questions.map((q, idx) => (
          <div key={q.id} className="p-4 bg-[#0a0a0a] rounded-lg border border-[#d4af37]/20">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#d4af37]/20 text-[#d4af37] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                {editingQuestionId === q.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={q.question}
                      onChange={e => updateQuestion(q.id, { question: e.target.value })}
                      placeholder="Enter your question..."
                      className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm resize-none"
                      rows={2}
                    />

                    {q.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        {q.options?.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctAnswer === optIdx}
                              onChange={() => updateQuestion(q.id, { correctAnswer: optIdx })}
                              className="w-4 h-4 text-[#d4af37]"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={e => {
                                const newOptions = [...(q.options || [])];
                                newOptions[optIdx] = e.target.value;
                                updateQuestion(q.id, { options: newOptions });
                              }}
                              placeholder={`Option ${optIdx + 1}`}
                              className="flex-1 bg-[#141414] border border-[#d4af37]/20 rounded px-3 py-1.5 text-white text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'true_false' && (
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`tf-${q.id}`}
                            checked={q.correctAnswer === true}
                            onChange={() => updateQuestion(q.id, { correctAnswer: true })}
                            className="w-4 h-4 text-[#d4af37]"
                          />
                          <span className="text-white text-sm">True</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`tf-${q.id}`}
                            checked={q.correctAnswer === false}
                            onChange={() => updateQuestion(q.id, { correctAnswer: false })}
                            className="w-4 h-4 text-[#d4af37]"
                          />
                          <span className="text-white text-sm">False</span>
                        </label>
                      </div>
                    )}

                    {q.type === 'text_answer' && (
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Correct Answer (for auto-grading)</label>
                        <input
                          type="text"
                          value={(q.correctAnswer as string) || ''}
                          onChange={e => updateQuestion(q.id, { correctAnswer: e.target.value })}
                          placeholder="Expected answer..."
                          className="w-full bg-[#141414] border border-[#d4af37]/20 rounded px-3 py-2 text-white text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Explanation (shown after answer)</label>
                      <textarea
                        value={q.explanation || ''}
                        onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                        placeholder="Explain why this is the correct answer..."
                        className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-gray-400 text-xs mr-2">Points:</label>
                        <input
                          type="number"
                          value={q.points}
                          onChange={e => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                          className="w-16 bg-[#141414] border border-[#d4af37]/20 rounded px-2 py-1 text-white text-sm"
                          min="1"
                        />
                      </div>
                      <button onClick={() => setEditingQuestionId(null)} className="px-3 py-1.5 bg-[#d4af37] text-black rounded text-sm font-medium">Done</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-white text-sm mb-2">{q.question || <span className="text-gray-500 italic">No question text</span>}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-[#141414] rounded">{q.type.replace('_', ' ')}</span>
                      <span>{q.points} pt{q.points > 1 ? 's' : ''}</span>
                      {q.correctAnswer !== undefined && q.type !== 'text_answer' && (
                        <span className="text-green-400 flex items-center gap-1"><CheckCircle size={10} /> Answer set</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditingQuestionId(editingQuestionId === q.id ? null : q.id)} className="p-1.5 text-gray-400 hover:text-[#d4af37] transition-colors">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => deleteQuestion(q.id)} className="p-1.5 text-gray-400 hover:text-[#DC143C] transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Live Session Builder Component
function LiveSessionBuilder({ lesson, onUpdate }: { lesson: Lesson; onUpdate: (lesson: Lesson) => void }) {
  const [sessionData, setSessionData] = useState({
    title: lesson.content || '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    maxParticipants: 50,
    meetingLink: '',
    notifyStudents: true,
    recordingEnabled: true,
    ...lesson.liveSessionData
  });

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Anchorage', 'America/Honolulu', 'Europe/London', 'Europe/Paris',
    'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney',
    'Pacific/Auckland'
  ];

  const updateField = (field: string, value: string | number | boolean) => {
    const updated = { ...sessionData, [field]: value };
    setSessionData(updated);
    onUpdate({ ...lesson, content: updated.title, liveSessionData: updated });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Session Info */}
      <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#8b5cf6]/20">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-[#8b5cf6]" /> Live Session Details
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Session Title</label>
            <input
              type="text"
              value={sessionData.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder="e.g., Live Q&A: Navajo Weaving Techniques"
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Description</label>
            <textarea
              value={sessionData.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="What will students learn in this session?"
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#8b5cf6]/20">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Clock size={16} className="text-[#8b5cf6]" /> Schedule
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Date</label>
            <input
              type="date"
              value={sessionData.date}
              onChange={e => updateField('date', e.target.value)}
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm"
            />
            {sessionData.date && (
              <p className="text-[#d4af37] text-xs mt-1">{formatDate(sessionData.date)}</p>
            )}
          </div>
          
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Time</label>
            <input
              type="time"
              value={sessionData.time}
              onChange={e => updateField('time', e.target.value)}
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Duration (minutes)</label>
            <select
              value={sessionData.duration}
              onChange={e => updateField('duration', parseInt(e.target.value))}
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </div>
          
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Timezone</label>
            <select
              value={sessionData.timezone}
              onChange={e => updateField('timezone', e.target.value)}
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Meeting Settings */}
      <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#8b5cf6]/20">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Video size={16} className="text-[#8b5cf6]" /> Meeting Settings
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Meeting Link (Zoom, Google Meet, etc.)</label>
            <input
              type="url"
              value={sessionData.meetingLink}
              onChange={e => updateField('meetingLink', e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Max Participants</label>
            <input
              type="number"
              value={sessionData.maxParticipants}
              onChange={e => updateField('maxParticipants', parseInt(e.target.value) || 50)}
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm"
              min="1"
              max="1000"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#8b5cf6]/20">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Users size={16} className="text-[#8b5cf6]" /> Student Notifications
        </h4>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sessionData.notifyStudents}
              onChange={e => updateField('notifyStudents', e.target.checked)}
              className="w-4 h-4 rounded border-[#d4af37]/30 bg-[#141414] text-[#d4af37]"
            />
            <span className="text-gray-300 text-sm">Notify enrolled students when session is scheduled</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sessionData.recordingEnabled}
              onChange={e => updateField('recordingEnabled', e.target.checked)}
              className="w-4 h-4 rounded border-[#d4af37]/30 bg-[#141414] text-[#d4af37]"
            />
            <span className="text-gray-300 text-sm">Record session for later viewing</span>
          </label>
        </div>

        {sessionData.notifyStudents && sessionData.date && sessionData.time && (
          <div className="mt-3 p-3 bg-[#8b5cf6]/10 rounded-lg border border-[#8b5cf6]/20">
            <p className="text-[#8b5cf6] text-xs flex items-center gap-1">
              <CheckCircle size={12} />
              Students will be notified: immediately, 24 hours before, and 1 hour before the session
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      {sessionData.date && sessionData.time && (
        <div className="p-4 bg-gradient-to-r from-[#8b5cf6]/10 to-[#d4af37]/10 rounded-lg border border-[#8b5cf6]/20">
          <h4 className="text-white font-medium mb-2">Session Preview</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p><span className="text-gray-500">When:</span> {formatDate(sessionData.date)} at {sessionData.time}</p>
            <p><span className="text-gray-500">Duration:</span> {sessionData.duration} minutes</p>
            <p><span className="text-gray-500">Timezone:</span> {sessionData.timezone.replace('_', ' ')}</p>
            <p><span className="text-gray-500">Capacity:</span> {sessionData.maxParticipants} students</p>
          </div>
        </div>
      )}
    </div>
  );
}

const instructorStats = {
  totalStudents: 2341,
  totalRevenue: 156000,
  avgRating: 4.9,
  monthlyEarnings: 12400
};

const existingCourses = [
  { id: '1', title: 'Navajo Weaving Masterclass', status: 'published', students: 1234, revenue: 89500, rating: 4.9, progress: 100, lastUpdated: '2 days ago' },
  { id: '2', title: 'Traditional Beadwork Fundamentals', status: 'draft', students: 0, revenue: 0, rating: 0, progress: 65, lastUpdated: '1 week ago' }
];

function SimpleQuestionCard({ step, title, detail, children }: { step: string; title: string; detail: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#d4af37]/20 bg-[#141414] p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">{step}</p>
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{detail}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

const lessonTypes = [
  { id: 'video', name: 'Video Lesson', icon: Film, color: '#d4af37', desc: 'Upload or record a video' },
  { id: 'text', name: 'Text & Article', icon: FileText, color: '#4A90E2', desc: 'Written content with rich editor' },
  { id: 'quiz', name: 'Quiz', icon: FileQuestion, color: '#DC143C', desc: 'Test student knowledge' },
  { id: 'resource', name: 'Downloadable', icon: Upload, color: '#22c55e', desc: 'PDFs, templates, files' },
  { id: 'live', name: 'Live Session', icon: Calendar, color: '#8b5cf6', desc: 'Schedule a live class' },
  { id: 'audio', name: 'Audio Lesson', icon: Mic, color: '#f59e0b', desc: 'Podcast-style audio lesson' },
];

function CourseCreationPageContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/creator-hub';
  const simpleMode = searchParams.get('simple') === '1';
  const editOfferingId = searchParams.get('edit') || '';
  const requestedProfileSlug = searchParams.get('slug') || '';
  const [profileSlug, setProfileSlug] = useState(requestedProfileSlug);
  const [mirrorOffering, setMirrorOffering] = useState<ProfileOffering | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'basics' | 'curriculum' | 'media' | 'pricing' | 'settings'>(simpleMode ? 'basics' : 'dashboard');
  
  // Course basics
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubtitle, setCourseSubtitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [language, setLanguage] = useState('English');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [objectives, setObjectives] = useState(['', '', '']);
  const [requirements, setRequirements] = useState(['']);
  const [certificateMessage, setCertificateMessage] = useState('This certifies that {student_name} has successfully completed this class.');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [introVideoName, setIntroVideoName] = useState<string | null>(null);

  // Curriculum
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [showLessonTypeMenu, setShowLessonTypeMenu] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [idCounter, setIdCounter] = useState(1);

  // Media / Video upload
  const [uploadingLesson, setUploadingLesson] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<{ id: string; name: string; size: string; type: string; duration?: string }[]>([]);

  // Pricing
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [verificationTier, setVerificationTier] = useState('Bronze');
  const [isFree, setIsFree] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState<'draft' | 'under_review' | 'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [workflowMessage, setWorkflowMessage] = useState<string | null>(null);

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
        setCourseTitle(offering.title || '');
        setCourseSubtitle(offering.type || '');
        setCourseDescription(offering.blurb || '');
        setPrice(parseNumericPrice(offering.priceLabel));
        setActiveTab('basics');
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [editOfferingId, profileSlug]);

  // Refs
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const introVideoRef = useRef<HTMLInputElement>(null);
  const videoUploadRef = useRef<HTMLInputElement>(null);

  // ---- Helpers ----
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const nonEmptyObjectives = objectives.filter((o) => o.trim().length > 0).length;
  const validationChecklist = [
    { label: 'Course title', done: !!courseTitle.trim() },
    { label: 'Description', done: !!courseDescription.trim() },
    { label: 'Thumbnail', done: !!thumbnailPreview },
    { label: 'Min. 1 module', done: modules.length > 0 },
    { label: 'Min. 3 lessons', done: totalLessons >= 3 },
    { label: 'Min. 3 objectives', done: nonEmptyObjectives >= 3 },
    { label: 'Price set', done: !!price || isFree }
  ];
  const missingChecklistItems = validationChecklist.filter((item) => !item.done).map((item) => item.label);

  const completionScore = Math.min(
    (courseTitle ? 20 : 0) +
    (courseDescription ? 20 : 0) +
    (thumbnailPreview ? 20 : 0) +
    (modules.length > 0 ? 20 : 0) +
    (totalLessons >= 3 ? 20 : 0),
    100
  );

  const recommendedSimpleTab: 'basics' | 'curriculum' | 'media' | 'pricing' | 'settings' = !courseTitle.trim() || !courseDescription.trim() || !category
    ? 'basics'
    : modules.length === 0
      ? 'curriculum'
      : !thumbnailPreview && mediaFiles.length === 0
        ? 'media'
        : !isFree && !price
          ? 'pricing'
          : 'settings';

  const addModule = () => {
    const newId = `m${idCounter}`;
    setIdCounter(p => p + 1);
    const m: Module = { id: newId, title: `Module ${modules.length + 1}: Untitled`, lessons: [] };
    setModules([...modules, m]);
    setExpandedModules([...expandedModules, newId]);
  };

  const removeModule = (id: string) => setModules(modules.filter(m => m.id !== id));

  const toggleModule = (id: string) =>
    setExpandedModules(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const addLesson = (moduleId: string, type: string) => {
    const newId = `l${idCounter}`;
    setIdCounter(p => p + 1);
    const l: Lesson = { id: newId, title: 'Untitled Lesson', type, duration: '0:00', content: '', isPreview: false };
    setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, l] } : m));
    setShowLessonTypeMenu(null);
  };

  const removeLesson = (moduleId: string, lessonId: string) =>
    setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));

  const openLessonEditor = (lesson: Lesson, moduleId: string) => {
    setEditingLesson({ ...lesson });
    setEditingModuleId(moduleId);
  };

  const saveLessonEdit = () => {
    if (!editingLesson || !editingModuleId) return;
    setModules(modules.map(m =>
      m.id === editingModuleId
        ? { ...m, lessons: m.lessons.map(l => l.id === editingLesson.id ? editingLesson : l) }
        : m
    ));
    setEditingLesson(null);
    setEditingModuleId(null);
  };

  const simulateUpload = (lessonId: string, fileName: string) => {
    setUploadingLesson(lessonId);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingLesson(null);
          setMediaFiles(f => [...f, { id: `f${Date.now()}`, name: fileName, size: '245 MB', type: 'video', duration: '12:45' }]);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleIntroVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setIntroVideoName(file.name);
  };

  const tabs = [
    { id: 'dashboard' as const, label: simpleMode ? 'Start' : 'Dashboard', icon: BarChart3 },
    { id: 'basics' as const, label: simpleMode ? 'About class' : 'Course Info', icon: BookOpen },
    { id: 'curriculum' as const, label: simpleMode ? 'Lessons' : 'Curriculum', icon: List },
    { id: 'media' as const, label: simpleMode ? 'Files' : 'Media Library', icon: MonitorPlay },
    { id: 'pricing' as const, label: simpleMode ? 'Price' : 'Pricing', icon: DollarSign },
    { id: 'settings' as const, label: simpleMode ? 'Rules' : 'Settings', icon: Settings },
  ];

  const getWallet = () => {
    if (typeof window === 'undefined') return '';
    return (window.localStorage.getItem('indigena_wallet_address') || '').trim().toLowerCase();
  };

  const toMinutes = (duration: string) => {
    const clean = String(duration || '').trim();
    if (!clean) return 0;
    if (clean.includes(':')) {
      const parts = clean.split(':').map((x) => Number(x));
      if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
        return parts[0] + Math.round(parts[1] / 60);
      }
      if (parts.length === 3 && Number.isFinite(parts[0]) && Number.isFinite(parts[1]) && Number.isFinite(parts[2])) {
        return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60);
      }
    }
    const parsed = Number(clean.replace(/[^\d.]/g, ''));
    return Number.isFinite(parsed) ? Math.round(parsed) : 0;
  };

const buildCoursePayload = (creatorAddress: string) => {
    const flattenedLessons = modules.flatMap((module, moduleIndex) =>
      module.lessons.map((lesson, lessonIndex) => ({
        moduleId: lesson.id || `${module.id}-${lessonIndex + 1}`,
        title: lesson.title || `Lesson ${lessonIndex + 1}`,
        description: lesson.content || '',
        contentType: (['video', 'audio', 'text', 'interactive', 'pdf', 'quiz'].includes(lesson.type) ? lesson.type : 'text') as 'video' | 'audio' | 'text' | 'interactive' | 'pdf' | 'quiz',
        contentUrl: lesson.videoUrl || '',
        duration: toMinutes(lesson.duration),
        order: moduleIndex * 100 + lessonIndex + 1,
        isPreview: Boolean(lesson.isPreview)
      }))
    );
    const estimatedDuration = flattenedLessons.reduce((sum, l) => sum + Number(l.duration || 0), 0);
    const pricingType = isFree ? 'free' : 'one_time';
    const numericPrice = isFree ? 0 : Math.max(0, Number(price || 0));

    return {
      creatorAddress,
      title: courseTitle.trim(),
      description: courseDescription.trim(),
      language,
      category: category || 'traditional_arts',
      categoryId: category || 'traditional_arts',
      subcategory: subcategory || '',
      modules: flattenedLessons,
      pricing: {
        type: pricingType,
        amount: numericPrice,
        currency: 'INDI'
      },
      skillLevel: level.toLowerCase() === 'beginner' ? 'beginner' : level.toLowerCase() === 'intermediate' ? 'intermediate' : level.toLowerCase() === 'advanced' ? 'advanced' : 'all_levels',
      thumbnailUrl: thumbnailPreview || '',
      previewVideoUrl: introVideoName || '',
      tags,
      prerequisites: requirements.filter((x) => x.trim()),
      estimatedDuration,
      culturalContext: {
        traditionalKnowledgeLabel: verificationTier
      }
    };
  };

  const syncCreatorHubMirror = async (
    status: string,
    overrides?: Partial<Pick<ProfileOffering, 'availabilityLabel' | 'availabilityTone' | 'ctaMode'>>
  ) => {
    if (!editOfferingId) return;
    const activeProfileSlug = profileSlug || (await resolveCurrentCreatorProfileSlug());
    if (!activeProfileSlug) return;
    if (!profileSlug) setProfileSlug(activeProfileSlug);
    await updateProfileOffering({
      slug: activeProfileSlug,
      offeringId: editOfferingId,
      title: courseTitle.trim(),
      blurb: courseDescription.trim(),
      priceLabel: isFree ? 'Free' : `INDI ${Number(price || 0).toFixed(0)}`,
      status,
      coverImage: thumbnailPreview || mirrorOffering?.coverImage || '',
      ctaMode: overrides?.ctaMode || mirrorOffering?.ctaMode || 'enroll',
      ctaPreset: overrides?.ctaMode === 'enroll' || !overrides?.ctaMode ? 'enroll-now' : mirrorOffering?.ctaPreset,
      merchandisingRank: mirrorOffering?.merchandisingRank ?? 0,
      galleryOrder: thumbnailPreview ? [thumbnailPreview] : (mirrorOffering?.galleryOrder ?? []),
      launchWindowStartsAt: mirrorOffering?.launchWindowStartsAt || '',
      launchWindowEndsAt: mirrorOffering?.launchWindowEndsAt || '',
      availabilityLabel: overrides?.availabilityLabel || mirrorOffering?.availabilityLabel || 'Enrollment open',
      availabilityTone: overrides?.availabilityTone || mirrorOffering?.availabilityTone || 'success',
      featured: mirrorOffering?.featured ?? false
    });
  };

  const handleSaveDraft = async (): Promise<string> => {
    let wallet = getWallet();
    if (!wallet) {
      try {
        const auth = await requireWalletAction('save this course draft');
        wallet = auth.wallet;
      } catch (error) {
        setWorkflowMessage(error instanceof Error ? error.message : 'Sign in to save this course draft.');
        return '';
      }
    }
    if (!courseTitle.trim() || !courseDescription.trim()) {
      setWorkflowMessage('Course title and description are required.');
      return '';
    }
    setSaving(true);
    setWorkflowMessage(null);
    try {
      const payload = buildCoursePayload(wallet);
      if (currentCourseId) {
        await updateCourseListing(currentCourseId, payload);
        await syncCreatorHubMirror('Draft', {
          availabilityLabel: 'Draft',
          availabilityTone: 'default',
          ctaMode: 'enroll'
        });
        setWorkflowStatus('draft');
        setWorkflowMessage('Draft saved.');
        return currentCourseId;
      } else {
        const response = await createCourseListing(payload as unknown as Record<string, unknown>);
        const createdId = String((response as { course?: { courseId?: string } })?.course?.courseId || '');
        if (createdId) setCurrentCourseId(createdId);
        await syncCreatorHubMirror('Draft', {
          availabilityLabel: 'Draft',
          availabilityTone: 'default',
          ctaMode: 'enroll'
        });
        setWorkflowStatus('draft');
        setWorkflowMessage('Draft saved.');
        return createdId;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save draft.';
      setWorkflowMessage(message);
      return '';
    } finally {
      setSaving(false);
    }
    return '';
  };

  const handleSubmitForReview = async () => {
    let wallet = getWallet();
    if (!wallet) {
      try {
        const auth = await requireWalletAction('submit this course for review');
        wallet = auth.wallet;
      } catch (error) {
        setWorkflowMessage(error instanceof Error ? error.message : 'Sign in to submit this course for review.');
        return;
      }
    }
    if (missingChecklistItems.length > 0) {
      setWorkflowMessage(`Complete checklist before submit: ${missingChecklistItems.join(', ')}`);
      return;
    }
    const workingCourseId = currentCourseId || (await handleSaveDraft());
    if (!workingCourseId) return;
    setSubmitting(true);
    setWorkflowMessage(null);
    try {
      await submitCourseForReview(workingCourseId, wallet);
      await syncCreatorHubMirror('Under review', {
        availabilityLabel: 'Review in progress',
        availabilityTone: 'warning',
        ctaMode: 'enroll'
      });
      setWorkflowStatus('under_review');
      setWorkflowMessage('Course submitted for review.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit course for review.';
      setWorkflowMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    let wallet = getWallet();
    if (!wallet) {
      try {
        const auth = await requireWalletAction('publish this course');
        wallet = auth.wallet;
      } catch (error) {
        setWorkflowMessage(error instanceof Error ? error.message : 'Sign in to publish this course.');
        return;
      }
    }
    if (!currentCourseId) {
      setWorkflowMessage('Save and submit this course before publishing.');
      return;
    }
    if (missingChecklistItems.length > 0) {
      setWorkflowMessage(`Complete checklist before publish: ${missingChecklistItems.join(', ')}`);
      return;
    }
    setPublishing(true);
    setWorkflowMessage(null);
    try {
      await publishCourseListing(currentCourseId, wallet, wallet);
      await syncCreatorHubMirror('Active', {
        availabilityLabel: 'Enrollment open',
        availabilityTone: 'success',
        ctaMode: 'enroll'
      });
      setWorkflowStatus('published');
      setWorkflowMessage('Course published.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish course.';
      setWorkflowMessage(message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className={`min-h-screen ${simpleMode ? 'bg-[#050505]' : 'h-full'} flex flex-col`}>
      {/* Top Header */}
      <header className={`${simpleMode ? 'mx-auto mt-8 w-full max-w-5xl rounded-[28px] border border-[#d4af37]/20 bg-[#101010] px-6 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]' : 'bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4'} flex-shrink-0`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={returnTo} className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors">
                <ChevronLeft size={20} />
                <span className="text-sm">{simpleMode ? 'Back to simple home' : 'Back to Creator Hub'}</span>
              </Link>
              {!simpleMode ? <div className="h-6 w-px bg-[#d4af37]/20" /> : null}
              <h1 className="text-white font-semibold">{simpleMode ? 'Make a class' : 'Knowledge Keeper Studio'}</h1>
              {/* Readiness score */}
              <div className={`flex items-center gap-2 px-3 py-1 bg-[#0a0a0a] rounded-full ${simpleMode ? 'ml-2' : ''}`}>
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4a6]" style={{ width: `${completionScore}%` }} />
                </div>
                <span className="text-xs text-[#d4af37]">{completionScore}% {simpleMode ? 'done' : 'ready'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                <Eye size={18} />
                <span className="text-sm">{simpleMode ? 'Check it' : 'Preview'}</span>
              </button>
              <button onClick={() => { void handleSaveDraft(); }} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-[#d4af37]/30 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                <Save size={18} />
                <span className="text-sm">{saving ? 'Saving...' : simpleMode ? 'Save here' : 'Save Draft'}</span>
              </button>
              <button onClick={() => { void handleSubmitForReview(); }} disabled={submitting} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                <CheckCircle size={18} />
                {submitting ? 'Submitting...' : simpleMode ? 'Check my class' : 'Submit for Review'}
              </button>
              <button onClick={() => { void handlePublish(); }} disabled={publishing || !currentCourseId} className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                <Upload size={16} />
                <span className="text-sm">{publishing ? 'Publishing...' : simpleMode ? 'Put live' : 'Publish'}</span>
              </button>
              {simpleMode && activeTab !== recommendedSimpleTab ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(recommendedSimpleTab)}
                  className="flex items-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm font-semibold text-[#f3ddb1]"
                >
                  Next: {tabs.find((tab) => tab.id === recommendedSimpleTab)?.label}
                </button>
              ) : null}
            </div>
          </div>
          {(workflowMessage || currentCourseId) && (
            <div className="mt-3 flex items-center gap-3 text-xs">
              {currentCourseId && <span className="text-gray-500">Course ID: {currentCourseId}</span>}
              <span className="text-[#d4af37]">Status: {workflowStatus.replace('_', ' ')}</span>
              {workflowMessage && <span className="text-gray-300">{workflowMessage}</span>}
            </div>
          )}
        </header>

        <div className={`flex flex-1 ${simpleMode ? 'mx-auto mt-6 w-full max-w-5xl flex-col overflow-visible px-4 pb-12 sm:px-0' : 'overflow-hidden'}`}>
          {/* Left Nav */}
          <div className={`${simpleMode ? 'w-full rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-3' : 'w-56 bg-[#141414] border-r border-[#d4af37]/20 flex flex-col flex-shrink-0'}`}>
            <nav className={`${simpleMode ? 'flex gap-2 overflow-x-auto' : 'p-3 space-y-1 flex-1'}`}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`${simpleMode ? 'flex-shrink-0' : 'w-full'} flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeTab === tab.id ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon size={17} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
            {/* Checklist */}
            {!simpleMode ? (
            <div className="p-4 border-t border-[#d4af37]/20 space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Checklist</p>
              {validationChecklist.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                    {item.done ? <CheckCircle size={10} className="text-green-500" /> : <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />}
                  </div>
                  <span className={`text-xs ${item.done ? 'text-gray-300' : 'text-gray-500'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            ) : null}
          </div>

          {/* Main Content */}
          <div className={`flex-1 ${simpleMode ? 'overflow-visible rounded-2xl border border-[#d4af37]/20 bg-[#101010]' : 'overflow-y-auto'}`}>

            {/* â”€â”€ DASHBOARD â”€â”€ */}
            {activeTab === 'dashboard' && (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Students', value: instructorStats.totalStudents.toLocaleString(), icon: Users, color: '#d4af37' },
                    { label: 'Total Revenue', value: `${instructorStats.totalRevenue.toLocaleString()} INDI`, icon: Wallet, color: '#22c55e' },
                    { label: 'Avg Rating', value: instructorStats.avgRating, icon: Star, color: '#f59e0b' },
                    { label: 'Monthly Earnings', value: `${instructorStats.monthlyEarnings.toLocaleString()} INDI`, icon: TrendingUp, color: '#DC143C' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#141414] rounded-xl p-4 border border-[#d4af37]/20">
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

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{simpleMode ? 'Your classes' : 'Your Courses'}</h2>
                    <button onClick={() => setActiveTab('basics')} className="flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/20 transition-colors">
                      <Plus size={18} /> {simpleMode ? 'New class' : 'New Course'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {existingCourses.map(course => (
                      <div key={course.id} className="bg-[#141414] rounded-xl p-4 border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${course.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <div>
                              <h3 className="text-white font-semibold">{course.title}</h3>
                              <p className="text-gray-400 text-sm">
                                {course.status === 'published'
                                  ? `${course.students.toLocaleString()} students â€¢ â­ ${course.rating}`
                                  : `${course.progress}% complete â€¢ Last edited ${course.lastUpdated}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {course.status === 'published' && <span className="text-[#d4af37] font-medium">{course.revenue.toLocaleString()} INDI</span>}
                            <button className="p-2 text-gray-400 hover:text-white"><Edit3 size={18} /></button>
                            <button className="p-2 text-gray-400 hover:text-[#DC143C]"><MoreVertical size={18} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#d4af37]/10 to-[#DC143C]/10 rounded-xl p-6 border border-[#d4af37]/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-[#d4af37]" /> {simpleMode ? 'Helpful tips' : 'Tips for Success'}</h3>
                  <ul className="space-y-2 text-gray-300">
                    {['Courses with 5-10 modules have the highest completion rates', 'Video lessons between 10-20 minutes perform best', 'Include at least one downloadable resource per module', 'Add a free preview lesson to attract more students', 'Respond to student questions within 24 hours'].map(tip => (
                      <li key={tip} className="flex items-start gap-2"><CheckCircle size={16} className="text-[#d4af37] mt-1 flex-shrink-0" />{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* â”€â”€ COURSE BASICS â”€â”€ */}
            {activeTab === 'basics' && (
              <div className="p-6 max-w-3xl space-y-6">
                {simpleMode ? (
                  <>
                    <SimpleQuestionCard step="Question 1" title="What is your class called?" detail="Start with the class name.">
                      <input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="Navajo Weaving Masterclass" className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                      <VoiceInputButton label="Say the class name" onTranscript={setCourseTitle} />
                    </SimpleQuestionCard>

                    {courseTitle.trim() ? (
                      <SimpleQuestionCard step="Question 2" title="What will people learn?" detail="Write the promise of the class in plain language.">
                        <input value={courseSubtitle} onChange={e => setCourseSubtitle(e.target.value)} placeholder="A short line that explains the class" className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                        <textarea value={courseDescription} onChange={e => setCourseDescription(e.target.value)} placeholder="Explain what people will learn and who this class is for." rows={5} className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none" />
                        <VoiceInputButton label="Say what people will learn" onTranscript={setCourseDescription} />
                      </SimpleQuestionCard>
                    ) : null}

                    {courseTitle.trim() && courseDescription.trim() ? (
                      <SimpleQuestionCard step="Question 3" title="Who is this class for?" detail="Choose the topic and level.">
                        <div className="grid gap-3 md:grid-cols-2">
                          {COURSE_CATEGORIES.slice(0, 8).map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => { setCategory(c.id); setSubcategory(''); }}
                              className={`rounded-2xl border p-4 text-left transition-all ${
                                category === c.id
                                  ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#f3ddb1]'
                                  : 'border-white/10 bg-[#0a0a0a] text-gray-300 hover:border-[#d4af37]/30'
                              }`}
                            >
                              <div className="text-xl">{c.icon}</div>
                              <p className="mt-2 text-sm font-semibold">{c.name}</p>
                            </button>
                          ))}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <select value={subcategory} onChange={e => setSubcategory(e.target.value)} disabled={!category} className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value="">Choose topic</option>
                            {COURSE_CATEGORIES.find(c => c.id === category)?.subcategories.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                          <div className="grid grid-cols-2 gap-2">
                            {SIMPLE_COURSE_LEVELS.map((entry) => (
                              <button
                                key={entry.value}
                                type="button"
                                onClick={() => setLevel(entry.value)}
                                className={`rounded-2xl border p-3 text-left transition-all ${
                                  level === entry.value
                                    ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#f3ddb1]'
                                    : 'border-white/10 bg-[#0a0a0a] text-gray-300 hover:border-[#d4af37]/30'
                                }`}
                              >
                                <div className="text-sm text-[#d4af37]">{entry.icon}</div>
                                <p className="mt-1 text-sm font-semibold">{entry.value}</p>
                                <p className="text-xs text-gray-500">{entry.label}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </SimpleQuestionCard>
                    ) : null}

                    {category ? (
                      <SimpleQuestionCard step="Question 4" title="What should they be able to do after this?" detail="Add outcomes and anything they should know first.">
                        <div className="space-y-3">
                          {objectives.map((obj, i) => (
                            <input key={i} value={obj} onChange={e => { const o = [...objectives]; o[i] = e.target.value; setObjectives(o); }} placeholder={`Learning outcome ${i + 1}`} className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                          ))}
                          <VoiceInputButton label="Say an outcome" onTranscript={(text) => {
                            const index = objectives.findIndex((item) => !item.trim());
                            const target = index === -1 ? objectives.length - 1 : index;
                            const next = [...objectives];
                            next[target] = text;
                            setObjectives(next);
                          }} />
                          <button onClick={() => setObjectives([...objectives, ''])} className="text-sm text-[#d4af37] hover:text-[#f4e4a6]">Add another outcome</button>
                        </div>
                        <div className="space-y-3">
                          {requirements.map((req, i) => (
                            <input key={i} value={req} onChange={e => { const r = [...requirements]; r[i] = e.target.value; setRequirements(r); }} placeholder="Anything people should know first?" className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                          ))}
                          <VoiceInputButton label="Say a requirement" onTranscript={(text) => {
                            const index = requirements.findIndex((item) => !item.trim());
                            const target = index === -1 ? requirements.length - 1 : index;
                            const next = [...requirements];
                            next[target] = text;
                            setRequirements(next);
                          }} />
                          <button onClick={() => setRequirements([...requirements, ''])} className="text-sm text-[#d4af37] hover:text-[#f4e4a6]">Add another requirement</button>
                        </div>
                      </SimpleQuestionCard>
                    ) : null}
                  </>
                ) : (
                  <>
                {/* Title & Subtitle */}
                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BookOpen size={18} className="text-[#d4af37]" /> {simpleMode ? 'Tell people about your class' : 'Basic Info'}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{simpleMode ? 'Class name' : 'Course Title'} <span className="text-[#DC143C]">*</span></label>
                      <input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="e.g. Navajo Weaving Masterclass" className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                      <p className="text-xs text-gray-500 mt-1">{courseTitle.length}/80 characters</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{simpleMode ? 'Short line' : 'Subtitle'}</label>
                      <input value={courseSubtitle} onChange={e => setCourseSubtitle(e.target.value)} placeholder={simpleMode ? 'A short line that explains the class' : 'A short, catchy subtitle...'} className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{simpleMode ? 'What will people learn?' : 'Description'} <span className="text-[#DC143C]">*</span></label>
                      <textarea value={courseDescription} onChange={e => setCourseDescription(e.target.value)} placeholder={simpleMode ? 'Explain what people will learn and who this class is for.' : 'Describe what students will learn, who it&#39;s for, and what makes it special...'} rows={5} className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#d4af37]">
                          <option value="">Select...</option>
                          {COURSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Topic / Subcategory</label>
                        <select 
                          value={subcategory} 
                          onChange={e => setSubcategory(e.target.value)} 
                          disabled={!category}
                          className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select topic...</option>
                          {COURSE_CATEGORIES.find(c => c.id === category)?.subcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Level</label>
                        <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#d4af37]">
                          {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* Tags */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tags</label>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] rounded text-sm">
                            #{tag}
                            <button onClick={() => setTags(tags.filter(t => t !== tag))}><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add a tag..." className="flex-1 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                        <button onClick={addTag} className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/20"><Tag size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Objectives */}
                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Target size={18} className="text-[#d4af37]" /> Learning Objectives</h2>
                  <p className="text-gray-400 text-sm mb-4">What will students be able to do after completing this course?</p>
                  <div className="space-y-3">
                    {objectives.map((obj, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={obj} onChange={e => { const o = [...objectives]; o[i] = e.target.value; setObjectives(o); }} placeholder={`Objective ${i + 1}`} className="flex-1 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                        {objectives.length > 1 && <button onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))} className="p-2 text-gray-500 hover:text-[#DC143C]"><Trash2 size={16} /></button>}
                      </div>
                    ))}
                    <button onClick={() => setObjectives([...objectives, ''])} className="flex items-center gap-2 text-[#d4af37] text-sm hover:text-[#f4e4a6]"><Plus size={16} /> Add objective</button>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-[#d4af37]" /> Requirements</h2>
                  <p className="text-gray-400 text-sm mb-4">What should students know before taking this course?</p>
                  <div className="space-y-3">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={req} onChange={e => { const r = [...requirements]; r[i] = e.target.value; setRequirements(r); }} placeholder="e.g. No prior experience needed" className="flex-1 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                        {requirements.length > 1 && <button onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="p-2 text-gray-500 hover:text-[#DC143C]"><Trash2 size={16} /></button>}
                      </div>
                    ))}
                    <button onClick={() => setRequirements([...requirements, ''])} className="flex items-center gap-2 text-[#d4af37] text-sm hover:text-[#f4e4a6]"><Plus size={16} /> Add requirement</button>
                  </div>
                </div>

                {/* Thumbnail & Intro Video */}
                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><ImageIcon size={18} className="text-[#d4af37]" /> Media Assets</h2>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Thumbnail */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Course Thumbnail <span className="text-[#DC143C]">*</span></label>
                      <div className="relative w-full aspect-video bg-[#0a0a0a] border-2 border-dashed border-[#d4af37]/30 rounded-xl overflow-hidden hover:border-[#d4af37]/60 transition-colors cursor-pointer group" onClick={() => thumbnailRef.current?.click()}>
                        {thumbnailPreview ? (
                          <>
                            <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white text-sm">Change Thumbnail</span>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <ImageIcon size={32} className="text-gray-500" />
                            <span className="text-gray-500 text-sm">Click to upload</span>
                            <span className="text-gray-600 text-xs">1280Ã—720 recommended</span>
                          </div>
                        )}
                      </div>
                      <input ref={thumbnailRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                    </div>

                    {/* Intro Video */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Intro / Promo Video</label>
                      <div className="relative w-full aspect-video bg-[#0a0a0a] border-2 border-dashed border-[#d4af37]/30 rounded-xl overflow-hidden hover:border-[#d4af37]/60 transition-colors cursor-pointer group" onClick={() => introVideoRef.current?.click()}>
                        {introVideoName ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#141414]">
                            <PlayCircle size={40} className="text-[#d4af37]" />
                            <span className="text-white text-sm font-medium">{introVideoName}</span>
                            <span className="text-gray-400 text-xs">Click to replace</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <Video size={32} className="text-gray-500" />
                            <span className="text-gray-500 text-sm">Upload promo video</span>
                            <span className="text-gray-600 text-xs">MP4, MOV up to 2GB</span>
                          </div>
                        )}
                      </div>
                      <input ref={introVideoRef} type="file" accept="video/*" className="hidden" onChange={handleIntroVideoChange} />
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            )}

            {/* â”€â”€ CURRICULUM â”€â”€ */}
            {activeTab === 'curriculum' && (
              <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                      <h2 className="text-lg font-bold text-white">{simpleMode ? 'Lessons and path' : 'Course Curriculum'}</h2>
                        <p className="text-gray-400 text-sm">{modules.length} modules â€¢ {totalLessons} lessons</p>
                      </div>
                  <button onClick={addModule} className="flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/20 transition-colors">
                    <Plus size={18} /> Add Module
                  </button>
                </div>

                {modules.length === 0 && (
                  <div className="text-center py-16 bg-[#141414] rounded-xl border border-dashed border-[#d4af37]/30">
                    <Film size={48} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">{simpleMode ? 'Build your lessons' : 'Build Your Curriculum'}</h3>
                    <p className="text-gray-400 mb-4">Add modules and lessons to structure your course</p>
                    <button onClick={addModule} className="px-6 py-2.5 bg-[#d4af37] text-black font-medium rounded-lg">Add First Module</button>
                  </div>
                )}

                {modules.map((module, mIdx) => (
                  <div key={module.id} className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-visible">
                    {/* Module Header */}
                    <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-t-xl">
                      <GripVertical size={18} className="text-gray-600 cursor-grab" />
                      <button onClick={() => toggleModule(module.id)} className="text-gray-400 hover:text-white">
                        {expandedModules.includes(module.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                      <input
                        value={module.title}
                        onChange={e => setModules(modules.map(m => m.id === module.id ? { ...m, title: e.target.value } : m))}
                        className="flex-1 bg-transparent text-white font-semibold focus:outline-none"
                      />
                      {simpleMode ? <VoiceInputButton label="Say the module name" onTranscript={(text) => setModules(modules.map(m => m.id === module.id ? { ...m, title: text } : m))} /> : null}
                      <span className="text-gray-500 text-xs">{module.lessons.length} lessons</span>
                      <button onClick={() => removeModule(module.id)} className="p-2 text-gray-500 hover:text-[#DC143C]"><Trash2 size={15} /></button>
                    </div>

                    {expandedModules.includes(module.id) && (
                      <div className="p-4 space-y-2">
                        {module.lessons.map((lesson: Lesson) => (
                          <div key={lesson.id} className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg group border border-transparent hover:border-[#d4af37]/20 transition-colors">
                            <GripVertical size={15} className="text-gray-600 cursor-grab" />
                            {lesson.type === 'video' && <Film size={15} className="text-[#d4af37] flex-shrink-0" />}
                            {lesson.type === 'text' && <FileText size={15} className="text-[#4A90E2] flex-shrink-0" />}
                            {lesson.type === 'quiz' && <FileQuestion size={15} className="text-[#DC143C] flex-shrink-0" />}
                            {lesson.type === 'resource' && <Upload size={15} className="text-[#22c55e] flex-shrink-0" />}
                            {lesson.type === 'live' && <Calendar size={15} className="text-[#8b5cf6] flex-shrink-0" />}
                            {lesson.type === 'audio' && <Mic size={15} className="text-[#f59e0b] flex-shrink-0" />}

                            <span className="flex-1 text-gray-300 text-sm">{lesson.title}</span>

                            {lesson.isPreview && (
                              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">Preview</span>
                            )}

                            {/* Video Upload for video lessons */}
                            {lesson.type === 'video' && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                {uploadingLesson === lesson.id ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-[#d4af37] transition-all" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                    <span className="text-xs text-[#d4af37]">{uploadProgress}%</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => { videoUploadRef.current?.click(); simulateUpload(lesson.id, 'lesson_video.mp4'); }}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-[#d4af37]/10 text-[#d4af37] rounded hover:bg-[#d4af37]/20"
                                  >
                                    <Upload size={12} /> Upload Video
                                  </button>
                                )}
                              </div>
                            )}

                            <span className="text-gray-600 text-xs w-10 text-right">{lesson.duration}</span>

                            <button onClick={() => openLessonEditor(lesson, module.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#d4af37] transition-all">
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => removeLesson(module.id, lesson.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#DC143C] transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}

                        {/* Add Lesson */}
                        <div className="relative">
                          <button
                            onClick={() => setShowLessonTypeMenu(showLessonTypeMenu === module.id ? null : module.id)}
                            className="flex items-center gap-2 w-full p-3 text-gray-400 hover:text-[#d4af37] border border-dashed border-gray-700 hover:border-[#d4af37]/50 rounded-lg transition-colors"
                          >
                            <Plus size={16} /> <span className="text-sm">Add Lesson</span>
                          </button>

                          {showLessonTypeMenu === module.id && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-[#141414] border border-[#d4af37]/20 rounded-xl shadow-2xl z-20">
                              {lessonTypes.map(type => (
                                <button key={type.id} onClick={() => addLesson(module.id, type.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#d4af37]/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                >
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: type.color + '20' }}>
                                    <type.icon size={16} style={{ color: type.color }} />
                                  </div>
                                  <div>
                                    <p className="text-white text-sm font-medium">{type.name}</p>
                                    <p className="text-gray-500 text-xs">{type.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <input ref={videoUploadRef} type="file" accept="video/*" className="hidden" />
              </div>
            )}

            {/* â”€â”€ MEDIA LIBRARY â”€â”€ */}
            {activeTab === 'media' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">{simpleMode ? 'Your files' : 'Media Library'}</h2>
                    <p className="text-gray-400 text-sm">{mediaFiles.length} files uploaded</p>
                  </div>
                  <button
                    onClick={() => { videoUploadRef.current?.click(); simulateUpload('media', 'new_video.mp4'); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg"
                  >
                    <Upload size={18} /> Upload File
                  </button>
                </div>

                {/* Upload Drop Zone */}
                <div
                  className="border-2 border-dashed border-[#d4af37]/30 rounded-xl p-10 text-center mb-6 hover:border-[#d4af37]/60 transition-colors cursor-pointer"
                  onClick={() => videoUploadRef.current?.click()}
                >
                  <Film size={48} className="text-gray-600 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-1">Drag & drop or click to upload</h3>
                  <p className="text-gray-500 text-sm">MP4, MOV, AVI, PDF, ZIP â€” up to 4GB per file</p>
                  {uploadingLesson === 'media' && (
                    <div className="mt-4 max-w-xs mx-auto">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Uploading...</span>
                        <span className="text-[#d4af37]">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* File List */}
                {mediaFiles.length > 0 ? (
                  <div className="space-y-3">
                    {mediaFiles.map(file => (
                      <div key={file.id} className="flex items-center gap-4 p-4 bg-[#141414] rounded-xl border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-colors">
                        <div className="w-12 h-12 bg-[#d4af37]/10 rounded-lg flex items-center justify-center">
                          <Film size={24} className="text-[#d4af37]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{file.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{file.type.toUpperCase()}</span>
                            <span>{file.size}</span>
                            {file.duration && <span className="flex items-center gap-1"><Clock size={10} />{file.duration}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-[#d4af37]"><Eye size={16} /></button>
                          <button className="p-2 text-gray-400 hover:text-[#DC143C]"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No files uploaded yet. Upload your first video to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* â”€â”€ PRICING â”€â”€ */}
            {activeTab === 'pricing' && (
              <div className="p-6 max-w-2xl space-y-6">
                <h2 className="text-xl font-bold text-white">{simpleMode ? 'Price and payments' : 'Pricing & Monetisation'}</h2>

                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Course Price</h3>
                  <label className="flex items-center gap-3 mb-4 cursor-pointer">
                    <div onClick={() => setIsFree(!isFree)} className={`w-10 h-5 rounded-full transition-colors relative ${isFree ? 'bg-[#d4af37]' : 'bg-gray-700'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isFree ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-gray-300 text-sm">Make this course free</span>
                  </label>
                  {!isFree && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Regular Price</label>
                        <div className="relative">
                          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg pl-4 pr-16 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] font-medium text-sm">INDI</span>
                        </div>
                        {simpleMode ? <VoiceInputButton label="Say the price" onTranscript={setPrice} /> : null}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Sale Price (optional)</label>
                        <div className="relative">
                          <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="0" className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg pl-4 pr-16 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] font-medium text-sm">INDI</span>
                        </div>
                        {simpleMode ? <VoiceInputButton label="Say the sale price" onTranscript={setSalePrice} /> : null}
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification Tier */}
                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Verification Tier</h3>
                  <p className="text-gray-400 text-sm mb-4">Higher tiers unlock more visibility and student trust badges</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { tier: 'Bronze', color: '#CD7F32', desc: 'Free listing' },
                      { tier: 'Silver', color: '#C0C0C0', desc: '50 INDI/mo' },
                      { tier: 'Gold', color: '#FFD700', desc: '150 INDI/mo' },
                      { tier: 'Platinum', color: '#E5E4E2', desc: '300 INDI/mo' },
                    ].map(({ tier, color, desc }) => (
                      <button key={tier} onClick={() => setVerificationTier(tier)}
                        className={`p-4 rounded-xl border text-center transition-all ${verificationTier === tier ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-[#d4af37]/20 bg-[#0a0a0a] hover:border-[#d4af37]/40'}`}
                      >
                        <Award size={24} className="mx-auto mb-1" style={{ color }} />
                        <p className="font-semibold text-sm" style={{ color }}>{tier}</p>
                        <p className="text-gray-500 text-xs mt-1">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Revenue Calculator */}
                {(price || isFree) && (
                  <div className="bg-gradient-to-r from-[#d4af37]/10 to-[#22c55e]/10 rounded-xl p-6 border border-[#d4af37]/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-400"><span>Course Price</span><span className="text-white">{isFree ? 'Free' : `${price} INDI`}</span></div>
                      {!isFree && <><div className="flex justify-between text-gray-400"><span>Platform Fee (10%)</span><span className="text-[#DC143C]">-{Math.round(Number(price) * 0.1)} INDI</span></div>
                      <div className="h-px bg-[#d4af37]/20" />
                      <div className="flex justify-between"><span className="text-white font-semibold">You Earn Per Sale</span><span className="text-[#22c55e] font-bold text-lg">{Math.round(Number(price) * 0.9)} INDI</span></div>
                      <div className="flex justify-between text-gray-400"><span>Projected Monthly (50 students)</span><span className="text-[#d4af37]">{Math.round(Number(price) * 0.9 * 50).toLocaleString()} INDI</span></div></>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* â”€â”€ SETTINGS â”€â”€ */}
            {activeTab === 'settings' && (
              <div className="p-6 max-w-2xl space-y-6">
                <h2 className="text-xl font-bold text-white">{simpleMode ? 'Rules and visibility' : 'Course Settings'}</h2>

                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20 space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{simpleMode ? 'Who can see it?' : 'Visibility'}</h3>
                  {[{ val: 'public', title: 'Public', desc: simpleMode ? 'Visible to everyone who can browse classes' : 'Visible to all students in the marketplace' }, { val: 'invite', title: 'Invite Only', desc: 'Only accessible with a direct link' }, { val: 'draft', title: 'Draft', desc: 'Hidden from students until published' }].map(opt => (
                    <label key={opt.val} className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg cursor-pointer hover:bg-[#0f0f0f]">
                      <input type="radio" name="visibility" defaultChecked={opt.val === 'public'} />
                      <div><p className="text-white font-medium">{opt.title}</p><p className="text-gray-400 text-sm">{opt.desc}</p></div>
                    </label>
                  ))}
                </div>

                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20 space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-2">Student Experience</h3>
                  {[
                    'Students must complete lessons in order',
                    'Require quiz completion before certificate',
                    'Enable discussion forum for this course',
                    'Allow students to download lessons for offline viewing',
                    'Send automated welcome email to new students',
                    'Allow student reviews and ratings',
                  ].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="rounded border-[#d4af37]/30" />
                      <span className="text-gray-300 text-sm">{opt}</span>
                    </label>
                  ))}
                </div>

                <div className="bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20 space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-2">Certificate</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-[#d4af37]/30" />
                    <span className="text-gray-300 text-sm">Issue completion certificate</span>
                  </label>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Certificate message</label>
                    <textarea value={certificateMessage} onChange={e => setCertificateMessage(e.target.value)} placeholder="This certifies that {student_name} has successfully completed..." rows={2} className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none text-sm" />
                    {simpleMode ? <VoiceInputButton label="Say the certificate message" onTranscript={setCertificateMessage} /> : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* â”€â”€ LESSON EDITOR MODAL â”€â”€ */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
          <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#d4af37]/20">
              <h3 className="text-white font-bold text-lg">Edit Lesson</h3>
              <button onClick={() => setEditingLesson(null)} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Lesson Title</label>
                <input value={editingLesson.title} onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]" />
              </div>

              {editingLesson.type === 'video' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Video</label>
                  <div
                    onClick={() => { videoUploadRef.current?.click(); simulateUpload(editingLesson.id, 'lesson_video.mp4'); }}
                    className="border-2 border-dashed border-[#d4af37]/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#d4af37]/60 transition-colors"
                  >
                    {uploadingLesson === editingLesson.id ? (
                      <div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-[#d4af37] transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <span className="text-[#d4af37] text-sm">{uploadProgress}% uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Film size={32} className="text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Click to upload video (MP4, MOV up to 4GB)</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {editingLesson.type === 'text' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Content</label>
                  <textarea value={editingLesson.content} onChange={e => setEditingLesson({ ...editingLesson, content: e.target.value })} placeholder="Write your lesson content here..." rows={8} className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none" />
                </div>
              )}

              {editingLesson.type === 'quiz' && (
                <QuizBuilder
                  lesson={editingLesson}
                  onUpdate={(updatedLesson: Lesson) => setEditingLesson(updatedLesson)}
                />
              )}

              {editingLesson.type === 'live' && (
                <LiveSessionBuilder
                  lesson={editingLesson}
                  onUpdate={(updatedLesson: Lesson) => setEditingLesson(updatedLesson)}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duration</label>
                  <input value={editingLesson.duration} onChange={e => setEditingLesson({ ...editingLesson, duration: e.target.value })} placeholder="e.g. 15:30" className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setEditingLesson({ ...editingLesson, isPreview: !editingLesson.isPreview })} className={`w-10 h-5 rounded-full transition-colors relative ${editingLesson.isPreview ? 'bg-green-500' : 'bg-gray-700'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${editingLesson.isPreview ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-gray-300 text-sm">Free preview lesson</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-[#d4af37]/20">
              <button onClick={() => setEditingLesson(null)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
              <button onClick={saveLessonEdit} className="px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg">Save Lesson</button>
            </div>
          </div>
        </div>
      )}
      {simpleMode ? (
        <SimpleModeDock
          tips={[
            'Use the mic if typing is slow.',
            'Start with the class promise first.',
            'You can add lessons after the basics.'
          ]}
        />
      ) : null}
    </div>
  );
}

export default function CourseCreationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CourseCreationPageContent />
    </Suspense>
  );
}

function parseNumericPrice(label: string) {
  const match = label.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : '';
}



