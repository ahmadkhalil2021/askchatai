const API_URL = 'https://inference.dahl.global/v1/chat/completions';
const MODELS = [
  { id: 'moonshotai/Kimi-K2.6', name: 'Kimi-K2.6' },
  { id: 'MiniMaxAI/MiniMax-M2.7', name: 'MiniMax-M2.7' }
];
const DEFAULT_MODEL = MODELS[0].id;

const STORAGE_KEY = 'mchat_sessions';
const ACTIVE_KEY = 'mchat_active';
const API_KEY_STORAGE = 'kimi_api_key';
const USAGE_KEY = 'kimi_usage';

export function loadState() {
  const apiKey = localStorage.getItem(API_KEY_STORAGE) || import.meta.env.VITE_API_KEY || '';

  let sessions = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) sessions = JSON.parse(raw);
  } catch { sessions = []; }

  let activeId = localStorage.getItem(ACTIVE_KEY) || null;

  if (!sessions.length) {
    const s = makeSession('Chat 1');
    sessions = [s];
    activeId = s.id;
  }

  if (!sessions.find(s => s.id === activeId)) {
    activeId = sessions[0].id;
  }

  // Migrate old format
  const oldMsgs = localStorage.getItem('kimi_chat_messages');
  if (oldMsgs) {
    try {
      const msgs = JSON.parse(oldMsgs);
      const s = makeSession('Chat 1');
      s.messages = Array.isArray(msgs) ? msgs : [];
      sessions = [s];
      activeId = s.id;
      localStorage.removeItem('kimi_chat_messages');
      localStorage.removeItem('kimi_model');
    } catch {}
  }

  let usage = { totalTokens: 0, totalPrompt: 0, totalCompletion: 0 };
  try {
    const saved = localStorage.getItem(USAGE_KEY);
    if (saved) usage = JSON.parse(saved);
  } catch {}

  return { sessions, activeId, apiKey, usage };
}

export function makeSession(name, modelId) {
  return {
    id: 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    name: name || 'Chat',
    model: modelId || DEFAULT_MODEL,
    messages: []
  };
}

export function storeAll(sessions, activeId, usage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  localStorage.setItem(ACTIVE_KEY, activeId || '');
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

export function storeApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export { API_URL, MODELS, DEFAULT_MODEL };
