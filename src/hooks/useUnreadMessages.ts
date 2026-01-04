import { useState, useEffect, useCallback } from 'react';
import type { PrivateMessageDto } from '@/types';

interface UnreadCounts {
  [contactId: number]: number;
}

interface UseUnreadMessagesProps {
  currentUserId: string | undefined;
  selectedContactId: number | null;
  onReceiveMessage: (callback: (payload: PrivateMessageDto) => void) => void;
  offReceiveMessage: (callback: (payload: PrivateMessageDto) => void) => void;
}

export const useUnreadMessages = ({
  currentUserId,
  selectedContactId,
  onReceiveMessage,
  offReceiveMessage,
}: UseUnreadMessagesProps) => {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});

  const incrementUnread = useCallback((contactId: number) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [contactId]: (prev[contactId] || 0) + 1,
    }));
  }, []);

  const clearUnread = useCallback((contactId: number) => {
    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[contactId];
      return newCounts;
    });
  }, []);

  useEffect(() => {
    const handlePrivateMessage = (payload: PrivateMessageDto) => {
      const payloadFromUserId = String(payload.fromUserId);
      const payloadToUserId = String(payload.toUserId);

      // Only count if message is for me and from someone else
      if (payloadToUserId === currentUserId && payloadFromUserId !== currentUserId) {
        const fromContactId = Number(payload.fromUserId);
        
        // Don't increment if this is the currently selected contact
        if (fromContactId !== selectedContactId) {
          incrementUnread(fromContactId);
        }
      }
    };

    onReceiveMessage(handlePrivateMessage);

    return () => {
      offReceiveMessage(handlePrivateMessage);
    };
  }, [currentUserId, selectedContactId, incrementUnread, onReceiveMessage, offReceiveMessage]);

  // Clear unread when selecting a contact
  useEffect(() => {
    if (selectedContactId !== null) {
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[selectedContactId];
        return newCounts;
      });
    }
  }, [selectedContactId]);

  return {
    unreadCounts,
    clearUnread,
    incrementUnread,
  };
};
