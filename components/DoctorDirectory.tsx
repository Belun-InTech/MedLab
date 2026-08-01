import React, { useCallback, useEffect, useState } from 'react';
import { Filter, Loader2, Stethoscope, UserSearch } from 'lucide-react';
import SpecialistCard from './SpecialistCard';
import { fetchDoctors } from '../services/doctorService';
import { DoctorSpecialty, Specialist, SpokenLanguage } from '../shared/types';

interface DoctorDirectoryProps {
  t: any;
  selectedSpecialist: Specialist | null;
  onSpecialistSelect: (specialist: Specialist) => void;
  /** The primary action for the chosen doctor — booking on the directory, a call on results. */
  renderAction: (specialist: Specialist) => React.ReactNode;
  /** Pre-filter to the AI's recommendation when opened from a symptom check. */
  initialSpecialty?: DoctorSpecialty;
  onBack?: () => void;
  heading?: string;
}

const LANGUAGES: SpokenLanguage[] = ['tet', 'pt', 'id', 'en'];
const SPECIALTIES: DoctorSpecialty[] = ['Pediatrician', 'General Practitioner'];

const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all border
   ${active
     ? 'bg-blue-600 border-blue-600 text-white shadow-md'
     : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'}`;

/**
 * The real doctor directory, filtered server-side by specialty and spoken language.
 * Replaces the old MOCK_SPECIALISTS array and its English substring availability filter —
 * "available today" is now derived from actual working hours and actual bookings.
 */
const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  t,
  selectedSpecialist,
  onSpecialistSelect,
  renderAction,
  initialSpecialty,
  onBack,
  heading,
}) => {
  const [doctors, setDoctors] = useState<Specialist[]>([]);
  const [specialty, setSpecialty] = useState<DoctorSpecialty | 'all'>(initialSpecialty ?? 'all');
  const [language, setLanguage] = useState<SpokenLanguage | 'all'>('all');
  const [todayOnly, setTodayOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDoctors(await fetchDoctors({
        specialty: specialty === 'all' ? undefined : specialty,
        language: language === 'all' ? undefined : language,
      }));
    } catch {
      setError(t.results.loadingDoctorsFailed);
    } finally {
      setLoading(false);
    }
  }, [specialty, language, t.results.loadingDoctorsFailed]);

  useEffect(() => { load(); }, [load]);

  // Availability is a computed flag on each row, so this last filter stays client-side.
  const visible = todayOnly ? doctors.filter(d => d.availableToday) : doctors;

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          onClick={onBack}
          className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
        >
          {t.input.back}
        </button>
      )}

      {heading && (
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          {heading}
        </h3>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
          <Filter className="w-3.5 h-3.5" />
          {t.results.filterLabel}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSpecialty('all')} className={chip(specialty === 'all')}>
            {t.results.filterAll}
          </button>
          {SPECIALTIES.map(s => (
            <button key={s} onClick={() => setSpecialty(s)} className={chip(specialty === s)}>
              {t.specialistNames[s] || s}
            </button>
          ))}
          <button onClick={() => setTodayOnly(!todayOnly)} className={chip(todayOnly)}>
            {t.results.filterToday}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest self-center mr-1">
            {t.results.filterLanguage}
          </span>
          <button onClick={() => setLanguage('all')} className={chip(language === 'all')}>
            {t.results.filterAll}
          </button>
          {LANGUAGES.map(l => (
            <button key={l} onClick={() => setLanguage(l)} className={chip(language === l)}>
              {t.spokenLanguages?.[l] ?? l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      ) : visible.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {visible.map(specialist => (
            <SpecialistCard
              key={specialist.id}
              specialist={specialist}
              selected={selectedSpecialist?.id === specialist.id}
              t={t}
              onSelect={() => onSpecialistSelect(specialist)}
              action={renderAction(specialist)}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl text-center border border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserSearch className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t.results.noSpecialist}</p>
          <button
            onClick={() => { setSpecialty('all'); setLanguage('all'); setTodayOnly(false); }}
            className="mt-3 text-xs font-bold text-blue-600 hover:underline"
          >
            {t.results.filterAll}
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorDirectory;
