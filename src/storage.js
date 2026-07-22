const MODELS = [
  { id: 'moonshotai/Kimi-K2.6', name: 'Kimi-K2.6' },
  { id: 'MiniMaxAI/MiniMax-M2.7', name: 'MiniMax-M2.7' }
];
const DEFAULT_MODEL = MODELS[0].id;
const API_URL = 'https://inference.dahl.global/v1/chat/completions';

function makeSession(name, modelId) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: name || 'Chat',
    model: modelId || DEFAULT_MODEL,
    messages: []
  };
}

export { MODELS, DEFAULT_MODEL, API_URL, makeSession };
