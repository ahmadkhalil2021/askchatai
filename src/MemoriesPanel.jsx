import { useState, useEffect } from 'react';
import { loadMemories, saveMemory, deleteMemory } from './api';

export default function MemoriesPanel({ onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(2px)'
    }} onClick={handleBackdropClick}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '340px',
        height: '100vh',
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text)' }}>Erinnerungen (Memory)</h3>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '4px 8px'
        }}>&times;</button>
      </div>

      <form onSubmit={handleAdd} style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
        <textarea
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="Neue Erinnerung, z.B. 'Ich heisse Thomas und spreche Deutsch'"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--input)',
            color: 'var(--text)',
            fontSize: '13px',
            resize: 'none',
            minHeight: '60px',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
        <button type="submit" disabled={loading || !newContent.trim()} style={{
          marginTop: '8px',
          width: '100%',
          padding: '8px',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          opacity: loading ? 0.6 : 1
        }}>
          {loading ? '...' : 'Speichern'}
        </button>
      </form>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {memories.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
            Noch keine Erinnerungen gespeichert.
          </p>
        )}
        {memories.map(mem => (
          <div key={mem.id} style={{
            padding: '10px 12px',
            marginBottom: '8px',
            borderRadius: '8px',
            background: 'var(--message-bg)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            color: 'var(--text)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ flex: 1 }}>{mem.content}</span>
            <button onClick={() => handleDelete(mem.id)} style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '2px 4px',
              flexShrink: 0
            }}>&times;</button>
          </div>
        ))}
      </div>

      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        Erinnerungen werden als System-Prompt bei jedem AI-Request injiziert.
      </div>
    </div>
    </div>
  );
}
