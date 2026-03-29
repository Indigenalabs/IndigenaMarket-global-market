'use client';

import { useState, useEffect } from 'react';
import { 
  Video,
  Mic,
  MicOff,
  VideoOff,
  MonitorUp,
  MessageSquare,
  Users,
  Settings,
  PhoneOff,
  Hand,
  MoreVertical,
  Share2,
  Clock,
  AlertCircle,
  CheckCircle,
  Send
} from 'lucide-react';
import Link from 'next/link';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  hasHandRaised: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isInstructor: boolean;
}

// Mock session data
const sessionData = {
  id: 'live1',
  title: 'Live Q&A: Navajo Weaving Techniques',
  courseName: 'Navajo Weaving Masterclass',
  instructor: {
    name: 'Maria Begay',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    title: 'Master Weaver'
  },
  startTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
  duration: 60,
  meetingLink: 'https://meet.indigena.com/live-session-123'
};

// Mock participants
const mockParticipants: Participant[] = [
  { id: '1', name: 'Maria Begay (Host)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', isHost: true, isMuted: false, isVideoOff: false, hasHandRaised: false },
  { id: '2', name: 'John Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', isHost: false, isMuted: true, isVideoOff: false, hasHandRaised: false },
  { id: '3', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', isHost: false, isMuted: false, isVideoOff: true, hasHandRaised: true },
  { id: '4', name: 'Michael Brown', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', isHost: false, isMuted: true, isVideoOff: true, hasHandRaised: false },
];

// Mock chat messages
const mockChatMessages: ChatMessage[] = [
  { id: '1', sender: 'Maria Begay', message: 'Welcome everyone! We\'ll start in a few minutes.', timestamp: new Date(Date.now() - 10 * 60 * 1000), isInstructor: true },
  { id: '2', sender: 'John Smith', message: 'Excited to be here!', timestamp: new Date(Date.now() - 8 * 60 * 1000), isInstructor: false },
  { id: '3', sender: 'Sarah Johnson', message: 'Can\'t wait to learn about the new techniques', timestamp: new Date(Date.now() - 5 * 60 * 1000), isInstructor: false },
  { id: '4', sender: 'Maria Begay', message: 'Please make sure your microphones are muted during the presentation', timestamp: new Date(Date.now() - 3 * 60 * 1000), isInstructor: true },
];

export default function LiveSessionPage({ params }: { params: { sessionId: string } }) {
  const [sessionState, setSessionState] = useState<'waiting' | 'live' | 'ended'>('waiting');
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasHandRaised, setHasHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = sessionData.startTime.getTime();
      const diff = start - now;
      
      if (diff <= 0) {
        setSessionState('live');
        setTimeUntilStart(0);
      } else {
        setTimeUntilStart(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: chatMessage,
      timestamp: new Date(),
      isInstructor: false
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  const toggleHandRaise = () => {
    setHasHandRaised(!hasHandRaised);
    setParticipants(prev => prev.map(p => 
      p.id === '2' ? { ...p, hasHandRaised: !hasHandRaised } : p
    ));
  };

  // Waiting Room View
  if (sessionState === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video size={40} className="text-[#d4af37]" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">{sessionData.title}</h1>
            <p className="text-gray-400 mb-6">{sessionData.courseName}</p>

            <div className="bg-[#0a0a0a] rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-400 mb-2">Session starts in</p>
              <p className="text-4xl font-bold text-[#d4af37] font-mono">
                {formatTime(timeUntilStart)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-400">
                <Users size={18} />
                <span>{participants.length} participants</span>
              </div>
              <div className="w-px h-4 bg-[#d4af37]/20" />
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={18} />
                <span>{sessionData.duration} minutes</span>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center mb-8">
              <div className="flex items-center gap-3">
                <img 
                  src={sessionData.instructor.avatar} 
                  alt={sessionData.instructor.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="text-left">
                  <p className="text-white font-medium">{sessionData.instructor.name}</p>
                  <p className="text-sm text-gray-400">{sessionData.instructor.title}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link 
                href={`/courses/learn/${params.sessionId}`}
                className="px-6 py-3 bg-[#141414] border border-[#d4af37]/30 text-gray-300 rounded-lg hover:border-[#d4af37] transition-colors"
              >
                Back to Course
              </Link>
              <button 
                onClick={() => setSessionState('live')}
                className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
              >
                Join Early
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Live Session View
  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 text-sm font-medium">LIVE</span>
          </div>
          <h1 className="text-white font-medium">{sessionData.title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowParticipants(!showParticipants)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              showParticipants ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users size={18} />
            <span className="text-sm">{participants.length}</span>
          </button>
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              showChat ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Main Video (Host) */}
            <div className="col-span-2 bg-[#141414] rounded-xl border border-[#d4af37]/20 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <img 
                    src={sessionData.instructor.avatar}
                    alt={sessionData.instructor.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  <p className="text-white font-medium">{sessionData.instructor.name}</p>
                  <p className="text-gray-400 text-sm">Instructor</p>
                </div>
              </div>
              
              {/* Host Label */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2 py-1 bg-[#d4af37] text-black text-xs font-medium rounded">Host</span>
              </div>

              {/* Muted Indicator */}
              {participants[0].isMuted && (
                <div className="absolute top-4 right-4 p-2 bg-black/50 rounded-full">
                  <MicOff size={16} className="text-white" />
                </div>
              )}
            </div>

            {/* Participant Videos */}
            {participants.slice(1, 3).map((participant) => (
              <div 
                key={participant.id}
                className="bg-[#141414] rounded-xl border border-[#d4af37]/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <img 
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-16 h-16 rounded-full mx-auto mb-2"
                    />
                    <p className="text-white text-sm">{participant.name}</p>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {participant.isMuted && (
                    <div className="p-1.5 bg-black/50 rounded-full">
                      <MicOff size={14} className="text-white" />
                    </div>
                  )}
                  {participant.hasHandRaised && (
                    <div className="p-1.5 bg-[#d4af37] rounded-full">
                      <Hand size={14} className="text-black" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar (Chat or Participants) */}
        {showChat && (
          <div className="w-80 bg-[#141414] border-l border-[#d4af37]/20 flex flex-col">
            <div className="p-4 border-b border-[#d4af37]/20">
              <h3 className="text-white font-medium">Chat</h3>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`${msg.isInstructor ? 'bg-[#d4af37]/10' : ''} rounded-lg p-2`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${msg.isInstructor ? 'text-[#d4af37]' : 'text-gray-300'}`}>
                      {msg.sender}
                    </span>
                    {msg.isInstructor && (
                      <span className="px-1.5 py-0.5 bg-[#d4af37] text-black text-xs rounded">Instructor</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-[#d4af37]/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                />
                <button 
                  onClick={sendChatMessage}
                  className="p-2 bg-[#d4af37] text-black rounded-lg hover:bg-[#f4e4a6] transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {showParticipants && (
          <div className="w-80 bg-[#141414] border-l border-[#d4af37]/20 flex flex-col">
            <div className="p-4 border-b border-[#d4af37]/20">
              <h3 className="text-white font-medium">Participants ({participants.length})</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3 p-2 hover:bg-[#0a0a0a] rounded-lg">
                  <img 
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{participant.name}</p>
                    {participant.isHost && (
                      <span className="text-xs text-[#d4af37]">Host</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {participant.isMuted && <MicOff size={14} className="text-gray-500" />}
                    {participant.isVideoOff && <VideoOff size={14} className="text-gray-500" />}
                    {participant.hasHandRaised && <Hand size={14} className="text-[#d4af37]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-[#141414] border-t border-[#d4af37]/20 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full transition-colors ${
                isMuted ? 'bg-[#DC143C] text-white' : 'bg-[#d4af37]/20 text-[#d4af37]'
              }`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 rounded-full transition-colors ${
                isVideoOff ? 'bg-[#DC143C] text-white' : 'bg-[#d4af37]/20 text-[#d4af37]'
              }`}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3 rounded-full transition-colors ${
                isScreenSharing ? 'bg-[#d4af37] text-black' : 'bg-[#d4af37]/20 text-[#d4af37]'
              }`}
            >
              <MonitorUp size={20} />
            </button>
            <button 
              onClick={toggleHandRaise}
              className={`p-3 rounded-full transition-colors ${
                hasHandRaised ? 'bg-[#d4af37] text-black' : 'bg-[#d4af37]/20 text-[#d4af37]'
              }`}
            >
              <Hand size={20} />
            </button>
            <button className="p-3 rounded-full bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/30 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

          <button 
            onClick={() => setSessionState('ended')}
            className="p-3 rounded-full bg-[#DC143C] text-white hover:bg-red-600 transition-colors"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
