import React, { useState, useRef } from 'react';
import { Send, X, Image as ImageIcon, AlertCircle, Clock, Baby, Heart, Scale } from 'lucide-react';
import { PatientData, FamilyProfile } from '../types';
import { ageInMonths, ageInYears, formatChildAge, gestationalWeek } from '../services/profileService';

interface SymptomInputProps {
  profile: FamilyProfile;
  onAnalyze: (data: PatientData) => void;
  isLoading: boolean;
  t: any;
}

type Selection = { kind: 'pregnancy' } | { kind: 'child'; childId: string };

const SymptomInput: React.FC<SymptomInputProps> = ({ profile, onAnalyze, isLoading, t }) => {
  const motherAvailable = profile.mother.pregnant && !!profile.mother.lmp;
  const defaultSelection: Selection | null = motherAvailable
    ? { kind: 'pregnancy' }
    : profile.children[0] ? { kind: 'child', childId: profile.children[0].id } : null;

  const [selection, setSelection] = useState<Selection | null>(defaultSelection);
  const [weight, setWeight] = useState('');
  const [symptomOnset, setSymptomOnset] = useState('');
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ts = t.selector;
  const ti = t.input;

  const selectedChild = selection?.kind === 'child'
    ? profile.children.find(c => c.id === selection.childId)
    : undefined;
  const mode = selection?.kind === 'pregnancy' ? 'pregnancy' : 'child';
  const quickTags: string[] = mode === 'pregnancy' ? t.pregnancySymptoms : t.childSymptoms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection || (!text.trim() && !imagePreview)) return;

    let patientData: PatientData;
    if (selection.kind === 'pregnancy') {
      patientData = {
        mode: 'pregnancy',
        name: profile.mother.name,
        ageYears: profile.mother.dob ? ageInYears(profile.mother.dob) : 25,
        ageMonths: profile.mother.dob ? ageInMonths(profile.mother.dob) : 300,
        sex: 'Female',
        gestationalWeek: gestationalWeek(profile.mother.lmp!),
        symptomOnset: symptomOnset.trim() || 'Recently',
        symptoms: text,
        image: imagePreview || undefined,
      };
    } else {
      const child = selectedChild!;
      patientData = {
        mode: 'child',
        name: child.name,
        ageYears: ageInYears(child.dob),
        ageMonths: ageInMonths(child.dob),
        sex: child.sex,
        weightKg: weight ? Number(weight) : undefined,
        symptomOnset: symptomOnset.trim() || 'Recently',
        symptoms: text,
        image: imagePreview || undefined,
      };
    }
    onAnalyze(patientData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(ti.fileError);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSymptomTag = (symptom: string) => {
    setText(prev => {
      const trimmed = prev.trim();
      if (trimmed.length > 0) {
        return trimmed.endsWith(',') ? `${trimmed} ${symptom}` : `${trimmed}, ${symptom}`;
      }
      return symptom;
    });
  };

  const isFormValid = selection !== null && (text.trim().length > 0 || imagePreview !== null);

  return (
    <div className="space-y-6">
      {/* Patient selector */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{ts.title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{ts.subtitle}</p>
        <div className="flex flex-wrap gap-3">
          {motherAvailable && (
            <button
              type="button"
              onClick={() => setSelection({ kind: 'pregnancy' })}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all
                ${selection?.kind === 'pregnancy'
                  ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-500/20'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-pink-300'}`}
            >
              <Heart className="w-5 h-5" />
              <div className="text-left">
                <div className="font-bold text-sm leading-tight">{profile.mother.name}</div>
                <div className={`text-[10px] font-black uppercase tracking-widest ${selection?.kind === 'pregnancy' ? 'text-white/70' : 'text-pink-500'}`}>
                  {ts.pregnantBadge} • {ts.week} {gestationalWeek(profile.mother.lmp!)}
                </div>
              </div>
            </button>
          )}
          {profile.children.map(child => (
            <button
              key={child.id}
              type="button"
              onClick={() => setSelection({ kind: 'child', childId: child.id })}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all
                ${selection?.kind === 'child' && selection.childId === child.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'}`}
            >
              <Baby className="w-5 h-5" />
              <div className="text-left">
                <div className="font-bold text-sm leading-tight">{child.name}</div>
                <div className={`text-[10px] font-black uppercase tracking-widest ${selection?.kind === 'child' && selection.childId === child.id ? 'text-white/70' : 'text-slate-400'}`}>
                  {formatChildAge(child.dob, ts.months, ts.years)}
                </div>
              </div>
            </button>
          ))}
        </div>
        {!motherAvailable && (
          <p className="text-xs text-slate-400 italic mt-4">{ts.notPregnantNote}</p>
        )}
      </div>

      {/* Symptom form */}
      {selection && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className={`p-6 sm:p-8 border-b dark:border-slate-700 ${mode === 'pregnancy'
            ? 'bg-gradient-to-r from-pink-50 to-rose-50 dark:from-slate-900/50 dark:to-slate-800/50 border-pink-100'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900/50 dark:to-slate-800/50 border-blue-100'}`}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <span className={`bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm ${mode === 'pregnancy' ? 'text-pink-600' : 'text-blue-600'}`}>
                {mode === 'pregnancy' ? <Heart className="w-5 h-5" /> : <Baby className="w-5 h-5" />}
              </span>
              {ti.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {ti.forPatient}: <span className="font-bold text-slate-700 dark:text-slate-200">
                {mode === 'pregnancy'
                  ? `${profile.mother.name} — ${ti.gestationalAge} ${gestationalWeek(profile.mother.lmp!)}`
                  : `${selectedChild!.name} — ${formatChildAge(selectedChild!.dob, ts.months, ts.years)}`}
              </span>
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {mode === 'child' && (
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ti.weight}</label>
                    <div className="relative">
                      <Scale className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder={ti.weightPlaceholder}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white shadow-sm"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                <div className={mode === 'pregnancy' ? 'md:col-span-2' : ''}>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{ti.onset}</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={symptomOnset}
                      onChange={(e) => setSymptomOnset(e.target.value)}
                      placeholder={ti.onsetPlaceholder}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white shadow-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <AlertCircle className={`w-4 h-4 ${mode === 'pregnancy' ? 'text-pink-600' : 'text-blue-600'}`} />
                  {ti.symptomsLabel}
                </label>
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={imagePreview ? ti.imagePlaceholder : ti.symptomsPlaceholder}
                    className="w-full min-h-[140px] p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all dark:text-white"
                    disabled={isLoading}
                    required={!imagePreview}
                  />
                  {imagePreview && (
                    <div className="absolute bottom-4 left-4 z-10">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Symptom preview"
                          className="h-20 w-20 object-cover rounded-xl border-2 border-white dark:border-slate-700 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {quickTags.map((s: string) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSymptomTag(s)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg transition-colors border border-transparent hover:border-blue-200"
                      disabled={isLoading}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700 gap-4">
                 <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 font-bold transition-colors text-[11px] sm:text-sm"
                    >
                      <ImageIcon className="w-4 h-4 sm:w-5 h-5" />
                      <span className="leading-tight">{imagePreview ? ti.changePhoto : ti.uploadBtn}</span>
                    </button>
                 </div>

                 <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-white shadow-xl transition-all whitespace-nowrap
                    ${isLoading || !isFormValid ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/20'}`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 sm:w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 sm:w-4 h-4" />
                      <span className="text-[11px] sm:text-sm">{ti.analyzeBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomInput;
