import React, { useState, useRef } from 'react';
import { User, Mail, Lock, Camera, Loader2, ArrowRight, X } from 'lucide-react';
import { signupUser } from '../services/authService';
import { User as UserType } from '../types';

interface SignupProps {
  onSignupSuccess: (user: UserType) => void;
  onCancel: () => void;
  onSwitchToLogin: () => void;
  t: any;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess, onCancel, onSwitchToLogin, t }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    dob: '',
    sex: '' as 'Male' | 'Female' | 'Other' | ''
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ts = t.auth.signup;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await signupUser({ ...formData, avatar: avatar || undefined });
      if (user) {
        onSignupSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || ts.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8 animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{ts.title}</h2>
            <p className="text-slate-600 dark:text-slate-400">{ts.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {avatar && (
                   <button
                    type="button"
                    onClick={() => setAvatar(null)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                   >
                     <X className="w-3 h-3" />
                   </button>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
              <span className="text-xs text-slate-500">{ts.uploadPhoto}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{ts.firstName}</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  placeholder={ts.firstName}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{ts.lastName}</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  placeholder={ts.lastName}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{ts.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{ts.username}</label>
                  <input 
                    type="text" 
                    name="username" 
                    value={formData.username} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    placeholder={ts.username}
                    required
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{ts.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{ts.dob}</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{ts.sex}</label>
                <select 
                  name="sex" 
                  value={formData.sex} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  required
                >
                  <option value="">{t.input.sexOptions.select}</option>
                  <option value="Male">{t.input.sexOptions.male}</option>
                  <option value="Female">{t.input.sexOptions.female}</option>
                  <option value="Other">{t.input.sexOptions.other}</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </div>
            )}

            <div className="space-y-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{ts.complete} <ArrowRight className="w-5 h-5" /></>}
              </button>
              
              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {ts.haveAccount}{' '}
                  <button type="button" onClick={onSwitchToLogin} className="text-blue-600 font-bold hover:underline">{ts.signIn}</button>
                </p>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium transition-colors"
              >
                {ts.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;