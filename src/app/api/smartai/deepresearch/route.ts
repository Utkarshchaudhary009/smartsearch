import { createSmartAIAgent } from "@/app/api/smartai/utils/Agent";
import { NextRequest } from "next/server";
import { LangChainAdapter } from "ai";
import { Message } from "ai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { messages, clerkId } = await req.json();
    const googleApiKey = process.env.GOOGLE_AI_KEY;

    if (!googleApiKey) {
      return new Response(JSON.stringify({ error: "Missing Google API key" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create the agent
    const agent = createSmartAIAgent(googleApiKey, clerkId || "guest");

    try {
      // Use stream method from agent with values mode for compatibility
      const stream = await agent.stream(
        {
          messages: messages.map((msg: Message) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
        { streamMode: "values" }
      );

      // Convert the stream to a format compatible with AI SDK
      return LangChainAdapter.toDataStreamResponse(stream);
    } catch (error) {
      console.error("Error in agent execution:", error);
      return new Response(
        JSON.stringify({ error: "Error during agent execution" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
