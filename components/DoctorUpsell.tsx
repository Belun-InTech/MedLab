import React, { useEffect, useState } from 'react';
import { Crown, Languages, Lock, Stethoscope } from 'lucide-react';
import { fetchDoctors } from '../services/doctorService';
import { DoctorSpecialty, SpokenLanguage } from '../shared/types';

interface DoctorUpsellProps {
  /** The AI's recommendation, so the teaser counts the doctors that actually match. */
  specialty: DoctorSpecialty;
  t: any;
  onSubscribe: () => void;
}

/**
 * What an unsubscribed parent sees where the doctor directory would be.
 *
 * It deliberately renders a COUNT and nothing identifying — no names, photos, facilities,
 * phone numbers or ratings. Those are the thing the subscription buys, so putting them on
 * screen behind a blur would only mean shipping them in the page source anyway.
 */
const DoctorUpsell: React.FC<DoctorUpsellProps> = ({ specialty, t, onSubscribe }) => {
  const tp = t.paywall;
  const [count, setCount] = useState<number | null>(null);
  const [languages, setLanguages] = useState<SpokenLanguage[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const doctors = await fetchDoctors({ specialty });
        if (cancelled) return;
        setCount(doctors.length);
        setLanguages([...new Set(doctors.flatMap(d => d.languages))]);
      } catch {
        // The offer stands on its own; a failed count just drops that one line.
        if (!cancelled) setCount(null);
      }
    })();
    return () => { cancelled = true; };
  }, [specialty]);

  const specialtyLabel = t.specialistNames?.[specialty] ?? specialty;

  return (
    <div className="rounded-3xl border-2 border-amber-400/40 bg-slate-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-56 h-56 bg-amber-400/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30">
            <Lock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Crown className="w-3 h-3" /> {tp.premiumName}
            </p>
            <h3 className="text-xl font-black text-white tracking-tight">{tp.lockedTitle}</h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">{tp.lockedBody}</p>

        {/* Count only — enough to show real doctors are waiting, nothing identifying. */}
        {count !== null && count > 0 && (
          <div className="space-y-2 rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-amber-400 flex-shrink-0" />
              {tp.lockedCount.replace('{count}', String(count)).replace('{specialty}', specialtyLabel)}
            </p>
            {languages.length > 0 && (
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Languages className="w-3.5 h-3.5 flex-shrink-0" />
                {tp.lockedLanguages}{' '}
                {languages.map(l => t.spokenLanguages?.[l] ?? l).join(' · ')}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-3xl font-black text-white">{tp.price}</span>
          <span className="text-sm text-slate-400 font-bold pb-1">{tp.perMonth}</span>
        </div>

        <button
          onClick={onSubscribe}
          className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98]"
        >
          {tp.lockedCta}
        </button>
      </div>
    </div>
  );
};

export default DoctorUpsell;
