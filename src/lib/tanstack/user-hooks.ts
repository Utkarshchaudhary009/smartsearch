"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserById,
  getUserByMarketingConsent,
  changeMarketingConsent,
} from "../services/user-service";

// Key factory for consistent cache keys
const userKeys = {
  all: ["users"] as const,
  details: (id: string) => [...userKeys.all, "details", id] as const,
  marketingConsent: (consent: boolean) =>
    [...userKeys.all, "marketing", consent] as const,
};



// Hook to get user by Clerk ID
export function useUserById(clerkId: string) {
  return useQuery({
    queryKey: userKeys.details(clerkId),
    queryFn: () => getUserById(clerkId),
    enabled: !!clerkId,
  });
}

// Hook to get users by marketing consent
export function useUsersByMarketingConsent(marketingConsent: boolean) {
  return useQuery({
    queryKey: userKeys.marketingConsent(marketingConsent),
    queryFn: () => getUserByMarketingConsent(marketingConsent),
  });
}

// Hook to change marketing consent
export function useChangeMarketingConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { clerkId: string; marketingConsent: boolean }) =>
      changeMarketingConsent(params.clerkId, params.marketingConsent),
    onSuccess: (_, variables) => {
      // Invalidate specific user
      queryClient.invalidateQueries({
        queryKey: userKeys.details(variables.clerkId),
      });
      // Invalidate marketing consent lists
      queryClient.invalidateQueries({
        queryKey: userKeys.marketingConsent(true),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.marketingConsent(false),
      });
      // Invalidate all users
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.error("Error changing marketing consent:", error);
    },
  });
}
