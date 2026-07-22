import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import SettingsBar from './SettingsBar';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
import StatusBar from './StatusBar';
import LoginPage from './LoginPage';
import MemoriesPanel from './MemoriesPanel';
import { getUser, logout } from './api';
import { useChat } from './useChat';

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return [theme, toggle];
}

function ChatApp({ user, theme, onLogout, toggleTheme }) {
  const chat = useChat();
  const [lastUsage, setLastUsage] = useState(null);
  const [showMemories, setShowMemories] = useState(false);

  if (!chat.loaded) return null;

  const handleSend = async (content) => {
    const result = await chat.sendMessage(content);
    if (result?.ok && result.usage) setLastUsage(result.usage);
  };

  return (
    <div id="app">
      <Sidebar
        sessions={chat.sessions}
        activeId={chat.activeId}
        onSwitch={chat.switchChat}
        onDelete={chat.deleteChat}
        onNewChat={chat.createChat}
        onOpenMemories={() => setShowMemories(true)}
      />
      {showMemories && <MemoriesPanel onClose={() => setShowMemories(false)} />}
      <div id="main">
        <SettingsBar
          activeModel={chat.activeSession?.model || ''}
          onModelChange={chat.changeModel}
          onClearChat={chat.clearChat}
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
          onLogout={onLogout}
        />
        <ChatMessages
          messages={chat.activeSession?.messages || []}
          loading={chat.loading}
        />
        <MessageInput onSend={handleSend} loading={chat.loading} />
        <StatusBar
          modelId={chat.activeSession?.model || ''}
          lastUsage={lastUsage}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(getUser);
  const [theme, toggleTheme] = useTheme();

  if (!user) return <LoginPage onAuth={setUser} />;
  return <ChatApp user={user} theme={theme} onLogout={() => { logout(); setUser(null); }} toggleTheme={toggleTheme} />;
}
