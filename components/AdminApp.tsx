/**
 * The admin shell. Verification and aggregate counters only — there is deliberately no
 * admin screen anywhere that can reach a child record, a symptom string or a message.
 */
import React, { useState } from 'react';
import { BarChart3, LogOut, ShieldCheck } from 'lucide-react';
import Header from './Header';
import AdminVerificationQueue from './AdminVerificationQueue';
import AdminStats from './AdminStats';
import { MAIN_CLASS, ShellProps } from './shell';

type AdminView = 'verification' | 'stats';

const AdminApp: React.FC<ShellProps> = ({
  language,
  onLanguageChange,
  t,
  darkMode,
  onToggleDarkMode,
  onLogout,
}) => {
  const [view, setView] = useState<AdminView>('verification');
  const ta = t.admin;

  const menuItems = [
    { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', title: ta.verificationTab, subtitle: ta.verificationSubtitle, action: () => setView('verification') },
    { icon: <BarChart3 className="w-4 h-4 text-blue-500" />, iconBg: 'bg-blue-50 dark:bg-blue-900/30', title: ta.statsTab, subtitle: ta.statsSubtitle, action: () => setView('stats') },
    { icon: <LogOut className="w-4 h-4 text-red-500" />, iconBg: 'bg-red-50 dark:bg-red-900/30', title: t.header.logout, subtitle: t.header.logoutSubtitle, action: onLogout },
  ];

  return (
    <>
      <Header
        onLogoClick={() => setView('verification')}
        menuItems={menuItems}
        currentLang={language}
        onLanguageChange={onLanguageChange}
        t={t}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />
      <main className={MAIN_CLASS}>
        {view === 'verification' ? <AdminVerificationQueue t={t} /> : <AdminStats t={t} />}
      </main>
    </>
  );
};

export default AdminApp;
