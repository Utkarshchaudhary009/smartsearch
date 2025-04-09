import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Import utility functions
import { thinkerFunction } from "./utils/thinker";
import {
  generateAndStoreImage,
  initSupabaseClient,
} from "./utils/imageGeneration";
import { generateChatResponse } from "./utils/chatbot";

/**
 * Main API handler for the SmartAI endpoint
 */
export async function POST(request: Request) {
  try {
    // 1. Extract request data
    const { message, clerkId } = await request.json();
    // const { message, chatHistory, clerkId } = await request.json();

    // 2. Validate inputs
    if (!clerkId) {
      return NextResponse.json(
        { error: "User ID (clerkId) is required" },
        { status: 401 }
      );
    }

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

    const genAI = new GoogleGenAI({ apiKey: googleApiKey });
    const supabase = initSupabaseClient();

    // 4. Analyze request to determine if image generation is needed
    console.log(`Processing request: "${message.substring(0, 50)}..."`);
    const thinkerResult = await thinkerFunction(message, genAI);
    console.log("Thinker result:", JSON.stringify(thinkerResult));

    // 5. Generate response (either image or text)
    let responseContent: string;

    if (thinkerResult.generateImage && thinkerResult.prompt) {
      // 5a. Image generation path
      console.log(`Attempting image generation: "${thinkerResult.prompt}"`);
      const imageResult = await generateAndStoreImage(
        thinkerResult.prompt,
        thinkerResult.altText,
        clerkId,
        genAI,
        supabase || undefined
      );

      if (imageResult) {
        // Format markdown response with image
        const userText =
          thinkerResult.userText || "Here's the image you requested:";
        responseContent = `${userText}\n\n![${imageResult.altText}](${imageResult.imageUrl})`;
        console.log(`Image generated: ${imageResult.imageUrl}`);
      } else {
        // Fallback to text if image generation failed
        console.error("Image generation failed, falling back to text response");
        responseContent = await generateChatResponse(
          message,
          genAI
        );
      }
    } else {
      // 5b. Text response path
      console.log("Using text response");
      responseContent = await generateChatResponse(
        message,
        genAI
      );
    }

    // 6. Return the response
    return NextResponse.json({ message: responseContent });
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
