import { NextResponse } from "next/server";
import {  processUserRequest } from "./utils/Agent";
/**
 * Main API handler for the SmartAI endpoint
 */

export async function POST(request: Request) {
  try {
    // 1. Extract request data
    const { message, clerkId, chatHistory } = await request.json();
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 3. Initialize API clients
    const googleApiKey = process.env.GOOGLE_AI_KEY;
    if (!googleApiKey) {
      console.error("Google AI API key not found in environment variables");
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 500 }
      );
    }

    const AgentResponse = await processUserRequest(message, clerkId,chatHistory, googleApiKey);
    // 6. Return the response
    return NextResponse.json({ message: AgentResponse });
  } catch (error) {
    // Handle errors gracefully
    console.error("Error in SmartAI endpoint:", error);
    const errorMessage = "Failed to process your request";

    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
