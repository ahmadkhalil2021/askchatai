import { MODELS } from './useChat';

export default function ChatTabs({ sessions, activeId, onSwitch, onDelete, onRename }) {
  return (
    <div id="chat-tabs">
      {sessions.map(s => {
        const modelName = MODELS.find(m => m.id === s.model)?.name || s.model;
        return (
          <div
            key={s.id}
            className={'chat-tab' + (s.id === activeId ? ' active' : '')}
            onClick={() => onSwitch(s.id)}
            onDoubleClick={() => {
              const name = prompt('Name:', s.name);
              if (name?.trim()) onRename(s.id, name.trim());
            }}
          >
            <span style={{ pointerEvents: 'none' }}>{s.name}</span>
            <span style={{ fontSize: '10px', opacity: 0.6, pointerEvents: 'none' }}>{modelName}</span>
            <span
              className="tab-close"
              onClick={e => { e.stopPropagation(); onDelete(s.id); }}
            >&times;</span>
          </div>
        );
      })}
    </div>
  );
}
