import { MODELS } from './useChat';

export default function StatusBar({ modelId, lastUsage }) {
  const modelName = MODELS.find(m => m.id === modelId)?.name || modelId;
  return (
    <div id="status">
      Modell: {modelName}
      {lastUsage ? ` | Tokens: ${lastUsage.total_tokens?.toLocaleString() || '?'}` : ''}
    </div>
  );
}
