
import React, { useState, useMemo } from 'react';
import { Specialist, Appointment, Language } from '../types';
import { Calendar, Clock, Check, ArrowRight, X, MapPin, Bell, Mail, Smartphone } from 'lucide-react';

interface AppointmentSchedulerProps {
  specialist: Specialist;
  onConfirm: (appointment: Appointment) => void;
  onCancel: () => void;
  t: any;
  language: Language;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ specialist, onConfirm, onCancel, t, language }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Reminder State
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMethod, setReminderMethod] = useState<'email' | 'app'>('email');
  const [reminderTiming, setReminderTiming] = useState('1h');

  const locale = {
    'en': 'en-US',
    'tet': 'pt-PT',
    'id': 'id-ID'
  }[language] || 'en-US';

  const next7Days = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      days.push({
        full: d.toISOString().split('T')[0],
        day: d.toLocaleDateString(locale, { weekday: 'short' }),
        date: d.getDate(),
        month: d.toLocaleDateString(locale, { month: 'short' }),
      });
    }
    return days;
  }, [locale]);

  // Use specialist.availabilitySlots if they exist, otherwise use defaults
  const dynamicTimeSlots = useMemo(() => {
    const slots = specialist.availabilitySlots && specialist.availabilitySlots.length > 0 
      ? specialist.availabilitySlots 
      : ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '18:00', '18:30', '19:00'];

    return {
      morning: slots.filter(s => {
        const hour = parseInt(s.split(':')[0]);
        return hour < 12;
      }),
      afternoon: slots.filter(s => {
        const hour = parseInt(s.split(':')[0]);
        return hour >= 12 && hour < 17;
      }),
      evening: slots.filter(s => {
        const hour = parseInt(s.split(':')[0]);
        return hour >= 17;
      }),
    };
  }, [specialist.availabilitySlots]);

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) return;
    onConfirm({
      date: selectedDate,
      time: selectedTime,
      status: 'Scheduled',
      specialistId: specialist.id,
      reminder: reminderEnabled ? {
        enabled: true,
        method: reminderMethod,
        timing: reminderTiming,
      } : undefined
    });
  };

  const ts = t.scheduler;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in max-w-2xl mx-auto">
      <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
            <img src={specialist.image} alt={specialist.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white leading-tight">{specialist.name}</h3>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">
               {t.specialistNames[specialist.specialty] || specialist.specialty}
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-8 max-h-[70vh] overflow-y-auto">
        {/* Date Selection */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {ts.selectDate}
          </h4>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {next7Days.map((day) => (
              <button
                key={day.full}
                onClick={() => setSelectedDate(day.full)}
                className={`flex-shrink-0 w-16 h-24 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1
                  ${selectedDate === day.full 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                  }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{day.day}</span>
                <span className="text-xl font-black">{day.date}</span>
                <span className="text-[10px] font-bold">{day.month}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-6">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Clock className="w-4 h-4" /> {ts.selectTime}
          </h4>
          
          <div className="space-y-6">
            {(['morning', 'afternoon', 'evening'] as const).map((period) => (
              dynamicTimeSlots[period].length > 0 && (
                <div key={period} className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    {ts[period]}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {dynamicTimeSlots[period].map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all
                          ${selectedTime === time 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Bell className="w-4 h-4" /> {ts.reminders.title}
            </h4>
            <button 
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500
                ${reminderEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${reminderEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {reminderEnabled && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase">{ts.reminders.method}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setReminderMethod('email')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-sm transition-all
                      ${reminderMethod === 'email' 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'}`}
                  >
                    <Mail className="w-4 h-4" />
                    {ts.reminders.email}
                  </button>
                  <button
                    onClick={() => setReminderMethod('app')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-sm transition-all
                      ${reminderMethod === 'app' 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'}`}
                  >
                    <Smartphone className="w-4 h-4" />
                    {ts.reminders.app}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase">{ts.reminders.timing}</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: '1h', label: ts.reminders.opt1 },
                    { val: '12h', label: ts.reminders.opt2 },
                    { val: '24h', label: ts.reminders.opt3 },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setReminderTiming(opt.val)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all
                        ${reminderTiming === opt.val 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 pb-4">
          <button
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl
              ${!selectedDate || !selectedTime 
                ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700' 
                : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
              }`}
          >
            {ts.confirm}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-blue-600" />
        <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
          {specialist.hospital}
        </p>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
