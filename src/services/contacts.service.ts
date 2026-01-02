import { axiosClient } from '@/lib/axios';
import type { ApiResponse, ContactDto } from '@/types';

interface GetContactsParams {
  q?: string;
  page?: number;
  perPage?: number;
}

class ContactsService {
  private endpoint = '/contacts';

  async getAll(params?: GetContactsParams): Promise<ApiResponse<ContactDto[]>> {
    const response = await axiosClient.get<ApiResponse<ContactDto[]>>(this.endpoint, {
      params: {
        q: params?.q || '',
        page: params?.page || 1,
        perPage: params?.perPage || 20,
      },
    });
    return response.data;
  }
}

export const contactsService = new ContactsService();
