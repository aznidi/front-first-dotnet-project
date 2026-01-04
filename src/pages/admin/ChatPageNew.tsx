import { AdminLayout } from '@/components/layout/AdminLayout';
import { MessageSquare } from 'lucide-react';
import { useSignalR, useContacts, usePrivateChat, useUnreadMessages, useAuth } from '@/hooks';
import { ChatContacts, ChatMessages } from './chat';
import type { PrivateMessageDto } from '@/types';

export const ChatPageNew = () => {
  const { user } = useAuth();
  const { isConnected, invoke, on, off } = useSignalR({
    hubUrl: '/hubs/app',
    autoConnect: true,
  });
  
  const { contacts, isLoading: isLoadingContacts, selectedContact, setSelectedContact } = useContacts();
  
  const { unreadCounts } = useUnreadMessages({
    currentUserId: user?.userId ? String(user.userId) : undefined,
    selectedContactId: selectedContact?.id || null,
    onReceiveMessage: (callback: (payload: PrivateMessageDto) => void) => on('PrivateMessage', callback as (...args: unknown[]) => void),
    offReceiveMessage: (callback: (payload: PrivateMessageDto) => void) => off('PrivateMessage', callback as (...args: unknown[]) => void),
  });

  const handlePrivateMessageReceive = (callback: (payload: PrivateMessageDto) => void) => {
    on('PrivateMessage', callback as (...args: unknown[]) => void);
  };

  const handlePrivateMessageOff = (callback: (payload: PrivateMessageDto) => void) => {
    off('PrivateMessage', callback as (...args: unknown[]) => void);
  };

  const chatHook = usePrivateChat({
    contact: selectedContact,
    isConnected,
    invoke,
    on,
    off,
    onReceiveMessage: handlePrivateMessageReceive,
    offReceiveMessage: handlePrivateMessageOff,
  });

  const {
    messages,
    isLoadingHistory,
    hasMore,
    messagesEndRef,
    sendMessage,
    reactToMessage,
    loadOlderMessages,
  } = chatHook;

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r bg-background">
          <ChatContacts
            contacts={contacts}
            isLoading={isLoadingContacts}
            selectedContact={selectedContact}
            unreadCounts={unreadCounts}
            onSelectContact={setSelectedContact}
          />
        </div>

        {/* Messages Area */}
        <div className="flex-1 relative z-10">
          {selectedContact ? (
            <ChatMessages
              contact={selectedContact}
              messages={messages}
              isConnected={isConnected}
              isLoadingHistory={isLoadingHistory}
              hasMore={hasMore}
              messagesEndRef={messagesEndRef}
              onSendMessage={sendMessage}
              onLoadMore={loadOlderMessages}
              onReact={reactToMessage}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a contact to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
