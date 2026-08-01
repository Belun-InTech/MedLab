import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  ChevronDown, 
  Info, 
  HelpCircle, 
  Settings, 
  History, 
  LogOut, 
  LogIn, 
  Globe, 
  Sun, 
  Moon,
  PlayCircle,
  User as UserIcon,
  Languages
} from 'lucide-react';
import { Language, User } from '../types';

interface HeaderProps {
  onLogoClick: () => void;
  onHomeClick: () => void;
  onFaqClick: () => void;
  onAboutClick: () => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  t: any;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onHistoryClick: () => void;
  onProfileClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onLogoClick, 
  onHomeClick, 
  onFaqClick, 
  onAboutClick,
  currentLang, 
  onLanguageChange, 
  t,
  user,
  onLoginClick,
  onLogoutClick,
  onHistoryClick,
  onProfileClick,
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
              MurakMed <span className="text-blue-600">AI</span>
            </span>
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-3">
             {/* Menu Dropdown - The primary controller on mobile */}
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
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Language</span>
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

                       <button 
                        onClick={() => { onAboutClick(); setIsMenuOpen(false); }} 
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors group"
                       >
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:bg-white transition-colors">
                            <Info className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">{t.header.aboutMenuTitle}</span>
                            <span className="text-[10px] text-slate-400">{t.header.aboutMenuSubtitle}</span>
                          </div>
                       </button>

                       <button 
                        onClick={() => { onHomeClick(); setIsMenuOpen(false); }} 
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors group"
                       >
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl group-hover:bg-white transition-colors">
                            <PlayCircle className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">{t.header.howItWorks}</span>
                            <span className="text-[10px] text-slate-400">Step-by-step guide</span>
                          </div>
                       </button>

                       <button 
                        onClick={() => { onFaqClick(); setIsMenuOpen(false); }} 
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors group"
                       >
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl group-hover:bg-white transition-colors">
                            <HelpCircle className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">{t.header.faq}</span>
                            <span className="text-[10px] text-slate-400">Common questions</span>
                          </div>
                       </button>

                       {user ? (
                         <div className="border-t border-slate-100 dark:border-slate-700 mt-2">
                            <div className="px-4 py-2 sm:hidden bg-slate-50 dark:bg-slate-900/50 mb-1">
                               <p className="text-[10px] text-slate-400 uppercase font-bold">{user.name}</p>
                            </div>
                            <button 
                              onClick={() => { onProfileClick(); setIsMenuOpen(false); }} 
                              className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                               <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl">
                                 <Settings className="w-4 h-4 text-slate-500" />
                               </div>
                               <span className="font-bold">Profile Settings</span>
                            </button>
                            <button 
                              onClick={() => { onHistoryClick(); setIsMenuOpen(false); }} 
                              className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                               <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                                 <History className="w-4 h-4 text-orange-500" />
                               </div>
                               <span className="font-bold">Medical History</span>
                            </button>
                            <button 
                              onClick={() => { onLogoutClick(); setIsMenuOpen(false); }} 
                              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                            >
                               <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-xl">
                                 <LogOut className="w-4 h-4 text-red-600" />
                               </div>
                               <span className="font-bold">Logout</span>
                            </button>
                         </div>
                       ) : (
                         <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 mt-2">
                           <button 
                             onClick={() => { onLoginClick(); setIsMenuOpen(false); }}
                             className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                           >
                             <LogIn className="w-4 h-4" /> Sign In
                           </button>
                         </div>
                       )}
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

            {/* Profile Avatar - Only shown on larger screens, mobile version is in menu */}
            {user && (
              <div className="relative group hidden sm:block">
                 <button 
                  onClick={onProfileClick}
                  className="flex items-center gap-2 pl-1 pr-1 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors shadow-sm"
                 >
                    <img 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                      alt="User" 
                      className="w-8 h-8 rounded-full object-cover border border-white dark:border-slate-900 shadow-sm"
                    />
                 </button>
                 <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block animate-fade-in z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2">
                       <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Signed in as</p>
                          <p className="font-bold text-slate-900 dark:text-white truncate">{user.username}</p>
                       </div>
                       <button onClick={onProfileClick} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors">
                          <Settings className="w-4 h-4 text-slate-400" /> <span>Profile Settings</span>
                       </button>
                       <button onClick={onHistoryClick} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors">
                          <History className="w-4 h-4 text-slate-400" /> <span>Medical History</span>
                       </button>
                       <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                          <button onClick={onLogoutClick} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors">
                             <LogOut className="w-4 h-4" /> <span>Logout</span>
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {!user && (
              <button 
                onClick={onLoginClick}
                className="hidden sm:flex items-center gap-2 px-5 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;