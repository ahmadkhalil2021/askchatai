import { MODELS } from './useChat';

export default function SettingsBar({ activeModel, onModelChange, onClearChat, theme, onToggleTheme, user, onLogout }) {
  return (
    <div id="settings-bar">
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
