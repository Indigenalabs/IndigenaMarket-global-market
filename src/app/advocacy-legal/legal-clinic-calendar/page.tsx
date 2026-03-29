'use client';

import { useEffect, useState } from 'react';
import AdvocacyFrame from '../components/AdvocacyFrame';
import { fetchAdvocacyClinicSlots, readAdvocacyAdminState, saveAdvocacyClinicSlot } from '@/app/lib/advocacyLegalClientStore';

type ClinicSlot = {
  id: string;
  attorneyName: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  locationLabel: string;
  bookingStatus: string;
  capacity: number;
  bookedCount: number;
  bookingUrl: string;
};

function formatSlot(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export default function LegalClinicCalendarBookingPage() {
  const [slots, setSlots] = useState<ClinicSlot[]>([]);
  const [adminSigned, setAdminSigned] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({
    attorneyName: '',
    startsAt: '',
    endsAt: '',
    locationLabel: 'Virtual Clinic',
    capacity: 1
  });

  useEffect(() => {
    let active = true;
    setAdminSigned(readAdvocacyAdminState().adminSigned);
    (async () => {
      const data = await fetchAdvocacyClinicSlots();
      if (active && Array.isArray(data)) setSlots(data as ClinicSlot[]);
    })();
    return () => {
      active = false;
    };
  }, []);

  const saveSlot = async () => {
    try {
      const saved = await saveAdvocacyClinicSlot({
        attorneyName: form.attorneyName,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        locationLabel: form.locationLabel,
        capacity: form.capacity
      });
      setStatus('Clinic slot saved.');
      const data = await fetchAdvocacyClinicSlots();
      if (Array.isArray(data)) setSlots(data as ClinicSlot[]);
      setForm({ attorneyName: '', startsAt: '', endsAt: '', locationLabel: 'Virtual Clinic', capacity: 1 });
      return saved;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to save clinic slot.');
      return null;
    }
  };

  return (
    <AdvocacyFrame title="Legal Clinic Calendar & Booking" subtitle="Book community legal clinic sessions with participating advisors.">
      {adminSigned ? (
        <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-300">Publish clinic slot</p>
            <span className="rounded-full border border-emerald-500/40 px-2 py-1 text-[11px] text-emerald-300">Admin signed</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input value={form.attorneyName} onChange={(e) => setForm((prev) => ({ ...prev, attorneyName: e.target.value }))} placeholder="Attorney name" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" />
            <input value={form.startsAt} onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))} type="datetime-local" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" />
            <input value={form.endsAt} onChange={(e) => setForm((prev) => ({ ...prev, endsAt: e.target.value }))} type="datetime-local" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" />
            <input value={form.locationLabel} onChange={(e) => setForm((prev) => ({ ...prev, locationLabel: e.target.value }))} placeholder="Location label" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value || 1) }))} type="number" min={1} className="w-24 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" />
            <button onClick={() => void saveSlot()} className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
              Save Slot
            </button>
            {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
          </div>
        </section>
      ) : null}
      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {slots.length === 0 ? (
            <article className="rounded-lg border border-white/10 bg-black/25 p-4 text-sm text-gray-400">
              No clinic sessions published yet.
            </article>
          ) : slots.map((slot) => (
            <article key={slot.id} className="rounded-xl border border-[#d4af37]/20 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">{slot.attorneyName}</p>
              <p className="mt-1 text-xs text-[#d4af37]">{formatSlot(slot.startsAt)}</p>
              <p className="mt-1 text-xs text-gray-400">
                {slot.locationLabel} • {slot.bookedCount}/{slot.capacity} booked
              </p>
              <a
                href={slot.bookingUrl}
                className="mt-3 inline-flex rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10"
              >
                Book Session
              </a>
            </article>
          ))}
        </div>
      </section>
    </AdvocacyFrame>
  );
}
