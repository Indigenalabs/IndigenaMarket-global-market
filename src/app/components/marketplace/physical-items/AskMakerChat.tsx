'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, MessageCircle, Clock, CheckCheck, Lock, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  sender: 'buyer' | 'maker';
  text: string;
  timestamp: string;
  read: boolean;
}

interface AskMakerChatProps {
  makerName: string;
  makerAvatar: string;
  nation: string;
  itemTitle: string;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
  'How long does shipping usually take?',
  'Can this be made in a custom size?',
  'Is this item safe to ship internationally?',
  'Do you accept returns?',
  'Can you share more photos of this piece?',
  'What materials are used in this item?',
];

const AUTO_REPLIES: Record<string, string> = {
  'ship': 'Hi! Shipping through the Hub typically takes 5–10 business days domestically, and 10–21 days internationally. I package everything carefully with protective wrapping.',
  'custom': 'Yes, I do take custom orders! Please use the Custom Order form to submit your specifications and I\'ll get back to you within 48 hours.',
  'return': 'I accept returns within 14 days if the item arrives damaged. Sacred items are non-returnable once shipped. Please message me first if there\'s an issue.',
  'photo': 'Of course! I can send additional photos. Just let me know what angles you\'d like — close-up beadwork, full piece, or detail shots.',
  'material': 'Happy to share! I use traditional materials sourced locally — I\'ll list the exact materials used in this piece in my next message.',
  'default': 'Thanks for your message! I typically respond within 24 hours. I\'m currently working on several commissions so please allow a bit of time. 🙏',
};

function getAutoReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('ship') || lower.includes('deliver')) return AUTO_REPLIES['ship'];
  if (lower.includes('custom') || lower.includes('size')) return AUTO_REPLIES['custom'];
  if (lower.includes('return') || lower.includes('refund')) return AUTO_REPLIES['return'];
  if (lower.includes('photo') || lower.includes('picture') || lower.includes('image')) return AUTO_REPLIES['photo'];
  if (lower.includes('material') || lower.includes('made of')) return AUTO_REPLIES['material'];
  return AUTO_REPLIES['default'];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AskMakerChat({ makerName, makerAvatar, nation, itemTitle, onClose }: AskMakerChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: '0',
      sender: 'maker',
      text: `Hi there! I'm ${makerName}. Ask me anything about "${itemTitle}" — I'm happy to help!`,
      timestamp: new Date(Date.now() - 60000).toISOString(),
      read: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const msgIdRef = useRef(1);
  const getNextId = useCallback(() => { msgIdRef.current += 1; return String(msgIdRef.current); }, []);

  const send = (text: string) => {
    if (!text.trim()) return;
    const msgId = getNextId();
    const replyId = getNextId();
    const now = new Date().toISOString();
    const msg: Message = {
      id: msgId,
      sender: 'buyer',
      text: text.trim(),
      timestamp: now,
      read: false,
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setIsTyping(true);

    // Simulate maker typing then reply
    const delay = 1800;
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: replyId,
        sender: 'maker',
        text: getAutoReply(text),
        timestamp: new Date().toISOString(),
        read: false,
      };
      setMessages((prev) => [...prev, reply]);
    }, delay);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#141414] border border-[#d4af37]/30 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md flex flex-col" style={{ height: '80vh', maxHeight: 600 }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
          <div className="relative">
            <img src={makerAvatar} alt={makerName} className="w-9 h-9 rounded-full object-cover" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#141414]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{makerName}</p>
            <p className="text-gray-500 text-xs">{nation} · Usually replies within 24h</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#d4af37]/10 rounded-full border border-[#d4af37]/20">
              <Lock size={10} className="text-[#d4af37]" />
              <span className="text-[#d4af37] text-xs">Encrypted</span>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors ml-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Item context pill */}
        <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <MessageCircle size={11} className="text-gray-500" />
            <span className="text-gray-500 text-xs truncate">Re: {itemTitle}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.sender === 'maker' && (
                <img src={makerAvatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-auto" />
              )}
              <div className={`max-w-[75%] ${msg.sender === 'buyer' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'buyer'
                    ? 'bg-[#d4af37] text-black rounded-br-sm'
                    : 'bg-[#242424] text-gray-200 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 ${msg.sender === 'buyer' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600 text-xs">{formatTime(msg.timestamp)}</span>
                  {msg.sender === 'buyer' && (
                    <CheckCheck size={12} className="text-[#d4af37]" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2">
              <img src={makerAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
              <div className="bg-[#242424] px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex-shrink-0">
            <p className="text-gray-600 text-xs mb-1.5 flex items-center gap-1">
              <Sparkles size={10} /> Quick questions
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="flex-shrink-0 text-xs px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-full transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/15 rounded-xl px-3 py-2 focus-within:border-[#d4af37]/40">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Ask the maker…"
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="text-[#d4af37] hover:text-[#e5c84a] disabled:text-gray-600 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-gray-700 text-xs text-center mt-1.5 flex items-center justify-center gap-1">
            <Clock size={10} /> Maker notified immediately
          </p>
        </div>
      </div>
    </div>
  );
}
