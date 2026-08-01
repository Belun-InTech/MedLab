import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQProps {
  onBack: () => void;
  t: any;
}

const FAQ: React.FC<FAQProps> = ({ onBack, t }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
       {/* Back Button */}
       <button 
         onClick={onBack} 
         className="flex items-center text-slate-500 hover:text-blue-600 transition-colors group"
       >
         <div className="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mr-3 group-hover:border-blue-200 dark:group-hover:border-blue-800">
            <ArrowLeft className="w-4 h-4" />
         </div>
         <span className="font-medium">{t.about.back}</span>
       </button>

       {/* Header Section */}
       <div className="text-center space-y-3 mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
             <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.faq.title}</h1>
       </div>

       {/* Accordion */}
       <div className="space-y-4">
         {t.faq.items.map((item: any, index: number) => (
           <div 
             key={index} 
             className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-300 overflow-hidden ${
               openIndex === index 
                 ? 'border-blue-200 dark:border-blue-800 shadow-md ring-2 ring-blue-50/50 dark:ring-blue-900/20' 
                 : 'border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-200 dark:hover:border-blue-800'
             }`}
           >
             <button
               onClick={() => toggleIndex(index)}
               className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
             >
               <span className={`font-semibold text-lg ${openIndex === index ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                 {item.q}
               </span>
               <div className={`p-1 rounded-full transition-colors ${openIndex === index ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                 {openIndex === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
               </div>
             </button>
             
             <div 
               className={`px-5 text-slate-600 dark:text-slate-400 leading-relaxed transition-all duration-300 ease-in-out ${
                 openIndex === index ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
               }`}
             >
               {item.a}
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};

export default FAQ;