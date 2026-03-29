'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Download, MapPin, Ticket } from 'lucide-react';
import {
  cancelTourismBooking,
  fetchTourismBookingTicket,
  fetchTravelerBookings,
  rescheduleTourismBooking,
  submitTourismBookingReview,
  trackTourismEvent,
  type BookingRecord
} from '@/app/lib/culturalTourismApi';
import CulturalTourismFrame from '../components/CulturalTourismFrame';

export default function CulturalTourismTripsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [rescheduleDate, setRescheduleDate] = useState<Record<string, string>>({});
  const [rescheduleGuests, setRescheduleGuests] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');
  const [actionBusy, setActionBusy] = useState<string>('');
  const [ticketPayload, setTicketPayload] = useState<Record<string, string>>({});
  const [reviewDraft, setReviewDraft] = useState<Record<string, { rating: number; comment: string }>>({});
  const [reviewSubmitted, setReviewSubmitted] = useState<Record<string, string>>({});

  const load = () => {
    fetchTravelerBookings().then(setBookings).catch(() => setBookings([]));
  };

  useEffect(load, []);

  const cancelBooking = async (bookingId: string) => {
    setActionBusy(`cancel-${bookingId}`);
    setMessage('');
    try {
      await cancelTourismBooking(bookingId, 'Canceled by traveler');
      setMessage(`Booking ${bookingId} cancelled.`);
      load();
    } catch (e) {
      setMessage((e as Error).message || 'Cancel failed');
    } finally {
      setActionBusy('');
    }
  };

  const rescheduleBooking = async (bookingId: string) => {
    const date = rescheduleDate[bookingId];
    if (!date) {
      setMessage('Select a new date first.');
      return;
    }
    setActionBusy(`reschedule-${bookingId}`);
    setMessage('');
    try {
      await rescheduleTourismBooking(bookingId, date, rescheduleGuests[bookingId]);
      setMessage(`Booking ${bookingId} rescheduled to ${date}.`);
      load();
    } catch (e) {
      setMessage((e as Error).message || 'Reschedule failed');
    } finally {
      setActionBusy('');
    }
  };

  const downloadItinerary = async (bookingId: string) => {
    setActionBusy(`download-${bookingId}`);
    setMessage('');
    try {
      const ticket = await fetchTourismBookingTicket(bookingId);
      const payload = [
        `Booking ID: ${ticket.bookingId}`,
        `Ticket ID: ${ticket.ticketId}`,
        `Experience: ${ticket.experienceTitle}`,
        `Date: ${ticket.date}`,
        `Guests: ${ticket.guests}`,
        '',
        'Protocols:',
        ...(ticket.protocolSnapshot || []).map((p) => `- ${p}`),
        '',
        'Restrictions:',
        `- Photo: ${ticket.restrictions.photoAllowed ? 'Allowed' : 'Restricted'}`,
        `- Audio: ${ticket.restrictions.audioAllowed ? 'Allowed' : 'Restricted'}`,
        `- Video: ${ticket.restrictions.videoAllowed ? 'Allowed' : 'Restricted'}`
      ].join('\n');

      const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `itinerary-${bookingId}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setTicketPayload((prev) => ({ ...prev, [bookingId]: ticket.ticketId }));
      setMessage(`Itinerary downloaded for ${bookingId}.`);
    } catch (e) {
      setMessage((e as Error).message || 'Unable to download itinerary yet.');
    } finally {
      setActionBusy('');
    }
  };

  const submitReview = async (bookingId: string) => {
    const payload = reviewDraft[bookingId] || { rating: 5, comment: '' };
    setActionBusy(`review-${bookingId}`);
    setMessage('');
    try {
      const review = await submitTourismBookingReview(bookingId, payload.rating, payload.comment);
      await trackTourismEvent({
        event: 'tourism_booking_completed',
        metadata: {
          bookingId,
          reviewId: review.reviewId,
          reviewRating: payload.rating,
          reviewCommentLength: payload.comment.length,
          reviewCaptured: true
        }
      });
      setReviewSubmitted((prev) => ({ ...prev, [bookingId]: review.reviewId }));
      setMessage(`Review submitted for ${bookingId}.`);
    } catch (e) {
      setMessage((e as Error).message || 'Unable to submit review right now.');
    } finally {
      setActionBusy('');
    }
  };

  return (
    <CulturalTourismFrame
      title="Trip Dashboard"
      subtitle="Traveler itineraries, reviews, and booking changes with tourism premium exposure still visible around the journey."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Trip Dashboard</h1>
            <p className="text-gray-400 text-sm">Bookings, digital itineraries, and protocol reminders.</p>
          </div>
          <Link href="/cultural-tourism" className="px-4 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37]">Back to Tourism</Link>
        </div>
        {message && <p className="text-sm text-[#d4af37]">{message}</p>}

        {bookings.length === 0 ? (
          <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-6 text-gray-400">No bookings yet. Book an experience to see your itinerary here.</div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.bookingId} className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-white font-medium">{b.experienceTitle}</p>
                  <p className="text-xs text-gray-400">Booking {b.bookingId} • {b.status}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200">
                  <span className="inline-flex items-center gap-1"><CalendarDays size={14} />{b.date}</span>
                  <span className="inline-flex items-center gap-1"><Ticket size={14} />{b.guests} guests</span>
                  <span className="inline-flex items-center gap-1"><MapPin size={14} />Itinerary ready</span>
                  <span className="text-[#d4af37] font-medium">${b.totalAmount}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => downloadItinerary(b.bookingId)}
                    disabled={b.status !== 'confirmed' || actionBusy === `download-${b.bookingId}`}
                    className="px-3 py-1.5 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-sm inline-flex items-center gap-1 disabled:opacity-60"
                  >
                    <Download size={14} />
                    {actionBusy === `download-${b.bookingId}` ? 'Preparing...' : 'Download Itinerary'}
                  </button>
                  <input
                    type="date"
                    value={rescheduleDate[b.bookingId] || ''}
                    onChange={(e) => setRescheduleDate((prev) => ({ ...prev, [b.bookingId]: e.target.value }))}
                    className="px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-xs"
                    disabled={b.status === 'cancelled'}
                  />
                  <input
                    type="number"
                    min={1}
                    value={rescheduleGuests[b.bookingId] || b.guests}
                    onChange={(e) => setRescheduleGuests((prev) => ({ ...prev, [b.bookingId]: Math.max(1, Number(e.target.value || 1)) }))}
                    className="w-16 px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-xs"
                    disabled={b.status === 'cancelled'}
                  />
                  <button
                    onClick={() => rescheduleBooking(b.bookingId)}
                    disabled={b.status === 'cancelled' || actionBusy === `reschedule-${b.bookingId}`}
                    className="px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-300 text-xs disabled:opacity-60"
                  >
                    {actionBusy === `reschedule-${b.bookingId}` ? 'Rescheduling...' : 'Reschedule'}
                  </button>
                  <button
                    onClick={() => cancelBooking(b.bookingId)}
                    disabled={b.status === 'cancelled' || actionBusy === `cancel-${b.bookingId}`}
                    className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 text-xs disabled:opacity-60"
                  >
                    {actionBusy === `cancel-${b.bookingId}` ? 'Cancelling...' : b.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                  </button>
                  {ticketPayload[b.bookingId] && (
                    <span className="text-[11px] px-2 py-1 rounded-full border border-emerald-500/40 text-emerald-300">
                      Ticket {ticketPayload[b.bookingId]}
                    </span>
                  )}
                </div>
                {b.status === 'confirmed' && (
                  <div className="w-full mt-2 rounded-lg border border-[#d4af37]/20 bg-[#111111] p-3">
                    <p className="text-xs text-gray-400 mb-2">Post-Experience Review</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={reviewDraft[b.bookingId]?.rating ?? 5}
                        onChange={(e) =>
                          setReviewDraft((prev) => ({
                            ...prev,
                            [b.bookingId]: { rating: Math.max(1, Number(e.target.value || 5)), comment: prev[b.bookingId]?.comment || '' }
                          }))
                        }
                        className="px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-xs"
                      >
                        <option value={5}>5 stars</option>
                        <option value={4}>4 stars</option>
                        <option value={3}>3 stars</option>
                        <option value={2}>2 stars</option>
                        <option value={1}>1 star</option>
                      </select>
                      <input
                        value={reviewDraft[b.bookingId]?.comment ?? ''}
                        onChange={(e) =>
                          setReviewDraft((prev) => ({
                            ...prev,
                            [b.bookingId]: { rating: prev[b.bookingId]?.rating ?? 5, comment: e.target.value }
                          }))
                        }
                        placeholder="Share your experience"
                        className="flex-1 min-w-[220px] px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-xs"
                      />
                      <button
                        onClick={() => submitReview(b.bookingId)}
                        disabled={actionBusy === `review-${b.bookingId}` || Boolean(reviewSubmitted[b.bookingId])}
                        className="px-3 py-1.5 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-xs disabled:opacity-60"
                      >
                        {actionBusy === `review-${b.bookingId}` ? 'Submitting...' : reviewSubmitted[b.bookingId] ? 'Review Submitted' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </CulturalTourismFrame>
  );
}
