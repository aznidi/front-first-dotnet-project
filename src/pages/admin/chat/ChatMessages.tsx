import { useState } from 'react';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { MessageBubble } from './partials';
import type { ContactDto } from '@/types';

interface ChatMessage {
  id: string | number;
  message: string;
  sentAt: Date;
  isMine: boolean;
  deliveredAt?: Date | null;
  readAt?: Date | null;
  reactions?: Array<{ userId: number; type: string; createdAt: string }>;
}

interface ChatMessagesProps {
  contact: ContactDto;
  messages: ChatMessage[];
  isConnected: boolean;
  isLoadingHistory: boolean;
  hasMore: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSendMessage: (message: string) => Promise<void>;
  onLoadMore: () => void;
  onReact: (messageId: number | string, emoji: string) => Promise<void>;
}

export const ChatMessages = ({
  contact,
  messages,
  isConnected,
  isLoadingHistory,
  hasMore,
  messagesEndRef,
  onSendMessage,
  onLoadMore,
  onReact,
}: ChatMessagesProps) => {
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !isConnected || isSending) {
      return;
    }

    const message = messageInput;
    setIsSending(true);
    try {
      await onSendMessage(message);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b bg-background flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary">
            {contact.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{contact.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
        </div>
        {!isConnected && (
          <span className="text-xs text-destructive font-medium">Offline</span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-accent/10">
        {/* Load More Button */}
        {hasMore && messages.length > 0 && (
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoadingHistory}
              className="shadow-sm"
            >
              {isLoadingHistory ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Load older messages
                </>
              )}
            </Button>
          </div>
        )}

        {isLoadingHistory && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} onReact={onReact} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Message ${contact.fullName.split(' ')[0]}...`}
            disabled={!isConnected || isSending}
            className="flex-1"
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={!isConnected || isSending || !messageInput.trim()}
            size="icon"
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        {!isConnected && (
          <p className="text-xs text-destructive mt-2">
            ⚠️ Not connected to chat server
          </p>
        )}
      </div>
    </div>
  );
};
