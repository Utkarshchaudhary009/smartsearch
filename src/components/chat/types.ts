export interface Message {
  role: "agent" | "user";
  content: string;
  timestamp: string;
  id?: string;
  isLoading?: boolean;
  status?: "sent" | "queued" | "failed";
}

export interface ChatMessage {
  id: string;
  clerk_id: string;
  query: string;
  response: string;
  chat_slug: string;
  created_at: string;
}
