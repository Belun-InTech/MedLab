import React from 'react';
import { Clock, ShieldAlert, ShieldX, LogOut } from 'lucide-react';
import { DoctorStatus } from '../shared/types';

interface DoctorPendingScreenProps {
  status: DoctorStatus;
  reason: string | null;
  name: string;
  t: any;
  onLogout: () => void;
}

/**
 * The doctor equivalent of the parent's child-onboarding gate: until an admin approves the
 * registration this is the only screen a doctor account can reach. Sitting in the same
 * position in the flow is deliberate — one screen, no partial portal.
 */
const DoctorPendingScreen: React.FC<DoctorPendingScreenProps> = ({ status, reason, name, t, onLogout }) => {
  const td = t.doctorPortal;

  const variants: Record<string, { icon: React.ReactNode; title: string; body: string; tone: string }> = {
    pending: {
      icon: <Clock className="w-8 h-8 text-amber-500" />,
      title: td.pendingTitle,
      body: td.pendingBody,
      tone: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    },
    rejected: {
      icon: <ShieldX className="w-8 h-8 text-red-500" />,
      title: td.rejectedTitle,
      body: td.rejectedBody,
      tone: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    },
    suspended: {
      icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
      title: td.suspendedTitle,
      body: td.suspendedBody,
      tone: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    },
  };

  const variant = variants[status] ?? variants.pending!;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className={`rounded-3xl border p-8 space-y-4 ${variant.tone}`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">{variant.icon}</div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{name}</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{variant.title}</h2>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{variant.body}</p>

        {reason && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{td.reviewNote}</p>
            <p className="text-sm text-slate-700 dark:text-slate-200">{reason}</p>
          </div>
        )}
      </div>

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        {t.header.logout}
      </button>
    </div>
  );
};

export default DoctorPendingScreen;
