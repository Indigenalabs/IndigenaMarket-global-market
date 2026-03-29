'use client';

import { useState } from 'react';
import { 
  Megaphone,
  Plus,
  Send,
  Clock,
  Users,
  Eye,
  Trash2,
  Edit3,
  CheckCircle,
  X
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  course: string;
  sentAt: string;
  recipients: number;
  opens: number;
  status: 'sent' | 'scheduled' | 'draft';
}

const announcements: Announcement[] = [
  {
    id: '1',
    title: 'New Module Available!',
    message: 'Week 5: Advanced Pattern Techniques is now live. Check it out!',
    course: 'Navajo Weaving Masterclass',
    sentAt: '2 days ago',
    recipients: 1234,
    opens: 892,
    status: 'sent'
  },
  {
    id: '2',
    title: 'Live Q&A This Friday',
    message: 'Join me for a live Q&A session this Friday at 3 PM EST.',
    course: 'Lakota Language Fundamentals',
    sentAt: 'Scheduled for tomorrow',
    recipients: 892,
    opens: 0,
    status: 'scheduled'
  },
];

export default function AnnouncementsPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleSend = () => {
    alert('Announcement sent!');
    setShowNewModal(false);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Announcements</h1>
            <p className="text-gray-400 text-sm">Communicate with your students</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
          >
            <Plus size={18} />
            New Announcement
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                    <Megaphone size={20} className="text-[#d4af37]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{announcement.title}</h3>
                    <p className="text-[#d4af37] text-sm">{announcement.course}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  announcement.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                  announcement.status === 'scheduled' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                </span>
              </div>

              <p className="text-gray-300 mb-4">{announcement.message}</p>

              <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/10">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {announcement.sentAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {announcement.recipients.toLocaleString()} recipients
                  </span>
                  {announcement.status === 'sent' && (
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {announcement.opens.toLocaleString()} opens
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* New Announcement Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
          <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/30 w-full max-w-lg">
            <div className="p-6 border-b border-[#d4af37]/20 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">New Announcement</h3>
              <button onClick={() => setShowNewModal(false)} className="p-2 text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="">Select a course</option>
                  <option value="1">Navajo Weaving Masterclass</option>
                  <option value="2">Lakota Language Fundamentals</option>
                  <option value="3">Traditional Pottery Techniques</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title"
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your announcement..."
                  rows={4}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#d4af37]/20 flex justify-end gap-3">
              <button 
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSend}
                disabled={!title || !message || !selectedCourse}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50"
              >
                <Send size={16} />
                Send Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
