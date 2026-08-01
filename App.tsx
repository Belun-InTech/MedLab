import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FamilyProfileSetup from './components/FamilyProfileSetup';
import SymptomInput from './components/SymptomInput';
import ResultsDisplay from './components/ResultsDisplay';
import PregnancyTracker from './components/PregnancyTracker';
import VaccinationSchedule from './components/VaccinationSchedule';
import FacilityFinder from './components/FacilityFinder';
import DoctorChat from './components/DoctorChat';
import DoctorCall from './components/DoctorCall';
import SubscriptionPaywall from './components/SubscriptionPaywall';
import About from './components/About';
import FAQ from './components/FAQ';
import { analyzeSymptoms, translateAnalysisResult } from './services/ollamaService';
import { getFamilyProfile, saveFamilyProfile, isSubscribed, setSubscribed } from './services/profileService';
import { AnalysisResult, AnalysisStatus, PatientData, Language, FamilyProfile, Specialist } from './types';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from './constants/translations';

type ViewState =
  | 'home' | 'about' | 'faq' | 'profile'
  | 'checker' | 'tracker' | 'vaccines' | 'facilities'
  | 'chat' | 'call' | 'subscribe';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [profile, setProfile] = useState<FamilyProfile | null>(() => getFamilyProfile());
  const [language, setLanguage] = useState<Language>('tet');

  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);

  const [contentLanguage, setContentLanguage] = useState<Language>('tet');
  const [isTranslating, setIsTranslating] = useState(false);

  const [subscribed, setSubscribedState] = useState<boolean>(() => isSubscribed());
  const [pendingDoctorAction, setPendingDoctorAction] = useState<'chat' | 'call'>('chat');

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('medlab_dark_mode');
    if (stored !== null) return JSON.parse(stored);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('medlab_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const t = TRANSLATIONS[language];

  // Re-translate an existing analysis when the UI language changes
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

  const handleAnalyze = async (patientData: PatientData) => {
    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult(null);
    setSelectedSpecialist(null);
    setContentLanguage(language);

    try {
      const data = await analyzeSymptoms(patientData, language);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err) {
      setError(t.error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const resetChecker = () => {
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setError(null);
    setSelectedSpecialist(null);
  };

  const goHome = () => {
    setView('home');
    resetChecker();
  };

  const handleProfileSave = (updated: FamilyProfile) => {
    saveFamilyProfile(updated);
    setProfile(updated);
    setView('home');
  };

  // Doctor access is the premium feature; emergencies bypass the paywall.
  const handleTalkToDoctor = (specialist: Specialist | null, action: 'chat' | 'call' = 'chat', emergency = false) => {
    if (specialist) setSelectedSpecialist(specialist);
    if (subscribed || emergency) {
      setView(action);
    } else {
      setPendingDoctorAction(action);
      setView('subscribe');
    }
  };

  const handleSubscribe = () => {
    setSubscribed(true);
    setSubscribedState(true);
    setView(pendingDoctorAction);
  };

  const renderChecker = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <button
        onClick={goHome}
        className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-colors"
      >
        {t.input.back}
      </button>

      {status !== AnalysisStatus.SUCCESS && profile && (
        <SymptomInput profile={profile} onAnalyze={handleAnalyze} isLoading={status === AnalysisStatus.ANALYZING} t={t} />
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
                <span className="text-xs font-black uppercase tracking-widest text-blue-800 animate-pulse">
                  {t.results.translating} {language.toUpperCase()}...
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center gap-6 mb-2">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {t.results.title}
            </h2>
            <button
              onClick={resetChecker}
              className="text-base sm:text-lg font-black uppercase tracking-[0.1em] text-blue-600 hover:text-blue-700 transition-all active:scale-[0.95]"
            >
              {t.results.newRecord}
            </button>
          </div>

          <ResultsDisplay
            result={result}
            t={t}
            selectedSpecialist={selectedSpecialist}
            onSpecialistSelect={setSelectedSpecialist}
            onTalkToDoctor={(s) => handleTalkToDoctor(s, 'call', result.emergencyAlert)}
          />
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    // First launch: no family profile yet → onboarding takes over every view
    if (!profile) {
      return <FamilyProfileSetup existingProfile={null} onSave={handleProfileSave} t={t} />;
    }

    switch (view) {
      case 'about':
        return <About onBack={goHome} language={language} t={t} />;
      case 'faq':
        return <FAQ onBack={goHome} t={t} />;
      case 'profile':
        return <FamilyProfileSetup existingProfile={profile} onSave={handleProfileSave} onCancel={goHome} t={t} />;
      case 'checker':
        return renderChecker();
      case 'tracker':
        return <PregnancyTracker profile={profile} language={language} t={t} onBack={goHome} onEditProfile={() => setView('profile')} />;
      case 'vaccines':
        return <VaccinationSchedule profile={profile} t={t} onBack={goHome} onEditProfile={() => setView('profile')} />;
      case 'facilities':
        return <FacilityFinder t={t} onBack={goHome} />;
      case 'subscribe':
        return <SubscriptionPaywall t={t} onSubscribe={handleSubscribe} onCancel={goHome} />;
      case 'chat':
        // returning from the doctor keeps an existing analysis on screen instead of discarding it
        return <DoctorChat t={t} specialist={selectedSpecialist} onStartCall={() => setView('call')}
          onBack={() => setView(status === AnalysisStatus.SUCCESS ? 'checker' : 'home')} />;
      case 'call':
        return <DoctorCall t={t} specialist={selectedSpecialist} onEnd={() => setView(subscribed ? 'chat' : 'home')} />;
      case 'home':
      default:
        return (
          <Dashboard
            profile={profile}
            onCheckSymptoms={() => { resetChecker(); setView('checker'); }}
            onOpenTracker={() => setView('tracker')}
            onOpenVaccines={() => setView('vaccines')}
            onTalkToDoctor={() => handleTalkToDoctor(null, 'chat')}
            onOpenFacilities={() => setView('facilities')}
            t={t}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header
        onLogoClick={goHome}
        onHomeClick={goHome}
        onFaqClick={() => setView('faq')}
        onAboutClick={() => setView('about')}
        onProfileClick={() => setView('profile')}
        currentLang={language}
        onLanguageChange={setLanguage}
        t={t}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        {renderContent()}
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center space-y-4">
         <div className="max-w-md mx-auto px-4">
           <p className="text-xs text-slate-400 dark:text-slate-600 leading-relaxed">
             {t.footer.safety}
           </p>
         </div>
         <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
           Médiku Labarik (MédLab) • {new Date().getFullYear()}
         </p>
      </footer>
    </div>
  );
};

export default App;
