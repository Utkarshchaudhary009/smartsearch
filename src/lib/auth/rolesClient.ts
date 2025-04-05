import { useAuth } from "@clerk/nextjs";

import { UserRole } from "@/lib/types/role";
import { supabase } from "@/lib/supabase/supabase";
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const user = await useAuth();

    if (!user) {
      return null;
    }

    // Get user role from Supabase database
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", user.userId)
      .single();

    if (error || !data) {
      console.error("Error fetching role from database:", error);
      return null;
    }

    return (data.role as UserRole) || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}
