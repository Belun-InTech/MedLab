import React, { useState, useRef } from 'react';
import { Send, X, Image as ImageIcon, AlertCircle, Clock, Baby, Scale, ArrowRight } from 'lucide-react';
import { AnalyzeRequest, FamilyProfile } from '../shared/types';
import { formatChildAge, findChild } from '../services/profileService';

interface SymptomInputProps {
  profile: FamilyProfile;
  onAnalyze: (data: Omit<AnalyzeRequest, 'language'>) => void;
  isLoading: boolean;
  onBack: () => void;        // leave the checker entirely
  onEditProfile: () => void; // open the family profile editor
  t: any;
}

type Step = 'child' | 'form';

const SymptomInput: React.FC<SymptomInputProps> = ({ profile, onAnalyze, isLoading, onBack, onEditProfile, t }) => {
  // Nothing is pre-selected — picking the child is the first decision.
  const [step, setStep] = useState<Step>('child');
  const [childId, setChildId] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [symptomOnset, setSymptomOnset] = useState('');
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ts = t.selector;
  const ti = t.input;

  const hasChildren = profile.children.length > 0;
  const selectedChild = childId ? findChild(profile, childId) : undefined;

  // Guard a selection that no longer resolves (profile edited underneath us)
  const effectiveStep: Step = step === 'form' && !selectedChild ? 'child' : step;

  const chooseChild = (nextId: string) => {
    // Weight is per-person and feeds dosage reasoning — never carry it between children.
    if (nextId !== childId) setWeight('');
    setChildId(nextId);
    setStep('form');
  };

  const handleBack = () => {
    if (effectiveStep === 'form') {
      setStep('child');
      return;
    }
    onBack();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || (!text.trim() && !imagePreview)) return;

    // The server reads the child's name, age and sex from the database by id — the
    // client cannot fake an age or analyse against a child it does not own.
    onAnalyze({
      childId: selectedChild.id,
      weightKg: weight ? Number(weight) : undefined,
      symptomOnset: symptomOnset.trim() || 'Recently',
      symptoms: text,
      image: imagePreview || undefined,
    });
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

  const isFormValid = !!selectedChild && (text.trim().length > 0 || imagePreview !== null);

  return (
    <div className="space-y-6 animate-fade-in">
      <StepHeader
        label={ti.back}
        onBack={handleBack}
        disabled={isLoading && effectiveStep === 'form'}
        current={effectiveStep === 'child' ? 1 : 2}
      />

      {/* Step 1 — which child are we consulting for? */}
      {effectiveStep === 'child' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{ts.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{ts.subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 items-start">
            {profile.children.map(child => (
              <button
                key={child.id}
                type="button"
                onClick={() => chooseChild(child.id)}
                className={`p-5 sm:p-6 rounded-[2rem] border shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                  text-left flex items-center gap-4 group bg-blue-50/30 dark:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-800
                  ${childId === child.id
                    ? 'ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-blue-500 border-blue-500'
                    : 'border-slate-200 dark:border-slate-700'}`}
              >
                <span className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                  <Baby className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">{child.name}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {formatChildAge(child.dob, ts.months, ts.years)}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-blue-600 transition-all flex-shrink-0" />
              </button>
            ))}

            {/* A div, not a button — it contains the profile button, and nesting buttons is invalid HTML. */}
            {!hasChildren && (
              <div
                aria-disabled="true"
                className="p-5 sm:p-6 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 flex flex-col gap-3 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm text-slate-300 dark:text-slate-600">
                    <Baby className="w-6 h-6" />
                  </span>
                  <h3 className="font-bold text-slate-400 dark:text-slate-500">{t.onboarding.childrenSection}</h3>
                </div>
                <p className="text-xs text-slate-400 italic leading-relaxed">{ts.noChildrenNote}</p>
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="mt-1 w-fit px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  {t.vaccines.goToProfile}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2 — symptom form */}
      {effectiveStep === 'form' && selectedChild && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 sm:p-8 border-b dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900/50 dark:to-slate-800/50 border-blue-100">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <span className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm text-blue-600">
                <Baby className="w-5 h-5" />
              </span>
              {ti.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {ti.forPatient}: <span className="font-bold text-slate-700 dark:text-slate-200">
                {selectedChild.name} — {formatChildAge(selectedChild.dob, ts.months, ts.years)}
              </span>
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

                <div>
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
                  <AlertCircle className="w-4 h-4 text-blue-600" />
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
                  {(t.childSymptoms as string[]).map((s: string) => (
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

const StepHeader = ({ label, onBack, disabled, current }: any) => (
  <div className="flex items-center justify-between gap-4">
    <button
      onClick={onBack}
      disabled={disabled}
      className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-colors disabled:opacity-40 disabled:hover:text-slate-400"
    >
      {label}
    </button>
    <div className="flex items-center gap-1.5">
      {[1, 2].map(n => (
        <span
          key={n}
          className={`h-1.5 rounded-full transition-all ${n === current ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}
        />
      ))}
    </div>
  </div>
);

export default SymptomInput;
