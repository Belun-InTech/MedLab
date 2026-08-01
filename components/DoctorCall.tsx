import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, PhoneOff, FlaskConical } from 'lucide-react';
import { Specialist } from '../shared/types';
import { MOCK_SPECIALISTS } from '../constants/medicalData';

interface DoctorCallProps {
  t: any;
  specialist?: Specialist | null;
  onEnd: () => void;
}

// Simulated voice call: "rings" for a few seconds, then shows a running in-call timer.
const DoctorCall: React.FC<DoctorCallProps> = ({ t, specialist, onEnd }) => {
  const td = t.doctorTalk;
  const doctor = specialist || MOCK_SPECIALISTS[0];

  const [phase, setPhase] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const connectTimer = setTimeout(() => setPhase('connected'), 3000);
    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'connected') return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleEnd = () => {
    setPhase('ended');
    setTimeout(onEnd, 1500);
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden min-h-[70vh] flex flex-col items-center justify-between">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <span className="relative z-10 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-full">
          <FlaskConical className="w-3 h-3" /> {td.demoBadge}
        </span>

        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <img
              src={doctor.image}
              alt={doctor.name}
              className={`w-36 h-36 rounded-full border-4 object-cover shadow-2xl transition-all
                ${phase === 'calling' ? 'border-blue-500/50 animate-pulse' : 'border-emerald-500/60'}`}
            />
            {phase === 'calling' && (
              <span className="absolute inset-0 rounded-full border-4 border-blue-400/40 animate-ping" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black">{doctor.name}</h2>
            <p className="text-slate-400 text-sm font-medium">
              {t.specialistNames[doctor.specialty] || doctor.specialty} • {doctor.hospital}
            </p>
          </div>
          <div className="text-lg font-mono font-bold tracking-widest">
            {phase === 'calling' && <span className="text-blue-400 animate-pulse">{td.calling}</span>}
            {phase === 'connected' && <span className="text-emerald-400">{mmss}</span>}
            {phase === 'ended' && <span className="text-slate-400">{td.callEnded}</span>}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <button
            onClick={() => setMuted(!muted)}
            disabled={phase !== 'connected'}
            className={`p-5 rounded-full transition-all active:scale-95 disabled:opacity-40
              ${muted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white border border-slate-700'}`}
            aria-label={muted ? td.muted : td.mute}
          >
            {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={handleEnd}
            className="p-6 bg-red-600 hover:bg-red-700 rounded-full shadow-xl shadow-red-500/30 transition-all active:scale-95"
            aria-label={td.endCall}
          >
            <PhoneOff className="w-7 h-7" />
          </button>
          <button
            disabled={phase !== 'connected'}
            className="p-5 bg-slate-800 text-white border border-slate-700 rounded-full transition-all active:scale-95 disabled:opacity-40"
            aria-label={td.speaker}
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCall;
