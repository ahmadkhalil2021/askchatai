import { MODELS } from './useChat';

export default function StatusBar({ modelId, lastUsage, summarizing }) {
  const modelName = MODELS.find(m => m.id === modelId)?.name || modelId;
  return (
    <div id="status">
      {summarizing && <span style={{ color: 'var(--accent)', marginRight: '8px' }}>● Zusammenfassen…</span>}
      Modell: {modelName}
      {lastUsage ? ` | Tokens: ${lastUsage.total_tokens?.toLocaleString() || '?'}` : ''}
    </div>
  );
}
