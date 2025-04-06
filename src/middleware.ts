import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/smartai(.*)",
]);

// Define admin routes
const adminRoutes = createRouteMatcher(["/admin(.*)"]);

// Handle CORS preflight requests
function handleCors(req: NextRequest) {
  // Return early with a 200 for OPTIONS requests (CORS preflight)
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    setCorsHeaders(response);
    return response;
  }
  return null;
}

// Set CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  return response;
}

// Our middleware handler
export default function middleware(req: NextRequest) {
  // First handle CORS preflight requests before any authentication
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // For non-OPTIONS requests, process with Clerk middleware
  return clerkMiddleware()(req as any, async (req: NextRequest) => {
    const { userId } = req.auth;

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

    // Normal response with CORS headers
    const response = NextResponse.next();
    return setCorsHeaders(response);
  });
}

// Includes both the root path (/) and excludes static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/"],
};
