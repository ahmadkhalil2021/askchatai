const API = '';
const apiKey = import.meta.env.VITE_API_KEY || '';
const EXTERNAL_API = 'https://inference.dahl.global/v1/chat/completions';

async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  console.log('API call:', path, 'token:', token ? token.slice(0, 20) + '...' : 'none');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body) headers['Content-Type'] = 'application/json';
  try {
    const res = await fetch(API + path, { ...options, headers });
    console.log('API response:', path, res.status);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data.error || `HTTP ${res.status}`;
      console.error('API fehler:', path, msg, data);
      throw new Error(msg);
    }
    return res.json();
  } catch (e) {
    if (e.message.includes('Failed to fetch') || e.name === 'TypeError') {
      console.error('Netzwerk-Fehler:', path, e);
    }
    throw e;
  }
}

export function getToken() { return localStorage.getItem('token'); }
export function getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }

export async function register(email, password) {
  const data = await api('/api/register', { method: 'POST', body: JSON.stringify({ email, password }) });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export async function login(email, password) {
  const data = await api('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  console.log('Login erfolgreich, token gespeichert:', !!data.token);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function loadChats() {
  const data = await api('/api/chats');
  console.log('loadChats Rohdaten:', JSON.stringify(data));
  return data;
}

export async function saveChat(chat) {
  return api('/api/chats', { method: 'POST', body: JSON.stringify(chat) });
}

export async function deleteChat(id) {
  return api('/api/chats?id=' + encodeURIComponent(id), { method: 'DELETE' });
}

export async function loadMemories() {
  return api('/api/memory');
}

export async function saveMemory(content) {
  return api('/api/memory', { method: 'POST', body: JSON.stringify({ content }) });
}

export async function deleteMemory(id) {
  return api('/api/memory?id=' + encodeURIComponent(id), { method: 'DELETE' });
}

export async function summarizeChat(messages) {
  if (!messages || messages.length < 10) return null;

  const summaryPrompt = `Fasse diese Unterhaltung in 2-3 kurzen Saetzen auf Deutsch zusammen. Beschreibe das Hauptthema. Antworte NUR mit der Zusammenfassung:

${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

  try {
    const res = await fetch(EXTERNAL_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'MiniMaxAI/MiniMax-M2.7',
        messages: [
          { role: 'system', content: 'Du bist ein Assistent der Unterhaltungen zusammenfasst. Antworte auf Deutsch mit nur der Zusammenfassung.' },
          { role: 'user', content: summaryPrompt }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Summarize failed:', data);
      return null;
    }
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error('Summarize error:', e);
    return null;
  }
}
