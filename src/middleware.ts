import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Define public routes that don't require authentication
const publicRoutes = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)"
]);

// Define admin routes
const adminRoutes = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If the user is not authenticated and trying to access a protected route
  if (!userId && !publicRoutes(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user is trying to access admin routes
  if (userId && adminRoutes(req)) {
    try {
      // Supabase client for client-side usage
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      // Get the role from Supabase database
      const supabase = await createClient(supabaseUrl, supabaseServiceKey);
      // Add logging to debug
      console.log("Searching for clerk_id:", userId);

      // First, check if any users exist at all
      const { data: user, error: userError } = await supabase
        .from("smartusers")
        .select("id, clerk_id, role")
        .single();
      if (userError) {
        console.error("Error fetching user:", userError);
        return NextResponse.redirect(new URL("/", req.url));
      }
      if (!user) {
        console.log("No user found");
        return NextResponse.redirect(new URL("/", req.url));
      }

      // If the user is not an admin, redirect to home page
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
