import { useState, useLayoutEffect } from 'react';

export default function MessageInput({ onSend, loading }) {
  const [text, setText] = useState('');

  useLayoutEffect(() => {
    const ta = document.getElementById('message-input');
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || loading) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div id="input-area">
      <textarea
        id="message-input"
        placeholder="Nachricht eingeben…"
        rows="1"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button id="send-btn" disabled={loading || !text.trim()} onClick={handleSend}>
        Senden
      </button>
    </div>
  );
}
