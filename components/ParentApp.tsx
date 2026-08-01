/**
 * The parent/guardian shell. This is a near-verbatim move of what used to be the body of
 * App.tsx — view state, the symptom-checker flow, the onboarding gate and the paywall.
 * It was moved rather than rewritten, so please don't "tidy" it while comparing against
 * git history: the only intentional changes are that this shell now owns its own Header
 * menu and loads the family itself instead of being handed it by App.
 */
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CalendarClock, HelpCircle, Home, Info, Loader2, LogOut, PhoneCall, Users } from 'lucide-react';
import Header from './Header';
import Dashboard from './Dashboard';
import DoctorDirectory from './DoctorDirectory';
import BookingCalendar from './BookingCalendar';
import AppointmentList from './AppointmentList';
import FamilyProfileSetup from './FamilyProfileSetup';
import SymptomInput from './SymptomInput';
import ResultsDisplay from './ResultsDisplay';
import VaccinationSchedule from './VaccinationSchedule';
import FacilityFinder from './FacilityFinder';
import DoctorChat from './DoctorChat';
import DoctorCall from './DoctorCall';
import SubscriptionPaywall from './SubscriptionPaywall';
import About from './About';
import FAQ from './FAQ';
import { MAIN_CLASS, ShellProps } from './shell';
import { analyzeSymptoms, translateAnalysisResult } from '../services/analysisService';
import { fetchChildren, saveChildren } from '../services/profileService';
import { subscribe, SessionUser } from '../services/authService';
import {
  AnalysisResult,
  AnalysisStatus,
  AnalyzeRequest,
  Language,
  FamilyProfile,
  Specialist,
} from '../shared/types';

type ViewState =
  | 'home' | 'about' | 'faq' | 'profile'
  | 'checker' | 'vaccines' | 'facilities' | 'doctors'
  | 'booking' | 'appointments'
  | 'chat' | 'call' | 'subscribe';

interface ParentAppProps extends ShellProps {
  onUserChange: (updater: (prev: SessionUser) => SessionUser) => void;
}

const ParentApp: React.FC<ParentAppProps> = ({
  user,
  language,
  onLanguageChange,
  t,
  darkMode,
  onToggleDarkMode,
  onLogout,
  onUserChange,
}) => {
  const [view, setView] = useState<ViewState>('home');
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  // Separate from `profile` being null: without this the onboarding screen flashes on
  // every reload before the children have loaded.
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);

  const [contentLanguage, setContentLanguage] = useState<Language>('tet');
  const [isTranslating, setIsTranslating] = useState(false);

  /**
   * Where to land once the paywall is satisfied. A plain ViewState rather than the
   * 'chat' | 'call' pair it replaced: the results screen needs to send the user back to
   * itself, and booking needs to resume into the calendar rather than into chat.
   */
  const [afterSubscribe, setAfterSubscribe] = useState<ViewState>('doctors');

  const subscribed = user.subscribed;

  const openPaywall = (destination: ViewState) => {
    setAfterSubscribe(destination);
    setView('subscribe');
  };

  useEffect(() => {
    (async () => {
      try {
        setProfile(await fetchChildren());
      } catch (e) {
        console.error('Loading the family failed', e);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  // Screens swap in place, so without this a new screen inherits the previous scroll offset
  // and appears already scrolled halfway down.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, profile]);

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

  const handleProfileSave = async (updated: FamilyProfile) => {
    // The server assigns real UUIDs and returns the canonical list.
    setProfile(await saveChildren(updated.children));
    setView('home');
  };

  /**
   * Doctor access is the premium feature, with no exceptions — an emergency routes to the
   * facility finder instead (see the banner in ResultsDisplay), which is free and is the
   * right advice for a danger sign anyway.
   *
   * With MOCK_SPECIALISTS gone there is no doctor to fall back to, so a null specialist
   * routes to the directory to pick one rather than silently landing on whoever happened
   * to be first in a hardcoded array.
   */
  const handleTalkToDoctor = (specialist: Specialist | null, action: 'chat' | 'call' = 'chat') => {
    const target = specialist ?? selectedSpecialist;
    if (specialist) setSelectedSpecialist(specialist);

    if (!subscribed) {
      openPaywall(action);
      return;
    }
    setView(target ? action : 'doctors');
  };

  const handleSubscribe = async () => {
    await subscribe();
    onUserChange(prev => ({ ...prev, subscribed: true }));
    // 'chat' and 'call' both need a specialist; fall back to the directory if there is none.
    const needsSpecialist = afterSubscribe === 'chat' || afterSubscribe === 'call' || afterSubscribe === 'booking';
    setView(needsSpecialist && !selectedSpecialist ? 'doctors' : afterSubscribe);
  };

  const handleBookAppointment = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    if (!subscribed) {
      openPaywall('booking');
      return;
    }
    setView('booking');
  };

  const menuItems = [
    { icon: <Home className="w-4 h-4 text-emerald-500" />, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', title: t.header.howItWorks, subtitle: t.header.howItWorksSubtitle, action: goHome },
    { icon: <Info className="w-4 h-4 text-blue-500" />, iconBg: 'bg-blue-50 dark:bg-blue-900/30', title: t.header.aboutMenuTitle, subtitle: t.header.aboutMenuSubtitle, action: () => setView('about') },
    { icon: <HelpCircle className="w-4 h-4 text-purple-500" />, iconBg: 'bg-purple-50 dark:bg-purple-900/30', title: t.header.faq, subtitle: t.header.faqSubtitle, action: () => setView('faq') },
    { icon: <CalendarClock className="w-4 h-4 text-blue-500" />, iconBg: 'bg-blue-50 dark:bg-blue-900/30', title: t.booking.upcomingTitle, subtitle: t.header.appointmentsSubtitle, action: () => setView('appointments') },
    { icon: <Users className="w-4 h-4 text-orange-500" />, iconBg: 'bg-orange-50 dark:bg-orange-900/30', title: t.header.editProfile, subtitle: t.header.editProfileSubtitle, action: () => setView('profile') },
    { icon: <LogOut className="w-4 h-4 text-red-500" />, iconBg: 'bg-red-50 dark:bg-red-900/30', title: t.header.logout, subtitle: t.header.logoutSubtitle, action: onLogout },
  ];

  const renderChecker = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* SymptomInput owns "back" while it is mounted (it has inner steps); this shell only
          owns it on the results screen, where SymptomInput is unmounted. Exactly one back button. */}
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
            subscribed={subscribed}
            selectedSpecialist={selectedSpecialist}
            onSpecialistSelect={setSelectedSpecialist}
            onTalkToDoctor={(s) => handleTalkToDoctor(s, 'call')}
            onBookAppointment={handleBookAppointment}
            onFindFacilities={() => setView('facilities')}
            // Subscribing from here returns to the results, with the list revealed in place.
            onSubscribe={() => openPaywall('checker')}
          />
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loadingProfile) {
      return (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      );
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
      case 'doctors':
        return (
          <DoctorDirectory
            t={t}
            heading={t.home.cards.doctor}
            onBack={goHome}
            selectedSpecialist={selectedSpecialist}
            onSpecialistSelect={setSelectedSpecialist}
            renderAction={(specialist) => (
              <>
                <button
                  onClick={() => handleBookAppointment(specialist)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-[0.95]"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  {t.booking.bookAppointment}
                </button>
                <button
                  onClick={() => handleTalkToDoctor(specialist, 'chat')}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  {t.results.talkToDoctor}
                </button>
              </>
            )}
          />
        );
      case 'booking':
        // Guarded: 'booking' is only ever reached through handleBookAppointment, which
        // always sets a specialist first. The fallback keeps the type honest anyway.
        return selectedSpecialist ? (
          <BookingCalendar
            specialist={selectedSpecialist}
            profile={profile}
            t={t}
            onBack={() => setView('doctors')}
            onBooked={() => setView('appointments')}
          />
        ) : null;
      case 'appointments':
        return <AppointmentList t={t} viewer="parent" onBack={goHome} />;
      case 'chat':
        // returning from the doctor keeps an existing analysis on screen instead of discarding it
        return selectedSpecialist && profile.children[0] ? (
          <DoctorChat
            t={t}
            specialist={selectedSpecialist}
            childId={profile.children[0].id}
            onStartCall={() => setView('call')}
            onBack={() => setView(status === AnalysisStatus.SUCCESS ? 'checker' : 'home')}
          />
        ) : null;
      case 'call':
        return selectedSpecialist ? (
          <DoctorCall t={t} specialist={selectedSpecialist} onEnd={() => setView('chat')} />
        ) : null;
      case 'home':
      default:
        return (
          <Dashboard
            profile={profile}
            parentName={user.name}
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
    <>
      <Header
        onLogoClick={goHome}
        menuItems={menuItems}
        currentLang={language}
        onLanguageChange={onLanguageChange}
        t={t}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />
      <main className={MAIN_CLASS}>{renderContent()}</main>
    </>
  );
};

export default ParentApp;
