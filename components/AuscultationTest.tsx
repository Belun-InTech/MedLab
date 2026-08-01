
import React, { useState } from 'react';
import { AuscultationData, Specialist } from '../types';
import { Heart, Activity, Wind, Save, X, Stethoscope, AlertCircle } from 'lucide-react';

interface AuscultationTestProps {
  specialist: Specialist;
  onSave: (data: AuscultationData) => void;
  onCancel: () => void;
  t: any;
}

const AuscultationTest: React.FC<AuscultationTestProps> = ({ specialist, onSave, onCancel, t }) => {
  const [heartSounds, setHeartSounds] = useState('');
  const [lungSounds, setLungSounds] = useState('');
  const [bowelSounds, setBowelSounds] = useState('');
  const [findings, setFindings] = useState('');

  const handleSave = () => {
    const data: AuscultationData = {
      heartSounds,
      lungSounds,
      bowelSounds,
      findings,
      performedBy: specialist.name,
      date: new Date().toISOString()
    };
    onSave(data);
  };

  const ta = t.auscultation;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in max-w-2xl mx-auto">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
            <Stethoscope className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight">{ta.title}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ta.subtitle}</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
           <img src={specialist.image} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" alt={specialist.name} />
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Examining Specialist</p>
              <p className="font-bold text-slate-900 dark:text-white">{specialist.name}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Heart className="w-4 h-4 text-red-500" />
              {ta.heart}
            </label>
            <textarea 
              value={heartSounds}
              onChange={(e) => setHeartSounds(e.target.value)}
              placeholder={ta.heartPlaceholder}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white min-h-[80px] resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Wind className="w-4 h-4 text-blue-400" />
              {ta.lung}
            </label>
            <textarea 
              value={lungSounds}
              onChange={(e) => setLungSounds(e.target.value)}
              placeholder={ta.lungPlaceholder}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white min-h-[80px] resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Activity className="w-4 h-4 text-emerald-500" />
              {ta.bowel}
            </label>
            <textarea 
              value={bowelSounds}
              onChange={(e) => setBowelSounds(e.target.value)}
              placeholder={ta.bowelPlaceholder}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white min-h-[80px] resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              {ta.findings}
            </label>
            <textarea 
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder={ta.findingsPlaceholder}
              className="w-full p-4 bg-slate-50 dark:bg-blue-900/10 border border-slate-200 dark:border-blue-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white min-h-[100px] resize-none text-sm font-medium"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
           <button
             onClick={handleSave}
             className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
           >
             <Save className="w-5 h-5" />
             {ta.saveBtn}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AuscultationTest;
