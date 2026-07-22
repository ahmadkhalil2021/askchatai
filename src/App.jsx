import { useState, useEffect } from 'react';
import SettingsBar from './SettingsBar';
import ChatTabs from './ChatTabs';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
import StatusBar from './StatusBar';
import { useChat } from './useChat';

function useTheme() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return [theme, toggle];
}

export default function App() {
  const chat = useChat();
  const [theme, toggleTheme] = useTheme();
  const [lastUsage, setLastUsage] = useState(null);

  const handleSend = async (content) => {
    const result = await chat.sendMessage(content);
    if (result?.ok && result.usage) {
      setLastUsage(result.usage);
    }
  };

  return (
    <div id="app">
      <SettingsBar
        activeModel={chat.activeSession?.model || ''}
        onModelChange={chat.changeModel}
        onCreateChat={chat.createChat}
        onClearChat={chat.clearChat}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <ChatTabs
        sessions={chat.sessions}
        activeId={chat.activeId}
        onSwitch={chat.switchChat}
        onDelete={chat.deleteChat}
        onRename={chat.renameChat}
      />
      <ChatMessages
        messages={chat.activeSession?.messages || []}
        loading={chat.loading}
      />
      <MessageInput onSend={handleSend} loading={chat.loading} />
      <StatusBar
        modelId={chat.activeSession?.model || ''}
        usage={chat.usage}
        lastUsage={lastUsage}
      />
    </div>
  );
}