'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { donateSeva, fetchSevaCauses, fetchSevaPlatformStats, requestSevaProject, type SevaCause } from '@/app/lib/sevaApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import { 
  Heart, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Shield, 
  Leaf, 
  Zap,
  Clock,
  CheckCircle,
  Award,
  Globe,
  Radio,
  ClipboardList,
  BookOpen,
  Sprout
} from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';

type FundId = 'rapid-response' | 'land-back' | 'innovation';

type SevaProject = {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  daysLeft: number;
  verification: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  fund: string;
  fundId: FundId;
  impact: string;
  updates: number;
};

// Live impact stats
const impactStats = {
  totalDonated: 2847500,
  projectsFunded: 47,
  activeDonors: 12543,
  communitiesImpacted: 89,
  thisMonth: 125000
};

// The Three Sacred Funds
const sacredFunds = [
  {
    id: 'rapid-response',
    name: 'Rapid Response Fund',
    description: 'Emergency support for Indigenous communities facing crises - natural disasters, health emergencies, and urgent needs.',
    icon: Zap,
    color: '#DC143C',
    raised: 450000,
    goal: 1000000,
    projects: 12,
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=300&fit=crop'
  },
  {
    id: 'land-back',
    name: 'Land Back Fund',
    description: 'Supporting Indigenous land stewardship, acquisition, and restoration projects that reconnect communities with ancestral territories.',
    icon: Leaf,
    color: '#d4af37',
    raised: 890000,
    goal: 2000000,
    projects: 8,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=300&fit=crop'
  },
  {
    id: 'innovation',
    name: 'Innovation Fund',
    description: 'Technology and cultural preservation projects - language apps, digital archives, VR experiences, and educational platforms.',
    icon: Globe,
    color: '#4A90E2',
    raised: 320000,
    goal: 750000,
    projects: 15,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=300&fit=crop'
  }
];

// Active SEVA Projects
const sevaProjects: SevaProject[] = [
  {
    id: '1',
    title: 'Lakota Language AI Preservation',
    description: 'Creating an AI-powered platform to preserve and teach the Lakota language to future generations. Features voice recognition and interactive lessons.',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=300&fit=crop',
    raised: 45000,
    goal: 75000,
    donors: 234,
    daysLeft: 15,
    verification: 'Platinum',
    fund: 'Innovation Fund',
    fundId: 'innovation',
    impact: 'Your $25 provides 1 month of language lessons for a student',
    updates: 5
  },
  {
    id: '2',
    title: 'Navajo Youth Art Mentorship',
    description: 'Connecting 50 Navajo youth with master artists to preserve traditional weaving, pottery, and silverwork techniques.',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=300&fit=crop',
    raised: 28000,
    goal: 50000,
    donors: 189,
    daysLeft: 22,
    verification: 'Gold',
    fund: 'Land Back Fund',
    fundId: 'land-back',
    impact: 'Your $15 provides art supplies for one student',
    updates: 3
  },
  {
    id: '3',
    title: 'Coastal Salish Emergency Relief',
    description: 'Supporting communities affected by recent flooding with temporary housing, food, and medical supplies.',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=300&fit=crop',
    raised: 125000,
    goal: 150000,
    donors: 892,
    daysLeft: 5,
    verification: 'Platinum',
    fund: 'Rapid Response Fund',
    fundId: 'rapid-response',
    impact: 'Your $50 provides emergency supplies for one family',
    updates: 8
  },
  {
    id: '4',
    title: 'Indigenous Women Entrepreneurship',
    description: 'Micro-grants and business training for 25 Indigenous women starting cultural enterprises and artisan businesses.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=300&fit=crop',
    raised: 67000,
    goal: 100000,
    donors: 445,
    daysLeft: 30,
    verification: 'Silver',
    fund: 'Innovation Fund',
    fundId: 'innovation',
    impact: 'Your $100 funds business training for one entrepreneur',
    updates: 2
  }
];

// Giving Tiers
const givingTiers = [
  { amount: 5, name: 'Seed Sower', description: 'Plant the seed of change', icon: Sprout, impact: 'Provides supplies for 1 student' },
  { amount: 15, name: 'Community Builder', description: 'Build stronger communities', icon: Users, impact: 'Funds 1 week of mentorship' },
  { amount: 25, name: 'Culture Keeper', description: 'Preserve traditions', icon: BookOpen, impact: 'Saves 10 language recordings' },
  { amount: 50, name: 'Legacy Guardian', description: 'Protect our heritage', icon: Shield, impact: 'Supports 1 emergency family' }
];

// Recent donors
const recentDonors = [
  { name: 'Sarah M.', amount: 25, project: 'Lakota Language', time: '2 min ago' },
  { name: 'Michael T.', amount: 100, project: 'Emergency Relief', time: '5 min ago' },
  { name: 'Jennifer K.', amount: 15, project: 'Youth Art', time: '12 min ago' },
  { name: 'David R.', amount: 50, project: 'Women Entrepreneurship', time: '18 min ago' },
  { name: 'Lisa W.', amount: 75, project: 'Lakota Language', time: '25 min ago' }
];

// Verification badges
const verificationBadges = {
  Bronze: { color: '#CD7F32', icon: Shield },
  Silver: { color: '#C0C0C0', icon: Shield },
  Gold: { color: '#FFD700', icon: Award },
  Platinum: { color: '#E5E4E2', icon: Award }
};

// Animated counter component
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span>{prefix}{count.toLocaleString()}{suffix}</span>
  );
}


const mapCauseCategoryToFund = (category: string): FundId => {
  if (category === "land_protection") return "land-back";
  if (category === "elder_care") return "rapid-response";
  return "innovation";
};

const mapCauseToProject = (cause: SevaCause): SevaProject => ({
  id: cause.causeId || `cause-${Date.now()}`,
  title: cause.name,
  description: cause.description || "Community cause",
  image: cause.imageUrl || "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=300&fit=crop",
  raised: Number(cause.currentFunding || 0),
  goal: Number(cause.fundingGoal || 0),
  donors: 0,
  daysLeft: 30,
  verification: cause.verifiedByElder ? "Platinum" : "Gold",
  fund: mapCauseCategoryToFund(cause.category) === "land-back" ? "Land Back Fund" : mapCauseCategoryToFund(cause.category) === "rapid-response" ? "Rapid Response Fund" : "Innovation Fund",
  fundId: mapCauseCategoryToFund(cause.category),
  impact: cause.category === "land_protection" ? "Protecting Indigenous land stewardship" : cause.category === "language_preservation" ? "Supporting language revival and lessons" : "Supporting community-led cultural resilience",
  updates: 0
});

export default function SevaPage() {
  const router = useRouter();
  const [activePillar, setActivePillar] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedFund, setSelectedFund] = useState<'all' | FundId>('all');
  const [liveStats, setLiveStats] = useState(impactStats);
  const [projects, setProjects] = useState<SevaProject[]>(sevaProjects);
  const [sevaLoading, setSevaLoading] = useState(false);
  const [sevaError, setSevaError] = useState<string | null>(null);
  const [donatingId, setDonatingId] = useState('');
  const [donationStatus, setDonationStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [requestForm, setRequestForm] = useState({
    title: '',
    community: '',
    nation: '',
    category: 'cultural_education',
    targetAmount: '',
    summary: '',
    impactPlan: ''
  });
  const [requestStatus, setRequestStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setSevaLoading(true);
        setSevaError(null);
        const [stats, causes] = await Promise.all([
          fetchSevaPlatformStats(),
          fetchSevaCauses()
        ]);

        if (!active) return;

        setLiveStats({
          totalDonated: stats.totalSEVADonated || impactStats.totalDonated,
          projectsFunded: stats.totalCauses || impactStats.projectsFunded,
          activeDonors: stats.totalUsers || impactStats.activeDonors,
          communitiesImpacted: Math.max(impactStats.communitiesImpacted, Math.round((stats.totalCauses || 0) * 1.6)),
          thisMonth: impactStats.thisMonth
        });

        if (Array.isArray(causes) && causes.length > 0) {
          setProjects(causes.map(mapCauseToProject));
        } else {
          setProjects([]);
        }
      } catch {
        if (!active) return;
        setSevaError('Unable to load live Seva data.');
      } finally {
        if (active) setSevaLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const filteredProjects = selectedFund === 'all'
    ? projects
    : projects.filter((project) => project.fundId === selectedFund);

  const handleDonate = async (causeId: string, amount: number, message: string) => {
    if (amount <= 0) return;
    setDonatingId(causeId);
    setDonationStatus({ type: 'idle' });
    try {
      const { wallet } = await requireWalletAction('contribute through Seva');
      const response = await donateSeva(wallet, causeId, amount, message);
      setDonationStatus({
        type: 'success',
        message: `Contribution confirmed: $${amount.toLocaleString()} sent through Seva.`
      });
      if (response.redirectUrl) {
        router.push(response.redirectUrl);
        return;
      }
    } catch (error) {
      setDonationStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to complete this Seva contribution right now.'
      });
    } finally {
      setDonatingId('');
    }
  };

  const handleRequestProject = async () => {
    if (!requestForm.title.trim() || !requestForm.summary.trim() || !requestForm.impactPlan.trim()) {
      setRequestStatus({
        type: 'error',
        message: 'Add a title, project summary, and impact plan so the platform can review the request properly.'
      });
      return;
    }

    try {
      setIsSubmittingRequest(true);
      setRequestStatus({ type: 'idle' });
      const { wallet } = await requireWalletAction('request a Seva project review');
      await requestSevaProject({
        walletAddress: wallet,
        requesterLabel: wallet,
        title: requestForm.title,
        community: requestForm.community,
        nation: requestForm.nation,
        category: requestForm.category,
        targetAmount: Number(requestForm.targetAmount || 0),
        summary: requestForm.summary,
        impactPlan: requestForm.impactPlan
      });
      setRequestStatus({
        type: 'success',
        message: 'Request sent. It is now in platform review for fit, stewardship, and fund-lane approval before it can go live.'
      });
      setRequestForm({
        title: '',
        community: '',
        nation: '',
        category: 'cultural_education',
        targetAmount: '',
        summary: '',
        impactPlan: ''
      });
    } catch (error) {
      setRequestStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to submit the Seva request right now.'
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <Sidebar 
        activePillar={activePillar} 
        onPillarChange={setActivePillar}
        isCollapsed={isCollapsed}
        onCollapseChange={setIsCollapsed}
      />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 transition-all duration-300">
        {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#DC143C]/20 via-[#0a0a0a] to-[#d4af37]/10 py-16 px-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,20,60,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.16),transparent_32%)]" />
            <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DC143C] to-[#8B0000] flex items-center justify-center">
                <Heart size={24} className="text-white" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#DC143C]/20 rounded-full">
                <Radio size={14} className="text-[#DC143C]" />
                <span className="text-[#DC143C] text-sm font-medium">LIVE IMPACT</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Seva <span className="text-[#DC143C]">Giving</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mb-8">
              Selfless service to Indigenous communities. 100% transparent giving with 
              <span className="text-[#d4af37]"> 90%+ direct impact</span>.
            </p>
            <div className="mb-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/72">Platform reviewed</span>
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/72">Advisory vetted</span>
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/72">Fund-lane governed</span>
            </div>
            <div className="mb-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Reviewed before launch</p>
                <p className="mt-3 text-sm leading-6 text-gray-300">Seva projects are reviewed before donors ever see them, so this pillar stays distinct from self-serve crowdfunding.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Fund-lane accountability</p>
                <p className="mt-3 text-sm leading-6 text-gray-300">Each approved project is published into the right Sacred Fund lane with governance notes, impact plan, and reporting expectations attached.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Donor clarity</p>
                <p className="mt-3 text-sm leading-6 text-gray-300">Donors can see what the project is for, who benefits, and whether it sits in emergency, land-back, or innovation funding.</p>
              </div>
            </div>

            {/* Live Impact Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                { label: 'Total SEVA Donated', value: liveStats.totalDonated, prefix: 'INDI ', suffix: '' },
                { label: 'Projects Funded', value: liveStats.projectsFunded, prefix: '', suffix: '' },
                { label: 'Active Donors', value: liveStats.activeDonors, prefix: '', suffix: '' },
                { label: 'Communities Impacted', value: liveStats.communitiesImpacted, prefix: '', suffix: '' }
              ].map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(20,20,20,0.86),rgba(8,8,8,0.82))] p-4 backdrop-blur">
                  <p className="text-2xl font-bold text-[#d4af37]">
                    <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
                ))}
              </div>
            </div>
          </div>

        {/* Three Sacred Funds */}
          <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">The Three Sacred Funds</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {sacredFunds.map((fund) => {
                const Icon = fund.icon;
                return (
                  <div 
                    key={fund.id}
                    onClick={() => setSelectedFund(selectedFund === fund.id ? 'all' : (fund.id as FundId))}
                  className={`cursor-pointer group overflow-hidden rounded-[26px] border transition-all ${
                      selectedFund === fund.id 
                        ? 'border-[#d4af37] bg-[linear-gradient(180deg,rgba(212,175,55,0.1),rgba(12,12,12,0.92))] shadow-[0_18px_40px_rgba(212,175,55,0.12)]' 
                        : 'border-white/8 bg-[linear-gradient(180deg,rgba(20,20,20,0.95),rgba(8,8,8,0.92))] hover:border-[#d4af37]/30'
                    }`}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img src={fund.image} alt={fund.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                      <div 
                        className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: fund.color }}
                      >
                        <Icon size={20} className="text-white" />
                      </div>
                    </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{fund.name}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{fund.description}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#d4af37]">{fund.raised.toLocaleString()} INDI</span>
                          <span className="text-gray-500">of {fund.goal.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, (fund.raised / fund.goal) * 100)}%`, backgroundColor: fund.color }}
                          />
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs">{fund.projects} active projects</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-12 bg-[#111111] border-y border-[#d4af37]/10">
          <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
            <div className="rounded-2xl border border-[#d4af37]/20 bg-[#141414] p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-medium text-[#d4af37]">
                <ClipboardList size={13} />
                Platform-governed intake
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">Need a Seva project on the platform?</h2>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                Seva projects are reviewed before they go live. Creators and communities do not self-publish Seva campaigns directly.
                Submit a request and the platform will review fit, urgency, governance, and community benefit before approval.
              </p>
              <div className="mt-6 space-y-3 text-sm text-gray-300">
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">1. Submit the project need, community context, and impact plan.</div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">2. Platform team reviews for legitimacy, urgency, and stewardship fit.</div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">3. Approved projects are published by the platform into the correct Sacred Fund lane.</div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/seva/requests" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35 hover:bg-[#d4af37]/10">
                  View my requests
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d4af37]/20 bg-[#141414] p-6">
              <h3 className="text-lg font-semibold text-white">Request Seva Project Review</h3>
              <p className="mt-2 text-sm text-gray-400">This sends your project to the platform for review. It does not publish a live campaign automatically.</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input value={requestForm.title} onChange={(e) => setRequestForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Project title" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40" />
                <input value={requestForm.community} onChange={(e) => setRequestForm((prev) => ({ ...prev, community: e.target.value }))} placeholder="Community" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40" />
                <input value={requestForm.nation} onChange={(e) => setRequestForm((prev) => ({ ...prev, nation: e.target.value }))} placeholder="Nation / People" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40" />
                <input value={requestForm.targetAmount} onChange={(e) => setRequestForm((prev) => ({ ...prev, targetAmount: e.target.value }))} placeholder="Target amount (optional)" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40" />
                <select value={requestForm.category} onChange={(e) => setRequestForm((prev) => ({ ...prev, category: e.target.value }))} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 md:col-span-2">
                  <option value="cultural_education">Cultural education</option>
                  <option value="language_preservation">Language preservation</option>
                  <option value="land_protection">Land protection</option>
                  <option value="elder_care">Elder care</option>
                  <option value="emergency_relief">Emergency relief</option>
                </select>
                <textarea value={requestForm.summary} onChange={(e) => setRequestForm((prev) => ({ ...prev, summary: e.target.value }))} placeholder="What is the project, who benefits, and why should it exist on Seva?" className="min-h-28 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 md:col-span-2" />
                <textarea value={requestForm.impactPlan} onChange={(e) => setRequestForm((prev) => ({ ...prev, impactPlan: e.target.value }))} placeholder="How would funds be used, measured, and reported back to donors?" className="min-h-28 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 md:col-span-2" />
              </div>
              {requestStatus.type !== 'idle' && (
                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${requestStatus.type === 'success' ? 'border-emerald-500/30 bg-emerald-900/10 text-emerald-300' : 'border-red-500/30 bg-red-900/10 text-red-300'}`}>
                  {requestStatus.message}
                </div>
              )}
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleRequestProject()}
                  disabled={isSubmittingRequest}
                  className="rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] px-5 py-3 text-sm font-semibold text-black transition-all hover:shadow-lg hover:shadow-[#d4af37]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingRequest ? 'Opening secure checkout...' : 'Submit for Platform Review'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 bg-[#0d0d0d]">
          <div className="max-w-7xl mx-auto grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
            <div className="rounded-2xl border border-[#d4af37]/15 bg-[#141414] p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-medium text-[#d4af37]">
                <Shield size={13} />
                Governance Model
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">How Seva projects are approved and funded</h2>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                Seva is a reviewed funding system. Every live project passes through platform review, advisory checks,
                and fund-lane assignment before donors see it.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Review Standards</p>
                <p className="mt-3 text-sm leading-7 text-gray-300">Urgency, legitimacy, community benefit, reporting capacity, and stewardship fit are checked before approval.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Fund Release</p>
                <p className="mt-3 text-sm leading-7 text-gray-300">Approved projects are placed into the right Sacred Fund lane and tracked through updates, milestones, and donor accountability.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Platform Custody</p>
                <p className="mt-3 text-sm leading-7 text-gray-300">Only platform administrators can publish live Seva projects, which prevents the pillar from becoming a self-published seller marketplace.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Active Projects */}
        <section className="py-12 px-6 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              {selectedFund === 'all' ? 'All Projects' : sacredFunds.find(f => f.id === selectedFund)?.name}
            </h2>
              <button type="button" onClick={() => setSelectedFund('all')} disabled={selectedFund === 'all'} className="flex items-center gap-2 text-[#d4af37] hover:text-[#f4e4a6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="text-sm">View All</span>
                <ArrowRight size={16} />
              </button>
            </div>
            {sevaLoading && <p className="text-xs text-gray-500 mb-4">Refreshing live causes...</p>}
            {sevaError && <p className="text-xs text-amber-400 mb-4">{sevaError}</p>}
            {donationStatus.type !== 'idle' && (
              <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${donationStatus.type === 'success' ? 'border-emerald-500/30 bg-emerald-900/10 text-emerald-300' : 'border-red-500/30 bg-red-900/10 text-red-300'}`}>
                {donationStatus.message}
              </div>
            )}

            {filteredProjects.length === 0 ? (
              <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-8 text-center">
                <p className="text-white font-semibold">No active causes available.</p>
                <p className="text-gray-400 text-sm mt-1">Try a different fund or check back shortly.</p>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => {
                const BadgeIcon = verificationBadges[project.verification as keyof typeof verificationBadges]?.icon || Shield;
                const badgeColor = verificationBadges[project.verification as keyof typeof verificationBadges]?.color || '#9ca3af';
                return (
                  <div 
                    key={project.id}
                    className="bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div 
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: badgeColor + '20', color: badgeColor }}
                        >
                          <BadgeIcon size={12} />
                          {project.verification}
                        </div>
                        <div className="px-2 py-1 rounded-full bg-[#DC143C]/20 text-[#DC143C] text-xs">
                          {project.fund}
                        </div>
                      </div>
                      
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#0a0a0a]/80 text-white text-xs">
                        <Clock size={12} className="inline mr-1" />
                        {project.daysLeft} days left
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
                      
                      {/* Impact Statement */}
                      <div className="mb-4 p-3 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-lg">
                        <p className="text-[#d4af37] text-sm">{project.impact}</p>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-[#d4af37] font-semibold">
                            {project.raised.toLocaleString()} INDI raised
                          </span>
                          <span className="text-gray-500">of {project.goal.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] rounded-full transition-all"
                            style={{ width: `${Math.min(100, (project.raised / project.goal) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats & Action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {project.donors} donors
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            {project.updates} updates
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDonate(project.id, 50, `Supporting ${project.title}`)}
                          disabled={donatingId === project.id}
                          className="px-4 py-2 bg-gradient-to-r from-[#DC143C] to-[#8B0000] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#DC143C]/30 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {donatingId === project.id ? 'Opening secure checkout...' : 'Donate Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </section>

        {/* Giving Tiers */}
        <section className="py-12 px-6 bg-gradient-to-br from-[#141414] to-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Choose Your Impact</h2>
            <p className="text-gray-400 text-center mb-8">Every contribution creates lasting change</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {givingTiers.map((tier) => {
                const TierIcon = tier.icon;
                return (
                <button
                  key={tier.amount}
                  type="button"
                  onClick={() => void handleDonate(filteredProjects[0]?.id || 'seva-community-fund', tier.amount, `${tier.name} contribution`)}
                  disabled={donatingId === (filteredProjects[0]?.id || 'seva-community-fund')}
                  className="group rounded-[24px] border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(10,10,10,0.96),rgba(20,20,20,0.9))] p-4 text-left transition-all hover:border-[#d4af37] hover:shadow-[0_16px_36px_rgba(212,175,55,0.14)]"
                >
                  <div className="mb-3 inline-flex rounded-full border border-[#d4af37]/18 bg-[#d4af37]/10 p-3 text-[#d4af37]">
                    <TierIcon size={18} />
                  </div>
                  <p className="text-2xl font-bold text-[#d4af37]">${tier.amount}</p>
                  <p className="text-white font-medium mb-1">{tier.name}</p>
                  <p className="text-gray-500 text-xs mb-2">{tier.description}</p>
                  <p className="text-[#d4af37]/80 text-xs">{tier.impact}</p>
                </button>
              )})}
            </div>
          </div>
        </section>

        {/* Live Donor Ticker & Transparency */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Recent Donors */}
              <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Radio size={16} className="text-[#DC143C] animate-pulse" />
                  <h3 className="text-lg font-semibold text-white">Live Donations</h3>
                </div>
                <div className="space-y-3">
                  {recentDonors.map((donor, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-[#d4af37]/10 last:border-0">
                      <div>
                        <p className="text-white text-sm">{donor.name}</p>
                        <p className="text-gray-500 text-xs">to {donor.project}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#d4af37] font-medium">${donor.amount}</p>
                        <p className="text-gray-500 text-xs">{donor.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transparency */}
              <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Transparency Promise</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">90%+ Direct Impact</p>
                      <p className="text-gray-400 text-xs">Minimum 90% of donations go directly to projects</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Public Ledger</p>
                      <p className="text-gray-400 text-xs">All transactions recorded on XRPL blockchain</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Indigenous Advisory Council</p>
                      <p className="text-gray-400 text-xs">All projects vetted by community leaders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Regular Updates</p>
                      <p className="text-gray-400 text-xs">Donors receive progress reports on funded projects</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-gradient-to-br from-[#DC143C]/20 via-[#0a0a0a] to-[#d4af37]/10">
          <div className="max-w-3xl mx-auto text-center">
            <Heart size={48} className="text-[#DC143C] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to support a Seva project?</h2>
            <p className="text-gray-400 mb-8">
              Join thousands of donors supporting Indigenous communities worldwide. 
              Every Seva contribution helps fund a real, reviewed community need.
            </p>
            <button
              type="button"
              onClick={() => void handleDonate(filteredProjects[0]?.id || 'seva-community-fund', 25, 'General Seva contribution')}
              disabled={donatingId === (filteredProjects[0]?.id || 'seva-community-fund')}
              className="px-8 py-4 bg-gradient-to-r from-[#DC143C] to-[#8B0000] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#DC143C]/30 transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {donatingId === (filteredProjects[0]?.id || 'seva-community-fund') ? 'Opening secure checkout...' : 'Start Giving Today'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}











