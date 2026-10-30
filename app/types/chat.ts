export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedFollowups?: string[];
  disclaimer?: string;
}

export interface ChatResponse {
  reply: string;
  suggested_followups: string[];
  disclaimer?: string;
}

