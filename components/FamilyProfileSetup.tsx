import React, { useState } from 'react';
import { Baby, Heart, Plus, Trash2, ArrowRight, ArrowLeft, User as UserIcon } from 'lucide-react';
import { FamilyProfile, Child } from '../types';
import { newChildId } from '../services/profileService';

interface FamilyProfileSetupProps {
  existingProfile: FamilyProfile | null;
  onSave: (profile: FamilyProfile) => void;
  onCancel?: () => void; // only offered when editing an existing profile
  t: any;
}

const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all shadow-sm";
const labelClass = "block text-xs font-black text-slate-400 uppercase tracking-widest mb-2";

const FamilyProfileSetup: React.FC<FamilyProfileSetupProps> = ({ existingProfile, onSave, onCancel, t }) => {
  const [momName, setMomName] = useState(existingProfile?.mother.name || '');
  const [momDob, setMomDob] = useState(existingProfile?.mother.dob || '');
  const [pregnant, setPregnant] = useState(existingProfile?.mother.pregnant ?? false);
  const [lmp, setLmp] = useState(existingProfile?.mother.lmp || '');
  const [children, setChildren] = useState<Child[]>(existingProfile?.children || []);
  const [error, setError] = useState('');

  const to = t.onboarding;

  const addChild = () => {
    setChildren(prev => [...prev, { id: newChildId(), name: '', dob: '', sex: 'Male' }]);
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    setChildren(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeChild = (id: string) => {
    setChildren(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momName.trim()) {
      setError(to.nameRequired);
      return;
    }
    const profile: FamilyProfile = {
      mother: {
        name: momName.trim(),
        dob: momDob || undefined,
        pregnant,
        lmp: pregnant ? (lmp || undefined) : undefined,
      },
      // drop half-filled child rows silently
      children: children.filter(c => c.name.trim() && c.dob),
    };
    onSave(profile);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6">
          <Heart className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          {existingProfile ? to.editTitle : to.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">{to.subtitle}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Mother section */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
            <UserIcon className="w-4 h-4" /> {to.momSection}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{to.momName}</label>
              <input type="text" value={momName} onChange={e => setMomName(e.target.value)} className={inputClass} placeholder={to.momName} />
            </div>
            <div>
              <label className={labelClass}>{to.momDob}</label>
              <input type="date" value={momDob} onChange={e => setMomDob(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{to.pregnantQ}</label>
            <div className="flex gap-3">
              {[{ v: true, l: to.yes }, { v: false, l: to.no }].map(opt => (
                <button
                  key={String(opt.v)}
                  type="button"
                  onClick={() => setPregnant(opt.v)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all
                    ${pregnant === opt.v
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {pregnant && (
            <div className="animate-fade-in">
              <label className={labelClass}>{to.lmp}</label>
              <input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className={inputClass} />
              <p className="text-xs text-slate-400 mt-2">{to.lmpHelp}</p>
            </div>
          )}
        </section>

        {/* Children section */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <Baby className="w-4 h-4" /> {to.childrenSection}
            </h3>
            <button
              type="button"
              onClick={addChild}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> {to.addChild}
            </button>
          </div>

          {children.length === 0 && (
            <p className="text-sm text-slate-400 italic">{to.noChildrenHint}</p>
          )}

          {children.map((child) => (
            <div key={child.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
              <div>
                <label className={labelClass}>{to.childName}</label>
                <input type="text" value={child.name} onChange={e => updateChild(child.id, 'name', e.target.value)} className={inputClass} placeholder={to.childName} />
              </div>
              <div>
                <label className={labelClass}>{to.childDob}</label>
                <input type="date" value={child.dob} onChange={e => updateChild(child.id, 'dob', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{to.childSex}</label>
                <select value={child.sex} onChange={e => updateChild(child.id, 'sex', e.target.value)} className={inputClass}>
                  <option value="Male">{to.boy}</option>
                  <option value="Female">{to.girl}</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeChild(child.id)}
                className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                aria-label={to.remove}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </section>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center animate-shake font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            {to.save} <ArrowRight className="w-5 h-5" />
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {t.about.back}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FamilyProfileSetup;
