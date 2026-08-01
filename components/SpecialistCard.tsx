import React from 'react';
import { CalendarCheck, Check, Languages, MapPin, Star } from 'lucide-react';
import DoctorAvatar from './DoctorAvatar';
import { Specialist } from '../shared/types';

interface SpecialistCardProps {
  specialist: Specialist;
  selected: boolean;
  t: any;
  onSelect: () => void;
  /** Rendered only when the card is selected — the primary action varies by screen. */
  action?: React.ReactNode;
}

/** Renders the next free slot in the viewer's locale; the wire format is a UTC instant. */
const formatNextSlot = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * One doctor, as a family sees them. Shared by the AI results screen and the directory so
 * the two cannot drift — they were the same card copy-pasted before doctors were real.
 */
const SpecialistCard: React.FC<SpecialistCardProps> = ({ specialist, selected, t, onSelect, action }) => (
  <div
    className={`relative bg-white dark:bg-slate-800 border transition-all duration-300 rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md
      ${selected ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 dark:border-slate-700'}`}
  >
    <DoctorAvatar name={specialist.name} photoUrl={specialist.photoUrl} />

    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-900 dark:text-white truncate">{specialist.name}</h4>
      <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase truncate">
        {t.specialistNames[specialist.specialty] || specialist.specialty}
      </p>

      <div className="mt-1 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
        <p className="flex items-center gap-1.5 truncate"><MapPin className="w-3 h-3 flex-shrink-0" /> {specialist.facilityName}</p>
        <p className="flex items-center gap-1.5 truncate">
          <Languages className="w-3 h-3 flex-shrink-0" />
          {specialist.languages.map((l) => t.spokenLanguages?.[l] ?? l).join(' · ')}
        </p>
        {specialist.ratingAvg !== null && (
          <p className="flex items-center gap-1.5">
            <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
            {specialist.ratingAvg.toFixed(1)} ({specialist.ratingCount})
          </p>
        )}
      </div>

      {/* Computed from real rules and real bookings — not a hardcoded string any more. */}
      <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5
        ${specialist.availableToday ? 'text-emerald-500' : 'text-slate-400'}`}>
        <CalendarCheck className="w-3 h-3" />
        {specialist.availableToday
          ? t.booking.availableToday
          : specialist.nextSlotAt
            ? `${t.booking.nextAvailable} ${formatNextSlot(specialist.nextSlotAt)}`
            : t.booking.noSlots}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onSelect}
          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all
            ${selected
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600'}`}
        >
          {selected && <Check className="w-3 h-3" />}
          {selected ? t.results.specialistChosen : t.results.choose}
        </button>

        {selected && action}
      </div>
    </div>
  </div>
);

export default SpecialistCard;
