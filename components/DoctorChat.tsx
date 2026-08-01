import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Phone, FlaskConical } from 'lucide-react';
import { Specialist } from '../shared/types';
import DoctorAvatar from './DoctorAvatar';
import {
  ChatMessage,
  fetchMessages,
  openConversation,
  sendMessage,
  simulateDoctorReply,
} from '../services/chatService';

interface DoctorChatProps {
  t: any;
  /** Required: there is no mock doctor to fall back to any more. */
  specialist: Specialist;
  /** A conversation is per (doctor, child) — a parent's other children are a separate thread. */
  childId: string;
  onStartCall: () => void;
  onBack: () => void;
}

/**
 * Chat is SIMULATED, but no longer simulated inside this component: everything goes
 * through services/chatService.ts, whose signatures are already the ones a real API would
 * expose. Making chat real is a change to that one file, not to this screen.
 */
const DoctorChat: React.FC<DoctorChatProps> = ({ t, specialist: doctor, childId, onStartCall, onBack }) => {
  const td = t.doctorTalk;
  const replies: string[] = td.cannedReplies;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const replyIndexRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const pushDoctorReply = async (id: string) => {
    setIsTyping(true);
    const message = await simulateDoctorReply(id, doctor, replies, replyIndexRef.current++);
    setIsTyping(false);
    setMessages(prev => [...prev, message]);
  };

  const startedRef = useRef(false);
  useEffect(() => {
    // The ref guard keeps StrictMode's double-mount from queuing two opening replies.
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const conversation = await openConversation(doctor.id, childId);
      setConversationId(conversation.id);
      const existing = await fetchMessages(conversation.id);
      setMessages(existing);
      // The doctor opens the conversation, but only the first time it is created.
      if (existing.length === 0) await pushDoctorReply(conversation.id);
      else replyIndexRef.current = existing.filter(m => m.from === 'doctor').length;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !conversationId) return;
    const body = input.trim();
    setInput('');
    const sent = await sendMessage(conversationId, body);
    setMessages(prev => [...prev, sent]);
    await pushDoctorReply(conversationId);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest mb-4">
        <ArrowLeft className="w-4 h-4" /> {t.about.back}
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[70vh]">
        {/* Chat header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <DoctorAvatar name={doctor.name} photoUrl={doctor.photoUrl} size="sm" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold leading-tight truncate">{doctor.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{td.online}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-1 rounded-full">
              <FlaskConical className="w-3 h-3" /> {td.demoBadge}
            </span>
            <button
              onClick={onStartCall}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
              aria-label={td.callBtn}
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'parent' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.from === 'parent'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-md'}`}
              >
                {msg.body}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-700 flex gap-3 bg-white dark:bg-slate-800">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={td.inputPlaceholder}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`p-3.5 rounded-2xl transition-all active:scale-95
              ${!input.trim() || isTyping ? 'bg-slate-200 dark:bg-slate-700 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'}`}
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorChat;
