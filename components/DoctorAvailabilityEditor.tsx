import React, { useEffect, useState } from 'react';
import { CalendarClock, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import { fetchAvailability, saveAvailability } from '../services/doctorService';
import { AvailabilityRule } from '../shared/types';

interface DoctorAvailabilityEditorProps {
  t: any;
  onBack: () => void;
  onSaved: (slotMinutes: number) => void;
}

const SLOT_OPTIONS = [15, 20, 30, 45, 60];

/** "09:00" ⇄ minutes from midnight. The wire format is minutes; the input is a time field. */
const toTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const selectClass = "px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm transition-all";

/**
 * Weekly working hours. The doctor describes a repeating week; the server expands that
 * into concrete bookable slots for the next fortnight (see server/src/lib/schedule.ts).
 * Times here are Asia/Dili wall-clock, which is what a doctor actually thinks in.
 */
const DoctorAvailabilityEditor: React.FC<DoctorAvailabilityEditorProps> = ({ t, onBack, onSaved }) => {
  const td = t.doctorPortal;
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const availability = await fetchAvailability();
        setRules(availability.rules);
        setSlotMinutes(availability.slotMinutes);
      } catch {
        setError(td.availabilityLoadFailed);
      } finally {
        setLoading(false);
      }
    })();
  }, [td.availabilityLoadFailed]);

  const addRule = (weekday: number) => {
    setSaved(false);
    setRules(prev => [...prev, { weekday, startMinute: 9 * 60, endMinute: 12 * 60 }]);
  };

  const updateRule = (index: number, field: keyof AvailabilityRule, value: number) => {
    setSaved(false);
    setRules(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const removeRule = (index: number) => {
    setSaved(false);
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError('');
    setSaved(false);

    if (rules.some(r => r.endMinute - r.startMinute < slotMinutes)) {
      setError(td.blockTooShort);
      return;
    }

    setBusy(true);
    const result = await saveAvailability({ rules, slotMinutes });
    setBusy(false);

    if (result.status === 'ok') {
      setSaved(true);
      onSaved(slotMinutes);
    } else {
      setError(
        result.reason === 'overlapping_rules' ? td.overlapError
          : result.reason === 'network' ? t.auth.networkError
          : td.availabilityInvalid,
      );
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
      >
        {t.input.back}
      </button>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{td.portalTitle}</p>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{td.availabilityTitle}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{td.availabilitySubtitle}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{td.slotLength}</label>
        <select
          value={slotMinutes}
          onChange={e => { setSlotMinutes(Number(e.target.value)); setSaved(false); }}
          className={selectClass}
        >
          {SLOT_OPTIONS.map(m => <option key={m} value={m}>{m} min</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {(td.weekdays as string[]).map((label, weekday) => {
          const dayRules = rules
            .map((rule, index) => ({ rule, index }))
            .filter(({ rule }) => rule.weekday === weekday);

          return (
            <div key={weekday} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{label}</h3>
                <button
                  onClick={() => addRule(weekday)}
                  className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {td.addBlock}
                </button>
              </div>

              {dayRules.length === 0 ? (
                <p className="text-xs text-slate-400">{td.dayOff}</p>
              ) : (
                <div className="space-y-2">
                  {dayRules.map(({ rule, index }) => (
                    <div key={index} className="flex items-center gap-2 flex-wrap">
                      <input
                        type="time"
                        value={toTime(rule.startMinute)}
                        onChange={e => updateRule(index, 'startMinute', toMinutes(e.target.value))}
                        className={selectClass}
                      />
                      <span className="text-xs font-black text-slate-400 uppercase">{td.to}</span>
                      <input
                        type="time"
                        value={toTime(rule.endMinute)}
                        onChange={e => updateRule(index, 'endMinute', toMinutes(e.target.value))}
                        className={selectClass}
                      />
                      <button
                        onClick={() => removeRule(index)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 transition-colors"
                        aria-label={td.removeBlock}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center animate-shake font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
      >
        {busy ? <Loader2 className="w-5 h-5 animate-spin" />
          : saved ? <><Check className="w-5 h-5" /> {td.availabilitySaved}</>
          : <><CalendarClock className="w-5 h-5" /> {td.saveAvailability}</>}
      </button>
    </div>
  );
};

export default DoctorAvailabilityEditor;
