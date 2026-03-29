'use client';

import { useState } from 'react';
import { 
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Edit3,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';

interface LiveSession {
  id: string;
  title: string;
  course: string;
  scheduledFor: string;
  duration: string;
  maxParticipants: number;
  registered: number;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  meetingLink: string;
}

const sessions: LiveSession[] = [
  {
    id: '1',
    title: 'Live Q&A: Advanced Techniques',
    course: 'Navajo Weaving Masterclass',
    scheduledFor: 'Tomorrow, 3:00 PM',
    duration: '60 min',
    maxParticipants: 50,
    registered: 34,
    status: 'upcoming',
    meetingLink: 'https://meet.indigena.com/session-1'
  },
  {
    id: '2',
    title: 'Pronunciation Workshop',
    course: 'Lakota Language Fundamentals',
    scheduledFor: 'Friday, 5:00 PM',
    duration: '90 min',
    maxParticipants: 30,
    registered: 28,
    status: 'upcoming',
    meetingLink: 'https://meet.indigena.com/session-2'
  },
  {
    id: '3',
    title: 'Glazing Techniques Demo',
    course: 'Traditional Pottery Techniques',
    scheduledFor: 'Last week',
    duration: '45 min',
    maxParticipants: 40,
    registered: 38,
    status: 'ended',
    meetingLink: 'https://meet.indigena.com/session-3'
  },
];

export default function SessionManagementPage() {
  const [showNewModal, setShowNewModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-amber-500/20 text-amber-400';
      case 'live': return 'bg-green-500/20 text-green-400';
      case 'ended': return 'bg-gray-500/20 text-gray-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Live Sessions</h1>
            <p className="text-gray-400 text-sm">Manage your live classes and webinars</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
          >
            <Plus size={18} />
            Schedule Session
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                    <Video size={24} className="text-[#d4af37]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{session.title}</h3>
                    <p className="text-[#d4af37] text-sm">{session.course}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(session.status)}`}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {session.scheduledFor}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {session.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {session.registered}/{session.maxParticipants} registered
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/10">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={session.meetingLink}
                    readOnly
                    className="bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-1.5 text-gray-400 text-sm w-64"
                  />
                  <button 
                    onClick={() => alert('Link copied!')}
                    className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {session.status === 'upcoming' && (
                    <>
                      <button className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] rounded-lg text-sm hover:bg-[#d4af37]/20 transition-colors">
                        Start
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  {session.status === 'ended' && (
                    <button className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] rounded-lg text-sm hover:bg-[#d4af37]/20 transition-colors">
                      View Recording
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
