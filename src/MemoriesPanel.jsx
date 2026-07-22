import { useState, useEffect } from 'react';
import { loadMemories, saveMemory, deleteMemory } from './api';

export default function MemoriesPanel({ onClose }) {
  const [memories, setMemories] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMemories().then(setMemories).catch(console.error);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setLoading(true);
    try {
      const mem = await saveMemory(newContent.trim());
      setMemories(prev => [mem, ...prev]);
      setNewContent('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          background: 'rgba(0,0,0,0.3)'
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '320px',
        height: '100vh',
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: '-4px 0 30px rgba(0,0,0,0.4)'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Erinnerungen</h3>
          <button
            onClick={onClose}
            style={{
              background: 'var(--hover)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '14px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleAdd} style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Ich heisse Max und spreche Deutsch"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--input)',
              color: 'var(--text)',
              fontSize: '14px',
              resize: 'none',
              minHeight: '70px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading || !newContent.trim()}
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              opacity: loading || !newContent.trim() ? 0.5 : 1,
              transition: 'opacity 0.15s'
            }}
          >
            Erinnerung speichern
          </button>
        </form>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {memories.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '30px', lineHeight: 1.5 }}>
              Keine Erinnerungen gespeichert.<br/>
              Füge deine erste Erinnerung hinzu.
            </p>
          )}
          {memories.map(mem => (
            <div key={mem.id} style={{
              padding: '12px 14px',
              marginBottom: '8px',
              borderRadius: '10px',
              background: 'var(--message-bg)',
              border: '1px solid var(--border)',
              fontSize: '14px',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <span style={{ flex: 1, lineHeight: 1.5 }}>{mem.content}</span>
              <button
                onClick={() => handleDelete(mem.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '2px 4px',
                  flexShrink: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
