/**
 * The admin shell. Verification and aggregate counters only — there is deliberately no
 * admin screen anywhere that can reach a child record, a symptom string or a message.
 */
import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { BarChart3, LogOut, ShieldCheck } from 'lucide-react';
import Header from './Header';
import AdminVerificationQueue from './AdminVerificationQueue';
import AdminStats from './AdminStats';
import { MAIN_CLASS, ShellProps } from './shell';

const AdminApp: React.FC<ShellProps> = ({
  language,
  onLanguageChange,
  t,
  darkMode,
  onToggleDarkMode,
  onLogout,
}) => {
  const navigate = useNavigate();
  const ta = t.admin;

  const menuItems = [
    { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', title: ta.verificationTab, subtitle: ta.verificationSubtitle, action: () => navigate('/verification') },
    { icon: <BarChart3 className="w-4 h-4 text-blue-500" />, iconBg: 'bg-blue-50 dark:bg-blue-900/30', title: ta.statsTab, subtitle: ta.statsSubtitle, action: () => navigate('/stats') },
    { icon: <LogOut className="w-4 h-4 text-red-500" />, iconBg: 'bg-red-50 dark:bg-red-900/30', title: t.header.logout, subtitle: t.header.logoutSubtitle, action: onLogout },
  ];

  return (
    <>
      <Header
        onLogoClick={() => navigate('/verification')}
        menuItems={menuItems}
        currentLang={language}
        onLanguageChange={onLanguageChange}
        t={t}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />
      <main className={MAIN_CLASS}>
        <Routes>
          <Route path="/verification" element={<AdminVerificationQueue t={t} />} />
          <Route path="/stats" element={<AdminStats t={t} />} />
          {/* The queue is the admin's home, and '*' also catches parent/doctor URLs that
              survived a role switch — this tree is the only one mounted for an admin. */}
          <Route path="*" element={<Navigate to="/verification" replace />} />
        </Routes>
      </main>
    </>
  );
};

export default AdminApp;
