'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Star,
  Ticket,
  Users,
  Video
} from 'lucide-react';
import {
  confirmTourismBookingPayment,
  createTourismBooking,
  createTourismBookingPaymentIntent,
  fetchTourismAvailability,
  fetchTourismBookingTicket,
  fetchTourismExperienceById,
  fetchTourismExperienceCalendar,
  fetchTourismExperienceReviews,
  trackTourismEvent,
  type BookingRecord,
  type ExperienceAvailability,
  type ExperienceCalendarDay,
  type ExperienceListing,
  type ExperienceReview
} from '@/app/lib/culturalTourismApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import CulturalTourismFrame from '../../components/CulturalTourismFrame';

function dayBadge(day: ExperienceCalendarDay, selectedDate: string) {
  if (day.date === selectedDate) return 'border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37]';
  if (day.blackout || day.soldOut) return 'border-red-500/30 bg-red-900/10 text-red-300';
  if (day.remaining <= 3) return 'border-amber-500/30 bg-amber-900/10 text-amber-300';
  return 'border-[#d4af37]/20 bg-[#111111] text-gray-200';
}

export default function CulturalTourismExperienceDetailPage() {
  const params = useParams<{ experienceId: string }>();
  const router = useRouter();
  const experienceId = String(params?.experienceId || '');

  const [item, setItem] = useState<ExperienceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookingDate, setBookingDate] = useState('');
  const [bookingGuests, setBookingGuests] = useState(1);
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [protocolAccepted, setProtocolAccepted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [consentAcknowledgements, setConsentAcknowledgements] = useState<string[]>([]);
  const [availability, setAvailability] = useState<ExperienceAvailability | null>(null);
  const [calendar, setCalendar] = useState<ExperienceCalendarDay[]>([]);
  const [bookingResult, setBookingResult] = useState<BookingRecord | null>(null);
  const [busy, setBusy] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState('');
  const [reviews, setReviews] = useState<ExperienceReview[]>([]);

  useEffect(() => {
    if (!experienceId) return;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const detail = await fetchTourismExperienceById(experienceId);
        if (!detail) {
          setError('Experience not found.');
          setItem(null);
          return;
        }
        setItem(detail);
        setBookingDate(detail.availableNextDate || '');
        setSelectedSession(detail.sessions?.[0]?.label || (detail.virtual ? 'Live Stream Access' : 'Morning Session (09:00)'));
        setConsentAcknowledgements([]);
        await trackTourismEvent({ event: 'tourism_view', experienceId: detail.id, kind: detail.kind });
        const cal = await fetchTourismExperienceCalendar(
          detail.id,
          detail.availableNextDate || new Date().toISOString().slice(0, 10),
          21,
          detail.sessions?.[0]?.sessionId || 'default'
        );
        setCalendar(cal.calendar || []);
        const nextReviews = await fetchTourismExperienceReviews(detail.id, 8).catch(() => []);
        setReviews(nextReviews);
      } catch (e) {
        setError((e as Error).message || 'Failed to load experience');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [experienceId]);

  useEffect(() => {
    if (!item || !bookingDate) {
      setAvailability(null);
      return;
    }
    const run = async () => {
      try {
        const picked = (item.sessions || []).find((s) => s.label === selectedSession);
        const next = await fetchTourismAvailability(item.id, bookingDate, bookingGuests, picked?.sessionId || 'default');
        setAvailability(next);
      } catch {
        setAvailability(null);
      }
    };
    void run();
  }, [item, bookingDate, bookingGuests, selectedSession]);

  const canSubmitBooking = useMemo(() => {
    if (!item || !bookingDate || !bookingName || !bookingEmail || !protocolAccepted || !policyAccepted || !selectedSession) return false;
    if (availability && !availability.canBook) return false;
    if (item.consentChecklist?.length) {
      return item.consentChecklist.every((x) => consentAcknowledgements.includes(x));
    }
    return true;
  }, [item, bookingDate, bookingName, bookingEmail, protocolAccepted, policyAccepted, selectedSession, availability, consentAcknowledgements]);

  const sessionOptions = useMemo(() => {
    if (!item) return [];
    const fromListing = (item.sessions || [])
      .filter((s) => s.active !== false)
      .map((s) => s.label);
    if (fromListing.length) return fromListing;
    if (item.virtual) return ['Live Stream Access', 'Replay + Live Q&A', 'Community Watch Party'];
    return ['Morning Session (09:00)', 'Midday Session (12:00)', 'Sunset Session (16:00)'];
  }, [item]);

  const selectedSessionObject = useMemo(() => {
    const sessions = item?.sessions || [];
    return sessions.find((s) => s.label === selectedSession) || null;
  }, [item, selectedSession]);

  const fare = useMemo(() => {
    const base = Number(item?.priceFrom || 0) * bookingGuests;
    const serviceFee = Number((base * 0.06).toFixed(2));
    const tax = Number((base * 0.03).toFixed(2));
    const total = Number((base + serviceFee + tax).toFixed(2));
    const api = availability?.fareBreakdown;
    if (api) {
      return {
        base: Number(api.baseFare || base),
        serviceFee: Number(api.serviceFee || serviceFee),
        tax: Number(api.taxAmount || tax),
        total: Number(api.totalAmount || total)
      };
    }
    return { base, serviceFee, tax, total };
  }, [item, bookingGuests, availability]);

  const onReserve = async () => {
    if (!item) return;
    setBusy('reserve');
    setBookingError(null);
    setBookingResult(null);
    try {
      await requireWalletAction('book this experience');
      await trackTourismEvent({ event: 'tourism_booking_started', experienceId: item.id, kind: item.kind });
      const result = await createTourismBooking({
        experienceId: item.id,
        date: bookingDate,
        sessionId: selectedSessionObject?.sessionId || 'default',
        sessionLabel: selectedSession,
        guests: bookingGuests,
        travelerName: bookingName,
        travelerEmail: bookingEmail,
        protocolAccepted,
        protocolAcknowledgements: consentAcknowledgements,
        notes: `Session: ${selectedSession}`
      });
      setBookingResult(result);
    } catch (e) {
      setBookingError((e as Error).message || 'Booking failed');
    } finally {
      setBusy('');
    }
  };

  const onCompletePayment = async () => {
    if (!bookingResult?.bookingId || !item) return;
    setBusy('pay');
    setBookingError(null);
    try {
      await requireWalletAction('complete this booking payment');
      const intent = await createTourismBookingPaymentIntent(bookingResult.bookingId);
      const confirmed = await confirmTourismBookingPayment(bookingResult.bookingId, intent.paymentIntentId);
      setBookingResult(confirmed);
      try {
        const ticket = await fetchTourismBookingTicket(bookingResult.bookingId);
        setTicketId(ticket.ticketId || '');
      } catch {
        setTicketId('');
      }
      await trackTourismEvent({ event: 'tourism_booking_completed', experienceId: item.id, kind: item.kind });
    } catch (e) {
      setBookingError((e as Error).message || 'Payment failed');
    } finally {
      setBusy('');
    }
  };

  const formatLabel = item?.virtual ? 'Online Experience Ticket' : 'In-Person Experience Ticket';

  return (
    <CulturalTourismFrame
      title={item?.title || 'Experience Detail'}
      subtitle="Destination booking detail with protocol, availability, and premium destination exposure visible across the pillar."
    >
      <main className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/cultural-tourism/experiences" className="px-3 py-1.5 rounded-lg border border-[#d4af37]/30 text-[#d4af37]">All Experiences</Link>
            <Link href="/cultural-tourism/trips" className="px-3 py-1.5 rounded-lg border border-[#d4af37]/20 text-gray-200">My Trips</Link>
          </div>
          <button
            onClick={() => router.back()}
            className="px-3 py-1.5 rounded-lg border border-[#d4af37]/20 text-gray-300 text-sm"
          >
            Back
          </button>
        </div>

        {loading && <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-6 text-gray-400">Loading experience...</div>}
        {error && <div className="rounded-xl border border-red-500/30 bg-red-900/10 p-4 text-red-300 text-sm">{error}</div>}

        {!loading && item && (
          <>
            <section className="rounded-2xl border border-[#d4af37]/20 bg-[#141414] overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-72 md:h-96 object-cover" />
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-3xl font-bold text-white">{item.title}</h1>
                    <p className="text-gray-300 mt-1">{item.summary}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-400">{formatLabel}</p>
                    <p className="text-2xl text-[#d4af37] font-semibold">From ${item.priceFrom}</p>
                    <button
                      type="button"
                      onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]"
                    >
                      Book Now
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-gray-200">
                  <span className="inline-flex items-center gap-1"><MapPin size={12} />{item.region}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={12} />{item.durationLabel}</span>
                  <span className="inline-flex items-center gap-1"><Users size={12} />{item.groupSize}</span>
                  <span className="inline-flex items-center gap-1 text-yellow-300"><Star size={12} />{item.rating.toFixed(1)} ({item.reviews})</span>
                  <span className="inline-flex items-center gap-1">{item.virtual ? <Video size={12} /> : <Ticket size={12} />}{item.virtual ? 'Online' : 'In Person'}</span>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 space-y-4">
                <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#d4af37]">What You Get</p>
                  <ul className="mt-2 space-y-2 text-sm text-gray-200">
                    <li>Guided Indigenous-led experience with cultural context.</li>
                    <li>Pre-trip protocol briefing and ticket confirmation.</li>
                    <li>{item.virtual ? 'Online access instructions sent before start time.' : 'On-site check-in ticket for selected date.'}</li>
                    <li>Post-trip review follow-up to improve quality and trust.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#d4af37]">Protocols & Restrictions</p>
                  <div className="mt-2 space-y-2 text-sm text-gray-200">
                    {(item.protocols || []).map((p) => (
                      <div key={p.id} className="flex items-start gap-2">
                        <Shield size={14} className="mt-0.5 text-[#d4af37]" />
                        <span>{p.label}</span>
                      </div>
                    ))}
                    <div className="pt-2 text-xs text-gray-400">
                      Media policy:
                      {' '}
                      Photo {item.mediaRestrictions?.photoAllowed ? 'allowed' : 'restricted'},
                      {' '}
                      Audio {item.mediaRestrictions?.audioAllowed ? 'allowed' : 'restricted'},
                      {' '}
                      Video {item.mediaRestrictions?.videoAllowed ? 'allowed' : 'restricted'}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#d4af37]">Availability Calendar</p>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                    {calendar.slice(0, 20).map((day) => (
                      <button
                        key={day.date}
                        onClick={() => setBookingDate(day.date)}
                        disabled={day.blackout || day.soldOut}
                        className={`text-left rounded-lg border px-3 py-2 text-xs disabled:opacity-50 ${dayBadge(day, bookingDate)}`}
                      >
                        <p>{day.date}</p>
                        <p className="text-[11px] mt-1">{day.blackout ? 'Unavailable' : `${day.remaining} spots left`}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <aside id="booking" className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4 space-y-3 h-fit sticky top-4">
                <p className="text-xs uppercase tracking-wide text-[#d4af37]">Book Ticket</p>
                <div>
                  <label htmlFor="booking-date" className="text-xs text-gray-400">Date</label>
                  <input id="booking-date" aria-label="Booking Date" type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-sm text-white" />
                </div>
                <div>
                  <label htmlFor="booking-guests" className="text-xs text-gray-400">Guests</label>
                  <input id="booking-guests" aria-label="Booking Guests" type="number" min={1} value={bookingGuests} onChange={(e) => setBookingGuests(Math.max(1, Number(e.target.value || 1)))} className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-sm text-white" />
                </div>
                <div>
                  <label htmlFor="booking-session" className="text-xs text-gray-400">Session</label>
                  <select id="booking-session" aria-label="Booking Session" value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-sm text-white">
                    {sessionOptions.map((session) => (
                      <option key={session} value={session}>{session}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="traveler-name" className="text-xs text-gray-400">Traveler Name</label>
                  <input id="traveler-name" aria-label="Traveler Name" placeholder="Traveler name" value={bookingName} onChange={(e) => setBookingName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-sm text-white" />
                </div>
                <div>
                  <label htmlFor="traveler-email" className="text-xs text-gray-400">Traveler Email</label>
                  <input id="traveler-email" aria-label="Traveler Email" placeholder="Traveler email" type="email" value={bookingEmail} onChange={(e) => setBookingEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-sm text-white" />
                </div>

                {availability && (
                  <div className={`text-xs rounded-lg border px-3 py-2 ${availability.canBook ? 'border-emerald-500/30 text-emerald-300 bg-emerald-900/10' : 'border-red-500/30 text-red-300 bg-red-900/10'}`}>
                    {availability.canBook ? `${availability.remaining} seats available` : 'Selected date not available for requested guests'}
                  </div>
                )}

                <label className="flex items-center gap-2 text-xs text-gray-100">
                  <input type="checkbox" checked={protocolAccepted} onChange={(e) => setProtocolAccepted(e.target.checked)} />
                  I acknowledge cultural protocols.
                </label>
                <div className="rounded-lg border border-[#d4af37]/20 bg-[#151515] p-3 text-xs text-gray-300">
                  <p className="text-[#d4af37] uppercase tracking-wide mb-1">Booking Policies</p>
                  <p>Free cancellation up to 48 hours before start. 50% refund up to 24 hours. No-show is non-refundable unless operator cancels.</p>
                  <label className="mt-2 flex items-start gap-2 text-xs text-gray-100">
                    <input type="checkbox" checked={policyAccepted} onChange={(e) => setPolicyAccepted(e.target.checked)} />
                    I accept cancellation, refund, and arrival policies for this ticket.
                  </label>
                </div>
                <div className="rounded-lg border border-[#d4af37]/20 bg-[#151515] p-3 text-xs text-gray-300">
                  <p className="text-[#d4af37] uppercase tracking-wide mb-1">Fare Breakdown</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between"><span>Base fare</span><span>${fare.base.toFixed(2)}</span></div>
                    <div className="flex items-center justify-between"><span>Service fee (6%)</span><span>${fare.serviceFee.toFixed(2)}</span></div>
                    <div className="flex items-center justify-between"><span>Taxes & duties (3%)</span><span>${fare.tax.toFixed(2)}</span></div>
                    <div className="flex items-center justify-between border-t border-[#d4af37]/20 pt-1 text-[#d4af37] font-medium"><span>Total</span><span>${fare.total.toFixed(2)}</span></div>
                  </div>
                </div>

                {Boolean(item.consentChecklist?.length) && (
                  <div className="rounded-lg border border-[#d4af37]/20 bg-[#151515] p-3 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-[#d4af37]">Mandatory Consent</p>
                    {item.consentChecklist?.map((entry) => (
                      <label key={entry} className="flex items-start gap-2 text-xs text-gray-200">
                        <input
                          type="checkbox"
                          checked={consentAcknowledgements.includes(entry)}
                          onChange={(e) => setConsentAcknowledgements((prev) => e.target.checked ? Array.from(new Set([...prev, entry])) : prev.filter((x) => x !== entry))}
                        />
                        <span>{entry}</span>
                      </label>
                    ))}
                  </div>
                )}

                <button
                  onClick={onReserve}
                  disabled={busy === 'reserve' || !canSubmitBooking}
                  className="w-full px-3 py-2 rounded-lg bg-[#d4af37] text-black font-medium disabled:opacity-50"
                >
                  {busy === 'reserve' ? 'Reserving...' : canSubmitBooking ? `Reserve Ticket (${fare.total.toFixed(2)})` : 'Complete Booking Details'}
                </button>

                {bookingResult?.status === 'pending' && (
                  <button
                    onClick={onCompletePayment}
                    disabled={busy === 'pay'}
                    className="w-full px-3 py-2 rounded-lg border border-[#d4af37]/40 text-[#d4af37] font-medium disabled:opacity-50"
                  >
                    {busy === 'pay' ? 'Completing Payment...' : 'Pay & Confirm Ticket'}
                  </button>
                )}

                {bookingResult?.status === 'confirmed' && (
                  <div className="rounded-lg border border-emerald-500/40 bg-emerald-900/10 p-3 text-xs text-emerald-300 space-y-2">
                    <p>Ticket confirmed. Booking ID: {bookingResult.bookingId}{ticketId ? ` • Ticket ${ticketId}` : ''}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/cultural-tourism/trips" className="px-2 py-1 rounded border border-emerald-500/40 text-emerald-300">Go to Trip Dashboard</Link>
                      <button onClick={() => router.push('/cultural-tourism/trips')} className="px-2 py-1 rounded border border-emerald-500/40 text-emerald-300">View Ticket & Itinerary</button>
                    </div>
                  </div>
                )}
                {bookingError && <p className="text-xs text-red-300">{bookingError}</p>}
              </aside>
            </section>
            <section className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
              <p className="text-xs uppercase tracking-wide text-[#d4af37]">Recent Traveler Reviews</p>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 mt-2">No reviews yet for this experience.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {reviews.map((review) => (
                    <div key={review.reviewId} className="rounded-lg border border-[#d4af37]/15 bg-[#101010] p-3">
                      <p className="text-sm text-[#d4af37]">{'★'.repeat(Math.max(1, Math.min(5, review.rating)))}</p>
                      <p className="text-sm text-gray-200 mt-1">{review.comment || 'No comment provided.'}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </CulturalTourismFrame>
  );
}
