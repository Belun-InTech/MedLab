import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Image as ImageIcon, AlertCircle, User as UserIcon, MapPin, Clock } from 'lucide-react';
import { PatientData, User } from '../types';

interface SymptomInputProps {
  onAnalyze: (data: PatientData) => void;
  isLoading: boolean;
  t: any;
  user?: User | null;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ onAnalyze, isLoading, t, user }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [address, setAddress] = useState('');
  const [symptomOnset, setSymptomOnset] = useState('');
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDob(user.dob || '');
      setSex(user.sex || '');
    }
  }, [user]);

  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge >= 0 ? calculatedAge : 0);
    } else {
      setAge('');
    }
  }, [dob]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    
    const patientData: PatientData = {
      name: name.trim() || "Pasiente Anonimu",
      dob: dob || new Date().toISOString().split('T')[0],
      age: age !== '' ? Number(age) : 30,
      sex: sex || "Other",
      address,
      symptomOnset: symptomOnset.trim() || "Foin dadauk",
      symptoms: text,
      image: imagePreview || undefined
    };
    onAnalyze(patientData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t.input.fileError);
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

  const isFormValid = (text.trim().length > 0 || imagePreview !== null);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900/50 dark:to-slate-800/50 border-b border-blue-100 dark:border-slate-700">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <span className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm text-blue-600">
             <UserIcon className="w-5 h-5" />
          </span>
          {t.input.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {t.input.desc}
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 relative">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.input.name}</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder={t.input.name}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all shadow-sm"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-grow">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.input.dob}</label>
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white shadow-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="w-20">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.input.age}</label>
                <input 
                  type="text" 
                  value={age} 
                  readOnly
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.input.sex}</label>
              <select 
                value={sex} 
                onChange={(e) => setSex(e.target.value as any)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white shadow-sm"
                disabled={isLoading}
              >
                <option value="">{t.input.sexOptions.select}</option>
                <option value="Male">{t.input.sexOptions.male}</option>
                <option value="Female">{t.input.sexOptions.female}</option>
                <option value="Other">{t.input.sexOptions.other}</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.input.address}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.input.addressPlaceholder}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white shadow-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.input.onset}</label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={symptomOnset} 
                  onChange={(e) => setSymptomOnset(e.target.value)}
                  placeholder={t.input.onsetPlaceholder}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white shadow-sm"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              {t.input.symptomsLabel}
            </label>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={imagePreview ? t.input.imagePlaceholder : t.input.symptomsPlaceholder}
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
              {t.commonSymptoms.map((s: string) => (
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
                  <span className="leading-tight">{imagePreview ? t.input.changePhoto : t.input.uploadBtn}</span>
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
                  <span className="text-[11px] sm:text-sm">{t.input.analyzeBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SymptomInput;