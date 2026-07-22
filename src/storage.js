import { get, set, del, keys } from 'idb-keyval';

const MODELS = [
  { id: 'moonshotai/Kimi-K2.6', name: 'Kimi-K2.6' },
  { id: 'MiniMaxAI/MiniMax-M2.7', name: 'MiniMax-M2.7' }
];
const DEFAULT_MODEL = MODELS[0].id;
const API_URL = 'https://inference.dahl.global/v1/chat/completions';

function makeSession(name, modelId) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: name || 'Chat',
    model: modelId || DEFAULT_MODEL,
    messages: [],
    createdAt: Date.now()
  };
}

async function dbLoadSessions() {
  const list = [];
  const allKeys = await keys();
  for (const k of allKeys) {
    if (typeof k === 'string' && k.startsWith('chat:')) {
      const s = await get(k);
      if (s) list.push(s);
    }
  }
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return list;
}

async function dbSaveSession(session) {
  await set('chat:' + session.id, session);
}

async function dbDeleteSession(id) {
  await del('chat:' + id);
}

async function dbGetUsage() { return (await get('usage')) || { totalTokens: 0, totalPrompt: 0, totalCompletion: 0 }; }
async function dbSaveUsage(u) { await set('usage', u); }

export {
  MODELS, DEFAULT_MODEL, API_URL, makeSession,
  dbLoadSessions, dbSaveSession, dbDeleteSession, dbGetUsage, dbSaveUsage
};
