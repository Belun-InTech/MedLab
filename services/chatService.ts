/**
 * Doctor chat — SIMULATED.
 *
 * This is the one part of the doctor feature that is deliberately not real: there is no
 * messages table and no endpoint behind it. What IS real is the shape. Every function
 * below is async and takes exactly the arguments the eventual API would take, so making
 * chat real means replacing the bodies here with `api.get`/`api.post` and adding a
 * `messages` table — no component above this file changes.
 *
 * What a real implementation needs, in order:
 *   1. `conversations` (doctor_id, parent_id, child_id) with a unique index on the triple,
 *      which is what makes openConversation idempotent, plus a `messages` table.
 *   2. Poll `fetchMessages(id, since)` on a ~3s interval with a monotonic `seq` cursor.
 *      Do NOT cursor on a timestamp: MySQL TIMESTAMP has one-second resolution, so two
 *      messages in the same second would be indistinguishable and one would be dropped.
 *   3. Gate posting (not reading) on requireSubscribed — cutting a parent off from their
 *      own child's medical conversation over a $2.99 flag would be indefensible.
 *
 * State lives in sessionStorage so the thread survives a reload during a demo but never
 * outlives the browser session.
 */
import { Specialist } from '../shared/types';

export interface ChatMessage {
  id: string;
  conversationId: string;
  /** seq, not createdAt — see the note above about timestamp resolution. */
  seq: number;
  from: 'parent' | 'doctor';
  body: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  doctorId: string;
  childId: string;
}

const STORE_KEY = 'medlab_demo_chat';

type Store = Record<string, ChatMessage[]>;

const readStore = (): Store => {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
};

const writeStore = (store: Store): void => {
  sessionStorage.setItem(STORE_KEY, JSON.stringify(store));
};

/** Idempotent by construction: the id is derived from the triple, as the unique index would be. */
export const openConversation = async (doctorId: string, childId: string): Promise<Conversation> => {
  const id = `${doctorId}:${childId}`;
  const store = readStore();
  if (!store[id]) {
    store[id] = [];
    writeStore(store);
  }
  return { id, doctorId, childId };
};

export const fetchMessages = async (conversationId: string, since = 0): Promise<ChatMessage[]> =>
  (readStore()[conversationId] ?? []).filter((m) => m.seq > since);

const append = (conversationId: string, from: 'parent' | 'doctor', body: string): ChatMessage => {
  const store = readStore();
  const thread = store[conversationId] ?? [];
  const message: ChatMessage = {
    id: `${conversationId}:${thread.length + 1}`,
    conversationId,
    seq: thread.length + 1,
    from,
    body,
    createdAt: new Date().toISOString(),
  };
  store[conversationId] = [...thread, message];
  writeStore(store);
  return message;
};

export const sendMessage = async (conversationId: string, body: string): Promise<ChatMessage> =>
  append(conversationId, 'parent', body);

/**
 * DEMO ONLY. A real doctor replies from their own portal; this stands in for that so the
 * parent-side screen is not a monologue on stage. Delete this function when chat is real.
 */
export const simulateDoctorReply = async (
  conversationId: string,
  specialist: Specialist,
  replies: string[],
  index: number,
): Promise<ChatMessage> => {
  const text = replies[Math.min(index, replies.length - 1)] ?? '…';
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
  return append(conversationId, 'doctor', text.replace('{doctor}', specialist.name));
};
