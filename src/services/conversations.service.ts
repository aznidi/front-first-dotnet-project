import { axiosClient } from '@/lib/axios';
import type { ApiResponse, ConversationReadyDto, ChatMessageDto } from '@/types';

interface GetMessagesParams {
  skip?: number;
  take?: number;
}

class ConversationsService {
  async getOrCreateConversation(otherUserId: number): Promise<ApiResponse<ConversationReadyDto>> {
    const response = await axiosClient.get<ApiResponse<ConversationReadyDto>>(
      `/conversations/with/${otherUserId}`
    );
    return response.data;
  }

  async getMessages(
    conversationId: number,
    params?: GetMessagesParams
  ): Promise<ApiResponse<ChatMessageDto[]>> {
    const response = await axiosClient.get<ApiResponse<ChatMessageDto[]>>(
      `/conversations/${conversationId}/messages`,
      {
        params: {
          skip: params?.skip || 0,
          take: params?.take || 50,
        },
      }
    );
    return response.data;
  }
}

export const conversationsService = new ConversationsService();
