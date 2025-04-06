'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  saveChatHistory, 
  getChatHistory, 
  getChatSlug,
  updateChatSlug,
  deleteChatsBySlug
} from '../services/chat-service';

// Key factory for consistent cache keys
const chatKeys = {
  all: ['chats'] as const,
  history: (clerkId: string, chatSlug: string) => 
    [...chatKeys.all, 'history', clerkId, chatSlug] as const,
  slugs: (clerkId: string) => 
    [...chatKeys.all, 'slugs', clerkId] as const,
};

// Hook to save chat history
export function useSaveChatHistory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { 
      clerkId: string; 
      query: string; 
      response: string; 
      chatSlug: string 
    }) => saveChatHistory(
      params.clerkId, 
      params.query, 
      params.response, 
      params.chatSlug
    ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: chatKeys.history(variables.clerkId, variables.chatSlug) 
      });
      queryClient.invalidateQueries({ 
        queryKey: chatKeys.slugs(variables.clerkId) 
      });
    },
  });
}

// Hook to get chat history
export function useChatHistory(clerkId: string, chatSlug: string) {
  return useQuery({
    queryKey: chatKeys.history(clerkId, chatSlug),
    queryFn: () => getChatHistory(clerkId, chatSlug),
    enabled: !!clerkId && !!chatSlug,
  });
}

// Hook to get chat slugs for a user
export function useChatSlugs(clerkId: string) {
  return useQuery({
    queryKey: chatKeys.slugs(clerkId),
    queryFn: () => getChatSlug(clerkId),
    enabled: !!clerkId,
  });
}

// Hook to update chat slug name
export function useUpdateChatSlug() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ oldSlug, newSlug }: { oldSlug: string, newSlug: string }) => {
      return await updateChatSlug(oldSlug, newSlug);
    },
    onSuccess: (_, variables) => {
      // Invalidate chat slug queries to refetch
      console.log("invalidating chat keys", variables);
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

// Hook to delete chats by slug
export function useDeleteChatsBySlug() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (slug: string) => {
      return await deleteChatsBySlug(slug);
    },
    onSuccess: () => {
      // Invalidate chat slug queries to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}