
import React, { useState, useEffect } from 'react';
import { Lock, User, Loader2, ArrowRight, ChevronRight, History, Stethoscope } from 'lucide-react';
import { loginUser, getStoredUsers } from '../services/authService';
import { User as UserType } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
  onCancel: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
  t: any;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancel, onSwitchToSignup, onForgotPassword, t }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedUsers, setSavedUsers] = useState<UserType[]>([]);

  const tl = t.auth.login;

  useEffect(() => {
    const users = getStoredUsers();
    const sorted = [...users].sort((a, b) => {
      const timeA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
      const timeB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
      return timeB - timeA;
    });
    setSavedUsers(sorted.slice(0, 3));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await loginUser(username, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError(tl.error);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSavedUser = (user: UserType) => {
    setUsername(user.username);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
              <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{tl.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{tl.subtitle}</p>
          </div>

          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
             <Stethoscope className="w-5 h-5 text-blue-500" />
             <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{tl.doctorLogin}</p>
                <p className="text-xs text-slate-500 leading-tight">Doctors can log in using their credentials to access the specialist portal.</p>
             </div>
          </div>

          {savedUsers.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                <History className="w-3 h-3" />
                {tl.recent}
              </div>
              <div className="space-y-3">
                {savedUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => selectSavedUser(u)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 group ${
                      username === u.username 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                      : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="relative">
                      <img 
                        src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} 
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                        alt={u.name}
                      />
                      {u.role === 'Specialist' && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full border border-white">
                          <Stethoscope className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-bold text-sm ${username === u.username ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {u.name}
                      </p>
                      <p className="text-[10px] text-slate-400">@{u.username} • {u.role || 'Patient'}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${username === u.username ? 'text-blue-500 translate-x-1' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                {tl.username}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder={tl.username}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  {tl.password}
                </label>
                <button 
                  type="button" 
                  onClick={onForgotPassword}
                  className="text-[10px] text-blue-600 hover:underline font-bold uppercase tracking-tight"
                >
                  {tl.forgot}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 text-center animate-shake font-medium">
                {error}
              </div>
            )}

            <div className="pt-4 flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{tl.signIn} <ArrowRight className="w-5 h-5" /></>}
              </button>

              <div className="text-center mt-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {tl.noAccount}{' '}
                  <button type="button" onClick={onSwitchToSignup} className="text-blue-600 font-black hover:underline">{tl.createAccount}</button>
                </p>
              </div>
              
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold transition-colors text-xs uppercase tracking-widest"
              >
                {tl.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
