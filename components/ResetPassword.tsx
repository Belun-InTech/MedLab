import React, { useState } from 'react';
import { Mail, User, Lock, Loader2, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { findUserForRecovery, resetUserPassword } from '../services/authService';
import { User as UserType } from '../types';

interface ResetPasswordProps {
  onSuccess: () => void;
  onCancel: () => void;
  t: any;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onSuccess, onCancel, t }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [foundUser, setFoundUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const tr = t.auth.reset;

  const handleIdentityCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const user = await findUserForRecovery(username, email);
    if (user) {
      setFoundUser(user);
      setStep(2);
    } else {
      setError(t.error);
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(tr.mismatch);
      return;
    }
    if (newPassword.length < 5) {
      setError(tr.length);
      return;
    }

    setIsLoading(true);
    setError('');
    
    if (foundUser) {
      const success = await resetUserPassword(foundUser.id, newPassword);
      if (success) {
        setStep(3);
        setTimeout(onSuccess, 3000);
      } else {
        setError(t.error);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8">
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{tr.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{tr.subtitle}</p>
              </div>

              <form onSubmit={handleIdentityCheck} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.auth.login.username}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                      placeholder={t.auth.login.username}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.auth.signup.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                      placeholder="your-email@example.com"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 text-center">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : tr.findAccount}
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full py-2.5 text-slate-400 hover:text-slate-600 text-sm font-medium"
                  >
                    {tr.backToLogin}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && foundUser && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-white">
                  <img src={foundUser.avatar} alt="User" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{tr.hello}, {foundUser.firstName}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{tr.subtitle}</p>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{tr.newPass}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{tr.confirmPass}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 text-center">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : tr.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-2.5 text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> {tr.notYourAccount}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{tr.successTitle}</h2>
              <p className="text-slate-600 dark:text-slate-400">{tr.successDesc}</p>
              <button 
                onClick={onSuccess}
                className="mt-6 px-8 py-2 bg-blue-600 text-white rounded-lg font-bold"
              >
                {tr.goNow}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;