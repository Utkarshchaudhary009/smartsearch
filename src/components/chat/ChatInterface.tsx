"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { useOnline } from "@/hooks/useOnline";
import { toast } from "sonner";
import Image from "next/image";

// localStorage keys
const GUEST_MSG_COUNT_KEY = "guestMessageCount";
const OFFLINE_MESSAGES_KEY = "offlineMessages";
const OFFLINE_INPUT_KEY = "offlineInput";

interface ChatInterfaceProps {
  userId: string | null;
}

// Maximum number of messages allowed for non-logged in users
const MAX_FREE_MESSAGES = 5;

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatSlug = searchParams.get("chatSlug") || "default";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isFirstQuery, setIsFirstQuery] = useState(chatSlug === "default");
  const isOnline = useOnline();
  const [wasOnline, setWasOnline] = useState(isOnline);
  const [input, setInput] = useState("");
  const [ifErrorInput, setIfErrorInput] = useState("");
  // Add a state to track the current working slug
  const [currentWorkingSlug, setCurrentWorkingSlug] =
    useState<string>(chatSlug);
  const [showTagline, setShowTagline] = useState(false);

  // Use TanStack hooks
  const { data: chatHistoryData, isLoading: isLoadingHistory } = useChatHistory(
    userId || "",
    currentWorkingSlug // Use the working slug for data fetching
  );
  const {
    mutate: saveChatHistory,
    isError: isSaveError,
    error: saveError,
  } = useSaveChatHistory();

  // --- Persistence Logic ---

  // Save messages to localStorage
  useEffect(() => {
    try {
      // Save only non-history messages or if guest
      if (!userId || chatSlug === "default") {
        const messagesToSave = messages.filter((m) => !m.isLoading); // Don't save loading skeletons
        localStorage.setItem(
          OFFLINE_MESSAGES_KEY,
          JSON.stringify(messagesToSave)
        );
      }
    } catch (error) {
      console.error("Error saving messages to localStorage:", error);
    }
  }, [messages, userId, chatSlug]);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(OFFLINE_MESSAGES_KEY);
      if (storedMessages && (!userId || chatSlug === "default")) {
        // Load only for guests or new chats
        const parsedMessages: Message[] = JSON.parse(storedMessages);
        // Only set if messages state is currently empty to avoid overwriting history/live updates
        if (messages.length === 0) {
          setMessages(parsedMessages);
          // If loaded messages exist, hide tagline
          if (parsedMessages.length > 0) setShowTagline(false);
        }
      }
      // Load saved input
      const storedInput = localStorage.getItem(OFFLINE_INPUT_KEY);
      if (storedInput) {
        setInput(storedInput);
      }
    } catch (error) {
      console.error("Error loading state from localStorage:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  // Save input to localStorage as user types
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_INPUT_KEY, input);
    } catch (error) {
      console.error("Error saving input to localStorage:", error);
    }
  }, [input]);

  // --- End Persistence Logic ---

  // Update currentWorkingSlug whenever chatSlug changes, handle guests
  useEffect(() => {
    if (userId) {
      // If user is logged in, sync with URL slug
      setCurrentWorkingSlug(chatSlug);
      console.log("Debug - Updated working slug to match URL:", chatSlug);
      // Clear guest messages if navigating to a saved chat
      if (chatSlug !== "default") {
        localStorage.removeItem(OFFLINE_MESSAGES_KEY);
        localStorage.removeItem(OFFLINE_INPUT_KEY); // Clear input too
        // If messages were loaded from guest storage, clear them
        if (messages.some((m) => m.status === "queued")) {
          setMessages([]);
        }
      }
    } else {
      // Force guest to default context and clear potentially loaded slug messages
      setCurrentWorkingSlug("default");
      setMessages((prev) => prev.filter((m) => m.status === "queued")); // Keep only queued
      if (chatSlug !== "default") {
        // If guest somehow landed on slug URL, redirect to default cleanly
        router.replace("/", { scroll: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatSlug, userId]); // Removed router dependency, replace handles it

  // Debugging logs
  useEffect(() => {
    console.log("Debug - userId:", userId);
    console.log("Debug - guestMessageCount:", guestMessageCount);
    console.log("Debug - chatSlug:", chatSlug);
    console.log("Debug - currentWorkingSlug:", currentWorkingSlug);
  }, [userId, guestMessageCount, chatSlug, currentWorkingSlug]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Reset guest message count & clear offline data when user logs in
  useEffect(() => {
    if (userId) {
      setGuestMessageCount(0);
      localStorage.removeItem(GUEST_MSG_COUNT_KEY);
      localStorage.removeItem(OFFLINE_MESSAGES_KEY); // Clear guest offline messages
      localStorage.removeItem(OFFLINE_INPUT_KEY); // Clear offline input
      setInput(""); // Clear current input state
      setShowLoginPrompt(false);
      // Fetch history for the potentially new slug user landed on
      // queryClient.invalidateQueries(chatKeys.history(userId, currentWorkingSlug)); // Optional: Force history refetch
    }
  }, [userId]);

  // Process queued messages when coming online
  const processQueuedMessages = useCallback(async () => {
    const queuedMessages = messages.filter(
      (msg) => msg.status === "queued" && msg.role === "user"
    );
    if (queuedMessages.length === 0) return;

    console.log("Processing queued messages:", queuedMessages.length);
    toast("Syncing offline messages...");

    // Process one message at a time to avoid UI confusion
    for (const msg of queuedMessages) {
      try {
        // Update status for visual feedback - original message stays visible
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "sent" } : m))
        );

        setIsLoading(true);

        // Call API directly without creating a new skeleton message
        const chatHistory = messages
          .filter((m) => m.status === "sent" && !m.isLoading && m.id !== msg.id)
          .map((m) => ({
            id: m.id || uuidv4(),
            role: m.role === "agent" ? "assistant" : "user",
            content: m.content,
            timestamp: Date.parse(m.timestamp) || Date.now(),
          }));

        // Add the current message to the history
        chatHistory.push({
          id: msg.id || uuidv4(),
          role: "user",
          content: msg.content,
          timestamp: Date.now(),
        });

        // Call API directly without handleSendMessage to avoid duplicate skeletons
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch("/api/smartai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: msg.content,
            clerkId:userId || "guest_user",
            chatHistory,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Add the agent response
        const agentResponse: Message = {
          id: uuidv4(),
          role: "agent",
          content: data.message || "Sorry, I couldn't generate a response.",
          timestamp: new Date().toISOString(),
          status: "sent",
        };

        setMessages((prev) => [...prev, agentResponse]);

        // Handle slug generation and database saving if needed
        let finalSlug = currentWorkingSlug;
        if (userId && isFirstQuery && currentWorkingSlug === "default") {
          const newSlug = await createSlugFromQuery(
            `user:"${msg.content}" -> Ai:"${agentResponse.content}"`
          );
          setCurrentWorkingSlug(newSlug);
          finalSlug = newSlug;
          setIsFirstQuery(false);

          // Update URL for logged-in users
          router.push(`/?chatSlug=${newSlug}`, { scroll: false });
        }

        // Save to database for logged-in users
        if (userId && finalSlug !== "default") {
          saveChatHistory({
            clerkId: userId,
            query: msg.content,
            response: agentResponse.content,
            chatSlug: finalSlug,
          });
        }

        // Update guest message count if needed
        if (!userId) {
          const newCount = guestMessageCount + 1;
          setGuestMessageCount(newCount);
          localStorage.setItem(GUEST_MSG_COUNT_KEY, newCount.toString());
          if (newCount >= MAX_FREE_MESSAGES) {
            setShowLoginPrompt(true);
          }
        }
      } catch (error) {
        console.error("Failed to send queued message:", msg.id, error);
        // Mark as failed on error
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "failed" } : m))
        );
        toast.error(
          `Failed to send message: ${msg.content.substring(0, 20)}...`
        );
      } finally {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, userId, currentWorkingSlug, isFirstQuery]);

  // Online status change handler
  useEffect(() => {
    if (isOnline !== wasOnline) {
      toast(isOnline ? "Back Online" : "Offline", {
        description: isOnline
          ? "Connection restored. You can continue chatting."
          : "You're offline. Messages will be queued.", // Updated description
      });
      setWasOnline(isOnline);
      if (isOnline) {
        processQueuedMessages();
      }
    }
  }, [isOnline, wasOnline, processQueuedMessages]);

  // Load guest message count from localStorage on component mount
  useEffect(() => {
    if (!userId) {
      try {
        const storedCount = localStorage.getItem(GUEST_MSG_COUNT_KEY);
        if (storedCount) {
          const count = parseInt(storedCount, 10);
          setGuestMessageCount(count);
          if (count >= MAX_FREE_MESSAGES) {
            setShowLoginPrompt(true);
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage for guest count:", error);
        setGuestMessageCount(0);
      }
    }
  }, [userId]);

  // Show tagline based on state
  useEffect(() => {
    // Show tagline if it's the default chat, no messages are present, and history isn't loading
    if (
      currentWorkingSlug === "default" &&
      messages.length === 0 &&
      !isLoadingHistory
    ) {
      setShowTagline(true);
    } else {
      setShowTagline(false);
    }
  }, [currentWorkingSlug, messages.length, isLoadingHistory]);

  // Reset chat state for new chat requests (logged-in users)
  useEffect(() => {
    const newChatRequested = window.localStorage.getItem("newChatRequested");
    // Reset for both logged-in users and guests when new chat is requested
    if (newChatRequested === "true") {
      console.log("Debug - New chat requested, resetting messages");
      setMessages([]);
      setIsFirstQuery(true);
      setShowTagline(true);
      setCurrentWorkingSlug("default"); // Explicitly set to default

      // Clear localStorage regardless of user status
      localStorage.removeItem(OFFLINE_MESSAGES_KEY);
      localStorage.removeItem(OFFLINE_INPUT_KEY);
      setInput("");

      window.localStorage.removeItem("newChatRequested");

      // Ensure URL reflects default state if not already there (for logged-in users)
      if (userId && chatSlug !== "default") {
        router.replace("/", { scroll: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, chatSlug]);

  // Load chat history from server (logged-in users, non-default slug)
  useEffect(() => {
    if (
      chatHistoryData &&
      !isLoadingHistory &&
      userId &&
      currentWorkingSlug !== "default"
    ) {
      console.log("Debug - Loading history for:", currentWorkingSlug);
      const formattedMessages = formatChatMessages(chatHistoryData);
      // Check if component is still mounted and slug hasn't changed back to default
      if (formattedMessages.length > 0 && currentWorkingSlug === chatSlug) {
        setMessages(formattedMessages);
        setIsFirstQuery(false);
        setShowTagline(false);
        // Clear any potential guest/offline messages now that history is loaded
        localStorage.removeItem(OFFLINE_MESSAGES_KEY);
        localStorage.removeItem(OFFLINE_INPUT_KEY);
      }
    }
    // Ensure history load is tied to the specific slug from the URL
  }, [chatHistoryData, isLoadingHistory, userId, currentWorkingSlug, chatSlug]);

  // Update isFirstQuery based on currentWorkingSlug
  useEffect(() => {
    setIsFirstQuery(currentWorkingSlug === "default");
  }, [currentWorkingSlug]);

  // Helper to create a chat slug (only used for logged-in users)
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

  const handleSendMessage = useCallback(
    async (content: string, isResend: boolean = false) => {
      // Hide tagline
      if (showTagline) setShowTagline(false);
      setIfErrorInput(input);
      setInput("");
      setApiError(null);

      const messageId = uuidv4(); // Generate ID upfront for queuing

      // --- Offline Handling ---
      if (!isOnline) {
        if (!isResend) {
          toast("Offline", {
            description: "Message queued. Will send when online.",
          });
          const userMessage: Message = {
            id: messageId,
            role: "user",
            content,
            timestamp: new Date().toISOString(),
            status: "queued",
          };
          setMessages((prev) => [...prev, userMessage]);
          setInput(""); // Clear input after queuing
          localStorage.removeItem(OFFLINE_INPUT_KEY); // Clear saved input
        }
        // Don't proceed with API call if offline
        return;
      }
      // --- End Offline Handling ---

      // Guest limit check
      if (!userId) {
        if (guestMessageCount >= MAX_FREE_MESSAGES) {
          setShowLoginPrompt(true);
          return;
        }
      }

      // Add user message to state (if not a resend already added)
      if (!isResend) {
        const userMessage: Message = {
          id: messageId,
          role: "user",
          content,
          timestamp: new Date().toISOString(),
          status: "sent", // Assume sent initially when online
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      setIsLoading(true);
      const tempAgentId = uuidv4();
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "",
          timestamp: "",
          id: tempAgentId,
          isLoading: true,
        },
      ]);

      try {
        // Prepare history: include only 'sent' messages, exclude loading/queued
        const chatHistory = messages
          .filter((msg) => msg.status === "sent" && !msg.isLoading)
          .map((msg) => ({
            id: msg.id || uuidv4(),
            role: msg.role === "agent" ? "assistant" : "user",
            content: msg.content,
            timestamp: Date.parse(msg.timestamp) || Date.now(),
          }));

        // Call API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const response = await fetch("/api/smartai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, clerkId: userId || "guest_user", chatHistory }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();

        // Clear input only on successful online send
        if (!isResend) {
          localStorage.removeItem(OFFLINE_INPUT_KEY);
        }

        setMessages((prev) => prev.filter((msg) => msg.id !== tempAgentId)); // Remove skeleton

        const agentResponse: Message = {
          role: "agent",
          content: data.message || "Sorry, I couldn't generate a response.",
          timestamp: new Date().toISOString(),
          status: "sent",
        };
        setMessages((prev) => [...prev, agentResponse]);

        // --- Post-send logic (Slug generation & Saving) ---

        let finalSlug = currentWorkingSlug;

        // Generate slug only for logged-in users on the first message of a default chat
        if (userId && isFirstQuery && currentWorkingSlug === "default") {
          const newSlug = await createSlugFromQuery(
            `user:"${content}" -> Ai:"${agentResponse.content}"`
          );
          console.log("Debug - created new slug:", newSlug);
          setCurrentWorkingSlug(newSlug);
          finalSlug = newSlug;
          setIsFirstQuery(false);

          // Update URL immediately for logged-in user
          router.push(`/?chatSlug=${newSlug}`, { scroll: false });
        }

        // Save to database only if logged in and slug is determined
        if (userId && finalSlug !== "default") {
          console.log("Debug - saving to database, chatSlug:", finalSlug);
          saveChatHistory({
            clerkId: userId,
            query: content,
            response: agentResponse.content,
            chatSlug: finalSlug,
          });
          if (isSaveError) {
            console.error("Debug - Error saving chat:", saveError);
            // Optionally revert message status or show error toast
          }
        } else if (!userId) {
          // Increment guest count only after successful response
          const newCount = guestMessageCount + 1;
          setGuestMessageCount(newCount);
          localStorage.setItem(GUEST_MSG_COUNT_KEY, newCount.toString());
          if (newCount >= MAX_FREE_MESSAGES) {
            setShowLoginPrompt(true);
          }
        }
        // --- End Post-send logic ---
      } catch (error: unknown) {
        console.error("Error sending message:", error);
        setMessages((prev) => prev.filter((msg) => msg.id !== tempAgentId)); // Remove skeleton

        setInput(ifErrorInput);
        const errorMessageContent =
          error instanceof DOMException && error.name === "AbortError"
            ? "Request timed out. Please try again."
            : "There was a problem connecting to the AI service. Please try again later.";
        setApiError(errorMessageContent);

        const errorMessage: Message = {
          role: "agent",
          content:
            "Sorry, there was an error processing your request. Our team has been notified.",
          timestamp: new Date().toISOString(),
          status: "failed", // Mark agent response as failed too
        };
        setMessages((prev) => [...prev, errorMessage]);

        // Mark the original user message as failed if it was an online attempt
        if (!isResend && isOnline) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, status: "failed" } : m
            )
          );
        }
      } finally {
        setIsLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      messages,
      isOnline,
      userId,
      guestMessageCount,
      currentWorkingSlug,
      isFirstQuery,
      saveChatHistory,
      router,
      showTagline,
    ]
  );

  const handleRetry = (content: string) => {
    setApiError(null); // Clear previous error display
    // Find the failed message by content (could be improved with ID if available)
    const failedMessage = messages.find(
      (m) => m.role === "user" && m.content === content && m.status === "failed"
    );
    if (failedMessage) {
      // Update status to indicate retry attempt
      setMessages((prev) =>
        prev.map((m) =>
          m.id === failedMessage.id
            ? { ...m, status: "queued", isLoading: true }
            : m
        )
      );
      handleSendMessage(content, true); // Use useCallback version
    } else {
      // Fallback if message not found (shouldn't happen often)
      handleSendMessage(content); // Use useCallback version
    }
  };

  return (
    <div className='flex flex-1 flex-col h-[80vh] sm:h-[90%]'>
      <div className='flex-1 h-[30vh] sm:h-[40%] md:h-[50%] overflow-y-auto relative'>
        {/* Tagline Logic */}
        {showTagline && (
          <div className='absolute inset-0 flex flex-col items-center justify-center text-center p-4 opacity-70'>
            <Image
              src='/web-app-manifest-192x192.svg'
              alt='SmartSearch Logo'
              width={64}
              height={64}
              className='mb-4 rounded-xl'
            />
            <h2 className='text-xl font-semibold text-muted-foreground'>
              Get Results, Not Links
            </h2>
          </div>
        )}
        {/* Message List Logic */}
        {(!showTagline || messages.length > 0) && (
          <MessageList
            messages={messages}
            onRetry={handleRetry}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
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

      {/* Login Prompt */}
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

      {/* Chat Input */}
      <div className='sticky bottom-0 bg-background'>
        <ChatInput
          onSendMessage={(msg) => handleSendMessage(msg)} // Pass the useCallback version
          ButtonText={isOnline ? "Send" : "Queued"} // Changed button text for offline
          TextareaPlaceholder={
            isOnline
              ? "Message SmartSearch..."
              : "Offline - Messages will be queued."
          }
          isLoading={isLoading}
          input={input}
          setInput={setInput}
          disabled={
            (!userId && guestMessageCount >= MAX_FREE_MESSAGES) ||
            (!isOnline && isLoading)
          } // Adjusted disabled logic
        />
      </div>
    </div>
  );
}
