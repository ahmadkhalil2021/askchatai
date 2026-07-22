import { MODELS } from './useChat';

export default function StatusBar({ modelId, usage, lastUsage }) {
  const modelName = MODELS.find(m => m.id === modelId)?.name || modelId;
  return (
    <div id="status">
      Modell: {modelName} |{' '}
      {lastUsage
        ? `Tokens: ${lastUsage.total_tokens?.toLocaleString() || '?'} (Gesamt: ${usage.totalTokens.toLocaleString()})`
        : usage.totalTokens > 0
          ? `Gesamt-Tokens: ${usage.totalTokens.toLocaleString()}`
          : 'Tokens: --'}
    </div>
  );
}
