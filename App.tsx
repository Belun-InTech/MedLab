import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import ParentApp from './components/ParentApp';
import DoctorApp from './components/DoctorApp';
import AdminApp from './components/AdminApp';
import { MAIN_CLASS, ShellProps } from './components/shell';
import { fetchSession, logout, SessionUser } from './services/authService';
import { Language } from './shared/types';
import { TRANSLATIONS } from './constants/translations';

/**
 * App owns only what every role shares: the session, the UI language, the theme, and the
 * page frame. Everything below the header belongs to a role shell.
 *
 * Routing lives one level down: each shell mounts its own `<Routes>`, because only one
 * role's tree is ever rendered and a doctor has no business owning a `/checker` path.
 * App does not route — it decides *which* route tree exists.
 */
const App: React.FC = () => {
  const navigate = useNavigate();

  // null while the session is still being restored — avoids flashing the login screen
  // at an already signed-in user on every reload.
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [language, setLanguage] = useState<Language>('tet');

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

  // Restore the session (httpOnly cookie) on boot.
  useEffect(() => {
    (async () => {
      try {
        setUser(await fetchSession());
      } catch (e) {
        console.error('Session restore failed', e);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    // Without this the next sign-in resumes at whatever deep URL the previous session left
    // behind — and that URL may not even exist in the next user's role tree.
    navigate('/', { replace: true });
  };

  const renderBody = () => {
    if (booting) {
      return (
        <main className={MAIN_CLASS}>
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        </main>
      );
    }

    if (!user) {
      return (
        <main className={MAIN_CLASS}>
          <AuthScreen
            onAuthenticated={setUser}
            currentLang={language}
            onLanguageChange={setLanguage}
            t={t}
          />
        </main>
      );
    }

    const shell: ShellProps = {
      user,
      language,
      onLanguageChange: setLanguage,
      t,
      darkMode,
      onToggleDarkMode: () => setDarkMode(!darkMode),
      onLogout: handleLogout,
    };

    // One branch, three self-contained apps. A doctor has no children and no symptom
    // checker, so sharing one switch would mean sprinkling role checks through twenty
    // cases and hoping none is ever forgotten — that class of miss is a security bug.
    switch (user.role) {
      case 'doctor':
        return <DoctorApp {...shell} />;
      case 'admin':
        return <AdminApp {...shell} />;
      default:
        return (
          <ParentApp
            {...shell}
            onUserChange={(update) => setUser((prev) => (prev ? update(prev) : prev))}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {renderBody()}

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
