/**
 * The parent/guardian shell. This is a near-verbatim move of what used to be the body of
 * App.tsx — view state, the symptom-checker flow, the onboarding gate and the paywall.
 * It was moved rather than rewritten, so please don't "tidy" it while comparing against
 * git history: the only intentional changes are that this shell now owns its own Header
 * menu and loads the family itself instead of being handed it by App.
 */
import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

/**
 * `?next=` comes back from the paywall and is handed straight to `navigate()`, so it has to
 * be a same-origin path. `//evil.com` is protocol-relative, hence the second check.
 */
const safeNext = (value: string | null) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/doctors';

/**
 * The paywall, re-stated as a route guard.
 *
 * Before routing, no unsubscribed parent could reach the directory at all: every entry point
 * (`handleTalkToDoctor`, `handleBookAppointment`) checked `subscribed` first, and the upsell
 * teaser rendered in ResultsDisplay instead. A typeable URL removes that funnel, so the
 * premium screens have to deny in their own right — otherwise `/doctors` hands an
 * unsubscribed parent exactly the names, photos, facilities, phones and ratings that
 * DoctorUpsell exists to withhold.
 *
 * This is a product boundary, not a security one — see known debt in CLAUDE.md.
 */
const Premium: React.FC<{ subscribed: boolean; children: React.ReactNode }> = ({ subscribed, children }) => {
  const { pathname } = useLocation();
  if (!subscribed) return <Navigate to={`/subscribe?next=${encodeURIComponent(pathname)}`} replace />;
  return <>{children}</>;
};

/**
 * The three premium screens need a `Specialist` object, which lives in memory rather than in
 * the URL. The id in the path keeps the URL honest and makes a later switch to refetch-by-id
 * a change inside this one component; until then, a cold load or a stale id goes back to the
 * directory instead of rendering the wrong doctor. Deliberate: see CLAUDE.md.
 */
const SpecialistRoute: React.FC<{
  subscribed: boolean;
  specialist: Specialist | null;
  render: (specialist: Specialist) => React.ReactNode;
}> = ({ subscribed, specialist, render }) => {
  const { doctorId } = useParams();
  // Subscription first: a specialist can be selected in the directory, so having one is not
  // evidence the paywall was ever satisfied.
  if (!subscribed) return <Premium subscribed={subscribed}>{null}</Premium>;
  if (!specialist || specialist.id !== doctorId) return <Navigate to="/doctors" replace />;
  return <>{render(specialist)}</>;
};

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
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

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

  const subscribed = user.subscribed;

  /**
   * Where to land once the paywall is satisfied, carried in the URL rather than in state so
   * that reloading the paywall does not lose the destination. A full path, not a screen
   * name: the results screen sends the user back to itself, and booking resumes into the
   * calendar for one specific doctor rather than into chat.
   */
  const openPaywall = (destination: string) =>
    navigate(`/subscribe?next=${encodeURIComponent(destination)}`);

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
  // and appears already scrolled halfway down. <ScrollRestoration> is data-router-only, so
  // this stays manual.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, profile]);

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
    navigate('/');
    resetChecker();
  };

  const handleProfileSave = async (updated: FamilyProfile) => {
    // The server assigns real UUIDs and returns the canonical list.
    setProfile(await saveChildren(updated.children));
    navigate('/');
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

    // Without a specialist there is nowhere to send them but the directory — including
    // through the paywall, whose ?next= would otherwise point at a doctor-less path.
    const destination = target ? `/${action}/${target.id}` : '/doctors';
    if (!subscribed) {
      openPaywall(destination);
      return;
    }
    navigate(destination);
  };

  const handleSubscribe = async () => {
    await subscribe();
    onUserChange(prev => ({ ...prev, subscribed: true }));
    // No specialist check here: /chat, /call and /booking each guard themselves and fall
    // back to the directory, so this only has to honour the destination.
    // `replace` so that going back from the destination does not re-enter the paywall.
    navigate(safeNext(searchParams.get('next')), { replace: true });
  };

  const handleBookAppointment = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    if (!subscribed) {
      openPaywall(`/booking/${specialist.id}`);
      return;
    }
    navigate(`/booking/${specialist.id}`);
  };

  const menuItems = [
    { icon: <Home className="w-4 h-4 text-emerald-500" />, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', title: t.header.howItWorks, subtitle: t.header.howItWorksSubtitle, action: goHome },
    { icon: <Info className="w-4 h-4 text-blue-500" />, iconBg: 'bg-blue-50 dark:bg-blue-900/30', title: t.header.aboutMenuTitle, subtitle: t.header.aboutMenuSubtitle, action: () => navigate('/about') },
    { icon: <HelpCircle className="w-4 h-4 text-purple-500" />, iconBg: 'bg-purple-50 dark:bg-purple-900/30', title: t.header.faq, subtitle: t.header.faqSubtitle, action: () => navigate('/faq') },
    { icon: <CalendarClock className="w-4 h-4 text-blue-500" />, iconBg: 'bg-blue-50 dark:bg-blue-900/30', title: t.booking.upcomingTitle, subtitle: t.header.appointmentsSubtitle, action: () => navigate('/appointments') },
    { icon: <Users className="w-4 h-4 text-orange-500" />, iconBg: 'bg-orange-50 dark:bg-orange-900/30', title: t.header.editProfile, subtitle: t.header.editProfileSubtitle, action: () => navigate('/profile') },
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
          onEditProfile={() => navigate('/profile')}
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
            onFindFacilities={() => navigate('/facilities')}
            // Subscribing from here returns to the results, with the list revealed in place.
            onSubscribe={() => openPaywall('/checker')}
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

    const family = profile;

    return (
      <Routes>
        <Route path="/about" element={<About onBack={goHome} language={language} t={t} />} />
        <Route path="/faq" element={<FAQ onBack={goHome} t={t} />} />
        <Route
          path="/profile"
          element={<FamilyProfileSetup existingProfile={family} onSave={handleProfileSave} onCancel={goHome} t={t} />}
        />
        <Route path="/checker" element={renderChecker()} />
        <Route
          path="/vaccines"
          element={<VaccinationSchedule profile={family} t={t} onBack={goHome} onEditProfile={() => navigate('/profile')} />}
        />
        <Route path="/facilities" element={<FacilityFinder t={t} onBack={goHome} />} />
        <Route
          path="/subscribe"
          element={<SubscriptionPaywall t={t} onSubscribe={handleSubscribe} onCancel={goHome} />}
        />
        <Route
          path="/doctors"
          element={
            <Premium subscribed={subscribed}>
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
            </Premium>
          }
        />
        <Route
          path="/booking/:doctorId"
          element={
            <SpecialistRoute
              subscribed={subscribed}
              specialist={selectedSpecialist}
              render={(specialist) => (
                <BookingCalendar
                  specialist={specialist}
                  profile={family}
                  t={t}
                  onBack={() => navigate('/doctors')}
                  // `replace` so Back cannot return to a calendar whose slot is now taken —
                  // the (doctor_id, starts_at) unique index would reject the rebook with a
                  // confusing error rather than an explanation.
                  onBooked={() => navigate('/appointments', { replace: true })}
                />
              )}
            />
          }
        />
        <Route path="/appointments" element={<AppointmentList t={t} viewer="parent" onBack={goHome} />} />
        <Route
          path="/chat/:doctorId"
          element={
            <SpecialistRoute
              subscribed={subscribed}
              specialist={selectedSpecialist}
              render={(specialist) =>
                family.children[0] ? (
                  <DoctorChat
                    t={t}
                    specialist={specialist}
                    childId={family.children[0].id}
                    onStartCall={() => navigate(`/call/${specialist.id}`)}
                    // Kept as an explicit destination rather than navigate(-1): ending a call
                    // replaces /call with /chat, so the previous history entry is /chat too
                    // and Back would appear to do nothing. The condition is the original
                    // rule — don't discard an analysis the parent is still reading.
                    onBack={() => navigate(status === AnalysisStatus.SUCCESS ? '/checker' : '/')}
                  />
                ) : null
              }
            />
          }
        />
        <Route
          path="/call/:doctorId"
          element={
            <SpecialistRoute
              subscribed={subscribed}
              specialist={selectedSpecialist}
              render={(specialist) => (
                <DoctorCall
                  t={t}
                  specialist={specialist}
                  // `replace` so that backing out of chat does not re-enter the call.
                  onEnd={() => navigate(`/chat/${specialist.id}`, { replace: true })}
                />
              )}
            />
          }
        />
        <Route
          path="/"
          element={
            <Dashboard
              profile={family}
              parentName={user.name}
              onCheckSymptoms={() => { resetChecker(); navigate('/checker'); }}
              onOpenVaccines={() => navigate('/vaccines')}
              onTalkToDoctor={() => handleTalkToDoctor(null, 'chat')}
              onOpenFacilities={() => navigate('/facilities')}
              t={t}
            />
          }
        />
        {/* Also catches doctor/admin URLs left over from a previous session in this tab. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
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
