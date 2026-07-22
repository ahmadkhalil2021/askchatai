import { useState, useCallback, useRef } from 'react';
import { API_URL, MODELS, DEFAULT_MODEL, storeAll, makeSession, loadState } from './storage';

const apiKey = import.meta.env.VITE_API_KEY || '';

export function useChat() {
  const initial = useRef(loadState());
  const [sessions, setSessions] = useState(initial.current.sessions);
  const [activeId, setActiveId] = useState(initial.current.activeId);
  const [usage, setUsage] = useState(initial.current.usage);
  const [loadingIds, setLoadingIds] = useState(new Set());

  const persist = useCallback((s, a, u) => {
    storeAll(s, a, u);
    setSessions([...s]);
    setActiveId(a);
    if (u !== undefined) setUsage({ ...u });
  }, []);

  const activeSession = sessions.find(s => s.id === activeId) || sessions[0];

  const createChat = useCallback(() => {
    const cur = activeSession;
    const s = makeSession('Chat ' + (sessions.length + 1), cur?.model || DEFAULT_MODEL);
    const newSessions = [...sessions, s];
    persist(newSessions, s.id, usage);
  }, [sessions, activeSession, usage, persist]);

  const switchChat = useCallback((id) => {
    if (sessions.find(s => s.id === id)) {
      persist(sessions, id, usage);
    }
  }, [sessions, usage, persist]);

  const deleteChat = useCallback((id) => {
    if (sessions.length <= 1) {
      const fresh = makeSession('Chat 1', sessions[0]?.model || DEFAULT_MODEL);
      persist([fresh], fresh.id, usage);
      return;
    }
    const filtered = sessions.filter(s => s.id !== id);
    const newActive = activeId === id ? filtered[0].id : activeId;
    persist(filtered, newActive, usage);
  }, [sessions, activeId, usage, persist]);

  const clearChat = useCallback(() => {
    const updated = sessions.map(s => s.id === activeId ? { ...s, messages: [] } : s);
    persist(updated, activeId, usage);
  }, [sessions, activeId, usage, persist]);

  const renameChat = useCallback((id, name) => {
    const updated = sessions.map(s => s.id === id ? { ...s, name: name.trim() } : s);
    persist(updated, activeId, usage);
  }, [sessions, activeId, usage, persist]);

  const changeModel = useCallback((modelId) => {
    const updated = sessions.map(s => s.id === activeId ? { ...s, model: modelId } : s);
    persist(updated, activeId, usage);
  }, [sessions, activeId, usage, persist]);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || !apiKey || !activeSession) return;

    const sid = activeSession.id;
    const userMsg = { role: 'user', content, timestamp: Date.now() };
    const withUser = sessions.map(s =>
      s.id === sid ? { ...s, messages: [...s.messages, userMsg] } : s
    );
    persist(withUser, activeId, usage);

    setLoadingIds(prev => new Set([...prev, sid]));

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeSession.model,
          messages: withUser.find(s => s.id === sid).messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        let msg = 'HTTP ' + res.status;
        try { const j = JSON.parse(txt); msg = j.error?.message || j.error || msg; } catch { msg += ': ' + txt.slice(0, 200); }
        throw new Error(msg);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || '(keine Antwort)';
      const asstMsg = { role: 'assistant', content: reply, timestamp: Date.now() };

      const withReply = withUser.map(s =>
        s.id === sid ? { ...s, messages: [...s.messages, asstMsg] } : s
      );

      let newUsage = usage;
      if (data.usage) {
        newUsage = {
          totalTokens: usage.totalTokens + (data.usage.total_tokens || 0),
          totalPrompt: usage.totalPrompt + (data.usage.prompt_tokens || 0),
          totalCompletion: usage.totalCompletion + (data.usage.completion_tokens || 0)
        };
      }

      persist(withReply, activeId, newUsage);
      return { ok: true, usage: data.usage };
    } catch (e) {
      return { ok: false, error: e.message };
    } finally {
      setLoadingIds(prev => { const next = new Set(prev); next.delete(sid); return next; });
    }
  }, [sessions, activeSession, activeId, usage, persist]);

  const loading = loadingIds.has(activeId);

  return {
    sessions, activeId, activeSession, usage, loading,
    createChat, switchChat, deleteChat, clearChat, renameChat, changeModel, sendMessage
  };
}

export { MODELS };
