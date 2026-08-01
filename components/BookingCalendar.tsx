import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import DoctorAvatar from './DoctorAvatar';
import { fetchSlots } from '../services/doctorService';
import { bookAppointment } from '../services/appointmentService';
import { Appointment, Child, FamilyProfile, Slot, Specialist } from '../shared/types';

interface BookingCalendarProps {
  specialist: Specialist;
  profile: FamilyProfile;
  t: any;
  /** Links the booking to the AI check that prompted it, when there is one. */
  consultationId?: string;
  onBooked: (appointment: Appointment) => void;
  onBack: () => void;
}

/** Group slots by Dili civil day for the day picker. Slot instants are UTC on the wire. */
const dayKey = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  specialist,
  profile,
  t,
  consultationId,
  onBooked,
  onBack,
}) => {
  const tb = t.booking;
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [childId, setChildId] = useState<string>(profile.children[0]?.id ?? '');
  const [reason, setReason] = useState('');
  const [sharesHistory, setSharesHistory] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadSlots = async () => {
    setLoading(true);
    try {
      setSlots(await fetchSlots(specialist.id));
    } catch {
      setError(tb.slotsFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSlots(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [specialist.id]);

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots.filter(s => !s.booked)) {
      const key = dayKey(slot.startsAt);
      map.set(key, [...(map.get(key) ?? []), slot]);
    }
    return map;
  }, [slots]);

  const days = [...byDay.keys()];
  const activeDay = day && byDay.has(day) ? day : days[0] ?? null;

  const handleBook = async () => {
    if (!chosen || !childId) return;
    setError('');
    setBusy(true);

    const result = await bookAppointment({
      doctorId: specialist.id,
      childId,
      startsAt: chosen,
      reason: reason.trim() || undefined,
      consultationId,
      sharesHistory,
    });
    setBusy(false);

    if (result.status === 'ok') {
      onBooked(result.appointment);
      return;
    }

    // Someone else took the slot between render and submit — reload rather than leaving a
    // stale calendar on screen offering a time that no longer exists.
    if (result.reason === 'slot_taken') {
      setChosen(null);
      await loadSlots();
      setError(tb.slotTaken);
      return;
    }
    setError(
      result.reason === 'subscription_required' ? t.paywall.title
        : result.reason === 'network' ? t.auth.networkError
        : tb.bookingFailed,
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
      >
        {t.input.back}
      </button>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{tb.title}</p>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{tb.subtitle}</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex items-center gap-4">
        <DoctorAvatar name={specialist.name} photoUrl={specialist.photoUrl} />
        <div className="min-w-0">
          <h3 className="font-black text-slate-900 dark:text-white truncate">{specialist.name}</h3>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase">
            {t.specialistNames[specialist.specialty] || specialist.specialty}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{specialist.facilityName}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{tb.forChild}</label>
        <div className="flex flex-wrap gap-2">
          {profile.children.map((child: Child) => (
            <button
              key={child.id}
              onClick={() => setChildId(child.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${childId === child.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600'}`}
            >
              {child.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : days.length === 0 ? (
        <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl text-center border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{tb.noSlots}</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{tb.pickDay}</label>
            <div className="flex flex-wrap gap-2">
              {days.map(d => (
                <button
                  key={d}
                  onClick={() => { setDay(d); setChosen(null); }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                    ${activeDay === d
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{tb.pickSlot}</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(activeDay ? byDay.get(activeDay) ?? [] : []).map(slot => (
                <button
                  key={slot.startsAt}
                  onClick={() => setChosen(slot.startsAt)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all
                    ${chosen === slot.startsAt
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600'}`}
                >
                  {timeLabel(slot.startsAt)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{tb.reason}</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            placeholder={tb.reasonPlaceholder}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm"
          />
        </div>

        {/* Consent is per appointment, never a global setting on the account. */}
        <button
          onClick={() => setSharesHistory(!sharesHistory)}
          className="w-full flex items-start gap-3 text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors"
        >
          <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors
            ${sharesHistory ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
            {sharesHistory && <ShieldCheck className="w-3.5 h-3.5 text-white" />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{tb.shareHistory}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tb.shareHistoryHelp}</p>
          </div>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center animate-shake font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handleBook}
        disabled={busy || !chosen || !childId}
        className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
      >
        {busy ? <Loader2 className="w-5 h-5 animate-spin" />
          : chosen ? <><CheckCircle2 className="w-5 h-5" /> {tb.confirm}</>
          : <><CalendarPlus className="w-5 h-5" /> {tb.pickSlot}</>}
      </button>
    </div>
  );
};

export default BookingCalendar;
