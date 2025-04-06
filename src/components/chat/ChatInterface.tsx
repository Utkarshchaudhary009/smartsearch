"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useChatHistory, useSaveChatHistory } from "@/lib/tanstack";
import { Message } from "./types";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { formatChatMessages } from "./utils";
import { ChatSlugGenerator } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { generateSlugTimestamp } from "@/lib/dateUtils";

interface ChatInterfaceProps {
  userId: string | null;
}

// Maximum number of messages allowed for non-logged in users
const MAX_FREE_MESSAGES = 5;

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatSlug = searchParams.get("chatSlug") || "default";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isFirstQuery, setIsFirstQuery] = useState(chatSlug === "default");

  // Use TanStack hooks
  const { data: chatHistoryData, isLoading: isLoadingHistory } = useChatHistory(
    userId || "",
    chatSlug
  );
  const {
    mutate: saveChatHistory,
    isError: isSaveError,
    error: saveError,
  } = useSaveChatHistory();

  // Debugging logs
  useEffect(() => {
    console.log("Debug - userId:", userId);
    console.log("Debug - guestMessageCount:", guestMessageCount);
    console.log("Debug - chatSlug:", chatSlug);
  }, [userId, guestMessageCount, chatSlug]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Reset guest message count when user logs in
  useEffect(() => {
    if (userId) {
      setGuestMessageCount(0);
      localStorage.removeItem("guestMessageCount");
      setShowLoginPrompt(false);
    }
  }, [userId]);

  // Load guest message count from localStorage on component mount
  useEffect(() => {
    if (!userId) {
      try {
        const storedCount = localStorage.getItem("guestMessageCount");
        console.log("Debug - storedCount from localStorage:", storedCount);
        if (storedCount) {
          const count = parseInt(storedCount, 10);
          setGuestMessageCount(count);
          if (count >= MAX_FREE_MESSAGES) {
            setShowLoginPrompt(true);
          }
        } else {
          // Initialize with 0 if not set
          localStorage.setItem("guestMessageCount", "0");
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
        // Default to allowing chats if localStorage fails
        setGuestMessageCount(0);
      }
    }
  }, [userId]);

  // Reset chat when new chat is requested or chatSlug changes to default
  useEffect(() => {
    // Handle new chat request from sidebar
    const newChatRequested = window.localStorage.getItem("newChatRequested");
    if (
      newChatRequested === "true" ||
      (chatSlug === "default" && messages.length > 0)
    ) {
      console.log("Debug - New chat requested, resetting messages");
      setMessages([]);
      setIsFirstQuery(true);
      window.localStorage.removeItem("newChatRequested");
    }
  }, [chatSlug, messages.length]);

  // Load chat history from the server when component mounts or chatSlug changes
  useEffect(() => {
    if (chatHistoryData && !isLoadingHistory && userId) {
      console.log("Debug - chatHistoryData:", chatHistoryData);
      const formattedMessages = formatChatMessages(chatHistoryData);

      // Reset default message if we have history
      if (formattedMessages.length > 0) {
        setMessages(formattedMessages);
        setIsFirstQuery(false);
      }
    }
  }, [chatHistoryData, isLoadingHistory, userId, chatSlug]);

  // Update isFirstQuery when chatSlug changes
  useEffect(() => {
    if (chatSlug === "default") {
      setIsFirstQuery(true);
    } else {
      setIsFirstQuery(false);
    }
  }, [chatSlug]);

  // Helper to create a chat slug from a query
  const createSlugFromQuery = async (query: string): Promise<string> => {
    // Create a slug from the first 5 words (or fewer if there are less than 5)
    const slug = await ChatSlugGenerator(query);
    const words = slug.trim().split(/\s+/).slice(0, 5).join("-");
    const baseSlug = words
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .slice(0, 50); // Limit length

    // Add timestamp to ensure uniqueness using the new date utility function
    const timestamp = generateSlugTimestamp();

    return `${baseSlug}-${timestamp}`;
  };

  const handleSendMessage = async (content: string) => {
    // Clear any previous API errors
    setApiError(null);

    console.log(
      "Debug - handleSendMessage start, userId:",
      userId,
      "guestMessageCount:",
      guestMessageCount,
      "isFirstQuery:",
      isFirstQuery,
      "chatSlug:",
      chatSlug
    );

    // Generate a new slug for the first query at default route
    let currentChatSlug = chatSlug;
    if (isFirstQuery && chatSlug === "default") {
      currentChatSlug = await createSlugFromQuery(content);
      console.log("Debug - created new slug:", currentChatSlug);

      // Use replace instead of push to avoid back button returning to default chat
      router.replace(`/?chatSlug=${currentChatSlug}`, { scroll: false });
      setIsFirstQuery(false);
    }

    // Check if non-logged user has reached message limit
    if (!userId) {
      if (guestMessageCount >= MAX_FREE_MESSAGES) {
        console.log("Debug - guest reached message limit");
        setShowLoginPrompt(true);
        return;
      }
    }

    // Add user message to state
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: "",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Add skeleton message temporarily while loading
    const tempId = uuidv4();
    setMessages((prev) => [
      ...prev,
      {
        role: "agent",
        content: "",
        timestamp: "",
        id: tempId,
        isLoading: true,
      },
    ]);

    try {
      // Create a chat history array for the API
      const chatHistory = messages
        .filter((msg) => !msg.isLoading) // Filter out any skeleton messages
        .map((msg) => ({
          id: uuidv4(),
          role: msg.role === "agent" ? "assistant" : "user",
          content: msg.content,
          timestamp: Date.now(),
        }));

      console.log("Debug - sending API request with chatHistory:", chatHistory);

      // Call the smartai API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch("/api/smartai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          chatHistory,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("Debug - response:", response);
      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error:", response.status, errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Debug - API response:", data);

      // Remove the skeleton message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));

      const agentResponse: Message = {
        role: "agent",
        content: data.message || "Sorry, I couldn't generate a response.",
        timestamp: "",
      };

      setMessages((prev) => [...prev, agentResponse]);

      // Save to database if user is logged in
      if (userId) {
        console.log("Debug - saving to database, chatSlug:", currentChatSlug);
        saveChatHistory({
          clerkId: userId,
          query: content,
          response: agentResponse.content,
          chatSlug: currentChatSlug,
        });

        if (isSaveError) {
          console.error("Debug - Error saving chat:", saveError);
        }
      }

      // Increment guest message count for non-logged users after successful response
      if (!userId) {
        // Increment guest message count
        const newCount = guestMessageCount + 1;
        console.log("Debug - incrementing guest count to:", newCount);
        setGuestMessageCount(newCount);
        localStorage.setItem("guestMessageCount", newCount.toString());

        // Show login prompt when reaching the limit
        if (newCount >= MAX_FREE_MESSAGES) {
          setShowLoginPrompt(true);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove the skeleton message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));

      // Set API error state
      if (error instanceof DOMException && error.name === "AbortError") {
        setApiError("Request timed out. Please try again.");
      } else {
        setApiError(
          "There was a problem connecting to the AI service. Please try again later."
        );
      }

      // Add error message
      const errorMessage: Message = {
        role: "agent",
        content:
          "Sorry, there was an error processing your request. Our team has been notified of the issue. Please try again later.",
        timestamp: "",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-1 flex-col h-[80vh] sm:h-[90%]'>
      <div className='flex-1 h-[30vh] sm:h-[40%] md:h-[50%] overflow-y-auto'>
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      {apiError && (
        <div className='p-4 mx-4 mb-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='h-5 w-5 text-red-500 mt-0.5 flex-shrink-0' />
            <div>
              <h3 className='font-medium text-red-900 dark:text-red-400'>
                Connection Error
              </h3>
              <p className='text-sm text-red-800 dark:text-red-500'>
                {apiError}
              </p>
            </div>
          </div>
        </div>
      )}

      {showLoginPrompt && !userId && (
        <div className='p-4 mx-4 mb-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0' />
            <div className='space-y-2'>
              <h3 className='font-medium text-amber-900 dark:text-amber-400'>
                You&apos;ve reached the guest message limit
              </h3>
              <p className='text-sm text-amber-800 dark:text-amber-500'>
                Sign in to continue chatting with unlimited messages and save
                your chat history.
              </p>
              <div className='pt-1'>
                <SignInButton mode='modal'>
                  <button className='px-4 py-1.5 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'>
                    Sign in
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='px-4 pb-1'>
        <p className='text-xs text-muted-foreground text-center'>
          This AI assistant may provide inaccurate information.
        </p>
      </div>

      <div className='sticky bottom-0 bg-background'>
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={
            (!userId && guestMessageCount >= MAX_FREE_MESSAGES) || !!apiError
          }
        />
      </div>
    </div>
  );
}
