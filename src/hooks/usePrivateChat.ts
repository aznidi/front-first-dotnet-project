import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { conversationsService } from '@/services';
import { parseApiError } from '@/utils';
import { toast } from 'react-toastify';
import type { ContactDto, PrivateMessageDto, ChatMessageDto } from '@/types';

interface Reaction {
  userId: number;
  type: string;
  createdAt: string;
}

interface ChatMessage {
  id: string | number;
  fromUserId: string | number;
  toUserId: string | number;
  message: string;
  sentAt: Date;
  isMine: boolean;
  deliveredAt?: Date | null;
  readAt?: Date | null;
  reactions?: Reaction[];
}

interface UsePrivateChatProps {
  contact: ContactDto | null;
  isConnected: boolean;
  invoke: (method: string, ...args: unknown[]) => Promise<void>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
  onReceiveMessage: (callback: (payload: PrivateMessageDto) => void) => void;
  offReceiveMessage: (callback: (payload: PrivateMessageDto) => void) => void;
}

export const usePrivateChat = ({
  contact,
  isConnected,
  invoke,
  on,
  off,
  onReceiveMessage,
  offReceiveMessage,
}: UsePrivateChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadConversationHistory = useCallback(
    async (contactId: number, reset = true) => {
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
            const historyMessages: ChatMessage[] = messagesResponse.data.map(
              (msg: ChatMessageDto) => ({
                id: msg.id,
                fromUserId: msg.fromUserId,
                toUserId: msg.toUserId,
                message: msg.content,
                sentAt: new Date(msg.sentAt),
                isMine: msg.fromUserId === Number(user?.userId),
                deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : null,
                readAt: msg.readAt ? new Date(msg.readAt) : null,
                reactions: msg.reactions?.map(r => ({
                  userId: r.userId,
                  type: r.type,
                  createdAt: r.createdAt
                })) || [],
              })
            );

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
    },
    [skip, user?.userId]
  );

  const sendMessage = useCallback(
    async (message: string) => {
      if (!contact || !isConnected) return;

      try {
        await invoke('SendPrivate', String(contact.id), message);
      } catch (error) {
        console.error('Error sending private message:', error);
        toast.error('Failed to send message');
        throw error;
      }
    },
    [contact, isConnected, invoke]
  );

  const reactToMessage = useCallback(
    async (messageId: number | string, emoji: string) => {
      if (!isConnected) {
        toast.error('Not connected to chat server');
        return;
      }

      try {
        await invoke('ReactToMessage', Number(messageId), emoji);
      } catch (error) {
        console.error('Error reacting to message:', error);
        throw error;
      }
    },
    [isConnected, invoke]
  );

  // Load conversation on contact change
  useEffect(() => {
    if (!contact) {
      setMessages([]);
      setConversationId(null);
      return;
    }

    setMessages([]);
    setSkip(0);
    setHasMore(true);
    loadConversationHistory(contact.id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact?.id]);

  // Mark as read when conversation opens
  useEffect(() => {
    if (conversationId && isConnected && contact) {
      invoke('MarkAsRead', conversationId, String(contact.id)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, contact?.id, isConnected]);

  // Listen to SignalR events
  useEffect(() => {
    const handleMessageDelivered = (...args: unknown[]) => {
      const payload = args[0] as { messageId: number | string; deliveredAt: string };
      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === String(payload.messageId)
            ? { ...m, deliveredAt: new Date(payload.deliveredAt) }
            : m
        )
      );
    };

    const handleMessagesRead = (...args: unknown[]) => {
      const payload = args[0] as { conversationId: number; readerId: number; readAt: string };
      if (payload.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.isMine ? { ...m, readAt: new Date(payload.readAt) } : m))
        );
      }
    };

    const handleMessageReaction = (...args: unknown[]) => {
      const payload = args[0] as {
        messageId: number;
        userId: number;
        type: string;
        createdAt: string;
      };
      setMessages((prev) =>
        prev.map((m) => {
          if (Number(m.id) !== payload.messageId) return m;

          const reactions = m.reactions ?? [];
          // Toggle logic: if user already reacted with this emoji, remove it; otherwise add it
          const key = `${payload.userId}:${payload.type}`;
          const exists = reactions.some((r) => `${r.userId}:${r.type}` === key);

          const nextReactions = exists
            ? reactions.filter((r) => `${r.userId}:${r.type}` !== key)
            : [...reactions, { userId: payload.userId, type: payload.type, createdAt: payload.createdAt }];

          return { ...m, reactions: nextReactions };
        })
      );
    };

    const handlePrivateMessage = (payload: PrivateMessageDto) => {
      if (!contact) return;

      const contactUserId = Number(contact.id);
      const currentUserId = Number(user?.userId || 0);
      const payloadFromUserId = Number(payload.fromUserId);
      const payloadToUserId = Number(payload.toUserId);

      if (
        (payloadFromUserId === contactUserId && payloadToUserId === currentUserId) ||
        (payloadFromUserId === currentUserId && payloadToUserId === contactUserId)
      ) {
        const newMessage: ChatMessage = {
          id: Number(payload.id),
          fromUserId: Number(payload.fromUserId),
          toUserId: Number(payload.toUserId),
          message: payload.message,
          sentAt: new Date(payload.sentAt),
          isMine: payloadFromUserId === currentUserId,
          deliveredAt: null,
          readAt: null,
          reactions: [],
        };

        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              Number(m.id) === Number(newMessage.id) ||
              (m.message === newMessage.message &&
                Math.abs(m.sentAt.getTime() - newMessage.sentAt.getTime()) < 2000)
          );
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    };

    on('MessageDelivered', handleMessageDelivered);
    on('MessagesRead', handleMessagesRead);
    on('MessageReaction', handleMessageReaction);
    onReceiveMessage(handlePrivateMessage);

    return () => {
      off('MessageDelivered', handleMessageDelivered);
      off('MessagesRead', handleMessagesRead);
      off('MessageReaction', handleMessageReaction);
      offReceiveMessage(handlePrivateMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, contact?.id, user?.userId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!isLoadingHistory) {
      scrollToBottom();
    }
  }, [messages, isLoadingHistory, scrollToBottom]);

  const loadOlderMessages = useCallback(() => {
    if (contact && conversationId && !isLoadingHistory && hasMore) {
      loadConversationHistory(contact.id, false);
    }
  }, [contact, conversationId, isLoadingHistory, hasMore, loadConversationHistory]);

  return {
    messages,
    conversationId,
    isLoadingHistory,
    hasMore,
    messagesEndRef,
    sendMessage,
    reactToMessage,
    loadOlderMessages,
    scrollToBottom,
  };
};
