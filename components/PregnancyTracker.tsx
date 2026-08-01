import React from 'react';
import { Baby, Calendar, CheckCircle2, Circle, Heart, Lightbulb, ArrowLeft } from 'lucide-react';
import { FamilyProfile, Language } from '../types';
import { gestationalWeek, dueDate, trimesterOf } from '../services/profileService';

interface PregnancyTrackerProps {
  profile: FamilyProfile;
  language: Language;
  t: any;
  onBack: () => void;
  onEditProfile: () => void;
}

// WHO 2016 ANC model: 8 contacts at these gestational weeks
const ANC_CONTACT_WEEKS = [12, 20, 26, 30, 34, 36, 38, 40];

const LOCALES: Record<Language, string> = { en: 'en-US', tet: 'pt-PT', id: 'id-ID' };

const PregnancyTracker: React.FC<PregnancyTrackerProps> = ({ profile, language, t, onBack, onEditProfile }) => {
  const tt = t.tracker;
  const { mother } = profile;

  if (!mother.pregnant || !mother.lmp) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Baby className="w-8 h-8 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{tt.notPregnant}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{tt.notPregnantDesc}</p>
        <button
          onClick={onEditProfile}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
        >
          {tt.updateProfile}
        </button>
      </div>
    );
  }

  const week = Math.min(gestationalWeek(mother.lmp), 42);
  const trimester = trimesterOf(week);
  const due = dueDate(mother.lmp);
  const daysToGo = Math.max(0, Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const isOverdue = Date.now() > due.getTime();
  const progress = Math.min(100, Math.round((week / 40) * 100));
  const nextContactWeek = ANC_CONTACT_WEEKS.find(w => w >= week);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
        <ArrowLeft className="w-4 h-4" /> {t.about.back}
      </button>

      {/* Hero: current week */}
      <section className="bg-gradient-to-br from-pink-500 to-rose-600 dark:from-pink-700 dark:to-rose-800 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <Heart className="absolute -top-6 -right-6 w-40 h-40 opacity-10" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-white/15 border-4 border-white/30 flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-5xl font-black leading-none">{week}</span>
            <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">{tt.week} {tt.of40}</span>
          </div>
          <div className="flex-1 text-center sm:text-left space-y-3">
            <h1 className="text-3xl font-black">{tt.title}</h1>
            <p className="text-white/80 font-bold uppercase tracking-widest text-xs">
              {tt.trimesterNames[trimester - 1]}
            </p>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-1 text-sm">
              <span className="flex items-center gap-2 font-bold">
                <Calendar className="w-4 h-4" />
                {tt.dueDate}: {due.toLocaleDateString(LOCALES[language], { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              {!isOverdue && (
                <span className="bg-white/15 px-3 py-1 rounded-full font-black text-xs uppercase tracking-widest">
                  {daysToGo} {tt.daysToGo}
                </span>
              )}
            </div>
            {isOverdue && (
              <p className="text-sm font-bold bg-white/15 rounded-xl px-4 py-2 inline-block">{tt.overdueNote}</p>
            )}
          </div>
        </div>
      </section>

      {/* Tips for this trimester */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
          <Lightbulb className="w-5 h-5 text-amber-500" /> {tt.tipsTitle}
        </h3>
        <ul className="space-y-3">
          {tt.tips[trimester - 1].map((tip: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0" />
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ANC schedule */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{tt.ancTitle}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{tt.ancSubtitle}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ANC_CONTACT_WEEKS.map((w, i) => {
            const done = week > w;
            const isNext = w === nextContactWeek;
            return (
              <div
                key={w}
                className={`p-4 rounded-2xl border text-center transition-all
                  ${isNext
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : done
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
              >
                <div className="flex justify-center mb-2">
                  {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 opacity-40" />}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-70">{tt.contact} {i + 1}</div>
                <div className="font-black">{tt.weekLabel} {w}</div>
                <div className="text-[9px] font-black uppercase tracking-widest mt-1">
                  {isNext ? tt.next : done ? tt.done : tt.upcoming}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PregnancyTracker;
