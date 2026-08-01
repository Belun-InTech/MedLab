import React, { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Check, Inbox, Languages, Loader2, MapPin, RefreshCw, ShieldAlert, X } from 'lucide-react';
import DoctorAvatar from './DoctorAvatar';
import {
  AdminDoctorRow,
  approveDoctor,
  fetchDoctorRegistrations,
  rejectDoctor,
  suspendDoctor,
} from '../services/adminService';
import { DoctorStatus } from '../shared/types';

interface AdminVerificationQueueProps {
  t: any;
}

const TABS: DoctorStatus[] = ['pending', 'approved', 'rejected', 'suspended'];

const STATUS_TONE: Record<DoctorStatus, string> = {
  pending: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
  approved: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
  rejected: 'text-red-600 bg-red-50 dark:bg-red-900/30',
  suspended: 'text-red-600 bg-red-50 dark:bg-red-900/30',
};

const AdminVerificationQueue: React.FC<AdminVerificationQueueProps> = ({ t }) => {
  const [tab, setTab] = useState<DoctorStatus>('pending');
  const [rows, setRows] = useState<AdminDoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const ta = t.admin;

  const load = useCallback(async (status: DoctorStatus) => {
    setLoading(true);
    setError('');
    try {
      setRows(await fetchDoctorRegistrations(status));
    } catch {
      setError(ta.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [ta.loadFailed]);

  useEffect(() => { load(tab); }, [tab, load]);

  const act = async (id: string, action: 'approve' | 'reject' | 'suspend') => {
    // A rejection or suspension without a reason is useless to the doctor reading it.
    let reason = '';
    if (action !== 'approve') {
      reason = window.prompt(action === 'reject' ? ta.rejectReason : ta.suspendReason) ?? '';
      if (!reason.trim()) return;
    }

    setBusyId(id);
    setError('');
    try {
      if (action === 'approve') await approveDoctor(id);
      else if (action === 'reject') await rejectDoctor(id, reason.trim());
      else await suspendDoctor(id, reason.trim());
      await load(tab);
    } catch {
      setError(ta.actionFailed);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{ta.title}</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{ta.pendingQueue}</h1>
        </div>
        <button
          onClick={() => load(tab)}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition-colors"
          aria-label={ta.refresh}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((status) => (
          <button
            key={status}
            onClick={() => setTab(status)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
              ${tab === status
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600'}`}
          >
            {ta.statuses[status]}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-700 dark:text-red-400 animate-shake">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
          <Inbox className="w-10 h-10" />
          <p className="text-sm font-bold">{ta.noneInStatus}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <DoctorAvatar name={row.name} photoUrl={row.photoUrl} />

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-900 dark:text-white">{row.name}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${STATUS_TONE[row.status]}`}>
                      {ta.statuses[row.status]}
                    </span>
                  </div>

                  <p className="text-sm text-blue-600 font-bold">
                    {t.specialistNames?.[row.specialty] ?? row.specialty}
                  </p>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="flex items-center gap-2"><BadgeCheck className="w-3.5 h-3.5" /> {row.licenseNumber}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {row.facilityName}</p>
                    <p className="flex items-center gap-2">
                      <Languages className="w-3.5 h-3.5" />
                      {row.languages.map((l) => t.spokenLanguages?.[l] ?? l).join(' · ')}
                    </p>
                    <p className="text-slate-400">{row.email}</p>
                  </div>

                  {row.bio && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{row.bio}</p>}

                  {row.rejectionReason && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      <span className="font-black uppercase tracking-widest">{ta.reason}: </span>
                      {row.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {row.status !== 'approved' && (
                  <button
                    onClick={() => act(row.id, 'approve')}
                    disabled={busyId === row.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {busyId === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {ta.approve}
                  </button>
                )}
                {row.status === 'pending' && (
                  <button
                    onClick={() => act(row.id, 'reject')}
                    disabled={busyId === row.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    {ta.reject}
                  </button>
                )}
                {row.status === 'approved' && (
                  <button
                    onClick={() => act(row.id, 'suspend')}
                    disabled={busyId === row.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {ta.suspend}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVerificationQueue;
