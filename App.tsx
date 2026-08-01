
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SymptomInput from './components/SymptomInput';
import ResultsDisplay from './components/ResultsDisplay';
import Dashboard from './components/Dashboard';
import SpecialistDashboard from './components/SpecialistDashboard';
import About from './components/About';
import FAQ from './components/FAQ';
import Login from './components/Login';
import Signup from './components/Signup';
import ResetPassword from './components/ResetPassword';
import PatientHistory from './components/PatientHistory';
import ProfileEdit from './components/ProfileEdit';
import AppointmentScheduler from './components/AppointmentScheduler';
import { analyzeSymptoms, translateAnalysisResult } from './services/ollamaService';
import { recordPatientData } from './services/sheetService';
import { getPatientHistory, saveNewHistoryRecord, updateHistoryRecord, getPersistedSession, clearPersistedSession } from './services/authService';
import { AnalysisResult, AnalysisStatus, PatientData, Language, User, HistoryRecord, Specialist, Appointment, AuscultationData } from './types';
import { AlertTriangle, Database, Loader2, CheckCircle2, Stethoscope } from 'lucide-react';
import { TRANSLATIONS } from './constants/translations';

type ViewState = 'home' | 'about' | 'faq' | 'login' | 'signup' | 'resetPassword' | 'history' | 'profile' | 'doctor';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [showInput, setShowInput] = useState(false);
  const [language, setLanguage] = useState<Language>('tet'); 
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const [contentLanguage, setContentLanguage] = useState<Language>('tet');
  const [isTranslating, setIsTranslating] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('murakmed_dark_mode');
    if (stored !== null) return JSON.parse(stored);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('murakmed_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const activeSession = getPersistedSession();
    if (activeSession) {
      setUser(activeSession);
      // Automatically switch to doctor view if role is specialist
      if (activeSession.role === 'Specialist') {
        setView('doctor');
      }
    }
  }, []);

  useEffect(() => {
    const performTranslation = async () => {
      if (status === AnalysisStatus.SUCCESS && result && language !== contentLanguage && !isTranslating) {
        setIsTranslating(true);
        try {
          const translatedResult = await translateAnalysisResult(result, language);
          setResult(translatedResult);
          setContentLanguage(language);
        } catch (e) {
          console.error("Auto-translation failed", e);
        } finally {
          setIsTranslating(false);
        }
      }
    };
    performTranslation();
  }, [language, contentLanguage, result, status, isTranslating]);

  useEffect(() => {
    if (user && user.role === 'Patient') {
      getPatientHistory(user.id).then(data => setHistory(data));
    } else {
      setHistory([]);
    }
  }, [user]);

  const handleAnalyze = async (patientData: PatientData) => {
    setStatus(AnalysisStatus.ANALYZING);
    setSaveStatus('saving');
    setError(null);
    setResult(null);
    setSelectedSpecialist(null);
    setCurrentPatient(patientData);
    setContentLanguage(language);

    try {
      const data = await analyzeSymptoms(patientData, language);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
      const saved = await recordPatientData(patientData, data);
      setSaveStatus(saved ? 'saved' : 'error');

      if (user) {
        const newRecord: HistoryRecord = {
          id: `h-${Date.now()}`,
          date: new Date().toISOString(),
          symptoms: patientData.symptoms || "Image Analysis",
          diagnosis: data.possibleConditions[0]?.name || "Unknown",
          doctorMet: data.recommendedSpecialist,
          notes: data.emergencyAlert ? "Potential Emergency Detected" : "AI Assessment Complete",
          status: data.emergencyAlert ? "Emergency" : "Pending", // Start as Pending until doctor meeting
          fullResult: data,
          patientSnapshot: patientData
        };
        await saveNewHistoryRecord(user.id, newRecord);
        setHistory(prev => [newRecord, ...prev]);
      }
    } catch (err: any) {
      setError(t.error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleSpecialistSelect = async (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    
    if (user && history.length > 0) {
      const updatedHistory = [...history];
      const targetRecord = updatedHistory[0];
      targetRecord.selectedSpecialist = specialist;
      setHistory(updatedHistory);
      await updateHistoryRecord(user.id, targetRecord.id, { selectedSpecialist: specialist });
    }
  };

  const handleAppointmentConfirm = async (appointment: Appointment) => {
    if (!user || history.length === 0) return;
    
    const updatedHistory = [...history];
    const targetRecord = updatedHistory[0];
    targetRecord.appointment = appointment;
    setHistory(updatedHistory);
    
    await updateHistoryRecord(user.id, targetRecord.id, { appointment });
    setIsScheduling(false);
    alert(t.scheduler.success);
  };

  const handleReset = () => {
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setSelectedSpecialist(null);
    setIsScheduling(false);
    setShowInput(true);
    setCurrentPatient(null);
  };

  const handleLogoClick = () => {
    if (user?.role === 'Specialist') {
      setView('doctor');
    } else {
      setView('home');
      setShowInput(false);
      setIsScheduling(false);
      setStatus(AnalysisStatus.IDLE);
    }
  };

  const handleLogout = () => {
    clearPersistedSession();
    setUser(null);
    setHistory([]);
    setView('home');
    setShowInput(false);
    setIsScheduling(false);
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
  };

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    if (u.role === 'Specialist') {
      setView('doctor');
    } else {
      setView('home');
    }
  };

  const renderHomeContent = () => {
    if (user?.role === 'Specialist') {
      return <SpecialistDashboard user={user} t={t} />;
    }

    if (!user) {
      return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight flex flex-col items-center">
              <span>{t.hero.title}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {t.hero.subtitle}
              </span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t.hero.desc}
            </p>
          </div>
          <SymptomInput onAnalyze={handleAnalyze} isLoading={status === AnalysisStatus.ANALYZING} t={t} user={user} />
        </div>
      );
    }

    if (!showInput && status === AnalysisStatus.IDLE) {
      return (
        <Dashboard user={user} onStartAnalysis={() => setShowInput(true)} onViewHistory={() => setView('history')} onViewProfile={() => setView('profile')} t={t} />
      );
    }

    if (isScheduling && selectedSpecialist) {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
           <button 
            onClick={() => setIsScheduling(false)}
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-colors mb-4"
          >
            {t.scheduler.backToResults}
          </button>
          <AppointmentScheduler 
            specialist={selectedSpecialist} 
            onConfirm={handleAppointmentConfirm} 
            onCancel={() => setIsScheduling(false)} 
            t={t}
            language={language}
          />
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {status !== AnalysisStatus.SUCCESS && (
          <div className="space-y-6">
            <button 
              onClick={() => setShowInput(false)}
              className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <SymptomInput onAnalyze={handleAnalyze} isLoading={status === AnalysisStatus.ANALYZING} t={t} user={user} />
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-4 text-red-700 dark:text-red-400 animate-shake">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {status === AnalysisStatus.SUCCESS && result && (
           <div className="space-y-8 relative">
              {isTranslating && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl border border-white/50 transition-all duration-300">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest text-blue-800 animate-pulse">Auto-translating to {language.toUpperCase()}...</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-2">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {t.results.title}
                </h2>
                
                <div className="flex items-center gap-8 sm:gap-12 w-full sm:w-auto justify-end">
                  <div className="flex flex-col items-end">
                    {saveStatus === 'saved' ? (
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 
                        {t.results.recordSaved}
                      </span>
                    ) : saveStatus === 'saving' ? (
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                        Rai hela...
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">
                        {t.results.recordSaved}
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={handleReset}
                    className="text-base sm:text-lg font-black uppercase tracking-[0.1em] text-blue-600 hover:text-blue-700 transition-all active:scale-[0.95]"
                  >
                    {t.results.newRecord}
                  </button>
                </div>
              </div>

              <ResultsDisplay 
                result={result} 
                t={t} 
                patient={currentPatient || undefined} 
                selectedSpecialist={selectedSpecialist}
                onSpecialistSelect={handleSpecialistSelect}
                onScheduleAppointment={() => setIsScheduling(true)}
                language={language}
              />
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header 
        onLogoClick={handleLogoClick}
        onHomeClick={handleLogoClick}
        onFaqClick={() => setView('faq')}
        onAboutClick={() => setView('about')}
        currentLang={language}
        onLanguageChange={setLanguage}
        t={t}
        user={user}
        onLoginClick={() => setView('login')}
        onLogoutClick={handleLogout}
        onHistoryClick={() => setView('history')}
        onProfileClick={() => setView('profile')}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        {view === 'home' && renderHomeContent()}
        {view === 'doctor' && user && <SpecialistDashboard user={user} t={t} />}
        {view === 'about' && <About onBack={() => setView('home')} language={language} t={t} />}
        {view === 'faq' && <FAQ onBack={() => setView('home')} t={t} />}
        {view === 'login' && (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onCancel={() => setView('home')}
            onSwitchToSignup={() => setView('signup')}
            onForgotPassword={() => setView('resetPassword')}
            t={t}
          />
        )}
        {view === 'signup' && (
          <Signup 
            onSignupSuccess={handleLoginSuccess} 
            onCancel={() => setView('home')}
            onSwitchToLogin={() => setView('login')}
            t={t}
          />
        )}
        {view === 'resetPassword' && (
          <ResetPassword 
            onSuccess={() => setView('login')} 
            onCancel={() => setView('login')} 
            t={t}
          />
        )}
        {view === 'history' && user && <PatientHistory user={user} history={history} t={t} />}
        {view === 'profile' && user && (
          <ProfileEdit 
            user={user} 
            onUpdateSuccess={(updated) => setUser(updated)} 
            onCancel={() => setView('home')} 
            t={t}
          />
        )}
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center space-y-4">
         <div className="max-w-md mx-auto px-4">
           <p className="text-xs text-slate-400 dark:text-slate-600 leading-relaxed">
             {t.footer.safety}
           </p>
         </div>
         <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
           MurakMed-AI • Developed by Boscovi Nahak • {new Date().getFullYear()}
         </p>
      </footer>
    </div>
  );
};

export default App;
