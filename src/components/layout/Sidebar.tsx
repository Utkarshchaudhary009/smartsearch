"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useChatSlugs } from "@/lib/tanstack/chat-hooks";
import { MessageSquare, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  userId: string | null;
}

// Helper function to format a chat slug into a more readable title
function formatChatTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/(\d{6})$/, "") // Remove timestamp if present
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

export default function Sidebar({ userId }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatSlug = searchParams.get("chatSlug") || "default";
  
  const { data: chatSlugs, isLoading } = useChatSlugs(userId || "");
  const [formattedSlugs, setFormattedSlugs] = useState<Array<string>>([]);
  
  useEffect(() => {
    if (chatSlugs && !isLoading) {
      // Convert Set to Array and ensure "default" is first if it exists
      const slugsArray = Array.from(chatSlugs);
      if (slugsArray.includes("default")) {
        const defaultIndex = slugsArray.indexOf("default");
        slugsArray.splice(defaultIndex, 1);
        slugsArray.unshift("default");
      }
      setFormattedSlugs(slugsArray);
    }
  }, [chatSlugs, isLoading]);
  
  const startNewChat = () => {
    // Force a new chat by explicitly setting chatSlug to default
    router.push("/?chatSlug=default");
    
    // Clear any cached messages for this chat (run any necessary cleanup)
    // This is important to ensure the chat UI fully resets
    window.localStorage.setItem('newChatRequested', 'true');
  };
  
  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 py-2">
        <h2 className="mb-2 px-2 text-lg font-semibold">Your Chats</h2>
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={startNewChat}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <Separator className="my-2" />
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 py-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <p className="text-sm text-muted-foreground">Loading chats...</p>
            </div>
          ) : formattedSlugs.length > 0 ? (
            formattedSlugs.map((slug) => (
              <Button
                key={slug}
                variant={currentChatSlug === slug ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={`/?chatSlug=${slug}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {slug === "default" ? "New Chat" : formatChatTitle(slug)}
                  </span>
                </Link>
              </Button>
            ))
          ) : (
            <div className="flex justify-center py-4">
              <p className="text-sm text-muted-foreground">No chat history</p>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="px-4 py-2">
        <p className="text-xs text-center text-muted-foreground">
          Smart Search © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
} 