import { useState, useCallback, useEffect, useRef } from 'react';
import { MODELS, DEFAULT_MODEL, makeSession } from './storage';
import { loadChats, saveChat, deleteChat as apiDeleteChat, getUser, getToken } from './api';

const apiKey = import.meta.env.VITE_API_KEY || '';

export function useChat() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [usage, setUsage] = useState({ totalTokens: 0, totalPrompt: 0, totalCompletion: 0 });
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      try {
        const list = await loadChats();
        if (!list || !Array.isArray(list) || !list.length) {
          const s = makeSession('Chat 1');
          await saveChat(s);
          setSessions([s]);
          setActiveId(s.id);
        } else {
          setSessions(list);
          setActiveId(list[0].id);
        }
      } catch (e) {
        console.error(e);
        const s = makeSession('Chat 1');
        setSessions([s]);
        setActiveId(s.id);
      }
      setLoaded(true);
    })();
  }, []);

  const activeSession = sessions.find(s => s.id === activeId) || sessions[0];

  const createChat = useCallback(async () => {
    const s = makeSession(`Chat ${sessions.length + 1}`, activeSession?.model);
    await saveChat(s);
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id);
  }, [sessions, activeSession]);

  const switchChat = useCallback((id) => {
    const chat = sessions.find(s => s.id === id);
    if (chat) setActiveId(id);
  }, [sessions]);

  const deleteChat = useCallback(async (id) => {
    if (sessions.length <= 1) {
      const s = makeSession('Chat 1');
      await saveChat(s);
      setSessions([s]);
      setActiveId(s.id);
      return;
    }
    await apiDeleteChat(id);
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeId === id) setActiveId(filtered[0]?.id || null);
  }, [sessions, activeId]);

  const clearChat = useCallback(async () => {
    const updated = sessions.map(s =>
      s.id === activeId ? { ...s, messages: [] } : s
    );
    setSessions(updated);
    const cur = updated.find(s => s.id === activeId);
    if (cur) await saveChat(cur);
  }, [sessions, activeId]);

  const renameChat = useCallback(async (id, name) => {
    const updated = sessions.map(s => s.id === id ? { ...s, name: name.trim() } : s);
    setSessions([...updated]);
    const cur = updated.find(s => s.id === id);
    if (cur) await saveChat(cur);
  }, [sessions]);

  const changeModel = useCallback(async (modelId) => {
    const updated = sessions.map(s => s.id === activeId ? { ...s, model: modelId } : s);
    setSessions([...updated]);
    const cur = updated.find(s => s.id === activeId);
    if (cur) await saveChat(cur);
  }, [sessions, activeId]);

  const sendMessage = useCallback(async (content) => {
    const token = getToken();
    if (!content.trim() || !token || !activeSession) return;
    const sid = activeSession.id;

    // Auto-name: use first message as title
    const isNew = activeSession.name.startsWith('Chat ') && activeSession.messages.length === 0;
    const newName = isNew ? content.slice(0, 40) : activeSession.name;

    const userMsg = { role: 'user', content, timestamp: Date.now() };
    const withUser = sessions.map(s =>
      s.id === sid ? { ...s, name: newName, messages: [...s.messages, userMsg] } : s
    );
    setSessions([...withUser]);
    const activeWithUser = withUser.find(s => s.id === sid);
    if (activeWithUser) await saveChat(activeWithUser);

    setLoadingIds(prev => new Set([...prev, sid]));

    try {
      const msgsForApi = activeWithUser.messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeSession.model,
          messages: msgsForApi
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
      setSessions([...withReply]);
      const activeWithReply = withReply.find(s => s.id === sid);
      if (activeWithReply) await saveChat(activeWithReply);

      if (data.usage) {
        return { ok: true, usage: data.usage };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    } finally {
      setLoadingIds(prev => { const nx = new Set(prev); nx.delete(sid); return nx; });
    }
  }, [sessions, activeSession, activeId]);

  const loading = loadingIds.has(activeId);

  return {
    sessions, activeId, activeSession, loading, loaded,
    createChat, switchChat, deleteChat, clearChat, renameChat, changeModel, sendMessage
  };
}

export { MODELS };
