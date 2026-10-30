import { request } from './api';
import { ChatResponse } from '../types/chat';

export const ChatService = {
  async sendMessage(query: string, context?: any): Promise<ChatResponse> {
    return await request<ChatResponse>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        query: query.trim(),
        context: context || null,
      }),
    });
  },
};

export default ChatService;

