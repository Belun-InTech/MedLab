
import React, { useState, useEffect } from 'react';
import { Specialist, User, Appointment, Language, AnalysisResult, AuscultationData, HistoryRecord } from '../types';
import { getSpecialistAppointments, updateAppointmentBySpecialist, getPatientHistory } from '../services/authService';
import { MOCK_SPECIALISTS } from '../constants/medicalData';
import ResultsDisplay from './ResultsDisplay';
import AuscultationTest from './AuscultationTest';
import PatientHistory from './PatientHistory';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Stethoscope, 
  Settings, 
  Power, 
  CheckCircle2, 
  Bell,
  Search,
  ChevronRight,
  Filter,
  Users,
  ArrowLeft,
  Heart,
  Wind,
  Activity,
  AlertCircle,
  FileSearch,
  History,
  ShieldAlert,
  ExternalLink,
  Award
} from 'lucide-react';

interface SpecialistDashboardProps {
  user: User;
  t: any;
}

const SpecialistDashboard: React.FC<SpecialistDashboardProps> = ({ user, t }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'availability'>('appointments');
  const [status, setStatus] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAuscultating, setIsAuscultating] = useState(false);
  
  // Patient History View state
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [patientHistoryRecords, setPatientHistoryRecords] = useState<HistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const specialistProfile = MOCK_SPECIALISTS.find(s => s.id === user.specialistId);
  const dt = t.doctor;

  useEffect(() => {
    refreshAppointments();
    if (specialistProfile) {
      setStatus(specialistProfile.availability);
    }
  }, [user.specialistId, specialistProfile]);

  const refreshAppointments = () => {
    if (user.specialistId) {
      getSpecialistAppointments(user.specialistId).then(data => {
        setAppointments(data);
        setIsLoading(false);
      });
    }
  };

  const handleUpdateStatus = () => {
    alert(`Status updated to: ${status}. Patients will see this on your profile.`);
  };

  const handleAuscultationSave = async (data: AuscultationData) => {
    if (!selectedAppointment?.id) return;
    
    await updateAppointmentBySpecialist(selectedAppointment.id, { auscultation: data });
    
    // Update local state
    const updatedApp = { ...selectedAppointment, auscultation: data };
    setSelectedAppointment(updatedApp);
    setIsAuscultating(false);
    refreshAppointments();
    alert("Full physical exam recorded. The patient can now access their official medical certificate immediately.");
  };

  const openPatientHistory = async (patientId: string) => {
    setViewingPatientId(patientId);
    setIsLoadingHistory(true);
    try {
      const records = await getPatientHistory(patientId);
      setPatientHistoryRecords(records);
    } catch (err) {
      console.error("Failed to fetch patient history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!specialistProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Stethoscope className="w-16 h-16 mb-4 opacity-20" />
        <p>Could not link account to specialist profile.</p>
      </div>
    );
  }

  // --- SUB-VIEW: PATIENT HISTORY DRILL-DOWN ---
  if (viewingPatientId) {
    const patientName = appointments.find(a => a.patientId === viewingPatientId)?.patientName || "Patient";
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <button 
          onClick={() => setViewingPatientId(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group font-bold uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl text-orange-600">
                <History className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Full History: {patientName}</h2>
           </div>
           
           {isLoadingHistory ? (
             <div className="py-20 text-center text-slate-400">Loading patient records...</div>
           ) : (
             <div className="space-y-4">
                {patientHistoryRecords.length === 0 ? (
                  <p className="text-center py-10 text-slate-500">No previous records found for this patient.</p>
                ) : (
                  patientHistoryRecords.map(record => (
                    <div key={record.id} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(record.date).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                           {record.auscultation && (
                             <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight flex items-center gap-1">
                               <Award className="w-2.5 h-2.5" /> Certificate Ready
                             </span>
                           )}
                           <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${record.status === 'Emergency' ? 'bg-red-100 text-red-600' : record.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                             {record.status}
                           </span>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{record.diagnosis}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1 italic">"{record.symptoms}"</p>
                    </div>
                  ))
                )}
             </div>
           )}
        </div>
      </div>
    );
  }

  // --- SUB-VIEW: AUSCULTATION FORM ---
  if (isAuscultating && selectedAppointment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <button 
          onClick={() => setIsAuscultating(false)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patient Record
        </button>
        <div className="space-y-4">
           <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-center gap-3">
              <Award className="w-5 h-5 text-blue-600" />
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Completing this test unlocks the patient's medical certificate.</p>
           </div>
           <AuscultationTest 
            specialist={specialistProfile}
            onSave={handleAuscultationSave}
            onCancel={() => setIsAuscultating(false)}
            t={t}
           />
        </div>
      </div>
    );
  }

  // --- SUB-VIEW: APPOINTMENT DETAIL ---
  if (selectedAppointment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setSelectedAppointment(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <div className="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm group-hover:border-blue-300">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-semibold">{t.about.back}</span>
          </button>
          
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Reference ID</span>
            <span className="text-sm font-mono text-slate-500">#{selectedAppointment.id}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-xl">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 pb-10 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600">
                   <UserIcon className="w-10 h-10" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">{selectedAppointment.patientName}</h2>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{selectedAppointment.patientAge} Years Old</span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{selectedAppointment.patientSex}</span>
                      {selectedAppointment.patientId && (
                        <button 
                          onClick={() => openPatientHistory(selectedAppointment.patientId!)}
                          className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <History className="w-3 h-3" /> Full History
                        </button>
                      )}
                    </div>
                 </div>
              </div>
              <div className="text-right bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 min-w-[200px]">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{dt.time}</span>
                 <div className="flex items-center justify-end gap-2 text-xl font-black text-blue-600">
                    <Calendar className="w-5 h-5" />
                    {selectedAppointment.date}
                 </div>
                 <div className="text-slate-500 font-bold mt-1">@ {selectedAppointment.time}</div>
              </div>
           </div>

           <div className="space-y-10">
              <section>
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{dt.symptoms}</h3>
                    {!selectedAppointment.auscultation && (
                      <button 
                        onClick={() => setIsAuscultating(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        {t.auscultation.performBtn}
                      </button>
                    )}
                 </div>
                 <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-50 dark:border-blue-900/30">
                    <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium italic">
                      "{selectedAppointment.patientSymptoms}"
                    </p>
                 </div>
              </section>

              {selectedAppointment.auscultation && (
                <section>
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.auscultation.title}</h3>
                      <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" /> Exam Done • Certificate Available
                      </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <div className="flex items-center gap-2 mb-3 text-red-500">
                           <Heart className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{t.auscultation.heart}</span>
                         </div>
                         <p className="text-sm text-slate-600 dark:text-slate-400 italic">{selectedAppointment.auscultation.heartSounds}</p>
                      </div>
                      <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <div className="flex items-center gap-2 mb-3 text-blue-500">
                           <Wind className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{t.auscultation.lung}</span>
                         </div>
                         <p className="text-sm text-slate-600 dark:text-slate-400 italic">{selectedAppointment.auscultation.lungSounds}</p>
                      </div>
                      <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <div className="flex items-center gap-2 mb-3 text-emerald-500">
                           <Activity className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{t.auscultation.bowel}</span>
                         </div>
                         <p className="text-sm text-slate-600 dark:text-slate-400 italic">{selectedAppointment.auscultation.bowelSounds}</p>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-900 rounded-2xl border border-blue-500/20">
                      <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.auscultation.findings}</span>
                      </div>
                      <p className="text-lg font-bold text-white leading-tight">{selectedAppointment.auscultation.findings}</p>
                   </div>
                   
                   <button 
                     onClick={() => setIsAuscultating(true)}
                     className="mt-4 text-xs font-black text-slate-400 hover:text-blue-500 uppercase tracking-widest flex items-center gap-2"
                   >
                     <Settings className="w-3.5 h-3.5" /> Re-run Examination
                   </button>
                </section>
              )}

              {selectedAppointment.analysisResult && (
                <section className="pt-10 border-t border-slate-100 dark:border-slate-700">
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">AI Symptom Analysis Archive</h3>
                   <ResultsDisplay 
                     result={selectedAppointment.analysisResult} 
                     t={t} 
                     language="en"
                     readOnly={true}
                     selectedSpecialist={specialistProfile}
                     onSpecialistSelect={() => {}}
                     onScheduleAppointment={() => {}}
                     auscultation={selectedAppointment.auscultation}
                   />
                </section>
              )}
           </div>
        </div>
      </div>
    );
  }

  // --- MAIN VIEW: APPOINTMENT LIST & TABS ---
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Specialist Header */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="w-32 h-32 rounded-full border-4 border-slate-700 overflow-hidden shadow-xl">
             <img src={specialistProfile.image} alt={user.name} className="w-full h-full object-cover" />
           </div>
           <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                <Power className="w-3 h-3" /> {dt.dashboard}
              </div>
              <h1 className="text-4xl font-black">{dt.welcome} {user.firstName}</h1>
              <p className="text-slate-400 font-medium">
                {t.specialistNames[specialistProfile.specialty] || specialistProfile.specialty} • {specialistProfile.hospital}
              </p>
           </div>
           <div className="flex gap-4">
              <div className="text-center p-4 bg-slate-800 rounded-2xl border border-slate-700 min-w-[100px]">
                 <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Today's Total</span>
                 <span className="text-2xl font-black text-blue-400">{appointments.length}</span>
              </div>
           </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
             <button 
               onClick={() => setActiveTab('appointments')}
               className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'appointments' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
             >
               {dt.upcoming}
             </button>
             <button 
               onClick={() => setActiveTab('availability')}
               className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'availability' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
             >
               {dt.availability}
             </button>
          </div>

          {activeTab === 'appointments' ? (
            <div className="space-y-4">
              {isLoading ? (
                <div className="p-12 text-center text-slate-400">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="p-20 text-center bg-white dark:bg-slate-800 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                   <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Calendar className="w-8 h-8 text-slate-300" />
                   </div>
                   <p className="font-bold text-slate-500">{dt.noAppointments}</p>
                   <p className="text-sm text-slate-400 mt-1">{dt.notified}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {appointments.map((app) => {
                    const primaryCondition = app.analysisResult?.possibleConditions?.[0];
                    const isEmergency = app.analysisResult?.emergencyAlert;
                    const isExamined = !!app.auscultation;

                    return (
                      <div key={app.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                         {isEmergency && (
                           <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 animate-pulse" title="Emergency Case" />
                         )}
                         
                         <div className="flex flex-col xl:flex-row justify-between gap-6 relative z-10">
                            <div className="flex items-start gap-5 flex-1">
                               <div className="relative">
                                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                     <UserIcon className="w-7 h-7" />
                                  </div>
                                  {isEmergency && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-800 animate-bounce">
                                      <ShieldAlert className="w-3 h-3" />
                                    </div>
                                  )}
                               </div>
                               <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                     <h4 className="font-black text-lg text-slate-900 dark:text-white leading-none">{app.patientName}</h4>
                                     {isExamined && (
                                       <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight flex items-center gap-1 border border-emerald-200">
                                          <CheckCircle2 className="w-2.5 h-2.5" /> Exam Complete
                                       </span>
                                     )}
                                     {primaryCondition && (
                                       <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                         primaryCondition.probability === 'High' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                                       }`}>
                                          AI: {primaryCondition.name} ({primaryCondition.probability})
                                       </span>
                                     )}
                                  </div>
                                  <p className="text-xs text-slate-400 font-medium">Age: {app.patientAge || '?'} • {app.patientSex || '?'}</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 italic">
                                     <span className="font-bold text-[10px] uppercase text-slate-400 not-italic mr-1">{dt.symptoms}:</span>
                                     "{app.patientSymptoms}"
                                  </p>
                               </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 xl:gap-8 justify-between xl:justify-end border-t xl:border-t-0 pt-4 xl:pt-0 border-slate-100 dark:border-slate-700">
                               <div className="text-right">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{dt.time}</span>
                                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                     <Clock className="w-4 h-4 text-blue-500" />
                                     {app.time}
                                  </div>
                               </div>
                               
                               <div className="flex gap-2">
                                  {app.patientId && (
                                    <button 
                                      onClick={() => openPatientHistory(app.patientId!)}
                                      className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-500 hover:text-blue-600 rounded-xl transition-colors border border-slate-100 dark:border-slate-600"
                                      title="Patient History"
                                    >
                                      <History className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => setSelectedAppointment(app)}
                                    className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-500/10 flex items-center gap-2"
                                  >
                                    {dt.viewRecord}
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 space-y-8">
               <div className="max-w-md">
                 <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{dt.currentStatus}</h4>
                 <div className="flex flex-wrap gap-2 mb-6">
                    {([dt.available, dt.tomorrow, dt.busy, dt.unavailable] as string[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${status === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        {s}
                      </button>
                    ))}
                 </div>
                 <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Custom availability message</label>
                    <input 
                      type="text" 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm dark:text-white"
                      placeholder="e.g., Available Today until 5 PM"
                    />
                    <button 
                      onClick={handleUpdateStatus}
                      className="w-full py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      {dt.saveStatus}
                    </button>
                 </div>
               </div>

               <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{dt.manageSlots}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {['Morning', 'Afternoon', 'Evening'].map(p => (
                       <div key={p} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-4">{p} Slots</h5>
                          <div className="space-y-2">
                             {[1,2,3,4].map(i => (
                               <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                  <span className="text-xs font-bold text-slate-500">{0 + i}:00 - {0 + i}:30</span>
                                  <div className="w-8 h-4 bg-emerald-500 rounded-full"></div>
                               </div>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-80 space-y-6">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Professional Network
              </h4>
              <div className="space-y-4">
                 {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                       <div className="flex-1">
                          <div className="h-2 w-20 bg-slate-100 dark:bg-slate-700 rounded mb-1"></div>
                          <div className="h-2 w-12 bg-slate-50 dark:bg-slate-800 rounded"></div>
                       </div>
                    </div>
                 ))}
                 <button className="w-full py-2 text-xs font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50">
                    Connect with Colleagues
                 </button>
              </div>
           </div>

           <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-400 mb-1">Performance Stats</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-600 mb-4">Patient satisfaction is up by 12% this month.</p>
              <div className="h-1 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[92%]"></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                 <span>Rating</span>
                 <span>4.9/5.0</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistDashboard;
