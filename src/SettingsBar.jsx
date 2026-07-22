import { MODELS } from './useChat';

export default function SettingsBar({ activeModel, onModelChange, onCreateChat, onClearChat, theme, onToggleTheme }) {
  return (
    <div id="settings-bar">
      <select id="model-select" value={activeModel} onChange={e => onModelChange(e.target.value)}>
        {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <button id="new-chat-btn" onClick={onCreateChat}>+ Neu</button>
      <button id="clear-btn" onClick={onClearChat}>Leeren</button>
      <button id="theme-btn" onClick={onToggleTheme} title="Light/Dark umschalten">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}