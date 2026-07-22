export default function ChatTabs({ sessions, activeId, onSwitch, onDelete, onRename }) {
  return (
    <div id="chat-tabs">
      {sessions.map(s => (
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
          <span
            className="tab-close"
            onClick={e => { e.stopPropagation(); onDelete(s.id); }}
          >&times;</span>
        </div>
      ))}
    </div>
  );
}
