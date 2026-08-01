import React from 'react';
import { Crown, Check, ArrowLeft, Info } from 'lucide-react';

interface SubscriptionPaywallProps {
  t: any;
  onSubscribe: () => void;
  onCancel: () => void;
}

const SubscriptionPaywall: React.FC<SubscriptionPaywallProps> = ({ t, onSubscribe, onCancel }) => {
  const tp = t.paywall;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6">
          <Crown className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">{tp.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">{tp.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Free tier */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{tp.freeName}</h3>
          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{tp.free}</span>
            <span className="text-sm text-slate-400 font-bold">{tp.perMonth}</span>
          </div>
          <ul className="space-y-3">
            {tp.freeFeatures.map((f: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Check className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium tier */}
        <div className="bg-slate-900 rounded-3xl border-2 border-amber-400/50 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4" /> {tp.premiumName}
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">{tp.price}</span>
              <span className="text-sm text-slate-400 font-bold">{tp.perMonth}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {tp.premiumFeatures.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                  <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={onSubscribe}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              {tp.subscribeBtn}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl text-xs text-blue-700 dark:text-blue-400 mb-6">
        <Info className="w-4 h-4 flex-shrink-0" />
        {tp.note}
      </div>

      <button
        onClick={onCancel}
        className="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> {tp.maybeLater}
      </button>
    </div>
  );
};

export default SubscriptionPaywall;
