import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { useSignalR } from '@/hooks/useSignalR';
import { Send, Loader2, Wifi, WifiOff, Users, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { ContactsList, PrivateChatBox } from './components';
import type { ContactDto, PrivateMessageDto } from '@/types';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

type ChatMode = 'global' | 'private';

export const ChatPage = () => {
  const [chatMode, setChatMode] = useState<ChatMode>('global');
  const [selectedContact, setSelectedContact] = useState<ContactDto | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const { isConnected, isConnecting, error, invoke, on, off } = useSignalR({
    hubUrl: '/hubs/app',
    autoConnect: true,
  });

  useEffect(() => {
    const handleReceiveMessage = (...args: unknown[]) => {
      const message = args[0] as string;
      console.log('Received message:', message);
      const newMessage: ChatMessage = {
        id: Date.now().toString() + Math.random(),
        user: 'User',
        message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    on('ReceiveMessage', handleReceiveMessage);

    return () => {
      off('ReceiveMessage', handleReceiveMessage);
    };
  }, [on, off]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast.error('SignalR connection error: ' + error.message);
    }
  }, [error]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !isConnected) {
      return;
    }

    setIsSending(true);
    try {
      const userName = user?.email || 'Anonymous';
      const fullMessage = `${userName}: ${messageInput}`;
      await invoke('Broadcast', fullMessage);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPrivateMessage = async (toUserId: string, message: string) => {
    try {
      await invoke('SendPrivate', toUserId, message);
    } catch (error) {
      console.error('Error sending private message:', error);
      toast.error('Failed to send private message');
      throw error;
    }
  };

  const handlePrivateMessageReceive = (callback: (payload: PrivateMessageDto) => void) => {
    on('PrivateMessage', callback as (...args: unknown[]) => void);
  };

  const handlePrivateMessageOff = (callback: (payload: PrivateMessageDto) => void) => {
    off('PrivateMessage', callback as (...args: unknown[]) => void);
  };

  const handleSelectContact = (contact: ContactDto) => {
    setSelectedContact(contact);
    setChatMode('private');
  };

  const getConnectionBadge = () => {
    if (isConnected) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Connected</span>
        </div>
      );
    }
    if (isConnecting) {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Connecting...</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-red-600">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Disconnected</span>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Chat</h1>
            <p className="text-muted-foreground">Real-time messaging with SignalR</p>
          </div>
          {getConnectionBadge()}
        </div>

        {/* Chat Mode Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setChatMode('global')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              chatMode === 'global'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            Global Chat
          </button>
          <button
            onClick={() => setChatMode('private')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              chatMode === 'private'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Private Chat
          </button>
        </div>

        {/* Chat Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
          {/* Contacts List (only visible in private mode) */}
          {chatMode === 'private' && (
            <Card className="lg:col-span-1 h-full">
              <ContactsList
                onSelectContact={handleSelectContact}
                selectedContactId={selectedContact?.id}
              />
            </Card>
          )}

          <Card className={`${chatMode === 'private' ? 'lg:col-span-2' : 'lg:col-span-3'} h-full flex flex-col`}>
            {chatMode === 'global' ? null 
            // (
              // <CardContent className="flex-1 flex flex-col p-0">
              //   {/* Global Chat Header */}
              //   <div className="p-4 border-b">
              //     <h3 className="font-semibold text-lg">Global Chat Room</h3>
              //     <p className="text-sm text-muted-foreground">Everyone can see these messages</p>
              //   </div>

              //   {/* Messages Area */}
              //   <div className="flex-1 overflow-y-auto p-4 space-y-4">
              //     {messages.length === 0 ? (
              //       <div className="flex items-center justify-center h-full text-muted-foreground">
              //         <p>No messages yet. Start the conversation!</p>
              //       </div>
              //     ) : (
              //       messages.map((msg) => (
              //         <div key={msg.id} className="flex flex-col gap-1">
              //           <div className="bg-accent p-3 rounded-lg max-w-[80%]">
              //             <p className="text-sm break-words">{msg.message}</p>
              //           </div>
              //           <span className="text-xs text-muted-foreground">
              //             {msg.timestamp.toLocaleTimeString()}
              //           </span>
              //         </div>
              //       ))
              //     )}
              //     <div ref={messagesEndRef} />
              //   </div>

              //   {/* Input Area */}
              //   <div className="border-t p-4">
              //     <form onSubmit={handleSendMessage} className="flex gap-2">
              //       <Input
              //         value={messageInput}
              //         onChange={(e) => setMessageInput(e.target.value)}
              //         placeholder="Type your message..."
              //         disabled={!isConnected || isSending}
              //         className="flex-1"
              //       />
              //       <Button
              //         type="submit"
              //         disabled={!isConnected || isSending || !messageInput.trim()}
              //       >
              //         {isSending ? (
              //           <Loader2 className="h-4 w-4 animate-spin" />
              //         ) : (
              //           <>
              //             <Send className="h-4 w-4 mr-2" />
              //             Send
              //           </>
              //         )}
              //       </Button>
              //     </form>
              //     {!isConnected && (
              //       <p className="text-sm text-red-600 mt-2">
              //         ⚠️ Not connected to chat server
              //       </p>
              //     )}
              //   </div>
              // </CardContent>
            // )
             : (
              <div className="flex-1 flex flex-col">
                {selectedContact ? (
                  <PrivateChatBox
                    contact={selectedContact}
                    isConnected={isConnected}
                    onSendMessage={handleSendPrivateMessage}
                    onReceiveMessage={handlePrivateMessageReceive}
                    offReceiveMessage={handlePrivateMessageOff}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p>Select a contact to start chatting</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
