import { MODELS } from './useChat';

export default function Sidebar({ sessions, activeId, onSwitch, onDelete, onNewChat, onOpenMemories, isOpen, onClose }) {
  return (
    <div id="sidebar" className={isOpen ? 'open' : ''}>
      <div id="sidebar-header">
        <div id="sidebar-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
            <path d="M8 9h8"/>
            <path d="M8 13h5"/>
            <path d="M12 17a2 2 0 0 0 2-2V9a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2z"/>
          </svg>
          <span>AskChatAI</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button id="sidebar-new-btn" onClick={() => { onNewChat(); onClose(); }} title="Neuer Chat">+</button>
          <button id="sidebar-memory-btn" onClick={onOpenMemories} title="Erinnerungen" style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/>
              <path d="M9 21h6"/>
            </svg>
          </button>
        </div>
      </div>
      <div id="sidebar-list">
        {sessions.map(s => {
          const modelName = MODELS.find(m => m.id === s.model)?.name || s.model;
          const lastMsg = s.messages.length ? s.messages[s.messages.length - 1].content.slice(0, 60) : '';
          return (
            <div
              key={s.id}
              className={'sidebar-item' + (s.id === activeId ? ' active' : '')}
              onClick={() => { onSwitch(s.id); onClose(); }}
            >
              <div className="sidebar-item-main">
                <span className="sidebar-item-name">{s.name}</span>
                <span className="sidebar-item-model">{modelName}</span>
                {lastMsg && <span className="sidebar-item-preview">{lastMsg}</span>}
              </div>
              <button
                className="sidebar-item-delete"
                onClick={e => { e.stopPropagation(); onDelete(s.id); }}
                title="Loeschen"
              >&times;</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
