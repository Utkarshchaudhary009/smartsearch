"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useChatHistory, useSaveChatHistory } from "@/lib/tanstack";
import { Message } from "./types";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { formatChatMessages } from "./utils";
import { AlertCircle } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

interface ChatInterfaceProps {
  userId: string | null;
}

// Maximum number of messages allowed for non-logged in users
const MAX_FREE_MESSAGES = 5;

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const searchParams = useSearchParams();
  const chatSlug = searchParams.get("chatSlug") || "default";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: "Hello, I am a generative AI assistant. How may I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Use TanStack hooks
  const { data: chatHistoryData, isLoading: isLoadingHistory } = useChatHistory(
    userId || "",
    chatSlug
  );
  const { mutate: saveChatHistory } = useSaveChatHistory();

  // Load guest message count from localStorage on component mount
  useEffect(() => {
    if (!userId) {
      const storedCount = localStorage.getItem('guestMessageCount');
      if (storedCount) {
        const count = parseInt(storedCount, 10);
        setGuestMessageCount(count);
        if (count >= MAX_FREE_MESSAGES) {
          setShowLoginPrompt(true);
        }
      }
    }
  }, [userId]);

  // Load chat history from the server when component mounts or chatSlug changes
  useEffect(() => {
    if (chatHistoryData && !isLoadingHistory && userId) {
      const formattedMessages = formatChatMessages(chatHistoryData);
      
      // Reset default message if we have history
      if (formattedMessages.length > 0) {
        setMessages(formattedMessages);
      }
    }
  }, [chatHistoryData, isLoadingHistory, userId, chatSlug]);

  const handleSendMessage = async (content: string) => {
    // Check if non-logged user has reached message limit
    if (!userId) {
      if (guestMessageCount >= MAX_FREE_MESSAGES) {
        setShowLoginPrompt(true);
        return;
      }
      
      // Increment guest message count
      const newCount = guestMessageCount + 1;
      setGuestMessageCount(newCount);
      localStorage.setItem('guestMessageCount', newCount.toString());
      
      // Show login prompt when reaching the limit
      if (newCount >= MAX_FREE_MESSAGES) {
        setShowLoginPrompt(true);
      }
    }

    // Add user message to state
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create a chat history array for the API
      const chatHistory = messages.map(msg => ({
        id: uuidv4(),
        role: msg.role === "agent" ? "assistant" : "user",
        content: msg.content,
        timestamp: Date.now()
      }));

      // Call the smartai API
      const response = await fetch("/api/smartai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          chatHistory
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const agentResponse: Message = {
        role: "agent",
        content: data.message,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prev => [...prev, agentResponse]);
      
      // Save to database if user is logged in
      if (userId) {
        saveChatHistory({
          clerkId: userId,
          query: content,
          response: agentResponse.content,
          chatSlug,
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      const errorMessage: Message = {
        role: "agent",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <MessageList messages={messages} />
      
      {showLoginPrompt && !userId && (
        <div className="p-4 mx-4 mb-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-medium text-amber-900 dark:text-amber-400">
                You&apos;ve reached the guest message limit
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-500">
                Sign in to continue chatting with unlimited messages and save your chat history.
              </p>
              <div className="pt-1">
                <SignInButton mode="modal">
                  <button className="px-4 py-1.5 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Sign in
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="px-4 pb-1">
        <p className="text-xs text-muted-foreground text-center">
          This AI assistant provides information based on its training data and may occasionally produce inaccurate or incomplete responses. Please verify important information from reliable sources.
        </p>
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        disabled={!userId && guestMessageCount >= MAX_FREE_MESSAGES}
      />
    </div>
  );
}
