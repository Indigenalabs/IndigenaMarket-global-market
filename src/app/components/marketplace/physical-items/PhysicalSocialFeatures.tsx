'use client';

import { useState } from 'react';
import { Users, UserPlus, UserCheck, Share2, Twitter, Link2, CheckCircle, Heart, MessageCircle, Bell, BellOff } from 'lucide-react';
import { PhysicalItem } from './ItemDetailModal';

interface PhysicalSocialFeaturesProps {
  item?: PhysicalItem | null;
}

const MOCK_MAKERS = [
  { id: 'm1', name: 'SilverLeaf Studio', nation: 'Navajo Nation', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=silverleaf', followers: 2140, isFollowing: false, verified: true },
  { id: 'm2', name: 'Thunderbird Crafts', nation: 'Ojibwe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thunderbird', followers: 890, isFollowing: true, verified: false },
  { id: 'm3', name: 'Red Earth Pottery', nation: 'Cherokee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=redearth', followers: 3320, isFollowing: false, verified: true },
  { id: 'm4', name: 'NightSky Beadworks', nation: 'Lakota', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nightsky', followers: 1670, isFollowing: false, verified: true },
];

const MOCK_FEED = [
  { id: 'f1', user: 'EarthTones22', action: 'saved', item: 'Navajo Sand-Painted Pot', time: '3m ago' },
  { id: 'f2', user: 'PrairieWind', action: 'purchased', item: 'Lakota Beadwork Bracelet', time: '11m ago' },
  { id: 'f3', user: 'SkyDancer', action: 'reviewed', item: 'Haida Bentwood Box', time: '28m ago' },
  { id: 'f4', user: 'NightSky_Collector', action: 'shared', item: 'Cherokee Rivercane Basket', time: '1h ago' },
];

export default function PhysicalSocialFeatures({ item }: PhysicalSocialFeaturesProps) {
  const [makers, setMakers] = useState(MOCK_MAKERS);
  const [notifications, setNotifications] = useState<Set<string>>(new Set(['m2']));
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'makers' | 'feed'>('makers');

  const toggleFollow = (id: string) => {
    setMakers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, isFollowing: !m.isFollowing, followers: m.isFollowing ? m.followers - 1 : m.followers + 1 }
          : m
      )
    );
  };

  const toggleNotif = (id: string) => {
    setNotifications((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#d4af37]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Users size={16} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Community</h3>
            <p className="text-gray-500 text-xs">Follow makers &amp; share finds</p>
          </div>
        </div>

        {/* Share item button */}
        {item && (
          <div className="relative">
            <button
              onClick={() => setShareOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs rounded-xl hover:bg-[#d4af37]/20 transition-colors"
            >
              <Share2 size={12} />
              Share Item
            </button>
            {shareOpen && (
              <div className="absolute right-0 top-full mt-2 z-20 bg-[#1a1a1a] border border-[#d4af37]/20 rounded-xl p-3 w-48 shadow-xl">
                <p className="text-gray-400 text-xs mb-2 truncate">{item.title}</p>
                <div className="space-y-1">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 text-sm transition-colors"
                  >
                    {linkCopied ? <CheckCircle size={13} className="text-green-400" /> : <Link2 size={13} />}
                    {linkCopied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 text-sm transition-colors">
                    <Twitter size={13} className="text-sky-400" />
                    Share to X
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 text-sm transition-colors">
                    <MessageCircle size={13} className="text-purple-400" />
                    Send to Friend
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(['makers', 'feed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'text-[#d4af37] border-b-2 border-[#d4af37]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'makers' ? 'Follow Makers' : 'Community Feed'}
          </button>
        ))}
      </div>

      {/* Follow Makers tab */}
      {activeTab === 'makers' && (
        <div className="divide-y divide-white/5">
          {makers.map((maker) => (
            <div key={maker.id} className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0a0a0a] flex-shrink-0">
                <img src={maker.avatar} alt={maker.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-medium truncate">{maker.name}</span>
                  {maker.verified && (
                    <CheckCircle size={12} className="text-[#d4af37] flex-shrink-0" />
                  )}
                </div>
                <div className="text-gray-500 text-xs">{maker.nation} · {maker.followers.toLocaleString()} followers</div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {maker.isFollowing && (
                  <button
                    onClick={() => toggleNotif(maker.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      notifications.has(maker.id) ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-white/5 text-gray-500 hover:text-gray-300'
                    }`}
                    title={notifications.has(maker.id) ? 'Mute notifications' : 'Get notifications'}
                  >
                    {notifications.has(maker.id) ? <Bell size={12} /> : <BellOff size={12} />}
                  </button>
                )}
                <button
                  onClick={() => toggleFollow(maker.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    maker.isFollowing
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-[#DC143C] hover:border-[#DC143C]/30'
                      : 'bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/20'
                  }`}
                >
                  {maker.isFollowing ? <UserCheck size={11} /> : <UserPlus size={11} />}
                  {maker.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Feed tab */}
      {activeTab === 'feed' && (
        <div className="divide-y divide-white/5">
          {MOCK_FEED.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 p-4">
              <div className="w-7 h-7 rounded-full bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {entry.action === 'saved' && <Heart size={12} className="text-[#DC143C]" />}
                {entry.action === 'purchased' && <CheckCircle size={12} className="text-green-400" />}
                {entry.action === 'reviewed' && <MessageCircle size={12} className="text-blue-400" />}
                {entry.action === 'shared' && <Share2 size={12} className="text-purple-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">
                  <span className="text-white font-medium">{entry.user}</span>
                  {' '}{entry.action}{' '}
                  <span className="text-[#d4af37]">{entry.item}</span>
                </p>
                <p className="text-gray-600 text-xs mt-0.5">{entry.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-white/5 text-center">
        <span className="text-gray-600 text-xs">
          {makers.filter((m) => m.isFollowing).length} makers followed · {MOCK_FEED.length} recent actions
        </span>
      </div>
    </div>
  );
}
