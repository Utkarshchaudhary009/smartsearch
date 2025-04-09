import { createSmartAIAgent } from "@/app/api/smartai/utils/Agent";
import { NextRequest } from "next/server";
import { Message } from "ai";
import { LangChainAdapter } from "ai";

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
    let stream;
    // Start the agent execution in the background

    try {
      // Invoke the agent with the user's message history
      stream = await agent.stream(
        {
          messages: messages.map((msg: Message) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
        { streamMode: "values" }
      );
    } catch (error) {
      console.error("Error in API route:", error);
      return new Response(JSON.stringify({ error: "An error occurred" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return a streaming response with the additional data
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.error("Error in API route:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
