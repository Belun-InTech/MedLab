import React, { useState } from 'react';
import { AnalysisResult, Condition, DoctorSpecialty, Specialist } from '../shared/types';
import {
  Info,
  ChevronDown,
  ChevronUp,
  Pill,
  CheckCircle2,
  Stethoscope,
  ShieldAlert,
  Check,
  CalendarPlus,
  MapPin,
  PhoneCall
} from 'lucide-react';
import DoctorDirectory from './DoctorDirectory';
import DoctorUpsell from './DoctorUpsell';

interface ResultsDisplayProps {
  result: AnalysisResult;
  t: any;
  /** Doctor access is the premium feature — this decides list vs offer. */
  subscribed: boolean;
  selectedSpecialist: Specialist | null;
  onSpecialistSelect: (specialist: Specialist) => void;
  onTalkToDoctor: (specialist: Specialist | null) => void;
  onBookAppointment: (specialist: Specialist) => void;
  /** The free emergency route: the nearest hospital or clinic. */
  onFindFacilities: () => void;
  onSubscribe: () => void;
}

/**
 * The AI returns one of exactly two canonical English specialty names (normalised in
 * server/src/routes/consultations.ts), so matching a recommendation to real doctors is a
 * plain equality rather than the substring guessing this screen used to do.
 */
const asSpecialty = (recommended: string): DoctorSpecialty =>
  recommended === 'Pediatrician' ? 'Pediatrician' : 'General Practitioner';

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  t,
  subscribed,
  selectedSpecialist,
  onSpecialistSelect,
  onTalkToDoctor,
  onBookAppointment,
  onFindFacilities,
  onSubscribe
}) => {
  if (!result) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {result.emergencyAlert && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-4">
           <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-full h-fit w-fit flex-shrink-0">
             <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
           </div>
           <div>
             <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">{t.results.emergencyTitle}</h3>
             <p className="text-red-700 dark:text-red-400 leading-relaxed font-medium">
               {result.emergencyMessage || t.results.emergencyDefault}
             </p>
             {/* The nearest facility is the free action, and for a danger sign it is also
                 the right one — so it is the primary CTA for both tiers. Premium adds the
                 doctor on top of it rather than replacing it. */}
             <div className="mt-4 flex flex-wrap gap-2">
               <button
                 onClick={onFindFacilities}
                 className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2"
               >
                 <MapPin className="w-4 h-4" />
                 {t.results.emergencyFindFacility}
               </button>

               {subscribed && (
                 <button
                   onClick={() => onTalkToDoctor(selectedSpecialist)}
                   className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 font-bold rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                 >
                   <PhoneCall className="w-4 h-4" />
                   {t.results.seekEmergency}
                 </button>
               )}
             </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {t.results.conditionsTitle}
        </h3>

        {result.possibleConditions?.map((condition, idx) => (
          <ConditionCard key={idx} condition={condition} index={idx} t={t} />
        ))}
      </div>

      {result.generalAdvice && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-emerald-900 dark:text-white mb-4 flex items-center gap-2">
             <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
             {t.results.recommendedAction}
          </h3>
          <ul className="space-y-3">
            {result.generalAdvice.map((advice, i) => (
              <li key={i} className="flex items-start gap-3 text-emerald-800 dark:text-emerald-400">
                 <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                 <span className="leading-relaxed">{advice}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {t.results.selectSpecialist}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              {t.specialistNames[result.recommendedSpecialist] || result.recommendedSpecialist || "General"}
            </span>
          </h3>
          {subscribed && selectedSpecialist && (
            <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{selectedSpecialist.name} {t.results.specialistChosen}</span>
            </div>
          )}
        </div>

        {/* Doctor access is what Premium buys, so an unsubscribed parent gets the offer
            here rather than the directory. Emergencies do NOT reveal it — the emergency
            route for both tiers is the facility finder in the banner above. */}
        {!subscribed ? (
          <DoctorUpsell
            specialty={asSpecialty(result.recommendedSpecialist)}
            t={t}
            onSubscribe={onSubscribe}
          />
        ) : (
        <DoctorDirectory
          t={t}
          selectedSpecialist={selectedSpecialist}
          onSpecialistSelect={onSpecialistSelect}
          initialSpecialty={asSpecialty(result.recommendedSpecialist)}
          renderAction={(specialist) => (
            <>
              <button
                onClick={() => onBookAppointment(specialist)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-[0.95] border border-blue-500"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                {t.booking.bookAppointment}
              </button>
              <button
                onClick={() => onTalkToDoctor(specialist)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                {t.results.talkToDoctor}
              </button>
            </>
          )}
        />
        )}
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex gap-3">
         <Info className="w-5 h-5 text-slate-400 flex-shrink-0" />
         <p>{result.disclaimer || t.results.disclaimer}</p>
      </div>
    </div>
  );
};

const ConditionCard: React.FC<{ condition: Condition; index: number; t: any }> = ({ condition, index, t }) => {
  const [expanded, setExpanded] = useState(index === 0);

  const probabilityColor = {
    'High': 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
    'Moderate': 'text-orange-600 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800',
    'Low': 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
  }[condition.probability] || 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900';

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border transition-all duration-300 ${expanded ? 'ring-2 ring-blue-500/10 dark:ring-blue-400/10 border-blue-200 dark:border-blue-800' : 'border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'}`}>
      <div
        className="p-5 cursor-pointer flex items-start justify-between gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
           <div className="flex flex-wrap items-center gap-3 mb-2">
             <h4 className="text-xl font-bold text-slate-800 dark:text-white">{condition.name}</h4>
             {condition.probability && (
               <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${probabilityColor}`}>
                 {condition.probability}
               </span>
             )}
           </div>
           <p className={`text-slate-600 dark:text-slate-400 ${expanded ? '' : 'line-clamp-2'}`}>{condition.description}</p>
        </div>
        <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mt-1">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-700 animate-slide-down">
          <div className="mt-4 space-y-4">
             <div>
                <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t.results.whyThis}</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{condition.reasoning}</p>
             </div>

             <div>
               <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                 <Pill className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                 {t.results.medications}
               </h5>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {condition.suggestedMedications?.map((med, i) => (
                   <div key={i} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-3">
                     <div className="flex justify-between items-start mb-1">
                       <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{med.name}</span>
                       <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                         {med.type === 'Over-the-counter' ? 'OTC' : med.type === 'Prescription' ? 'Rx' : 'Home'}
                       </span>
                     </div>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{med.description}</p>
                     {med.dosage && (
                       <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-auto">{t.results.dosage} {med.dosage}</p>
                     )}
                   </div>
                 ))}
               </div>
             </div>

             <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
               <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1 block">{t.results.nextStep}</span>
               <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">{condition.recommendedAction}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
