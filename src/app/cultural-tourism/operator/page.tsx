'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, DollarSign, PlusCircle, ShieldCheck } from 'lucide-react';
import {
  fetchTourismExperienceCalendar,
  fetchTourismOperatorBookingInbox,
  fetchTourismOperatorListings,
  fetchTourismOperatorProfile,
  trackTourismEvent,
  updateTourismExperienceBlackouts,
  upsertTourismExperienceSessions,
  upsertTourismExperienceListing,
  type BookingRecord,
  type ExperienceCalendarDay,
  type ExperienceKind,
  type ExperienceListing,
  type ExperienceSession
} from '@/app/lib/culturalTourismApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import { resolveCurrentCreatorProfileSlug } from '@/app/lib/accountAuthClient';
import VoiceInputButton from '@/app/components/VoiceInputButton';
import SimpleModeDock from '@/app/components/SimpleModeDock';
import CommunityStorefrontBanner from '@/app/components/community/CommunityStorefrontBanner';
import CulturalTourismFrame from '../components/CulturalTourismFrame';
import { appendAccountSlugToHref } from '@/app/lib/communityStorefrontState';
import { fetchPublicProfile, updateProfileOffering } from '@/app/lib/profileApi';
import type { ProfileOffering } from '@/app/profile/data/profileShowcase';

const kinds: ExperienceKind[] = [
  'lodging','guided-tours','workshops','performances','festivals','wellness','culinary','adventure','virtual','arts-crafts','voluntourism','transport','specialty'
];

const KIND_LABELS: Record<ExperienceKind, { icon: string; label: string }> = {
  lodging: { icon: 'Stay', label: 'Lodging' },
  'guided-tours': { icon: 'Walk', label: 'Tour' },
  workshops: { icon: 'Make', label: 'Workshop' },
  performances: { icon: 'Show', label: 'Performance' },
  festivals: { icon: 'Gather', label: 'Festival' },
  wellness: { icon: 'Rest', label: 'Wellness' },
  culinary: { icon: 'Taste', label: 'Food' },
  adventure: { icon: 'Trail', label: 'Adventure' },
  virtual: { icon: 'Screen', label: 'Virtual' },
  'arts-crafts': { icon: 'Craft', label: 'Arts' },
  voluntourism: { icon: 'Care', label: 'Service' },
  transport: { icon: 'Ride', label: 'Transport' },
  specialty: { icon: 'Star', label: 'Special' }
};

function SimpleQuestionCard({ step, title, detail, children }: { step: string; title: string; detail: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#d4af37]/20 bg-[#0f0f0f] p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">{step}</p>
      <h3 className="mt-2 text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{detail}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function CulturalTourismOperatorPageContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/creator-hub';
  const simpleMode = searchParams.get('simple') === '1';
  const editOfferingId = searchParams.get('edit') || '';
  const requestedProfileSlug = searchParams.get('slug') || '';
  const accountSlug = searchParams.get('accountSlug') || '';
  const returnToHref = appendAccountSlugToHref(returnTo, accountSlug || undefined);
  const [profileSlug, setProfileSlug] = useState(requestedProfileSlug);
  const [mirrorOffering, setMirrorOffering] = useState<ProfileOffering | null>(null);
  const [wallet, setWallet] = useState('demo-operator-wallet');
  const [walletInput, setWalletInput] = useState('demo-operator-wallet');
  const [profile, setProfile] = useState<{ operatorName: string; verificationTier: string; activeListings: number; monthlyBookings: number; payoutPending: number } | null>(null);
  const [listings, setListings] = useState<ExperienceListing[]>([]);
  const [bookingInbox, setBookingInbox] = useState<BookingRecord[]>([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [calendarDays, setCalendarDays] = useState<ExperienceCalendarDay[]>([]);
  const [calendarStart, setCalendarStart] = useState(new Date().toISOString().slice(0, 10));
  const [calendarSessionId, setCalendarSessionId] = useState('default');
  const [blackoutDate, setBlackoutDate] = useState('');
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<ExperienceKind>('guided-tours');
  const [region, setRegion] = useState('');
  const [nation, setNation] = useState('');
  const [summary, setSummary] = useState('');
  const [listingPhotos, setListingPhotos] = useState<Array<{ name: string; url: string }>>([]);
  const [priceFrom, setPriceFrom] = useState(100);
  const [durationLabel, setDurationLabel] = useState('Half Day');
  const [groupSize, setGroupSize] = useState('Up to 12');
  const [maxCapacity, setMaxCapacity] = useState(12);
  const [availableNextDate, setAvailableNextDate] = useState('');
  const [virtual, setVirtual] = useState(false);
  const [sacredContent, setSacredContent] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [updatingBlackout, setUpdatingBlackout] = useState(false);
  const [sessionDraft, setSessionDraft] = useState<ExperienceSession[]>([]);
  const [savingSessions, setSavingSessions] = useState(false);

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
        setTitle(offering.title || '');
        setSummary(offering.blurb || '');
        setPriceFrom(Number(parseNumericPrice(offering.priceLabel) || 100));
        setAvailableNextDate('');
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [editOfferingId, profileSlug]);

  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [p, operatorListings, inbox] = await Promise.all([
        fetchTourismOperatorProfile(wallet),
        fetchTourismOperatorListings(wallet, 50),
        fetchTourismOperatorBookingInbox(wallet, 200)
      ]);
      setProfile(p);
      setListings(operatorListings.slice(0, 12));
      setSelectedListingId((prev) => prev || operatorListings[0]?.id || '');
      setBookingInbox(inbox);
    } catch (e) {
      setMessage((e as Error).message || 'Failed to load operator data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = window.localStorage.getItem('indigena_wallet_address') || 'demo-operator-wallet';
    setWallet(saved);
    setWalletInput(saved);
  }, []);

  useEffect(() => {
    if (!wallet) return;
    void load();
  }, [wallet]);

  useEffect(() => {
    if (!selectedListingId) {
      setCalendarDays([]);
      return;
    }
    const run = async () => {
      setCalendarLoading(true);
      try {
        const calendar = await fetchTourismExperienceCalendar(selectedListingId, calendarStart, 21, calendarSessionId);
        setCalendarDays(calendar.calendar);
      } catch {
        setCalendarDays([]);
      } finally {
        setCalendarLoading(false);
      }
    };
    void run();
  }, [selectedListingId, calendarStart, calendarSessionId]);

  useEffect(() => {
    const listing = listings.find((x) => x.id === selectedListingId);
    if (!listing) {
      setSessionDraft([]);
      return;
    }
    const sessions = (listing.sessions || []).length > 0
      ? (listing.sessions || [])
      : [{
          sessionId: 'default',
          label: listing.virtual ? 'Live Stream Access' : 'General Admission',
          startTime: '',
          endTime: '',
          capacity: Math.max(1, listing.maxCapacity || Number((listing.groupSize || '').match(/\d+/)?.[0] || 12)),
          active: true,
          virtual: listing.virtual
        }];
    setSessionDraft(sessions.map((s) => ({ ...s })));
    setCalendarSessionId(sessions[0]?.sessionId || 'default');
  }, [selectedListingId, listings]);

  const saveWallet = async () => {
    let next = walletInput.trim();
    if (!next) {
      try {
        next = (await requireWalletAction('open the operator dashboard')).wallet;
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Sign in to open the operator dashboard.');
        return;
      }
    }
    window.localStorage.setItem('indigena_wallet_address', next);
    setWallet(next);
  };

  const canSubmit =
    title.trim().length > 3 &&
    region.trim().length > 1 &&
    nation.trim().length > 1 &&
    summary.trim().length > 20 &&
    Number.isFinite(priceFrom) &&
    priceFrom > 0 &&
    durationLabel.trim().length > 1;

  const create = async () => {
    if (!canSubmit) {
      setMessage('Please complete required fields before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const activeProfileSlug = profileSlug || (await resolveCurrentCreatorProfileSlug());
      if (!activeProfileSlug) throw new Error('Sign in to continue.');
      if (!profileSlug) setProfileSlug(activeProfileSlug);
      await upsertTourismExperienceListing({
        title,
        kind,
        region,
        nation,
        summary,
        image: listingPhotos[0]?.url,
        images: listingPhotos.map((photo) => photo.url),
        priceFrom,
        durationLabel,
        groupSize,
        maxCapacity,
        availableNextDate: availableNextDate || undefined,
        virtual,
        sacredContent
      });
        if (editOfferingId) {
          await updateProfileOffering({
          slug: activeProfileSlug,
          accountSlug: accountSlug || undefined,
          offeringId: editOfferingId,
          title: title.trim(),
          blurb: summary.trim(),
          priceLabel: `From INDI ${Math.round(priceFrom)}`,
          status: 'Active',
          coverImage: listingPhotos[0]?.url || mirrorOffering?.coverImage || '',
          ctaMode: 'book',
          ctaPreset: 'book-now',
          merchandisingRank: mirrorOffering?.merchandisingRank ?? 0,
          galleryOrder: listingPhotos.map((photo) => photo.url),
          launchWindowStartsAt: mirrorOffering?.launchWindowStartsAt || '',
          launchWindowEndsAt: mirrorOffering?.launchWindowEndsAt || '',
          availabilityLabel: 'Bookable',
          availabilityTone: 'success',
          featured: mirrorOffering?.featured ?? false
        });
      }
      await trackTourismEvent({ event: 'tourism_operator_listing_created', kind, metadata: { wallet } });
      setMessage('Listing created and queued for verification review.');
      setTitle('');
      setSummary('');
      setRegion('');
      setNation('');
      setListingPhotos([]);
      setAvailableNextDate('');
      setGroupSize('Up to 12');
      setMaxCapacity(12);
      void load();
    } catch (e) {
      setMessage((e as Error).message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const readers = await Promise.all(
      Array.from(files)
        .slice(0, 6)
        .map(
          (file) =>
            new Promise<{ name: string; url: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ name: file.name, url: String(reader.result || '') });
              reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
              reader.readAsDataURL(file);
            })
        )
    );
    setListingPhotos(readers);
  };

  const selectedListing = listings.find((x) => x.id === selectedListingId) || null;

  const updateBlackout = async (mode: 'add' | 'remove') => {
    if (!selectedListingId || !blackoutDate) {
      setMessage('Select a listing and date for blackout update.');
      return;
    }
    setUpdatingBlackout(true);
    setMessage('');
    try {
      await updateTourismExperienceBlackouts(
        selectedListingId,
        mode === 'add' ? [blackoutDate] : [],
        mode === 'remove' ? [blackoutDate] : []
      );
      await load();
      const calendar = await fetchTourismExperienceCalendar(selectedListingId, calendarStart, 21, calendarSessionId);
      setCalendarDays(calendar.calendar);
      setMessage(mode === 'add' ? `Blackout added: ${blackoutDate}` : `Blackout removed: ${blackoutDate}`);
    } catch (e) {
      setMessage((e as Error).message || 'Failed to update blackout dates');
    } finally {
      setUpdatingBlackout(false);
    }
  };

  const patchSession = (index: number, patch: Partial<ExperienceSession>) => {
    setSessionDraft((prev) => prev.map((row, idx) => (idx === index ? { ...row, ...patch } : row)));
  };

  const addSessionDraft = () => {
    setSessionDraft((prev) => [
      ...prev,
      {
        sessionId: `session-${Date.now()}`,
        label: 'New Session',
        startTime: '09:00',
        endTime: '12:00',
        capacity: 12,
        active: true,
        virtual: false
      }
    ]);
  };

  const removeSessionDraft = (index: number) => {
    setSessionDraft((prev) => prev.filter((_, idx) => idx !== index));
  };

  const saveSessions = async () => {
    if (!selectedListingId) {
      setMessage('Select a listing first.');
      return;
    }
    if (sessionDraft.length === 0) {
      setMessage('At least one session is required.');
      return;
    }
    setSavingSessions(true);
    setMessage('');
    try {
      await upsertTourismExperienceSessions(
        selectedListingId,
        sessionDraft.map((row) => ({
          ...row,
          sessionId: String(row.sessionId || '').trim().toLowerCase() || `session-${Date.now()}`,
          label: String(row.label || '').trim() || 'Session',
          capacity: Math.max(1, Number(row.capacity || 1))
        }))
      );
      await load();
      setMessage('Session schedule updated.');
    } catch (e) {
      setMessage((e as Error).message || 'Failed to save sessions');
    } finally {
      setSavingSessions(false);
    }
  };

  const content = (
    <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{simpleMode ? 'Add a trip or experience' : 'Cultural Tourism Operator Dashboard'}</h1>
            <p className="text-gray-400 text-sm">{simpleMode ? 'Start with one experience.' : 'Phase 1-3 operator tools: listings, calendar readiness, payout visibility, and verification lane.'}</p>
          </div>
          <Link href={returnToHref} className="px-4 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37]">{simpleMode ? 'Back to simple home' : 'Back to Creator Hub'}</Link>
        </div>

        <CommunityStorefrontBanner accountSlug={accountSlug || undefined} returnTo={returnToHref} />

        <div className={`grid gap-6 ${simpleMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'}`}>
          <div className={`bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4 flex flex-wrap gap-2 items-center ${simpleMode ? '' : 'md:col-span-4'}`}>
            <input value={walletInput} onChange={(e) => setWalletInput(e.target.value)} placeholder="Operator wallet address" className="flex-1 min-w-[260px] px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
            <button onClick={() => void saveWallet()} className="px-4 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-sm">Use Wallet</button>
          </div>

          {!simpleMode ? (
            <>
              <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4"><p className="text-xs text-gray-400">Operator</p><p className="text-white font-medium">{profile?.operatorName || '-'}</p></div>
              <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4"><p className="text-xs text-gray-400">Verification</p><p className="text-[#d4af37] font-medium inline-flex items-center gap-1"><ShieldCheck size={14} />{profile?.verificationTier || '-'}</p></div>
              <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4"><p className="text-xs text-gray-400">Monthly Bookings</p><p className="text-white font-medium">{profile?.monthlyBookings ?? 0}</p></div>
              <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4"><p className="text-xs text-gray-400">Payout Pending</p><p className="text-white font-medium inline-flex items-center gap-1"><DollarSign size={14} />{profile?.payoutPending ?? 0}</p></div>
            </>
          ) : null}
        </div>

        <div className={`grid gap-6 ${simpleMode ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3'}`}>
          {!simpleMode ? (
            <div className="xl:col-span-2 bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-3">Active Listings</h2>
              {loading && <p className="text-xs text-gray-400 mb-2">Loading listings...</p>}
              <div className="space-y-3">
                {listings.map((item) => (
                  <div key={item.id} className="rounded-lg border border-[#d4af37]/15 bg-[#0a0a0a] p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.region} • {item.kind} • ${item.priceFrom}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full border border-[#d4af37]/30 text-[#d4af37]">{item.verificationTier}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4 space-y-3">
            <h2 className="text-white font-semibold inline-flex items-center gap-2"><PlusCircle size={16} className="text-[#d4af37]" />{simpleMode ? 'Add an experience' : 'Create Listing'}</h2>
            {simpleMode ? (
              <div className="space-y-4">
                <SimpleQuestionCard step="Question 1" title="What is the experience called?" detail="Start with a clear name people will understand.">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sunrise canyon walk" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                  <VoiceInputButton onTranscript={setTitle} />
                </SimpleQuestionCard>

                {title.trim() ? (
                  <SimpleQuestionCard step="Question 2" title="What kind of experience is it?" detail="Choose the type and where it happens.">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {kinds.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setKind(k)}
                          className={`rounded-2xl border p-3 text-left transition-all ${
                            kind === k
                              ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#f3ddb1]'
                              : 'border-white/10 bg-[#0a0a0a] text-gray-300 hover:border-[#d4af37]/30'
                          }`}
                        >
                          <div className="text-sm text-[#d4af37]">{KIND_LABELS[k].icon}</div>
                          <p className="mt-1 text-sm font-semibold">{KIND_LABELS[k].label}</p>
                        </button>
                      ))}
                    </div>
                    <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                    <input value={nation} onChange={(e) => setNation(e.target.value)} placeholder="Nation or community" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                    <div className="flex gap-2">
                      <VoiceInputButton onTranscript={setRegion} label="Speak region" />
                      <VoiceInputButton onTranscript={setNation} label="Speak nation" />
                    </div>
                  </SimpleQuestionCard>
                ) : null}

                {title.trim() && region.trim() ? (
                  <SimpleQuestionCard step="Question 3" title="What does it cost and how long is it?" detail="Set the basics people need before booking.">
                    <input type="number" value={priceFrom} onChange={(e) => setPriceFrom(Number(e.target.value || 0))} placeholder="Starting price" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                    <input value={durationLabel} onChange={(e) => setDurationLabel(e.target.value)} placeholder="Duration" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                    <input value={groupSize} onChange={(e) => setGroupSize(e.target.value)} placeholder="Group size" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                    <input type="number" min={1} value={maxCapacity} onChange={(e) => setMaxCapacity(Math.max(1, Number(e.target.value || 1)))} placeholder="Max people per date" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                    <div className="flex gap-2">
                      <VoiceInputButton onTranscript={setDurationLabel} label="Say the duration" />
                      <VoiceInputButton onTranscript={setGroupSize} label="Say the group size" />
                    </div>
                  </SimpleQuestionCard>
                ) : null}

                {title.trim() && region.trim() && durationLabel.trim() ? (
                  <SimpleQuestionCard step="Question 4" title="Show and explain the experience" detail="Add the summary, next date, and photos.">
                    <input type="date" value={availableNextDate} onChange={(e) => setAvailableNextDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                    <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What will guests experience?" rows={3} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                    <VoiceInputButton onTranscript={setSummary} />
                    <label className="grid gap-2 text-xs text-gray-300">
                      Photos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => void uploadPhotos(e.target.files)}
                        className="w-full rounded-lg border border-dashed border-[#d4af37]/30 bg-[#0a0a0a] px-3 py-2 text-white text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#d4af37] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-black"
                      />
                    </label>
                    {listingPhotos.length ? (
                      <div className="grid grid-cols-3 gap-2">
                        {listingPhotos.map((photo) => (
                          <div key={photo.name} className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
                            <img src={photo.url} alt={photo.name} className="h-20 w-full object-cover" />
                            <p className="truncate px-2 py-1 text-[10px] text-gray-400">{photo.name}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <label className="text-xs text-gray-300 flex items-center gap-2"><input type="checkbox" checked={virtual} onChange={(e) => setVirtual(e.target.checked)} />Virtual experience</label>
                    <label className="text-xs text-gray-300 flex items-center gap-2"><input type="checkbox" checked={sacredContent} onChange={(e) => setSacredContent(e.target.checked)} />Sacred or protocol-sensitive</label>
                  </SimpleQuestionCard>
                ) : null}
              </div>
            ) : (
              <>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Experience title" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                <select value={kind} onChange={(e) => setKind(e.target.value as ExperienceKind)} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm">
                  {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                <input value={nation} onChange={(e) => setNation(e.target.value)} placeholder="Nation" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                <input type="number" value={priceFrom} onChange={(e) => setPriceFrom(Number(e.target.value || 0))} placeholder="Price" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                <input value={durationLabel} onChange={(e) => setDurationLabel(e.target.value)} placeholder="Duration label" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                <input value={groupSize} onChange={(e) => setGroupSize(e.target.value)} placeholder="Group size (e.g. Up to 12)" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                <input type="number" min={1} value={maxCapacity} onChange={(e) => setMaxCapacity(Math.max(1, Number(e.target.value || 1)))} placeholder="Max capacity per date" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                <input type="date" value={availableNextDate} onChange={(e) => setAvailableNextDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" rows={3} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
                <label className="grid gap-2 text-xs text-gray-300">
                  Listing photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => void uploadPhotos(e.target.files)}
                    className="w-full rounded-lg border border-dashed border-[#d4af37]/30 bg-[#0a0a0a] px-3 py-2 text-white text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#d4af37] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-black"
                  />
                </label>
                {listingPhotos.length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {listingPhotos.map((photo) => (
                      <div key={photo.name} className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
                        <img src={photo.url} alt={photo.name} className="h-20 w-full object-cover" />
                        <p className="truncate px-2 py-1 text-[10px] text-gray-400">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <label className="text-xs text-gray-300 flex items-center gap-2"><input type="checkbox" checked={virtual} onChange={(e) => setVirtual(e.target.checked)} />Virtual experience</label>
                <label className="text-xs text-gray-300 flex items-center gap-2"><input type="checkbox" checked={sacredContent} onChange={(e) => setSacredContent(e.target.checked)} />Sacred/protocol-sensitive</label>
              </>
            )}
            <button onClick={create} disabled={!canSubmit || submitting} className="w-full px-3 py-2 rounded-lg bg-[#d4af37] text-black font-medium text-sm disabled:opacity-60">{submitting ? 'Submitting...' : simpleMode ? 'Save this experience' : 'Submit Listing'}</button>
            {simpleMode ? (
              <Link
                href={appendAccountSlugToHref('/cultural-tourism/operator?returnTo=/creator-hub', accountSlug || undefined)}
                className="inline-flex w-full items-center justify-center rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-2 text-sm font-semibold text-[#f3ddb1]"
              >
                Next: bookable dates
              </Link>
            ) : null}
            {message && <p className="text-xs text-[#d4af37]">{message}</p>}
          </div>
        </div>

        {!simpleMode ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4 space-y-3">
            <h2 className="text-white font-semibold inline-flex items-center gap-2"><Calendar size={16} className="text-[#d4af37]" />{simpleMode ? 'When can people book?' : 'Availability Calendar + Blackouts'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <select value={selectedListingId} onChange={(e) => setSelectedListingId(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm">
                <option value="">Select listing</option>
                {listings.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
              </select>
              <select value={calendarSessionId} onChange={(e) => setCalendarSessionId(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm">
                {(sessionDraft.length > 0 ? sessionDraft : [{ sessionId: 'default', label: 'Default Session', capacity: 10, active: true, virtual: false }]).map((s) => (
                  <option key={s.sessionId} value={s.sessionId}>{s.label}</option>
                ))}
              </select>
              <input type="date" value={calendarStart} onChange={(e) => setCalendarStart(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input type="date" value={blackoutDate} onChange={(e) => setBlackoutDate(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
              <button onClick={() => updateBlackout('add')} disabled={updatingBlackout} className="px-3 py-2 rounded-lg border border-red-500/40 text-red-300 text-sm disabled:opacity-60">{updatingBlackout ? 'Updating...' : simpleMode ? 'Block date' : 'Add Blackout'}</button>
              <button onClick={() => updateBlackout('remove')} disabled={updatingBlackout} className="px-3 py-2 rounded-lg border border-emerald-500/40 text-emerald-300 text-sm disabled:opacity-60">{updatingBlackout ? 'Updating...' : simpleMode ? 'Reopen date' : 'Remove Blackout'}</button>
            </div>
            <div className="rounded-lg border border-[#d4af37]/15 bg-[#0f0f0f] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-[#d4af37]">{simpleMode ? 'Bookable times' : 'Session Schedule'}</p>
                <button onClick={addSessionDraft} className="px-2 py-1 rounded border border-[#d4af37]/30 text-[#d4af37] text-xs">Add Session</button>
              </div>
              {sessionDraft.map((session, index) => (
                <div key={`${session.sessionId}-${index}`} className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <input
                    value={session.sessionId}
                    onChange={(e) => patchSession(index, { sessionId: e.target.value })}
                    placeholder="session-id"
                    className="px-2 py-1.5 rounded bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-xs"
                  />
                  <input
                    value={session.label}
                    onChange={(e) => patchSession(index, { label: e.target.value })}
                    placeholder="Label"
                    className="px-2 py-1.5 rounded bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-xs"
                  />
                  <input
                    value={session.startTime || ''}
                    onChange={(e) => patchSession(index, { startTime: e.target.value })}
                    placeholder="Start"
                    className="px-2 py-1.5 rounded bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-xs"
                  />
                  <input
                    value={session.endTime || ''}
                    onChange={(e) => patchSession(index, { endTime: e.target.value })}
                    placeholder="End"
                    className="px-2 py-1.5 rounded bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-xs"
                  />
                  <input
                    type="number"
                    min={1}
                    value={session.capacity}
                    onChange={(e) => patchSession(index, { capacity: Math.max(1, Number(e.target.value || 1)) })}
                    placeholder="Capacity"
                    className="px-2 py-1.5 rounded bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-300 flex items-center gap-1">
                      <input type="checkbox" checked={session.active} onChange={(e) => patchSession(index, { active: e.target.checked })} />
                      Active
                    </label>
                    <button onClick={() => removeSessionDraft(index)} className="ml-auto px-2 py-1 rounded border border-red-500/40 text-red-300 text-[11px]">Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={saveSessions} disabled={savingSessions || !selectedListingId} className="px-3 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-xs disabled:opacity-60">
                {savingSessions ? 'Saving Sessions...' : simpleMode ? 'Save bookable times' : 'Save Session Schedule'}
              </button>
            </div>
            {selectedListing && (
              <p className="text-xs text-gray-300">
                {simpleMode ? 'Dates currently blocked: ' : 'Current blackouts: '}{(selectedListing.blackoutDates || []).length > 0 ? selectedListing.blackoutDates?.join(', ') : 'none'}
              </p>
            )}
            {calendarLoading ? (
              <p className="text-xs text-gray-400">Loading calendar...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {calendarDays.slice(0, 12).map((d) => (
                  <div key={d.date} className="rounded-lg border border-[#d4af37]/15 bg-[#0a0a0a] p-2">
                    <p className="text-xs text-gray-300">{d.date}</p>
                    <p className={`text-xs ${d.blackout || d.soldOut ? 'text-red-300' : 'text-emerald-300'}`}>
                      {d.blackout ? 'Blackout' : `${d.remaining}/${d.capacity} available`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4 space-y-3">
            <h2 className="text-white font-semibold">{simpleMode ? 'Booking messages' : 'Booking Inbox'}</h2>
            <p className="text-xs text-gray-400">Upcoming traveler bookings across your experiences.</p>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {bookingInbox.map((b) => (
                <div key={b.bookingId} className="rounded-lg border border-[#d4af37]/15 bg-[#0a0a0a] p-3">
                  <p className="text-sm text-white">{b.experienceTitle}</p>
                  <p className="text-xs text-gray-400">{b.bookingId} • {b.date} • {b.guests} guests • {b.status}</p>
                </div>
              ))}
              {!loading && bookingInbox.length === 0 && <p className="text-xs text-gray-400">No bookings for this operator yet.</p>}
            </div>
          </div>
        </div>
        ) : (
          <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
            <p className="text-sm text-gray-300">After you save this experience, you can set bookable dates, blocked dates, and booking messages from the full operator view.</p>
          </div>
        )}
      </div>
  );

  if (simpleMode) {
    return (
      <div className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-[28px] border border-[#d4af37]/20 bg-[#101010] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Simple mode</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Share one experience</h1>
            <p className="mt-2 text-sm leading-7 text-gray-300">Start here.</p>
          </div>
          {content}
          <SimpleModeDock
            tips={['Say the trip name and story out loud.', 'Save the experience first.', 'Add dates and booking rules later.']}
          />
        </div>
      </div>
    );
  }

  return (
    <CulturalTourismFrame
      title="Cultural Tourism Operator Studio"
      subtitle="Listings, calendar readiness, booking operations, and paid destination exposure from one operator surface."
    >
      {content}
    </CulturalTourismFrame>
  );
}

export default function CulturalTourismOperatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CulturalTourismOperatorPageContent />
    </Suspense>
  );
}

function parseNumericPrice(label: string) {
  const match = label.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : '';
}



