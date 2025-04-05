import { Message, ChatMessage } from "./types";

/**
 * Formats raw chat history data from the database into the UI message format
 */
export function formatChatMessages(chatHistory: ChatMessage[]): Message[] {
  const messages: Message[] = [];

  for (const chat of chatHistory) {
    // Add user message
    messages.push({
      role: "user",
      content: chat.query,
      timestamp: new Date(chat.created_at).toLocaleTimeString(),
    });

    // Add agent response
    messages.push({
      role: "agent",
      content: chat.response,
      timestamp: new Date(chat.created_at).toLocaleTimeString(),
    });
  }

  return messages;
}
