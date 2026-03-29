'use client';

import { useState } from 'react';
import { 
  Search,
  Filter,
  Mail,
  MoreVertical,
  Download,
  MessageSquare,
  CheckCircle,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  AlertCircle,
  ChevronDown,
  Star,
  BarChart3,
  Send
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourses: number;
  completedCourses: number;
  totalProgress: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'completed';
  avgScore: number;
  certificates: number;
}

// Mock students data
const studentsData: Student[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    enrolledCourses: 3,
    completedCourses: 1,
    totalProgress: 67,
    lastActive: '2 hours ago',
    status: 'active',
    avgScore: 88,
    certificates: 1
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    enrolledCourses: 2,
    completedCourses: 2,
    totalProgress: 100,
    lastActive: '1 day ago',
    status: 'completed',
    avgScore: 94,
    certificates: 2
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma.w@email.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    enrolledCourses: 4,
    completedCourses: 0,
    totalProgress: 34,
    lastActive: '5 minutes ago',
    status: 'active',
    avgScore: 72,
    certificates: 0
  },
  {
    id: '4',
    name: 'James Brown',
    email: 'james.brown@email.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    enrolledCourses: 1,
    completedCourses: 0,
    totalProgress: 12,
    lastActive: '1 week ago',
    status: 'inactive',
    avgScore: 0,
    certificates: 0
  },
  {
    id: '5',
    name: 'Lisa Davis',
    email: 'lisa.davis@email.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    enrolledCourses: 5,
    completedCourses: 3,
    totalProgress: 78,
    lastActive: '3 hours ago',
    status: 'active',
    avgScore: 91,
    certificates: 3
  },
];

export default function StudentManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const sendMessage = () => {
    // Mock send message
    alert(`Message sent to ${selectedStudents.length} students`);
    setShowMessageModal(false);
    setMessageText('');
    setSelectedStudents([]);
  };

  const stats = {
    total: studentsData.length,
    active: studentsData.filter(s => s.status === 'active').length,
    completed: studentsData.filter(s => s.status === 'completed').length,
    inactive: studentsData.filter(s => s.status === 'inactive').length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Student Management</h1>
            <p className="text-gray-400 text-sm">Manage and communicate with your students</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/20 transition-colors text-sm">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: stats.total, icon: BookOpen, color: '#d4af37' },
            { label: 'Active', value: stats.active, icon: TrendingUp, color: '#22c55e' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#4A90E2' },
            { label: 'Inactive', value: stats.inactive, icon: AlertCircle, color: '#DC143C' },
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

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search students..."
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {selectedStudents.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">{selectedStudents.length} selected</span>
              <button 
                onClick={() => setShowMessageModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black font-medium rounded-lg hover:bg-[#f4e4a6] transition-colors"
              >
                <Mail size={16} />
                Message
              </button>
            </div>
          )}
        </div>

        {/* Students Table */}
        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-[#d4af37]/10 bg-[#0a0a0a]">
                <th className="py-4 px-6">
                  <input 
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={selectAll}
                    className="rounded border-[#d4af37]/30 bg-[#141414] text-[#d4af37]"
                  />
                </th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Student</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Progress</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Courses</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Avg Score</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Last Active</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-[#0a0a0a]/50 transition-colors">
                  <td className="py-4 px-6">
                    <input 
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="rounded border-[#d4af37]/30 bg-[#141414] text-[#d4af37]"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="text-white font-medium">{student.name}</p>
                        <p className="text-gray-400 text-sm">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] rounded-full"
                          style={{ width: `${student.totalProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{student.totalProgress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <span className="text-white">{student.enrolledCourses}</span>
                      <span className="text-gray-400"> enrolled</span>
                      {student.completedCourses > 0 && (
                        <>
                          <span className="text-gray-500 mx-1">•</span>
                          <span className="text-green-400">{student.completedCourses} completed</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-[#d4af37] fill-[#d4af37]" />
                      <span className="text-white">{student.avgScore}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      student.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-sm">
                    {student.lastActive}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors">
                        <Mail size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors">
                        <BarChart3 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
          <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/30 w-full max-w-lg">
            <div className="p-6 border-b border-[#d4af37]/20">
              <h3 className="text-lg font-bold text-white">Send Message</h3>
              <p className="text-gray-400 text-sm">Send a message to {selectedStudents.length} selected students</p>
            </div>
            <div className="p-6">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
              />
            </div>
            <div className="p-6 border-t border-[#d4af37]/20 flex justify-end gap-3">
              <button 
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={sendMessage}
                disabled={!messageText.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
