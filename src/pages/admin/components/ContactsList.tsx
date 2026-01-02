import { useState, useEffect } from 'react';
import { 
    // Input,
    Button } from '@/components/ui';
import { 
    // Search,
    MessageCircle,
    Loader2 } from 'lucide-react';
import { contactsService } from '@/services';
import { parseApiError } from '@/utils';
import type { ContactDto } from '@/types';

interface ContactsListProps {
  onSelectContact: (contact: ContactDto) => void;
  selectedContactId?: number;
}

export const ContactsList = ({ onSelectContact, selectedContactId }: ContactsListProps) => {
  const [contacts, setContacts] = useState<ContactDto[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async (query: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await contactsService.getAll({ q: query, page: 1, perPage: 50 });
      if (response.success && response.data) {
        setContacts(response.data);
      }
    } catch (err) {
      const parsedError = parseApiError(err);
      setError(parsedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     fetchContacts(searchQuery);
//   };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      {/* <div className="p-4 border-b">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="pl-10"
            />
          </div>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </form>
      </div> */}

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-4 text-center text-red-600">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchContacts()} className="mt-2">
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>No contacts found</p>
          </div>
        ) : (
          <div className="divide-y">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className={`w-full p-4 text-left hover:bg-accent transition-colors flex items-center gap-3 ${
                  selectedContactId === contact.id ? 'bg-accent' : ''
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {contact.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{contact.fullName}</p>
                  <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                </div>
                <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
