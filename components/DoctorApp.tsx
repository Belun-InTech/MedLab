/**
 * The doctor shell. Shares nothing with the parent shell by design — a doctor has no
 * children, no symptom checker and no paywall — so it owns its own view union and header
 * menu rather than adding role checks to the parent's switch.
 */
import React, { useState } from 'react';
import { BadgeCheck, CalendarClock, CalendarDays, ChevronRight, HelpCircle, Home, Info, LogOut, Languages, MapPin, Phone, Star } from 'lucide-react';
import Header from './Header';
import About from './About';
import FAQ from './FAQ';
import DoctorAvatar from './DoctorAvatar';
import DoctorPendingScreen from './DoctorPendingScreen';
import DoctorAvailabilityEditor from './DoctorAvailabilityEditor';
import AppointmentList from './AppointmentList';
import DoctorAppointmentDetail from './DoctorAppointmentDetail';
import { MAIN_CLASS, ShellProps } from './shell';
import { Appointment, DoctorProfile } from '../shared/types';

type DoctorView = 'home' | 'about' | 'faq' | 'availability' | 'schedule' | 'consult';

const DoctorApp: React.FC<ShellProps> = ({
  user,
  language,
  onLanguageChange,
  t,
  darkMode,
  onToggleDarkMode,
  onLogout,
}) => {
  const [view, setView] = useState<DoctorView>('home');
  // Kept locally so the profile card reflects a slot-length change immediately, without
  // re-fetching the whole session just to move one number.
  const [slotMinutes, setSlotMinutes] = useState(user.doctor?.slotMinutes ?? 30);
  const [consult, setConsult] = useState<Appointment | null>(null);
  const doctor = user.doctor;
  const td = t.doctorPortal;

  const goHome = () => setView('home');

  const menuItems = [
    { icon: <Home className="w-4 h-4 text-emerald-500" />, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', title: td.portalTitle, subtitle: td.portalSubtitle, action: goHome },
    { icon: <CalendarDays className="w-4 h-4 text-emerald-500" />, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', title: td.scheduleTitle, subtitle: td.scheduleMenuSubtitle, action: () => setView('schedule') },
    { icon: <CalendarClock className="w-4 h-4 text-blue-500" />, iconBg: 'bg-blue-50 dark:bg-blue-900/30', title: td.availabilityTitle, subtitle: td.availabilityMenuSubtitle, action: () => setView('availability') },
    { icon: <Info className="w-4 h-4 text-blue-500" />, iconBg: 'bg-blue-50 dark:bg-blue-900/30', title: t.header.aboutMenuTitle, subtitle: t.header.aboutMenuSubtitle, action: () => setView('about') },
    { icon: <HelpCircle className="w-4 h-4 text-purple-500" />, iconBg: 'bg-purple-50 dark:bg-purple-900/30', title: t.header.faq, subtitle: t.header.faqSubtitle, action: () => setView('faq') },
    { icon: <LogOut className="w-4 h-4 text-red-500" />, iconBg: 'bg-red-50 dark:bg-red-900/30', title: t.header.logout, subtitle: t.header.logoutSubtitle, action: onLogout },
  ];

  const renderContent = () => {
    // Same position in the flow as the parent shell's child-onboarding gate: an
    // unapproved doctor sees exactly one screen and nothing else.
    if (!doctor || doctor.status !== 'approved') {
      return (
        <DoctorPendingScreen
          status={doctor?.status ?? 'pending'}
          reason={doctor?.rejectionReason ?? null}
          name={user.name}
          t={t}
          onLogout={onLogout}
        />
      );
    }

    switch (view) {
      case 'about':
        return <About onBack={goHome} language={language} t={t} />;
      case 'faq':
        return <FAQ onBack={goHome} t={t} />;
      case 'availability':
        return <DoctorAvailabilityEditor t={t} onBack={goHome} onSaved={setSlotMinutes} />;
      case 'schedule':
        return (
          <AppointmentList
            t={t}
            viewer="doctor"
            onBack={goHome}
            onOpen={(appointment) => { setConsult(appointment); setView('consult'); }}
          />
        );
      case 'consult':
        return consult ? (
          <DoctorAppointmentDetail appointment={consult} t={t} onBack={() => setView('schedule')} />
        ) : null;
      case 'home':
      default:
        return (
          <DoctorHome
            doctor={{ ...doctor, slotMinutes }}
            name={user.name}
            t={t}
            onOpenAvailability={() => setView('availability')}
            onOpenSchedule={() => setView('schedule')}
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

interface DoctorHomeProps {
  doctor: DoctorProfile;
  name: string;
  t: any;
  onOpenAvailability: () => void;
  onOpenSchedule: () => void;
}

const DoctorHome: React.FC<DoctorHomeProps> = ({ doctor, name, t, onOpenAvailability, onOpenSchedule }) => {
  const td = t.doctorPortal;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{td.portalTitle}</p>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{name}</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-5">
          <DoctorAvatar name={name} photoUrl={doctor.photoUrl} size="lg" />

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-blue-600">
                {t.specialistNames?.[doctor.specialty] ?? doctor.specialty}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                <BadgeCheck className="w-3 h-3" />
                {td.verified}
              </span>
            </div>

            <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {doctor.facilityName}</p>
              {doctor.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {doctor.phone}</p>}
              <p className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-slate-400" />
                {doctor.languages.map((l) => t.spokenLanguages?.[l] ?? l).join(' · ')}
              </p>
              {doctor.ratingAvg !== null && (
                <p className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  {doctor.ratingAvg.toFixed(1)} ({doctor.ratingCount})
                </p>
              )}
            </div>

            {doctor.bio && <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">{doctor.bio}</p>}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{td.licenseNumber}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{doctor.licenseNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{td.slotLength}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{doctor.slotMinutes} min</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <PortalCard
          icon={<CalendarDays className="w-6 h-6 text-emerald-600" />}
          iconBg="bg-emerald-50 dark:bg-emerald-900/30"
          title={td.scheduleTitle}
          subtitle={td.scheduleMenuSubtitle}
          onClick={onOpenSchedule}
        />
        <PortalCard
          icon={<CalendarClock className="w-6 h-6 text-blue-600" />}
          iconBg="bg-blue-50 dark:bg-blue-900/30"
          title={td.availabilityTitle}
          subtitle={td.availabilityMenuSubtitle}
          onClick={onOpenAvailability}
        />
      </div>
    </div>
  );
};

const PortalCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}> = ({ icon, iconBg, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-4 text-left hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
  >
    <div className={`p-3 rounded-2xl ${iconBg}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <h3 className="font-black text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
  </button>
);

export default DoctorApp;
