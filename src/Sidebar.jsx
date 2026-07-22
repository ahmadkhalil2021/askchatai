import { MODELS } from './useChat';

export default function Sidebar({ sessions, activeId, onSwitch, onDelete, onNewChat }) {
  return (
    <div id="sidebar">
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
        <button id="sidebar-new-btn" onClick={onNewChat} title="Neuer Chat">+</button>
      </div>
      <div id="sidebar-list">
        {sessions.map(s => {
          const modelName = MODELS.find(m => m.id === s.model)?.name || s.model;
          const lastMsg = s.messages.length ? s.messages[s.messages.length - 1].content.slice(0, 60) : '';
          return (
            <div
              key={s.id}
              className={'sidebar-item' + (s.id === activeId ? ' active' : '')}
              onClick={() => onSwitch(s.id)}
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
