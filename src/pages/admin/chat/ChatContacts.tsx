import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui';
import { ContactItem } from './partials';
import type { ContactDto } from '@/types';

interface ChatContactsProps {
  contacts: ContactDto[];
  isLoading: boolean;
  selectedContact: ContactDto | null;
  unreadCounts: Record<number, number>;
  onSelectContact: (contact: ContactDto) => void;
}

export const ChatContacts = ({
  contacts,
  isLoading,
  selectedContact,
  unreadCounts,
  onSelectContact,
}: ChatContactsProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter((contact) =>
    contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b bg-background">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
            <p className="text-sm">
              {searchQuery ? 'No contacts found' : 'No contacts available'}
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              unreadCount={unreadCounts[contact.id] || 0}
              isActive={selectedContact?.id === contact.id}
              onClick={() => onSelectContact(contact)}
            />
          ))
        )}
      </div>
    </div>
  );
};
