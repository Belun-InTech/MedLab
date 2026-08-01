
import React from 'react';
import { 
  Sparkles, 
  Stethoscope, 
  History, 
  UserCircle, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Heart 
} from 'lucide-react';
import { User } from '../types';

interface DashboardProps {
  user: User;
  onStartAnalysis: () => void;
  onViewHistory: () => void;
  onViewProfile: () => void;
  t: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartAnalysis, onViewHistory, onViewProfile, t }) => {
  const firstName = user.firstName || user.name.split(' ')[0];
  const dash = t.dashboard;

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-[#90D5FF] dark:bg-[#1C2E4A] text-slate-900 dark:text-white p-8 sm:p-12 shadow-2xl transition-colors duration-300">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/20 dark:from-blue-400/10 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 dark:bg-blue-400/20 border border-blue-600/20 dark:border-blue-400/30 text-blue-800 dark:text-blue-200 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              {dash.welcomeSub}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              {dash.hello}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-300 dark:to-indigo-300">{firstName}!</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-700 dark:text-blue-100/80 max-w-xl leading-relaxed mx-auto md:mx-0">
              {dash.heroDesc}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
               <button 
                onClick={onStartAnalysis}
                className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95"
               >
                 {t.input.analyzeBtn}
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>

          <div className="w-48 h-48 sm:w-64 sm:h-64 relative flex-shrink-0">
             <div className="relative w-full h-full rounded-full border-4 border-white/50 dark:border-blue-300/20 overflow-hidden shadow-2xl bg-white/20 dark:bg-blue-900/40">
               <img 
                 src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&size=256&background=0f172a&color=fff`} 
                 alt={user.name} 
                 className="w-full h-full object-cover"
               />
             </div>
          </div>
        </div>
      </section>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard 
          icon={<Stethoscope className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
          title={dash.actions.newAnalysis}
          desc={dash.actions.newAnalysisDesc}
          onClick={onStartAnalysis}
          color="blue"
        />
        <ActionCard 
          icon={<History className="w-8 h-8 text-orange-600 dark:text-orange-400" />}
          title={dash.actions.history}
          desc={dash.actions.historyDesc}
          onClick={onViewHistory}
          color="orange"
        />
        <ActionCard 
          icon={<UserCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
          title={dash.actions.profile}
          desc={dash.actions.profileDesc}
          onClick={onViewProfile}
          color="purple"
        />
      </div>

      {/* Insight Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
         <div className="relative z-10 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
               <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{dash.insights.title}</h2>
               <p className="text-slate-600 dark:text-slate-400">{dash.insights.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
               <InsightItem 
                 icon={<Zap className="w-6 h-6 text-amber-500" />}
                 title={dash.insights.item1Title}
                 desc={dash.insights.item1Desc}
               />
               <InsightItem 
                 icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
                 title={dash.insights.item2Title}
                 desc={dash.insights.item2Desc}
               />
               <InsightItem 
                 icon={<Heart className="w-6 h-6 text-red-500" />}
                 title={dash.insights.item3Title}
                 desc={dash.insights.item3Desc}
               />
            </div>
         </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, desc, onClick, color }: any) => {
  const colorStyles = {
    blue: 'hover:border-blue-300 dark:hover:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20',
    orange: 'hover:border-orange-300 dark:hover:border-orange-800 bg-orange-50/30 dark:bg-orange-900/20',
    purple: 'hover:border-purple-300 dark:hover:border-purple-800 bg-purple-50/30 dark:bg-purple-900/20'
  }[color as 'blue' | 'orange' | 'purple'];

  return (
    <button 
      onClick={onClick}
      className={`p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left flex flex-col gap-4 group ${colorStyles}`}
    >
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </button>
  );
};

const InsightItem = ({ icon, title, desc }: any) => (
  <div className="text-center space-y-4">
    <div className="mx-auto w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl">
      {icon}
    </div>
    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h4>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default Dashboard;
