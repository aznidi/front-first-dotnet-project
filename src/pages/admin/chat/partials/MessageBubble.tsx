import { useState } from 'react';
import { Check, CheckCheck, Smile } from 'lucide-react';
import { toast } from 'react-toastify';

interface Reaction {
  userId: number;
  type: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: {
    id: string | number;
    message: string;
    sentAt: Date;
    isMine: boolean;
    deliveredAt?: Date | null;
    readAt?: Date | null;
    reactions?: Reaction[];
  };
  onReact: (messageId: number | string, emoji: string) => Promise<void>;
}

const ALLOWED_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'] as const;

export const MessageBubble = ({ message, onReact }: MessageBubbleProps) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReaction = async (emoji: string) => {
    try {
      await onReact(message.id, emoji);
      setShowReactionPicker(false);
    } catch {
      toast.error('Failed to react to message');
    }
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionCounts = message.reactions.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex gap-1 mt-1.5 flex-wrap">
        {Object.entries(reactionCounts).map(([emoji, count]) => (
          <span
            key={emoji}
            className="text-xs px-1.5 py-0.5 rounded-full bg-background/20 border border-background/30"
          >
            {emoji} {count > 1 && count}
          </span>
        ))}
      </div>
    );
  };

  const renderStatus = () => {
    if (!message.isMine) return null;

    if (message.readAt) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    if (message.deliveredAt) {
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    }
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div
      className={`flex flex-col gap-1 mb-3 ${
        message.isMine ? 'items-end' : 'items-start'
      }`}
    >
      <div className="relative group max-w-[70%]">
        <div
          className={`px-3 py-2 rounded-2xl ${
            message.isMine
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-accent text-accent-foreground rounded-bl-sm'
          }`}
        >
          <p className="text-sm break-words whitespace-pre-wrap">{message.message}</p>
          {renderReactions()}
        </div>

        {/* Reaction Button - Only show on received messages */}
        {!message.isMine && (
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-full p-1 shadow-sm hover:shadow-md"
            title="React"
          >
            <Smile className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}

        {/* Reaction Picker - Vertical Layout */}
        {showReactionPicker && !message.isMine && (
          <div className="absolute top-0 right-0 mt-8 bg-popover border rounded-lg shadow-xl p-1.5 flex flex-col gap-0.5 z-50 min-w-[3rem]">
            {ALLOWED_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-xl hover:scale-110 transition-all p-2 hover:bg-accent rounded-md flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
        <span>{message.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {renderStatus()}
      </div>
    </div>
  );
};
