import { auth } from "@clerk/nextjs/server";
import { supabase } from "../supabase";
import { UserRole } from "@/lib/types/role";

/**
 * Check if the current user has a specific role
 * @param role The role to check for
 * @returns A boolean indicating if the user has the specified role
 */
export async function checkRole(role: UserRole): Promise<boolean> {
  try {
    const user = await auth();

    // If no user is logged in, return false
    if (!user) {
      return false;
    }

    // Get user role from Supabase database
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", user.userId)
      .single();

    if (error || !data) {
      console.error("Error fetching role from database:", error);
      return false;
    }

    // Check if user has the required role
    return data.role === role;
  } catch (error) {
    console.error("Error checking role:", error);
    return false;
  }
}

/**
 * Get the current user's role
 * @returns The user's role or null if no role is set
 */
export async function GetUserRole(): Promise<UserRole | null> {
  try {
    const user = await auth();

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

/**
 * Check if the current user is an admin
 * @returns A boolean indicating if the user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return checkRole("admin");
}

/**
 * Check if the current user is a moderator
 * @returns A boolean indicating if the user is a moderator
 */
export async function isModerator(): Promise<boolean> {
  return checkRole("moderator") || checkRole("admin");
}

/**
 * Set a user's role in the database
 * @param clerkId The Clerk ID of the user
 * @param role The role to set
 * @returns A boolean indicating success
 */
export async function setUserRole(
  clerkId: string,
  role: UserRole
): Promise<boolean> {
  try {
    // Only allow admins to set roles
    if (!(await isAdmin())) {
      console.error("Permission denied: Only admins can set roles");
      return false;
    }

    const { error } = await supabase
      .from("users")
      .update({ role })
      .eq("clerk_id", clerkId);

    if (error) {
      console.error("Error setting user role in database:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in setUserRole:", error);
    return false;
  }
}
