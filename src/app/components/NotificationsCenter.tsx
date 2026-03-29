'use client';

import { useState } from 'react';
import { 
  Bell,
  X,
  CheckCircle,
  MessageSquare,
  BookOpen,
  Award,
  Calendar,
  DollarSign,
  AlertCircle,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'course' | 'message' | 'achievement' | 'event' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationsCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'course',
    title: 'New module available',
    message: 'Week 5: Advanced Pattern Techniques is now live in Navajo Weaving Masterclass',
    timestamp: '5 minutes ago',
    read: false,
    link: '/courses/learn/1'
  },
  {
    id: '2',
    type: 'message',
    title: 'New reply to your discussion',
    message: 'Maria Begay replied to your question in the forum',
    timestamp: '1 hour ago',
    read: false,
    link: '/courses/1/forum'
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Certificate earned!',
    message: 'You completed Traditional Pottery Techniques. Congratulations!',
    timestamp: '2 hours ago',
    read: true,
    link: '/courses/certificate/3'
  },
  {
    id: '4',
    type: 'event',
    title: 'Live session starting soon',
    message: 'Live Q&A: Navajo Weaving starts in 30 minutes',
    timestamp: '3 hours ago',
    read: false,
    link: '/courses/live/1'
  },
  {
    id: '5',
    type: 'payment',
    title: 'Payment received',
    message: 'You earned 149 INDI from a course sale',
    timestamp: '1 day ago',
    read: true,
    link: '/courses/instructor/earnings'
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'course': return <BookOpen size={18} className="text-blue-400" />;
    case 'message': return <MessageSquare size={18} className="text-green-400" />;
    case 'achievement': return <Award size={18} className="text-[#d4af37]" />;
    case 'event': return <Calendar size={18} className="text-purple-400" />;
    case 'payment': return <DollarSign size={18} className="text-green-400" />;
    case 'system': return <AlertCircle size={18} className="text-red-400" />;
    default: return <Bell size={18} className="text-gray-400" />;
  }
};

export default function NotificationsCenter({ isOpen, onClose }: NotificationsCenterProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifs, setNotifs] = useState(notifications);

  if (!isOpen) return null;

  const filteredNotifications = activeTab === 'unread' 
    ? notifs.filter(n => !n.read)
    : notifs;

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
      <div 
        className="absolute right-4 top-16 w-96 bg-[#141414] rounded-2xl border border-[#d4af37]/30 shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/20">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#d4af37] text-black text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={markAllAsRead}
              className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#d4af37]/20">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'all' ? 'text-[#d4af37] border-b-2 border-[#d4af37]' : 'text-gray-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'unread' ? 'text-[#d4af37] border-b-2 border-[#d4af37]' : 'text-gray-400'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 border-b border-[#d4af37]/10 hover:bg-[#0a0a0a] transition-colors ${
                  !notification.read ? 'bg-[#d4af37]/5' : ''
                }`}
              >
                <div className="w-10 h-10 bg-[#0a0a0a] rounded-lg flex items-center justify-center flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{notification.title}</p>
                  <p className="text-gray-400 text-sm line-clamp-2">{notification.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{notification.timestamp}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-gray-400 hover:text-[#d4af37] transition-colors"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-[#d4af37] text-xs hover:underline"
                      onClick={() => markAsRead(notification.id)}
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#d4af37]/20">
          <Link 
            href="/notifications"
            className="block text-center text-[#d4af37] text-sm hover:underline"
            onClick={onClose}
          >
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
