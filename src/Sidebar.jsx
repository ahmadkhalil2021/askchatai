import { MODELS } from './useChat';

export default function Sidebar({ sessions, activeId, onSwitch, onDelete, onNewChat }) {
  return (
    <div id="sidebar">
      <div id="sidebar-header">
        <button id="sidebar-new-btn" onClick={onNewChat}>+ Neuer Chat</button>
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
                title="Loschen"
              >&times;</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
