import type { ReactNode } from 'react';
import type { Language } from '../shared/types';
import type { SessionUser } from '../services/authService';

/**
 * A role shell owns its own navigation. A doctor has no "Family Profile" and an admin has
 * neither that nor the FAQ, so the header menu is supplied per shell rather than being a
 * fixed list of onXClick props.
 */
export interface HeaderMenuItem {
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  action: () => void;
}

/**
 * What App passes down to whichever shell matches the signed-in role. App owns the
 * session, language and theme; the shell owns everything below the header.
 */
export interface ShellProps {
  user: SessionUser;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  t: any;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

/** Shared by every shell's <main>, so the footer keeps sitting at the bottom. */
export const MAIN_CLASS = 'flex-grow container mx-auto px-4 py-8 sm:py-12';
