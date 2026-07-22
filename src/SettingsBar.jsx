import { useState } from 'react';
import { MODELS } from './useChat';

export default function SettingsBar({ apiKey, onSaveKey, activeModel, onModelChange, onCreateChat, onClearChat }) {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!keyInput.trim()) return;
    onSaveKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div id="settings-bar">
      <label>API-Key:</label>
      <input
        type="password" id="api-key-input" placeholder="Bearer-Token eingeben…"
        value={keyInput} onChange={e => setKeyInput(e.target.value)}
      />
      <button
        id="save-key-btn" className={saved ? 'saved' : ''}
        onClick={handleSave}
      >
        {saved ? 'Gespeichert' : 'Speichern'}
      </button>
      <select id="model-select" value={activeModel} onChange={e => onModelChange(e.target.value)}>
        {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <button id="new-chat-btn" onClick={onCreateChat}>+ Neu</button>
      <button id="clear-btn" onClick={onClearChat}>Leeren</button>
    </div>
  );
}
