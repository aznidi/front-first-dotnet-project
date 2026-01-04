import { MessageCircle } from 'lucide-react';

interface ContactItemProps {
  contact: {
    id: number;
    fullName: string;
    email: string;
  };
  unreadCount?: number;
  isActive: boolean;
  onClick: () => void;
}

export const ContactItem = ({
  contact,
  unreadCount = 0,
  isActive,
  onClick,
}: ContactItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors border-b ${
        isActive ? 'bg-accent' : ''
      }`}
    >
      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-primary">
          {contact.fullName.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <p className={`font-medium text-sm truncate ${unreadCount > 0 ? 'text-foreground' : ''}`}>
            {contact.fullName}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
      </div>

      {!unreadCount && (
        <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
    </button>
  );
};
