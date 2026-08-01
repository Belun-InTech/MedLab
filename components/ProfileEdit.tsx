import React, { useState, useRef } from 'react';
import { User as UserIcon, Mail, Lock, Camera, Loader2, Save, ArrowLeft, X } from 'lucide-react';
import { User } from '../types';
import { updateUserProfile } from '../services/authService';

interface ProfileEditProps {
  user: User;
  onUpdateSuccess: (user: User) => void;
  onCancel: () => void;
  t: any;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onUpdateSuccess, onCancel, t }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || user.name.split(' ')[0] || '',
    lastName: user.lastName || user.name.split(' ')[1] || '',
    username: user.username,
    email: user.email || '',
    password: user.password || '',
    dob: user.dob || '',
    sex: user.sex || '' as 'Male' | 'Female' | 'Other' | ''
  });
  const [avatar, setAvatar] = useState<string | null>(user.avatar || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tp = t.auth.profile;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updatedUser = await updateUserProfile(user.id, { ...formData, avatar: avatar || undefined });
      setSuccess(true);
      onUpdateSuccess(updatedUser);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {tp.back}
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tp.title}</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="flex flex-col items-center gap-4 pb-8 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-900 border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-transform active:scale-90"
              >
                <Camera className="w-5 h-5" />
              </button>
              {avatar && avatar !== user.avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar(user.avatar || null)}
                  className="absolute -top-1 -right-1 bg-slate-500 text-white p-1 rounded-full shadow-md hover:bg-slate-600"
                  title="Restore original"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900 dark:text-white text-lg">{user.name}</p>
              <p className="text-sm text-slate-500">{tp.subtitle}</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.auth.signup.firstName}</label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.auth.signup.lastName}</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.auth.signup.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.auth.signup.username}</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.auth.login.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  placeholder="Update your password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.auth.signup.dob}</label>
              <input 
                type="date" 
                name="dob" 
                value={formData.dob} 
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.auth.signup.sex}</label>
              <select 
                name="sex" 
                value={formData.sex} 
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              >
                <option value="">{t.input.sexOptions.select}</option>
                <option value="Male">{t.input.sexOptions.male}</option>
                <option value="Female">{t.input.sexOptions.female}</option>
                <option value="Other">{t.input.sexOptions.other}</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400 text-center animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-sm text-emerald-600 dark:text-emerald-400 text-center">
              {tp.success}
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> {tp.save}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;