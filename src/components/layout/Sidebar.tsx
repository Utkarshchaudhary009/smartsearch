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

interface SidebarProps {
  userId: string | null;
}

// Helper function to format a chat slug into a more readable title
function formatChatTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/(\d{6})$/, "") // Remove timestamp if present
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

export default function Sidebar({ userId }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatSlug = searchParams.get("chatSlug") || "default";

  const { data: chatSlugs, isLoading } = useChatSlugs(userId || "");
  const updateChatSlugMutation = useUpdateChatSlug();
  const deleteChatsBySlugMutation = useDeleteChatsBySlug();

  const [formattedSlugs, setFormattedSlugs] = useState<Array<string>>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [newSlugName, setNewSlugName] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

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
    window.localStorage.setItem("newChatRequested", "true");
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
      // Create a proper slug with timestamp to ensure uniqueness
      const timestamp =
        oldSlug.match(/\d{6}$/)?.[0] ||
        new Date().getTime().toString().slice(-6);
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
      <ScrollArea className='flex-1 px-4'>
        <div className='space-y-1 py-2'>
          {isLoading ? (
            <div className='flex justify-center py-4'>
              <p className='text-sm text-muted-foreground'>Loading chats...</p>
            </div>
          ) : formattedSlugs.length > 0 ? (
            formattedSlugs.map((slug) => (
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
                      {isUpdating ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        "Save"
                      )}
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
                    >
                      <Link href={`/?chatSlug=${slug}`}>
                        <MessageSquare className='mr-2 h-4 w-4 flex-shrink-0' />
                        <span className='truncate max-w-[160px]'>
                          {slug === "default"
                            ? "New Chat"
                            : formatChatTitle(slug)}
                        </span>
                      </Link>
                    </Button>
                    {slug !== "default" && (
                      <div className='absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                        {deletingSlug === slug ? (
                          <div className='flex items-center justify-center w-8 h-8'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                              >
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(slug)}
                              >
                                <Pencil className='mr-2 h-4 w-4' />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(slug)}
                              >
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
            ))
          ) : (
            <div className='flex justify-center py-4'>
              <p className='text-sm text-muted-foreground'>No chat history</p>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className='px-4 py-2'>
        <p className='text-xs text-center text-muted-foreground'>
          Smart Search © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
