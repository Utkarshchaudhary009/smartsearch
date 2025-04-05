"use client";
import { useAuth } from "@clerk/nextjs";

import { UserRole } from "@/lib/types/role";
import { supabase } from "../supabase";

/**
 * Custom hook to get the current user's role
 * @returns The user's role or null if no role is set
 */
export function useUserRole(role: UserRole): Promise<boolean> {
  const { userId } = useAuth();

  /**
   * Fetches the user role from the database
   */
  const fetchUserRole = async (): Promise<boolean> => {
    if (!userId) {
      return false;
    }

    try {
      // Get user role from Supabase database
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("clerk_id", userId)
        .single();

      if (error || !data) {
        console.error("Error fetching role from database:", error);
        return false;
      }

      return (data.role as UserRole) === role;
    } catch (error) {
      console.error("Error getting user role:", error);
      return false;
    }
  };

  return fetchUserRole();
}
