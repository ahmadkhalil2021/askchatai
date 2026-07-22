import { MODELS } from './useChat';

export default function SettingsBar({ activeModel, onModelChange, onClearChat, theme, onToggleTheme, user, onLogout }) {
  return (
    <div id="settings-bar">
      <div id="brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
          <path d="M8 9h8"/>
          <path d="M8 13h5"/>
          <path d="M12 17a2 2 0 0 0 2-2V9a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2z"/>
        </svg>
        <span>AskChatAI</span>
      </div>
      <div id="controls">
        <select id="model-select" value={activeModel} onChange={e => onModelChange(e.target.value)}>
          {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <button id="clear-btn" onClick={onClearChat}>Leeren</button>
        <button id="theme-btn" onClick={onToggleTheme} title="Light/Dark">
          {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
        </button>
        <span id="user-info">{user?.email}</span>
        <button id="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
