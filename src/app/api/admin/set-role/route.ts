import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    // Get the current user's auth status
    const { userId } = await auth();

    // If no user is authenticated, return an error
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the authenticated user is an admin by querying Supabase
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from("smartusers")
      .select("role")
      .eq("clerk_id", userId)
      .single();

    if (adminCheckError || !adminCheck) {
      return NextResponse.json(
        { error: "Error verifying admin status" },
        { status: 500 }
      );
    }

    const isAdmin = adminCheck.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const { targetUserId, role } = await request.json();

    if (!targetUserId || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["admin", "user", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // 1. Update the user's role in Clerk (for initial login)
    await (
      await clerkClient()
    ).smartusers.updateUser(targetUserId, {
      publicMetadata: { role },
    });

    // 2. Update the user's role in Supabase database
    const { error: updateError } = await supabase
      .from("smartusers")
      .update({ role })
      .eq("clerk_id", targetUserId);

    if (updateError) {
      console.error("Error updating user role in database:", updateError);
      return NextResponse.json(
        { error: "Failed to update role in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Role updated in both Clerk and database",
    });
  } catch (error) {
    console.error("Error setting user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
