import { useState, useEffect } from 'react';
import { contactsService } from '@/services';
import { parseApiError } from '@/utils';
import { toast } from 'react-toastify';
import type { ContactDto } from '@/types';

export const useContacts = () => {
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactDto | null>(null);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await contactsService.getAll();
      if (response.success && response.data) {
        setContacts(response.data);
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      toast.error('Failed to load contacts: ' + parsedError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    isLoading,
    selectedContact,
    setSelectedContact,
    refreshContacts: fetchContacts,
  };
};
