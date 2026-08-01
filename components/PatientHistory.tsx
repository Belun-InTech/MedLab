
import React, { useState } from 'react';
import { HistoryRecord, User, PatientData } from '../types';
import { Calendar, User as UserIcon, FileText, ChevronRight, Stethoscope, ArrowLeft, Clock, MapPin, StickyNote, UserCheck, Heart, Wind, Activity, Award } from 'lucide-react';
import ResultsDisplay from './ResultsDisplay';

interface PatientHistoryProps {
  user: User;
  history: HistoryRecord[];
  t: any;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ user, history, t }) => {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  const th = t.history;

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (selectedRecord) {
    // Fallback patient data if snapshot missing (for older records)
    const patientData: PatientData = selectedRecord.patientSnapshot || {
      name: user.name,
      dob: user.dob || '',
      age: user.dob ? calculateAge(user.dob) : 0,
      sex: user.sex || '',
      address: '',
      symptoms: selectedRecord.symptoms,
      symptomOnset: ''
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setSelectedRecord(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <div className="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm group-hover:border-blue-300">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-semibold">{t.about.back}</span>
          </button>
          
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{th.reference}</span>
            <span className="text-sm font-mono text-slate-500">#{selectedRecord.id}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <ActivityIcon className="w-32 h-32" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
               <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{th.reportTitle}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                     <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(selectedRecord.date).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(selectedRecord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
               </div>
               <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                    className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700" 
                    alt={user.name} 
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">{th.verifiedPatient}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-6 mb-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{th.symptoms}</h4>
                    <p className="text-lg text-slate-700 dark:text-slate-200 bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-50 dark:border-blue-900/30">
                      {selectedRecord.symptoms}
                    </p>
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{th.notes}</h4>
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                      <StickyNote className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                      <p className="text-slate-700 dark:text-slate-200 italic leading-relaxed">
                        {selectedRecord.notes || th.noNotes}
                      </p>
                    </div>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                     <span className="text-xs font-bold text-slate-400 uppercase block mb-1">{th.primaryDiagnosis}</span>
                     <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedRecord.diagnosis}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                     <span className="text-xs font-bold text-slate-400 uppercase block mb-1">{th.specialist}</span>
                     <span className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        {selectedRecord.selectedSpecialist ? (
                          <>
                            <UserCheck className="w-5 h-5" />
                            {selectedRecord.selectedSpecialist.name}
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium italic">{th.pendingSpecialist || t.scheduler.pendingChoice}</span>
                        )}
                     </span>
                  </div>
               </div>
            </div>

            {selectedRecord.auscultation && (
              <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] border border-blue-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Stethoscope className="w-32 h-32 text-blue-400" />
                </div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    {t.auscultation.viewResults}
                  </h3>
                  <div className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Certificate Unlocked
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-3 text-red-400">
                      <Heart className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.auscultation.heart}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">{selectedRecord.auscultation.heartSounds}</p>
                  </div>
                  <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-3 text-blue-400">
                      <Wind className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.auscultation.lung}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">{selectedRecord.auscultation.lungSounds}</p>
                  </div>
                  <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400">
                      <Activity className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.auscultation.bowel}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">{selectedRecord.auscultation.bowelSounds}</p>
                  </div>
                </div>

                <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
                   <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">{t.auscultation.findings}</span>
                   <p className="text-lg font-bold text-white leading-tight">
                     {selectedRecord.auscultation.findings}
                   </p>
                   <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                     <span>Performed by {selectedRecord.auscultation.performedBy}</span>
                     <span>•</span>
                     <span>{new Date(selectedRecord.auscultation.date).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            )}

            {selectedRecord.fullResult ? (
              <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  {th.archive}
                </h3>
                <ResultsDisplay 
                  result={selectedRecord.fullResult} 
                  t={t} 
                  patient={patientData}
                  selectedSpecialist={selectedRecord.selectedSpecialist || null}
                  onSpecialistSelect={() => {}} 
                  onScheduleAppointment={() => {}} 
                  language={t.language || 'en'}
                  readOnly={true}
                  auscultation={selectedRecord.auscultation}
                />
              </div>
            ) : (
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                <p className="text-slate-500">{th.notAvailable}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
            alt={user.name} 
            className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-700 shadow-xl"
          />
          <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 border-4 border-white dark:border-slate-700 rounded-full"></div>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{user.name}</h2>
          <p className="text-slate-50 dark:text-slate-400 font-medium mb-6">Patient ID: #{user.id.toUpperCase()}</p>
          
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">{th.visits}</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{history.length}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">{th.lastUpdate}</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {history.length > 0 ? new Date(history[0].date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          {th.title}
        </h3>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">{th.noRecords}</p>
              <p className="text-sm text-slate-400 mt-1">{th.startNew}</p>
            </div>
          ) : (
            history.map((record) => (
              <button 
                key={record.id} 
                onClick={() => setSelectedRecord(record)}
                className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all group relative overflow-hidden active:scale-[0.99]"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-start gap-4 min-w-[160px]">
                    <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl p-2 w-16 h-16 border border-blue-100 dark:border-blue-800 shadow-inner">
                      <span className="text-xs font-black uppercase">{new Date(record.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-2xl font-black leading-none">{new Date(record.date).getDate()}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block mb-1">{new Date(record.date).getFullYear()}</span>
                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${record.status === 'Emergency' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : record.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'}`}>
                        {record.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                       <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{record.diagnosis}</h4>
                       {record.auscultation && (
                         <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight flex items-center gap-1 border border-emerald-200">
                           <Award className="w-2.5 h-2.5" /> Certificate Ready
                         </span>
                       )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-3">
                      <UserCheck className="w-4 h-4 text-blue-500" />
                      <span className="font-bold">
                        {record.selectedSpecialist ? record.selectedSpecialist.name : (th.pendingSpecialist || t.scheduler.pendingChoice)}
                      </span>
                    </div>
                    {record.auscultation && (
                      <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest">
                        <Stethoscope className="w-3 h-3" />
                        {t.auscultation.viewResults}
                      </div>
                    )}
                    {record.notes && (
                      <div className="mb-3 p-2 bg-amber-50/50 dark:bg-amber-900/5 rounded-lg border border-amber-100/50 dark:border-amber-900/20 text-xs text-slate-500 italic line-clamp-1">
                        <StickyNote className="w-3 h-3 inline mr-1 text-amber-500" />
                        {record.notes}
                      </div>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-widest">{th.snapshot} </span>
                      {record.symptoms}
                    </p>
                  </div>

                  <div className="flex items-center justify-end">
                    <div className="p-3 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50H25L35 20L50 80L65 40L75 60H90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default PatientHistory;
