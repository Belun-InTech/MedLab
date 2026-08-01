import React, { useState } from 'react';
import { MapPin, Phone, ArrowLeft, Building2, Hospital, Home, Stethoscope } from 'lucide-react';
import { HEALTH_FACILITIES, MUNICIPALITIES } from '../constants/facilities';
import { HealthFacility } from '../types';

interface FacilityFinderProps {
  t: any;
  onBack: () => void;
}

const typeIcon: Record<HealthFacility['type'], React.ReactNode> = {
  'Hospital': <Hospital className="w-5 h-5" />,
  'CHC': <Building2 className="w-5 h-5" />,
  'Health Post': <Home className="w-5 h-5" />,
  'Clinic': <Stethoscope className="w-5 h-5" />,
};

const typeColor: Record<HealthFacility['type'], string> = {
  'Hospital': 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  'CHC': 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  'Health Post': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Clinic': 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

const FacilityFinder: React.FC<FacilityFinderProps> = ({ t, onBack }) => {
  const tf = t.facilities;
  const [municipality, setMunicipality] = useState<string>('all');

  const filtered = municipality === 'all'
    ? HEALTH_FACILITIES
    : HEALTH_FACILITIES.filter(f => f.municipality === municipality);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
        <ArrowLeft className="w-4 h-4" /> {t.about.back}
      </button>

      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
          <MapPin className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{tf.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{tf.subtitle}</p>
      </div>

      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{tf.filterLabel}</label>
        <select
          value={municipality}
          onChange={e => setMunicipality(e.target.value)}
          className="w-full sm:w-72 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white shadow-sm"
        >
          <option value="all">{tf.all}</option>
          {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(facility => (
          <div key={facility.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-2xl flex-shrink-0 ${typeColor[facility.type]}`}>
              {typeIcon[facility.type]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-1">{facility.name}</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {tf.types[facility.type]} • {facility.municipality}
              </p>
              <a
                href={`tel:${facility.phone.replace(/[^+\d]/g, '')}`}
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> {tf.callBtn} {facility.phone}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacilityFinder;
