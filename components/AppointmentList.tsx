import React, { useCallback, useEffect, useState } from 'react';
import { CalendarClock, CalendarX, Check, ChevronRight, Loader2, Stethoscope, Trash2 } from 'lucide-react';
import DoctorAvatar from './DoctorAvatar';
import { cancelAppointment, fetchAppointments } from '../services/appointmentService';
import { Appointment } from '../shared/types';

interface AppointmentListProps {
  t: any;
  /** 'doctor' shows the child's name as the headline; 'parent' shows the doctor's. */
  viewer: 'parent' | 'doctor';
  onBack?: () => void;
  onOpen?: (appointment: Appointment) => void;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

/** Both sides' appointment list. The server decides whose rows these are, from the role. */
const AppointmentList: React.FC<AppointmentListProps> = ({ t, viewer, onBack, onOpen }) => {
  const tb = t.booking;
  const [scope, setScope] = useState<'upcoming' | 'past'>('upcoming');
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async (next: 'upcoming' | 'past') => {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchAppointments(next));
    } catch {
      setError(tb.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [tb.loadFailed]);

  useEffect(() => { load(scope); }, [scope, load]);

  const handleCancel = async (id: string) => {
    if (!window.confirm(tb.cancelConfirm)) return;
    setBusyId(id);
    try {
      await cancelAppointment(id);
      await load(scope);
    } catch {
      setError(tb.cancelFailed);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {onBack && (
        <button
          onClick={onBack}
          className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
        >
          {t.input.back}
        </button>
      )}

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{tb.title}</p>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
          {viewer === 'doctor' ? t.doctorPortal.scheduleTitle : tb.upcomingTitle}
        </h1>
      </div>

      <div className="flex gap-1.5">
        {(['upcoming', 'past'] as const).map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
              ${scope === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600'}`}
          >
            {s === 'upcoming' ? tb.upcoming : tb.past}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
          <CalendarX className="w-10 h-10" />
          <p className="text-sm font-bold">{tb.noAppointments}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                {viewer === 'parent'
                  ? <DoctorAvatar name={row.doctorName} photoUrl={row.doctorPhotoUrl} />
                  : <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center font-black text-emerald-600 flex-shrink-0">
                      {row.childName.slice(0, 2).toUpperCase()}
                    </div>}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-900 dark:text-white">
                      {viewer === 'parent' ? row.doctorName : row.childName}
                    </h3>
                    {row.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                        <Check className="w-3 h-3" /> {tb.completed}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase">
                    {viewer === 'parent'
                      ? (t.specialistNames[row.doctorSpecialty] || row.doctorSpecialty)
                      : `${tb.withDoctor} ${row.doctorName}`}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-slate-400" />
                    {when(row.startsAt)} · {row.durationMinutes} min
                  </p>

                  {viewer === 'parent' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {tb.forChild} {row.childName} · {row.doctorFacility}
                    </p>
                  )}

                  {row.reason && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{row.reason}</p>
                  )}
                  {!row.sharesHistory && viewer === 'doctor' && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mt-2">
                      {t.doctorPortal.noHistoryShared}
                    </p>
                  )}

                  {/* The human verdict, sitting on the same timeline as the AI's guess. */}
                  {row.noteAssessment && (
                    <div className="mt-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 p-3 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Stethoscope className="w-3 h-3" /> {t.doctorPortal.noteTitle}
                      </p>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.doctorPortal.assessment}</p>
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{row.noteAssessment}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.doctorPortal.plan}</p>
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{row.notePlan}</p>
                      </div>
                      {row.noteFollowUpDays !== null && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                          {t.doctorPortal.followUpDays}: {row.noteFollowUpDays}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {onOpen && (
                  <button
                    onClick={() => onOpen(row)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
                  >
                    {t.doctorPortal.openConsult}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {scope === 'upcoming' && (
                  <button
                    onClick={() => handleCancel(row.id)}
                    disabled={busyId === row.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                  >
                    {busyId === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    {tb.cancel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
