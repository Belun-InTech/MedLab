
import React from 'react';
import { AnalysisResult, PatientData, Specialist, AuscultationData } from '../types';
import { ShieldCheck, User, MapPin, Award, Stethoscope, Heart, Wind, Activity } from 'lucide-react';

interface MedicalCertificateProps {
  result: AnalysisResult;
  patient: PatientData;
  t: any;
  selectedSpecialist?: Specialist;
  auscultation?: AuscultationData;
}

const MedicalCertificate: React.FC<MedicalCertificateProps> = ({ result, patient, t, selectedSpecialist, auscultation }) => {
  const certId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const today = new Date().toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const ct = t.certificate;

  return (
    <div id="medical-certificate" className="bg-white p-8 md:p-12 border border-slate-200 shadow-sm max-w-[210mm] mx-auto min-h-[297mm] flex flex-col font-serif print:shadow-none print:border-none">
      {/* Document Header */}
      <div className="flex justify-between items-start mb-12 pb-6 border-b-4 border-blue-600">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="certLogoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 12 75 L 28 25 L 42 60 L 52 15 L 62 85 L 72 50 L 88 25 L 92 75" 
                  stroke="url(#certLogoGradient)" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
             </svg>
             <h1 className="text-3xl font-['Baumans'] text-slate-900 tracking-tight">
               MurakMed <span className="text-blue-600">AI</span>
             </h1>
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-sans">{ct.subTitle}</p>
        </div>
        <div className="text-right">
           <div className="text-[10px] font-black text-slate-400 uppercase mb-1 font-sans">{ct.certId}</div>
           <div className="text-lg font-mono text-slate-800">{certId}</div>
           <div className="text-[10px] font-black text-slate-400 uppercase mt-4 mb-1 font-sans">{ct.issuedDate}</div>
           <div className="text-sm font-bold text-slate-800 font-sans">{today}</div>
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2 font-sans tracking-tight uppercase">{ct.title}</h2>
        <div className="w-32 h-1 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      {/* Patient Section */}
      <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-sans">
          <User className="w-4 h-4" />
          {ct.patientInfo}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-sans">
           <div className="col-span-2">
             <label className="text-[10px] font-black text-slate-400 uppercase block">Name</label>
             <div className="text-xl font-bold text-slate-900">{patient.name}</div>
           </div>
           <div>
             <label className="text-[10px] font-black text-slate-400 uppercase block">Age</label>
             <div className="text-xl font-bold text-slate-900">{patient.age}</div>
           </div>
           <div>
             <label className="text-[10px] font-black text-slate-400 uppercase block">Gender</label>
             <div className="text-xl font-bold text-slate-900">{patient.sex || '-'}</div>
           </div>
           <div className="col-span-2">
             <label className="text-[10px] font-black text-slate-400 uppercase block">Address</label>
             <div className="text-sm font-medium text-slate-700 flex items-center gap-1 mt-1">
               <MapPin className="w-3.5 h-3.5 text-slate-400" />
               {patient.address || 'Not Provided'}
             </div>
           </div>
        </div>
      </div>

      {/* Main Clinical Data Section */}
      <div className="space-y-6 flex-1">
        <div>
           <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-sans">
             <ShieldCheck className="w-4 h-4" />
             {ct.clinicalFindings}
           </h3>
           
           <div className="mb-6 font-sans">
             <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Reported Symptoms</label>
             <p className="text-slate-800 leading-relaxed italic border-l-4 border-slate-200 pl-4 py-1">
               "{patient.symptoms || 'Symptoms presented in visual data (Image Analysis)'}"
             </p>
           </div>

           {/* Auscultation Section */}
           {auscultation && (
             <div className="mb-6 bg-blue-50/30 p-6 rounded-2xl border border-blue-100 font-sans">
               <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 <Stethoscope className="w-4 h-4" />
                 Physical Examination Results (Auscultation)
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                 <div className="p-3 bg-white rounded-xl border border-blue-100">
                    <div className="flex items-center gap-1.5 text-red-600 mb-1">
                      <Heart className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.auscultation.heart}</span>
                    </div>
                    <p className="text-xs text-slate-700 italic">{auscultation.heartSounds}</p>
                 </div>
                 <div className="p-3 bg-white rounded-xl border border-blue-100">
                    <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                      <Wind className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.auscultation.lung}</span>
                    </div>
                    <p className="text-xs text-slate-700 italic">{auscultation.lungSounds}</p>
                 </div>
                 <div className="p-3 bg-white rounded-xl border border-blue-100">
                    <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                      <Activity className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.auscultation.bowel}</span>
                    </div>
                    <p className="text-xs text-slate-700 italic">{auscultation.bowelSounds}</p>
                 </div>
               </div>
               <div className="mt-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Examination Findings</label>
                 <p className="text-sm font-bold text-slate-900 leading-tight">{auscultation.findings}</p>
               </div>
             </div>
           )}

           <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm font-sans">
              <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                 <span className="text-sm font-black text-slate-600 uppercase">{ct.primaryDiagnosis}</span>
                 <span className="text-xs font-bold px-2 py-0.5 bg-blue-600 text-white rounded-full">{result.possibleConditions[0]?.probability} {ct.probability}</span>
              </div>
              <div className="p-6">
                 <div className="text-2xl font-black text-slate-900 mb-3">{result.possibleConditions[0]?.name}</div>
                 <p className="text-slate-600 leading-relaxed">{result.possibleConditions[0]?.description}</p>
              </div>
           </div>
        </div>

        <div className="font-sans">
           <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-3">{ct.recommendations}</h3>
           <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed">
             <p className="text-blue-900 font-bold text-lg leading-relaxed">
               {result.possibleConditions[0]?.recommendedAction}
             </p>
           </div>
        </div>

        <div className="font-sans">
           <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-3">{ct.advice}</h3>
           <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-disc pl-5">
             {result.generalAdvice.slice(0, 4).map((advice, i) => (
               <li key={i} className="text-slate-600 text-sm leading-snug">{advice}</li>
             ))}
           </ul>
        </div>
      </div>

      {/* Validation / Footer Section */}
      <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-end gap-8 font-sans">
        <div className="max-w-md">
           <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-bold mb-4">
             {ct.disclaimer}
           </p>
           {selectedSpecialist && (
             <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
               <Award className="w-8 h-8 text-blue-600 opacity-50" />
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issuing Institution</p>
                 <p className="text-sm font-bold text-slate-800">{selectedSpecialist.hospital}</p>
               </div>
             </div>
           )}
        </div>
        
        <div className="flex gap-8 items-center">
           <div className="text-center">
              <div className="w-20 h-20 border-4 border-blue-600/20 rounded-xl flex flex-col items-center justify-center opacity-50 mb-1 grayscale">
                <svg className="w-10 h-10 text-blue-600" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path 
                    d="M 12 75 L 28 25 L 42 60 L 52 15 L 62 85 L 72 50 L 88 25 L 92 75" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[7px] font-black text-blue-600 mt-1">{ct.verified}</span>
              </div>
              <span className="text-[9px] text-slate-300 font-mono">HASH: {certId.split('-')[1]}</span>
           </div>

           <div className="text-center w-64">
              <div className="h-16 mb-2 border-b border-slate-300 flex flex-col items-center justify-end">
                {selectedSpecialist ? (
                  <>
                    <span className="text-sm font-bold text-slate-800 mb-0.5">{selectedSpecialist.name}</span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{selectedSpecialist.specialty}</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-300 italic mb-1">Digitally Signed by MurakMed-AI</span>
                )}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {selectedSpecialist ? 'Issuing Physician Signature' : 'Authorized Signature'}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalCertificate;
