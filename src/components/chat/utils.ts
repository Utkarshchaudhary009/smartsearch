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
      timestamp: "",
      status: "sent",
    });

    // Add agent response
    messages.push({
      role: "agent",
      content: chat.response,
      timestamp: "",
      status: "sent",
    });
  }

  return messages;
}
