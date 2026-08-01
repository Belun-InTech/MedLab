import React from 'react';
import { ArrowLeft, Shield, Clock, Brain, Activity } from 'lucide-react';
import { Language } from '../types';

interface AboutProps {
  onBack: () => void;
  language: Language;
  t: any;
}

const About: React.FC<AboutProps> = ({ onBack, t }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
       {/* Back Button */}
       <button 
         onClick={onBack} 
         className="flex items-center text-slate-500 hover:text-blue-600 transition-colors group"
       >
         <div className="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mr-3 group-hover:border-blue-200">
            <ArrowLeft className="w-4 h-4" />
         </div>
         <span className="font-medium">{t.about.back}</span>
       </button>

       {/* Bio Section */}
       <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl text-slate-900 dark:text-white mb-6 font-['Baumans']">
              {t.about.title}<span className="text-blue-600 dark:text-blue-400">AI</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-4">
              {t.about.bio1}
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              {t.about.bio2}
            </p>
          </div>
       </section>

       {/* Why Use Section */}
       <section>
         <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 px-2">{t.about.whyTitle}</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<Brain className="w-6 h-6 text-purple-500" />}
              title={t.about.features[0].title}
              desc={t.about.features[0].desc}
            />
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-blue-500" />}
              title={t.about.features[1].title}
              desc={t.about.features[1].desc}
            />
            <FeatureCard 
              icon={<Activity className="w-6 h-6 text-emerald-500" />}
              title={t.about.features[2].title}
              desc={t.about.features[2].desc}
            />
             <FeatureCard 
              icon={<Shield className="w-6 h-6 text-indigo-500" />}
              title={t.about.features[3].title}
              desc={t.about.features[3].desc}
            />
         </div>
       </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 group">
    <div className="bg-slate-50 dark:bg-slate-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-sm transition-colors">
      {icon}
    </div>
    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default About;