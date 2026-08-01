import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Building2, Calendar, Lock, Mail, Phone, Stethoscope, User as UserIcon } from 'lucide-react';
import { isAdult, signupDoctor, SessionUser } from '../services/authService';
import { HEALTH_FACILITIES } from '../constants/facilities';
import { DoctorSpecialty, SpokenLanguage } from '../shared/types';

interface DoctorSignupFormProps {
  onRegistered: (user: SessionUser) => void;
  onCancel: () => void;
  t: any;
}

const inputClass = "w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all shadow-sm";
const plainInputClass = "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all shadow-sm";
const labelClass = "block text-xs font-black text-slate-400 uppercase tracking-widest mb-2";

const SPECIALTIES: DoctorSpecialty[] = ['Pediatrician', 'General Practitioner'];
const LANGUAGES: SpokenLanguage[] = ['tet', 'pt', 'id', 'en'];

/**
 * Health-professional registration. Deliberately posts to its own endpoint rather than
 * sending a `role` on the normal signup — a role in the request body is a role anyone can
 * claim. The account lands in 'pending' and stays invisible to parents until an admin
 * approves it.
 */
const DoctorSignupForm: React.FC<DoctorSignupFormProps> = ({ onRegistered, onCancel, t }) => {
  const ta = t.auth;
  const td = t.doctorPortal;

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialty, setSpecialty] = useState<DoctorSpecialty>('Pediatrician');
  const [facilityId, setFacilityId] = useState<number>(HEALTH_FACILITIES[0]!.id);
  const [languages, setLanguages] = useState<SpokenLanguage[]>(['tet']);
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggleLanguage = (lang: SpokenLanguage) => {
    setLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !dob || !email.trim() || !password || !licenseNumber.trim()) {
      setError(ta.fieldsRequired);
      return;
    }
    if (password.length < 4) {
      setError(ta.passwordTooShort);
      return;
    }
    if (!languages.length) {
      setError(td.pickOneLanguage);
      return;
    }
    // Instant feedback only — the server re-checks this and is the real gate.
    if (!isAdult(dob)) {
      setError(ta.underAge);
      return;
    }

    setBusy(true);
    try {
      const result = await signupDoctor({
        name: name.trim(),
        email: email.trim(),
        password,
        dob,
        licenseNumber: licenseNumber.trim(),
        specialty,
        facilityId,
        languages,
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      });

      if (result.status === 'ok') {
        onRegistered(result.user);
      } else {
        setError(
          result.reason === 'under_age' ? ta.underAge
            : result.reason === 'email_taken' ? ta.emailTaken
            : result.reason === 'license_taken' ? ta.licenseTaken
            : result.reason === 'network' ? ta.networkError
            : ta.fieldsRequired,
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {ta.backToParentSignup}
      </button>

      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">{ta.doctorSignupTitle}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{ta.doctorSignupSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>{ta.name}</label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Dr. …" autoComplete="name" />
          </div>
        </div>

        <div>
          <label className={labelClass}>{ta.dob}</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} className={inputClass} autoComplete="bday" />
          </div>
        </div>

        <div>
          <label className={labelClass}>{ta.email}</label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder={ta.email} autoComplete="email" />
          </div>
        </div>

        <div>
          <label className={labelClass}>{ta.password}</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder={ta.password} autoComplete="new-password" />
          </div>
        </div>

        <div>
          <label className={labelClass}>{td.licenseNumber}</label>
          <div className="relative">
            <BadgeCheck className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className={inputClass} placeholder="TL-PED-0000" />
          </div>
          <p className="text-xs text-slate-400 mt-2">{td.licenseHelp}</p>
        </div>

        <div>
          <label className={labelClass}>{td.specialty}</label>
          <div className="relative">
            <Stethoscope className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
            <select value={specialty} onChange={e => setSpecialty(e.target.value as DoctorSpecialty)} className={inputClass}>
              {SPECIALTIES.map(s => (
                <option key={s} value={s}>{t.specialistNames?.[s] ?? s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>{td.facility}</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
            <select value={facilityId} onChange={e => setFacilityId(Number(e.target.value))} className={inputClass}>
              {HEALTH_FACILITIES.map(f => (
                <option key={f.id} value={f.id}>{f.name} — {f.municipality}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>{td.spokenLanguages}</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                  ${languages.includes(lang)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-blue-600'}`}
              >
                {t.spokenLanguages?.[lang] ?? lang}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>{td.phoneOptional}</label>
          <div className="relative">
            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+670 …" />
          </div>
        </div>

        <div>
          <label className={labelClass}>{td.bioOptional}</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className={plainInputClass} placeholder={td.bioPlaceholder} />
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
            <>{ta.doctorSignupBtn} <ArrowRight className="w-5 h-5" /></>
          )}
        </button>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">{td.approvalNotice}</p>
      </form>
    </div>
  );
};

export default DoctorSignupForm;
