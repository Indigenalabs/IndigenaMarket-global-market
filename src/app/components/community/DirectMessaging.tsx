'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Phone, Video, MoreVertical, Search, Plus } from 'lucide-react';
import Link from 'next/link';

interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
    online: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
  isTyping?: boolean;
}

const conversations: Conversation[] = [
  {
    id: 'conv-1',
    user: {
      name: 'Maria Redfeather',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      verified: true,
      online: true
    },
    lastMessage: 'Thanks for the feedback on my beadwork!',
    timestamp: '2m ago',
    unread: 2,
    isTyping: true
  },
  {
    id: 'conv-2',
    user: {
      name: 'ThunderVoice',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      verified: true,
      online: true
    },
    lastMessage: 'Would you be interested in collaborating?',
    timestamp: '1h ago',
    unread: 0
  },
  {
    id: 'conv-3',
    user: {
      name: 'Elena Rivers',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      verified: true,
      online: false
    },
    lastMessage: 'The workshop is scheduled for next week',
    timestamp: '3h ago',
    unread: 1
  }
];

export default function DirectMessaging() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center shadow-lg shadow-[#d4af37]/30 hover:scale-110 transition-transform z-40"
      >
        <MessageCircle size={24} className="text-black" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DC143C] rounded-full text-white text-xs flex items-center justify-center font-bold">
          3
        </span>
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-[#141414] rounded-2xl border border-[#d4af37]/20 shadow-2xl z-50 overflow-hidden">
          {!activeConversation ? (
            /* Conversations List */
            <>
              <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/10">
                <h3 className="text-white font-semibold">Messages</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors">
                    <Plus size={18} className="text-[#d4af37]" />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#1a1a1a] transition-colors text-left"
                  >
                    <div className="relative">
                      <img 
                        src={conv.user.avatar}
                        alt={conv.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.user.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#141414]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{conv.user.name}</span>
                        {conv.user.verified && (
                          <div className="w-3 h-3 rounded-full bg-[#d4af37] flex items-center justify-center">
                            <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm truncate">
                        {conv.isTyping ? (
                          <span className="text-[#d4af37]">typing...</span>
                        ) : (
                          conv.lastMessage
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{conv.timestamp}</p>
                      {conv.unread > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#DC143C] text-white text-xs rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Active Chat */
            <>
              <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveConversation(null)}
                    className="p-1 hover:bg-[#d4af37]/10 rounded transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="relative">
                    <img 
                      src={activeConversation.user.avatar}
                      alt={activeConversation.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {activeConversation.user.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#141414]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-medium text-sm">{activeConversation.user.name}</span>
                      {activeConversation.user.verified && (
                        <div className="w-3 h-3 rounded-full bg-[#d4af37] flex items-center justify-center">
                          <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-green-400">
                      {activeConversation.user.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors">
                    <Phone size={16} className="text-[#d4af37]" />
                  </button>
                  <button className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors">
                    <Video size={16} className="text-[#d4af37]" />
                  </button>
                  <button className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-64 p-4 overflow-y-auto space-y-3">
                <div className="flex justify-center">
                  <span className="text-xs text-gray-500 bg-[#0a0a0a] px-3 py-1 rounded-full">Today</span>
                </div>
                <div className="flex justify-start">
                  <div className="bg-[#0a0a0a] rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                    <p className="text-gray-300 text-sm">Hey! Love your recent beadwork posts!</p>
                    <span className="text-xs text-gray-500 mt-1">10:30 AM</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-[#d4af37] rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                    <p className="text-black text-sm">Thanks so much! Your digital art is amazing too</p>
                    <span className="text-xs text-black/60 mt-1">10:32 AM</span>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-[#0a0a0a] rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                    <p className="text-gray-300 text-sm">Thanks for the feedback on my beadwork!</p>
                    <span className="text-xs text-gray-500 mt-1">2m ago</span>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="p-3 border-t border-[#d4af37]/10">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                  />
                  <button className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center hover:bg-[#f4e4a6] transition-colors">
                    <Send size={18} className="text-black" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
