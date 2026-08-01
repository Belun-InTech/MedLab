import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Info,
  HelpCircle,
  Globe,
  Sun,
  Moon,
  Home,
  Users,
  LogOut
} from 'lucide-react';
import { Language } from '../shared/types';

interface HeaderProps {
  onLogoClick: () => void;
  onHomeClick: () => void;
  onFaqClick: () => void;
  onAboutClick: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  t: any;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onLogoClick,
  onHomeClick,
  onFaqClick,
  onAboutClick,
  onProfileClick,
  onLogoutClick,
  currentLang,
  onLanguageChange,
  t,
  darkMode,
  onToggleDarkMode
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languageLabels = {
    en: 'English',
    tet: 'Tetum',
    id: 'Indo'
  };

  const menuItems = [
    { icon: <Home className="w-4 h-4 text-emerald-500" />, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', title: t.header.howItWorks, subtitle: t.header.howItWorksSubtitle, action: onHomeClick },
    { icon: <Info className="w-4 h-4 text-blue-500" />, iconBg: 'bg-blue-50 dark:bg-blue-900/30', title: t.header.aboutMenuTitle, subtitle: t.header.aboutMenuSubtitle, action: onAboutClick },
    { icon: <HelpCircle className="w-4 h-4 text-purple-500" />, iconBg: 'bg-purple-50 dark:bg-purple-900/30', title: t.header.faq, subtitle: t.header.faqSubtitle, action: onFaqClick },
    { icon: <Users className="w-4 h-4 text-orange-500" />, iconBg: 'bg-orange-50 dark:bg-orange-900/30', title: t.header.editProfile, subtitle: t.header.editProfileSubtitle, action: onProfileClick },
    { icon: <LogOut className="w-4 h-4 text-red-500" />, iconBg: 'bg-red-50 dark:bg-red-900/30', title: t.header.logout, subtitle: t.header.logoutSubtitle, action: onLogoutClick },
  ];

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity focus:outline-none flex-shrink-0"
          >
            <svg className="w-8 h-8 sm:w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
               <defs>
                 <linearGradient id="headerLogoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#2563eb" />
                   <stop offset="100%" stopColor="#4f46e5" />
                 </linearGradient>
               </defs>
               <path
                 d="M 12 75 L 28 25 L 42 60 L 52 15 L 62 85 L 72 50 L 88 25 L 92 75"
                 stroke="url(#headerLogoGradient)"
                 strokeWidth="8"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               />
            </svg>
            <span className="text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight font-['Baumans']">
              Médiku <span className="text-blue-600">Labarik</span>
            </span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-3">
             {/* Menu Dropdown */}
             <div className="relative" ref={menuRef}>
               <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center justify-center p-2.5 rounded-xl border transition-all active:scale-95 shadow-sm
                  ${isMenuOpen
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                aria-label="Toggle menu"
               >
                 <Menu className="w-5 h-5" />
               </button>

               {isMenuOpen && (
                 <div className="absolute right-0 top-full pt-3 w-64 animate-fade-in z-[60]">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 overflow-hidden">
                       {/* Language Selector inside Menu for mobile visibility */}
                       <div className="px-4 py-2 mb-2 border-b border-slate-50 dark:border-slate-700 sm:hidden">
                         <div className="flex items-center gap-2 mb-2">
                           <Globe className="w-3.5 h-3.5 text-slate-400" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.header.language}</span>
                         </div>
                         <div className="flex gap-1.5">
                           {(['en', 'tet', 'id'] as Language[]).map(lang => (
                             <button
                               key={lang}
                               onClick={() => onLanguageChange(lang)}
                               className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1
                                 ${currentLang === lang
                                   ? 'bg-blue-600 text-white'
                                   : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                 }`}
                             >
                               {languageLabels[lang]}
                             </button>
                           ))}
                         </div>
                       </div>

                       {menuItems.map((item, i) => (
                         <button
                          key={i}
                          onClick={() => { item.action(); setIsMenuOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors group"
                         >
                            <div className={`p-2 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors ${item.iconBg}`}>
                              {item.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold">{item.title}</span>
                              <span className="text-[10px] text-slate-400">{item.subtitle}</span>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>
               )}
             </div>

            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Selector - Visible on larger screens, hidden on mobile (moved to menu) */}
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-bold text-xs uppercase border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                <Globe className="w-4 h-4" />
                <span>{currentLang}</span>
              </button>
              <div className="absolute right-0 top-full pt-2 w-32 hidden group-hover:block animate-fade-in z-50">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2">
                  {(['en', 'tet', 'id'] as Language[]).map(lang => (
                    <button
                      key={lang}
                      onClick={() => onLanguageChange(lang)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${currentLang === lang ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      {languageLabels[lang]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
