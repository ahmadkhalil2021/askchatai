const API = '';

async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body) headers['Content-Type'] = 'application/json';
  const res = await fetch(API + path, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.error || `HTTP ${res.status}`;
    console.error('API error:', path, msg);
    throw new Error(msg);
  }
  return res.json();
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
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function loadChats() {
  return api('/api/chats');
}

export async function saveChat(chat) {
  return api('/api/chats', { method: 'POST', body: JSON.stringify(chat) });
}

export async function deleteChat(id) {
  return api('/api/chats?id=' + encodeURIComponent(id), { method: 'DELETE' });
}
