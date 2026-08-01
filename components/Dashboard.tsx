import React from 'react';
import {
  Sparkles,
  Stethoscope,
  Baby,
  Syringe,
  MessageCircleHeart,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { FamilyProfile } from '../shared/types';

interface DashboardProps {
  profile: FamilyProfile;
  parentName: string;
  onCheckSymptoms: () => void;
  onOpenVaccines: () => void;
  onTalkToDoctor: () => void;
  onOpenFacilities: () => void;
  t: any;
}

const Dashboard: React.FC<DashboardProps> = ({
  profile, parentName, onCheckSymptoms, onOpenVaccines, onTalkToDoctor, onOpenFacilities, t
}) => {
  const th = t.home;
  const firstName = parentName.split(' ')[0];
  const childCount = profile.children.length;

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in max-w-5xl mx-auto">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-[#90D5FF] dark:bg-[#1C2E4A] text-slate-900 dark:text-white p-8 sm:p-12 shadow-2xl transition-colors duration-300">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/20 dark:from-blue-400/10 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 dark:bg-blue-400/20 border border-blue-600/20 dark:border-blue-400/30 text-blue-800 dark:text-blue-200 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              {th.welcomeSub}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              {th.hello}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-300 dark:to-indigo-300">{firstName}!</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-700 dark:text-blue-100/80 max-w-xl leading-relaxed mx-auto md:mx-0">
              {th.heroDesc}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
               <button
                onClick={onCheckSymptoms}
                className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95"
               >
                 {th.cards.checker}
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>

          {childCount > 0 && (
            <button
              onClick={onCheckSymptoms}
              className="w-40 h-40 sm:w-52 sm:h-52 flex-shrink-0 rounded-full bg-white/40 dark:bg-blue-900/40 border-4 border-white/50 dark:border-blue-300/20 shadow-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform"
            >
              <Baby className="w-8 h-8 text-blue-700 dark:text-blue-300 mb-1" />
              <span className="text-5xl font-black leading-none">{childCount}</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-1 px-4 text-center">
                {t.onboarding.childrenSection}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          icon={<Stethoscope className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
          title={th.cards.checker}
          desc={th.cards.checkerDesc}
          onClick={onCheckSymptoms}
          color="blue"
        />
        <ActionCard
          icon={<Syringe className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
          title={th.cards.vaccines}
          desc={th.cards.vaccinesDesc}
          onClick={onOpenVaccines}
          color="emerald"
        />
        <ActionCard
          icon={<MessageCircleHeart className="w-8 h-8 text-amber-600 dark:text-amber-400" />}
          title={th.cards.doctor}
          desc={th.cards.doctorDesc}
          onClick={onTalkToDoctor}
          color="amber"
        />
        <ActionCard
          icon={<MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
          title={th.cards.facilities}
          desc={th.cards.facilitiesDesc}
          onClick={onOpenFacilities}
          color="purple"
        />
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, desc, onClick, color }: any) => {
  const colorStyles = {
    blue: 'hover:border-blue-300 dark:hover:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20',
    pink: 'hover:border-pink-300 dark:hover:border-pink-800 bg-pink-50/30 dark:bg-pink-900/20',
    emerald: 'hover:border-emerald-300 dark:hover:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/20',
    amber: 'hover:border-amber-300 dark:hover:border-amber-800 bg-amber-50/30 dark:bg-amber-900/20',
    purple: 'hover:border-purple-300 dark:hover:border-purple-800 bg-purple-50/30 dark:bg-purple-900/20'
  }[color as string];

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

export default Dashboard;
