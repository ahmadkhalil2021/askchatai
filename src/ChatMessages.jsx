import { useEffect, useRef } from 'react';

function stripThink(text) {
  return text
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
    .replace(/\/?think>/gi, '')
    .replace(/\/?thinking>/gi, '')
    .replace(/\/?thought>/gi, '')
    .replace(/\/?reasoning>/gi, '')
    .replace(/^\s*\/m\s<[\s\S]*?>\s*/gim, '')
    .trim();
}

function formatContent(text) {
  text = stripThink(text);
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function fmtTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function Message({ role, content, timestamp }) {
  return (
    <div className={'message ' + role}>
      <span dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
      <div className="timestamp">{fmtTime(timestamp)}</div>
    </div>
  );
}

export default function ChatMessages({ messages, loading }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div id="chat-container" ref={containerRef}>
      {messages.map((m, i) => (
        <Message key={i} role={m.role} content={m.content} timestamp={m.timestamp} />
      ))}
      {loading && <div className="typing">Denkt nach…</div>}
    </div>
  );
}
