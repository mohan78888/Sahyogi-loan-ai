import { useState, useCallback } from 'react';
import { ChatMessage } from '../types/chat';
import { ChatService } from '../services/chatService';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-msg',
    sender: 'assistant',
    text: "Namaste! I am Sahyogi Loan AI Assistant. Ask me anything about loan rejections, FOIR ratios, CIBIL score recovery, or government subsidized schemes.",
    timestamp: 'Just now',
    suggestedFollowups: [
      'Why was my loan rejected?',
      'How do I calculate and reduce FOIR?',
      'What credit score do banks look for?',
      'Tell me about Mudra & KCC schemes',
    ],
  },
];

export function useChat(context?: any) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: text.trim(),
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      try {
        const response = await ChatService.sendMessage(text, context);
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: response.reply,
          timestamp: 'Just now',
          suggestedFollowups: response.suggested_followups,
          disclaimer: response.disclaimer,
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err: any) {
        setError(err.message || 'Unable to connect to AI assistant. Please retry.');
      } finally {
        setLoading(false);
      }
    },
    [loading, context]
  );

  const clearChat = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
  };
}

export default useChat;

