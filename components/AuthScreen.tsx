import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User as UserIcon, Calendar, Globe } from 'lucide-react';
import { signup, login, isAdult, SessionUser } from '../services/authService';
import { Language } from '../shared/types';

interface AuthScreenProps {
  onAuthenticated: (user: SessionUser, isNewAccount: boolean) => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  t: any;
}

const LANGUAGE_LABELS: Record<Language, string> = { en: 'English', tet: 'Tetun', id: 'Indo' };

type Mode = 'login' | 'signup';

const inputClass = "w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all shadow-sm";
const labelClass = "block text-xs font-black text-slate-400 uppercase tracking-widest mb-2";

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, currentLang, onLanguageChange, t }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const ta = t.auth;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password || (mode === 'signup' && (!name.trim() || !dob))) {
      setError(ta.fieldsRequired);
      return;
    }
    if (mode === 'signup' && password.length < 4) {
      setError(ta.passwordTooShort);
      return;
    }
    // Instant feedback only — the server re-checks this and is the real gate.
    if (mode === 'signup' && !isAdult(dob)) {
      setError(ta.underAge);
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const result = await signup({ name: name.trim(), email: email.trim(), password, dob });
        if (result.status === 'ok') {
          onAuthenticated(result.user, true);
        } else {
          setError(
            result.reason === 'under_age' ? ta.underAge
              : result.reason === 'email_taken' ? ta.emailTaken
              : result.reason === 'network' ? ta.networkError
              : ta.fieldsRequired,
          );
        }
      } else {
        const result = await login(email, password);
        if (result.status === 'ok') {
          onAuthenticated(result.user, false);
        } else {
          setError(result.reason === 'network' ? ta.networkError : ta.invalidCredentials);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 animate-fade-in">
      {/* The Header is hidden until sign-in, so language has to be switchable here too */}
      <div className="flex items-center justify-center gap-1.5 mb-8">
        <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
        {(Object.keys(LANGUAGE_LABELS) as Language[]).map(lang => (
          <button
            key={lang}
            type="button"
            onClick={() => onLanguageChange(lang)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
              ${currentLang === lang
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        ))}
      </div>

      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6">
          <svg className="w-10 h-10 -rotate-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="authLogoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
            <path
              d="M 12 75 L 28 25 L 42 60 L 52 15 L 62 85 L 72 50 L 88 25 L 92 75"
              stroke="url(#authLogoGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{ta.welcomeTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400">
          {mode === 'login' ? ta.loginSubtitle : ta.signupSubtitle}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Mode tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          {([['login', ta.loginTab], ['signup', ta.signupTab]] as [Mode, string][]).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                ${mode === m
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div className="animate-fade-in">
              <label className={labelClass}>{ta.name}</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputClass}
                  placeholder={ta.name}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="animate-fade-in">
              <label className={labelClass}>{ta.dob}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className={inputClass}
                  autoComplete="bday"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{ta.dobHelp}</p>
            </div>
          )}

          <div>
            <label className={labelClass}>{ta.email}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder={ta.email}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{ta.password}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputClass}
                placeholder={ta.password}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center animate-shake font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            {busy ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? ta.loginBtn : ta.signupBtn} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full text-center text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
        >
          {mode === 'login' ? ta.noAccountYet : ta.haveAccount}
        </button>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-600 text-center mt-6 leading-relaxed">
        {ta.demoNote}
      </p>
    </div>
  );
};

export default AuthScreen;
