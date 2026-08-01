import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, Baby, Check, CheckCircle2, ClipboardList, Loader2, ShieldOff, Syringe,
} from 'lucide-react';
import { completeAppointment, fetchChildRecord, saveClinicalNote } from '../services/appointmentService';
import { ageInMonths } from '../services/profileService';
import { EPI_SCHEDULE } from '../constants/vaccineSchedule';
import { Appointment, ChildRecord } from '../shared/types';

interface DoctorAppointmentDetailProps {
  appointment: Appointment;
  t: any;
  onBack: () => void;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

const dateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * The consult screen: the child's AI history on the left of the doctor's own verdict.
 * This is the whole point of putting a human in the loop — the note written here lands on
 * the same timeline the AI's guess is on.
 */
const DoctorAppointmentDetail: React.FC<DoctorAppointmentDetailProps> = ({ appointment, t, onBack }) => {
  const td = t.doctorPortal;
  const [record, setRecord] = useState<ChildRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState<'history_not_shared' | 'error' | null>(null);

  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [followUpDays, setFollowUpDays] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(appointment.status === 'completed');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const result = await fetchChildRecord(appointment.id);
      if (result.status === 'ok') {
        setRecord(result.record);
        // An existing note for THIS appointment pre-fills the form, so saving twice edits
        // rather than duplicates (the endpoint is an upsert).
        const existing = result.record.notes.find(n => n.appointmentId === appointment.id);
        if (existing) {
          setAssessment(existing.assessment);
          setPlan(existing.plan);
          setFollowUpDays(existing.followUpDays === null ? '' : String(existing.followUpDays));
        }
      } else {
        setBlocked(result.reason === 'history_not_shared' ? 'history_not_shared' : 'error');
      }
      setLoading(false);
    })();
  }, [appointment.id]);

  const handleSaveNote = async () => {
    setError('');
    if (!assessment.trim() || !plan.trim()) {
      setError(td.noteFieldsRequired);
      return;
    }
    setSaving(true);
    const result = await saveClinicalNote(appointment.id, {
      assessment: assessment.trim(),
      plan: plan.trim(),
      followUpDays: followUpDays ? Number(followUpDays) : undefined,
    });
    setSaving(false);
    if (result.status === 'ok') setSaved(true);
    else setError(td.noteFailed);
  };

  const handleComplete = async () => {
    try {
      await completeAppointment(appointment.id);
      setCompleted(true);
    } catch {
      setError(td.noteFailed);
    }
  };

  // The same gap logic VaccinationSchedule.tsx runs for the parent — one implementation.
  const missedDoses = record
    ? EPI_SCHEDULE.filter(dose => {
        const given = record.vaccinations.some(v => v.doseId === dose.id);
        return !given && ageInMonths(record.child.dob) >= dose.ageMonths;
      })
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
      >
        {t.input.back}
      </button>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{when(appointment.startsAt)}</p>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{appointment.childName}</h1>
        {appointment.reason && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{appointment.reason}</p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : blocked ? (
        <div className="rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 flex gap-4">
          <ShieldOff className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-black text-slate-900 dark:text-white">{td.noHistoryShared}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {blocked === 'history_not_shared' ? td.noHistorySharedBody : td.recordFailed}
            </p>
          </div>
        </div>
      ) : record && (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30"><Baby className="w-5 h-5 text-blue-600" /></div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">{record.child.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {record.child.sex} · {dateOnly(record.child.dob)} · {ageInMonths(record.child.dob)} {td.monthsOld}
                </p>
              </div>
            </div>
          </div>

          {/* AI history */}
          <section className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> {td.aiHistory}
            </h3>
            {record.consultations.length === 0 ? (
              <p className="text-sm text-slate-400">{td.noAiHistory}</p>
            ) : (
              record.consultations.map(c => (
                <div key={c.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{dateOnly(c.createdAt)}</p>
                    {c.emergencyAlert && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg">
                        <AlertTriangle className="w-3 h-3" /> {td.emergencyFlagged}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed">{c.symptoms}</p>
                  <p className="text-xs text-slate-400 mt-1">{c.symptomOnset}</p>
                  {c.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {c.conditions.map(cond => (
                        <span key={cond.name} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {cond.name} · {cond.probability}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>

          {/* Vaccination gaps */}
          <section className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Syringe className="w-4 h-4" /> {td.vaccinationGaps}
            </h3>
            {missedDoses.length === 0 ? (
              <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {td.vaccinationsUpToDate}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missedDoses.map(dose => (
                  <span key={dose.id} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    {dose.vaccine} · {dose.doseLabel}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* The doctor's verdict */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{td.noteTitle}</h3>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{td.assessment}</label>
              <textarea
                value={assessment}
                onChange={e => { setAssessment(e.target.value); setSaved(false); }}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{td.plan}</label>
              <textarea
                value={plan}
                onChange={e => { setPlan(e.target.value); setSaved(false); }}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{td.followUpDays}</label>
              <input
                type="number"
                min={0}
                max={255}
                value={followUpDays}
                onChange={e => { setFollowUpDays(e.target.value); setSaved(false); }}
                className="w-32 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center animate-shake">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSaveNote}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
                {saved ? td.noteSaved : td.saveNote}
              </button>

              {!completed && (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {td.markComplete}
                </button>
              )}
              {completed && (
                <span className="flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest text-emerald-600">
                  <Check className="w-4 h-4" /> {t.booking.completed}
                </span>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default DoctorAppointmentDetail;
