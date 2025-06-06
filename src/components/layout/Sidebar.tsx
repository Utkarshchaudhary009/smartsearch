"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useChatSlugs,
  useUpdateChatSlug,
  useDeleteChatsBySlug,
} from "@/lib/tanstack/chat-hooks";
import {
  MessageSquare,
  PlusCircle,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  cleanSlugForDisplay,
  groupChatsByDate,
  generateSlugTimestamp,
} from "@/lib/dateUtils";

interface SidebarProps {
  userId: string | null;
  closeSidebar?: () => void;
}

// Helper function to format a chat slug into a more readable title
function formatChatTitle(slug: string): string {
  // Use the cleanSlugForDisplay utility function
  return cleanSlugForDisplay(slug)
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

// Type for our grouped chats
interface GroupedChats {
  today: string[];
  yesterday: string[];
  week: string[];
  month: string[];
  older: string[];
}

export default function Sidebar({ userId, closeSidebar }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatSlug = searchParams.get("chatSlug") || "default";

  const { data: chatSlugs, isLoading } = useChatSlugs(userId || "");
  const updateChatSlugMutation = useUpdateChatSlug();
  const deleteChatsBySlugMutation = useDeleteChatsBySlug();

  const [formattedSlugs, setFormattedSlugs] = useState<Array<string>>([]);
  const [groupedChats, setGroupedChats] = useState<GroupedChats>({
    today: [],
    yesterday: [],
    week: [],
    month: [],
    older: [],
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [newSlugName, setNewSlugName] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (chatSlugs && !isLoading) {
      // Convert Set to Array
      const slugsArray = Array.from(chatSlugs);
      setFormattedSlugs(slugsArray);

      // Group chats by date using utility function
      const grouped = groupChatsByDate(slugsArray);
      setGroupedChats(grouped);
    }
  }, [chatSlugs, isLoading]);

  const startNewChat = () => {
    // Force a new chat by explicitly setting chatSlug to default
    router.push("/?chatSlug=default");

    // Clear any cached messages for this chat (run any necessary cleanup)
    // This is important to ensure the chat UI fully resets
    window.localStorage.setItem("newChatRequested", "true");

    // Close the sidebar on mobile if closeSidebar function is provided
    if (closeSidebar) {
      closeSidebar();
    }
  };

  const handleEditClick = (slug: string) => {
    setEditingSlug(slug);
    setNewSlugName(formatChatTitle(slug).replace(" ", "-").toLowerCase());
  };

  const handleDeleteClick = async (slug: string) => {
    try {
      setDeletingSlug(slug);
      const result = await deleteChatsBySlugMutation.mutateAsync(slug);
      if (result.success) {
        toast.success("Chat deleted successfully");
        // If we deleted the current chat, redirect to default
        if (currentChatSlug === slug) {
          router.push("/?chatSlug=default");
        }
      } else {
        toast.error("Failed to delete chat");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
      console.error("Error deleting chat:", error);
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleSaveEdit = async (oldSlug: string) => {
    if (!newSlugName.trim()) {
      toast.error("Chat name cannot be empty");
      return;
    }

    try {
      setIsUpdating(true);
      // Generate a new timestamp for the renamed chat
      const timestamp = generateSlugTimestamp();
      const formattedNewSlug = `${newSlugName
        .toLowerCase()
        .replace(/\s+/g, "-")}-${timestamp}`;

      const result = await updateChatSlugMutation.mutateAsync({
        oldSlug: oldSlug,
        newSlug: formattedNewSlug,
      });

      if (result.success) {
        toast.success("Chat name updated");
        setEditingSlug(null);

        // Update URL if we're editing the current chat
        if (currentChatSlug === oldSlug) {
          router.push(`/?chatSlug=${formattedNewSlug}`);
        }
      } else {
        toast.error("Failed to update chat name");
      }
    } catch (error) {
      toast.error("An error occurred while updating");
      console.error("Error updating chat:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, slug: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit(slug);
    }
  };

  const handleCancelEdit = () => {
    setEditingSlug(null);
    setNewSlugName("");
  };

  // Render a chat item
  const renderChatItem = (slug: string) => (
    <div
      key={slug}
      className='flex items-center group relative'
    >
      {editingSlug === slug ? (
        <div className='flex w-full items-center space-x-2 py-1'>
          <Input
            className='h-8'
            value={newSlugName}
            onChange={(e) => setNewSlugName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, slug)}
            autoFocus
          />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleSaveEdit(slug)}
            className='h-8 px-2'
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className='h-4 w-4 animate-spin' /> : "Save"}
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCancelEdit}
            className='h-8 px-2'
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <Button
            variant={currentChatSlug === slug ? "secondary" : "ghost"}
            className='w-full justify-start pr-10'
            asChild
            onClick={() => {
              if (currentChatSlug !== slug && closeSidebar) {
                closeSidebar();
              }
            }}
          >
            <Link href={`/?chatSlug=${slug}`}>
              <MessageSquare className='mr-2 h-4 w-4 flex-shrink-0' />
              <span className='text-balanced max-w-[200px] overflow-x-scroll'>
                {slug === "default" ? "New Chat" : formatChatTitle(slug)}
              </span>
            </Link>
          </Button>
          {slug !== "default" && (
            <div className='absolute right-1'>
              {deletingSlug === slug ? (
                <div className='flex items-center justify-center w-8 h-8'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <MoreVertical className='h-4 w-4' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => handleEditClick(slug)}>
                      <Pencil className='mr-2 h-4 w-4' />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(slug)}>
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  // Render section with header
  const renderSection = (title: string, slugs: string[]) => {
    if (slugs.length === 0) return null;

    return (
      <div className='space-y-1 mb-4'>
        <h3 className='text-xs font-medium text-muted-foreground px-2 mb-1 flex items-center'>
          <CalendarDays className='h-3 w-3 mr-1' />
          {title}
        </h3>
        <div className='space-y-1'>{slugs.map(renderChatItem)}</div>
      </div>
    );
  };

  return (
    <div className='flex flex-col h-full py-4'>
      <div className='px-4 py-2'>
        <h2 className='mb-2 px-2 text-lg font-semibold'>Your Chats</h2>
        <Button
          variant='outline'
          className='w-full justify-start'
          onClick={startNewChat}
        >
          <PlusCircle className='mr-2 h-4 w-4' />
          New Chat
        </Button>
      </div>
      <Separator className='my-2' />
      <ScrollArea className='flex-1 px-4 h-[70vh] overflow-y-scroll'>
        {isLoading ? (
          <div className='flex justify-center py-4'>
            <p className='text-sm text-muted-foreground'>Loading chats...</p>
          </div>
        ) : formattedSlugs.length > 0 ? (
          <div className='py-2'>
            {renderSection("Today", groupedChats.today)}
            {renderSection("Yesterday", groupedChats.yesterday)}
            {renderSection("Previous 7 Days", groupedChats.week)}
            {renderSection("Previous 30 Days", groupedChats.month)}
            {renderSection("Older", groupedChats.older)}
          </div>
        ) : (
          <div className='flex justify-center py-4'>
            <p className='text-sm text-muted-foreground'>No chat history</p>
          </div>
        )}
      </ScrollArea>
      <div className='px-4 py-2'>
        <p className='text-xs text-center text-muted-foreground'>
          Smart Search © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
