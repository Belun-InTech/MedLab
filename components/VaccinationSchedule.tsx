import React, { useState, useEffect } from 'react';
import { Syringe, ArrowLeft, CheckCircle2, AlertTriangle, Clock, Baby } from 'lucide-react';
import { FamilyProfile, VaccineDose } from '../shared/types';
import { EPI_SCHEDULE } from '../constants/vaccineSchedule';
import { ageInMonths, formatChildAge, fetchGivenVaccines, toggleVaccineGiven } from '../services/profileService';

interface VaccinationScheduleProps {
  profile: FamilyProfile;
  t: any;
  onBack: () => void;
  onEditProfile: () => void;
}

type DoseStatus = 'given' | 'overdue' | 'due' | 'upcoming';

// a dose counts as "due now" from its scheduled age until one month after; later than that is overdue
const doseStatus = (dose: VaccineDose, childAgeMonths: number, given: string[]): DoseStatus => {
  if (given.includes(dose.id)) return 'given';
  if (childAgeMonths >= dose.ageMonths + 1) return 'overdue';
  if (childAgeMonths >= dose.ageMonths) return 'due';
  return 'upcoming';
};

const formatDoseAge = (ageMonths: number, tv: any): string => {
  if (ageMonths === 0) return tv.atBirth;
  if (ageMonths < 4) return `${Math.round(ageMonths * 4.345)} ${tv.weeks}`;
  return `${ageMonths} ${tv.months}`;
};

const VaccinationSchedule: React.FC<VaccinationScheduleProps> = ({ profile, t, onBack, onEditProfile }) => {
  const tv = t.vaccines;
  const [selectedChildId, setSelectedChildId] = useState<string | null>(profile.children[0]?.id || null);
  const [given, setGiven] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedChildId) return;
    let cancelled = false;
    fetchGivenVaccines(selectedChildId)
      .then(doses => { if (!cancelled) setGiven(doses); })
      .catch(e => console.error('Failed to load vaccine record', e));
    return () => { cancelled = true; };
  }, [selectedChildId]);

  const child = profile.children.find(c => c.id === selectedChildId);

  if (profile.children.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Baby className="w-8 h-8 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{tv.noChildren}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{tv.addChildHint}</p>
        <button
          onClick={onEditProfile}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
        >
          {tv.goToProfile}
        </button>
      </div>
    );
  }

  const statusStyles: Record<DoseStatus, { badge: string; label: string; icon: React.ReactNode }> = {
    given: {
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      label: tv.statusGiven,
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    },
    overdue: {
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
      label: tv.statusOverdue,
      icon: <AlertTriangle className="w-3.5 h-3.5" />
    },
    due: {
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      label: tv.statusDue,
      icon: <Syringe className="w-3.5 h-3.5" />
    },
    upcoming: {
      badge: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      label: tv.statusUpcoming,
      icon: <Clock className="w-3.5 h-3.5" />
    },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
        <ArrowLeft className="w-4 h-4" /> {t.about.back}
      </button>

      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
          <Syringe className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{tv.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{tv.subtitle}</p>
      </div>

      {/* Child selector */}
      <div className="space-y-3">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{tv.selectChild}</span>
        <div className="flex flex-wrap gap-3">
          {profile.children.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedChildId(c.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all
                ${selectedChildId === c.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'}`}
            >
              <Baby className="w-5 h-5" />
              <div className="text-left">
                <div className="font-bold text-sm leading-tight">{c.name}</div>
                <div className={`text-[10px] font-black uppercase tracking-widest ${selectedChildId === c.id ? 'text-white/70' : 'text-slate-400'}`}>
                  {formatChildAge(c.dob, t.selector.months, t.selector.years)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dose list */}
      {child && (
        <div className="space-y-3">
          {EPI_SCHEDULE.map(dose => {
            const status = doseStatus(dose, ageInMonths(child.dob), given);
            const style = statusStyles[status];
            return (
              <div
                key={dose.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">{dose.vaccine}</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">
                      {dose.doseLabel}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${style.badge}`}>
                      {style.icon} {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tv.dueAt}: <span className="font-bold">{formatDoseAge(dose.ageMonths, tv)}</span>
                  </p>
                </div>
                <button
                  onClick={() => { toggleVaccineGiven(child.id, dose.id).then(() => fetchGivenVaccines(child.id)).then(setGiven).catch(e => console.error('Failed to toggle vaccine', e)); }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95
                    ${status === 'given'
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                      : 'bg-emerald-600 border-emerald-600 text-white shadow-md hover:bg-emerald-700'}`}
                >
                  {status === 'given' ? tv.unmark : tv.markGiven}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VaccinationSchedule;
