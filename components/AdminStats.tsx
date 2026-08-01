import React, { useEffect, useState } from 'react';
import { AlertTriangle, Baby, CalendarCheck, ClipboardList, Loader2, Stethoscope, Users } from 'lucide-react';
import { AdminStats as Stats, fetchStats } from '../services/adminService';

interface AdminStatsProps {
  t: any;
}

const Tile: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
    <div className="flex items-center gap-2 text-slate-400 mb-2">{icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
  </div>
);

/** Programme counters for the pitch. No patient data reaches this screen by design. */
const AdminStats: React.FC<AdminStatsProps> = ({ t }) => {
  const ta = t.admin;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setStats(await fetchStats());
      } catch {
        setError(ta.loadFailed);
      } finally {
        setLoading(false);
      }
    })();
  }, [ta.loadFailed]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  if (error || !stats) {
    return (
      <div className="max-w-3xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400 text-center">
        {error || ta.loadFailed}
      </div>
    );
  }

  const maxCondition = Math.max(1, ...stats.topConditions.map(c => c.value));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{ta.title}</p>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{ta.statsTitle}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Tile icon={<Users className="w-4 h-4" />} label={ta.totalParents} value={String(stats.totals.parents)} />
        <Tile icon={<Stethoscope className="w-4 h-4" />} label={ta.totalDoctors} value={String(stats.totals.doctors)} />
        <Tile icon={<ClipboardList className="w-4 h-4" />} label={ta.pendingReview} value={String(stats.totals.pendingDoctors)} />
        <Tile icon={<Baby className="w-4 h-4" />} label={ta.totalChildren} value={String(stats.totals.children)} />
        <Tile icon={<ClipboardList className="w-4 h-4" />} label={ta.totalConsultations} value={String(stats.totals.consultations)} />
        <Tile icon={<CalendarCheck className="w-4 h-4" />} label={ta.totalAppointments} value={String(stats.totals.appointments)} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">{ta.emergencyRate}</span>
        </div>
        <p className="text-3xl font-black text-red-600 tracking-tight">
          {(stats.emergencyRate * 100).toFixed(1)}%
        </p>
        <p className="text-xs text-slate-400 mt-1">{ta.emergencyRateHelp}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ta.topConditions}</h3>
        {stats.topConditions.length === 0 ? (
          <p className="text-sm text-slate-400">{ta.noData}</p>
        ) : (
          stats.topConditions.map(condition => (
            <div key={condition.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">{condition.name}</span>
                <span className="text-slate-400 font-black">{condition.value}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${(condition.value / maxCondition) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminStats;
