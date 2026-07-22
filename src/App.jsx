import { useState } from 'react';
import SettingsBar from './SettingsBar';
import ChatTabs from './ChatTabs';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
import StatusBar from './StatusBar';
import { useChat } from './useChat';

export default function App() {
  const chat = useChat();
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