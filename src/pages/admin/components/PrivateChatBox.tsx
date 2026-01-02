import { useState, useEffect, useRef } from 'react';
import { Input, Button } from '@/components/ui';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks';
import { conversationsService } from '@/services';
import { parseApiError } from '@/utils';
import { toast } from 'react-toastify';
import type { ContactDto, PrivateMessageDto, ChatMessageDto } from '@/types';

interface ChatMessage {
  id: string | number;
  fromUserId: string | number;
  toUserId: string | number;
  message: string;
  sentAt: Date;
  isMine: boolean;
}

interface PrivateChatBoxProps {
  contact: ContactDto;
  isConnected: boolean;
  onSendMessage: (toUserId: string, message: string) => Promise<void>;
  onReceiveMessage: (callback: (payload: PrivateMessageDto) => void) => void;
  offReceiveMessage: (callback: (payload: PrivateMessageDto) => void) => void;
}

export const PrivateChatBox = ({
  contact,
  isConnected,
  onSendMessage,
  onReceiveMessage,
  offReceiveMessage,
}: PrivateChatBoxProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const loadConversationHistory = async (contactId: number, reset = true) => {
    setIsLoadingHistory(true);
    try {
      const convResponse = await conversationsService.getOrCreateConversation(contactId);
      
      if (convResponse.success && convResponse.data) {
        const convId = convResponse.data.conversationId;
        setConversationId(convId);

        const currentSkip = reset ? 0 : skip;
        const messagesResponse = await conversationsService.getMessages(convId, {
          skip: currentSkip,
          take: 50,
        });

        if (messagesResponse.success && messagesResponse.data) {
          const historyMessages: ChatMessage[] = messagesResponse.data.map((msg: ChatMessageDto) => ({
            id: msg.id,
            fromUserId: msg.fromUserId,
            toUserId: msg.toUserId,
            message: msg.content,
            sentAt: new Date(msg.sentAt),
            isMine: msg.fromUserId === Number(user?.userId),
          }));

          if (reset) {
            setMessages(historyMessages);
            setSkip(50);
          } else {
            setMessages((prev) => [...historyMessages, ...prev]);
            setSkip((prev) => prev + 50);
          }

          setHasMore(historyMessages.length === 50);
        }
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error('Failed to load conversation: ' + parsedError.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    setSkip(0);
    setHasMore(true);
    loadConversationHistory(contact.id, true);
  }, [contact.id]);

  useEffect(() => {
    const handlePrivateMessage = (payload: any) => {
      const contactUserId = String(contact.id);
      const currentUserId = user?.userId || '';
      
      const payloadFromUserId = String(payload.fromUserId);
      const payloadToUserId = String(payload.toUserId);
      
      console.log('PrivateMessage received:', {
        payload,
        contactUserId,
        currentUserId,
        payloadFromUserId,
        payloadToUserId,
      });
      
      if (
        (payloadFromUserId === contactUserId && payloadToUserId === currentUserId) ||
        (payloadFromUserId === currentUserId && payloadToUserId === contactUserId)
      ) {
        const newMessage: ChatMessage = {
          id: payload.id || 'temp-' + Date.now() + Math.random(),
          fromUserId: payload.fromUserId,
          toUserId: payload.toUserId,
          message: payload.message,
          sentAt: new Date(payload.sentAt),
          isMine: payloadFromUserId === currentUserId,
        };
        
        setMessages((prev) => {
          const exists = prev.some(m => 
            String(m.id) === String(newMessage.id) ||
            (m.message === newMessage.message && 
             Math.abs(m.sentAt.getTime() - newMessage.sentAt.getTime()) < 2000)
          );
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    };

    onReceiveMessage(handlePrivateMessage);

    return () => {
      offReceiveMessage(handlePrivateMessage);
    };
  }, [contact.id, user?.userId, onReceiveMessage, offReceiveMessage]);

  useEffect(() => {
    if (!isLoadingHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingHistory]);

  const handleLoadOlderMessages = () => {
    if (conversationId && !isLoadingHistory && hasMore) {
      loadConversationHistory(contact.id, false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !isConnected) {
      return;
    }

    const messageToSend = messageInput;
    setIsSending(true);
    try {
      await onSendMessage(String(contact.id), messageToSend);
      
      // const optimisticMessage: ChatMessage = {
      //   id: 'temp-' + Date.now(),
      //   fromUserId: user?.userId || '',
      //   toUserId: contact.id,
      //   message: messageToSend,
      //   sentAt: new Date(),
      //   isMine: true,
      // };
      
      // setMessages((prev) => [...prev, optimisticMessage]);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending private message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {contact.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium">{contact.fullName}</p>
            <p className="text-sm text-muted-foreground">{contact.email}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Load Older Messages Button */}
        {hasMore && messages.length > 0 && (
          <div className="flex justify-center pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadOlderMessages}
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Older Messages
                </>
              )}
            </Button>
          </div>
        )}
        
        <div ref={messagesTopRef} />
        
        {isLoadingHistory && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Start a conversation with {contact.fullName}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${msg.isMine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[70%] ${
                  msg.isMine
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent'
                }`}
              >
                <p className="text-sm break-words">{msg.message}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {msg.sentAt.toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Message ${contact.fullName}...`}
            disabled={!isConnected || isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!isConnected || isSending || !messageInput.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </form>
        {!isConnected && (
          <p className="text-sm text-red-600 mt-2">
            ⚠️ Not connected to chat server
          </p>
        )}
      </div>
    </div>
  );
};
