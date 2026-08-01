import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';
import FamilyProfileSetup from './components/FamilyProfileSetup';
import SymptomInput from './components/SymptomInput';
import ResultsDisplay from './components/ResultsDisplay';
import VaccinationSchedule from './components/VaccinationSchedule';
import FacilityFinder from './components/FacilityFinder';
import DoctorChat from './components/DoctorChat';
import DoctorCall from './components/DoctorCall';
import SubscriptionPaywall from './components/SubscriptionPaywall';
import About from './components/About';
import FAQ from './components/FAQ';
import { analyzeSymptoms, translateAnalysisResult } from './services/analysisService';
import { fetchChildren, saveChildren } from './services/profileService';
import { fetchSession, logout, subscribe, SessionUser } from './services/authService';
import { AnalysisResult, AnalysisStatus, AnalyzeRequest, Language, FamilyProfile, Specialist } from './shared/types';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from './constants/translations';

type ViewState =
  | 'home' | 'about' | 'faq' | 'profile'
  | 'checker' | 'vaccines' | 'facilities'
  | 'chat' | 'call' | 'subscribe';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  // null while the session is still being restored — avoids flashing the login screen
  // at an already signed-in user on every reload.
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [language, setLanguage] = useState<Language>('tet');

  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);

  const [contentLanguage, setContentLanguage] = useState<Language>('tet');
  const [isTranslating, setIsTranslating] = useState(false);

  const [pendingDoctorAction, setPendingDoctorAction] = useState<'chat' | 'call'>('chat');

  const authed = user !== null;
  const subscribed = user?.subscribed ?? false;

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

  // Restore the session (httpOnly cookie) and load the family on boot.
  useEffect(() => {
    (async () => {
      try {
        const session = await fetchSession();
        setUser(session);
        if (session) setProfile(await fetchChildren());
      } catch (e) {
        console.error('Session restore failed', e);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  // Screens swap in place, so without this a new screen inherits the previous scroll offset
  // and appears already scrolled halfway down.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, authed, profile]);

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

  const handleAnalyze = async (request: Omit<AnalyzeRequest, 'language'>) => {
    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult(null);
    setSelectedSpecialist(null);
    setContentLanguage(language);

    try {
      const data = await analyzeSymptoms({ ...request, language });
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

  const handleAuthenticated = async (session: SessionUser, isNewAccount: boolean) => {
    setUser(session);
    // A brand-new account starts with no children; an existing one loads its family.
    setProfile(isNewAccount ? { children: [] } : await fetchChildren());
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setProfile(null);
    goHome();
  };

  const handleProfileSave = async (updated: FamilyProfile) => {
    // The server assigns real UUIDs and returns the canonical list.
    setProfile(await saveChildren(updated.children));
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

  const handleSubscribe = async () => {
    await subscribe();
    setUser(prev => (prev ? { ...prev, subscribed: true } : prev));
    setView(pendingDoctorAction);
  };

  const renderChecker = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* SymptomInput owns "back" while it is mounted (it has inner steps); App only owns it
          on the results screen, where SymptomInput is unmounted. Exactly one back button. */}
      {status === AnalysisStatus.SUCCESS && (
        <button
          onClick={goHome}
          className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-colors"
        >
          {t.input.back}
        </button>
      )}

      {status !== AnalysisStatus.SUCCESS && profile && (
        <SymptomInput
          profile={profile}
          onAnalyze={handleAnalyze}
          isLoading={status === AnalysisStatus.ANALYZING}
          onBack={goHome}
          onEditProfile={() => setView('profile')}
          t={t}
        />
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
    // Restoring the session — don't flash the login screen at a signed-in user.
    if (booting) {
      return (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      );
    }

    // Sign-up / login gates everything
    if (!authed) {
      return <AuthScreen onAuthenticated={handleAuthenticated} currentLang={language} onLanguageChange={setLanguage} t={t} />;
    }

    // First launch: no children registered yet → onboarding takes over every view
    if (!profile || profile.children.length === 0) {
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
            parentName={user?.name ?? ''}
            onCheckSymptoms={() => { resetChecker(); setView('checker'); }}
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
      {authed && (
        <Header
          onLogoClick={goHome}
          onHomeClick={goHome}
          onFaqClick={() => setView('faq')}
          onAboutClick={() => setView('about')}
          onProfileClick={() => setView('profile')}
          onLogoutClick={handleLogout}
          currentLang={language}
          onLanguageChange={setLanguage}
          t={t}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      )}

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
