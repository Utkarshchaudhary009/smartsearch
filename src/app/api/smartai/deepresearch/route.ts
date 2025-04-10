import { createSmartAIAgent } from "@/app/api/smartai/utils/Agent";
import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";
// import type { StreamEvent } from "@langchain/core/tracers/log_stream"; // No longer needed for .stream()
import type { AIMessageChunk } from "@langchain/core/messages"; // Import for type checking

export const runtime = "edge";

// Renamed and updated transformer for .stream() output
function createStreamOutputTransformer(): TransformStream<
  AIMessageChunk,
  string
> {
    console.log("chunk", chunk);
  return new TransformStream({
    transform(chunk: AIMessageChunk, controller) {
      // .stream() typically yields AIMessageChunk objects with a .content property
      if (typeof chunk.content === "string") {
        controller.enqueue(chunk.content);
      }
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages, clerkId } = await req.json();
    const googleApiKey = process.env.GOOGLE_AI_KEY;

    if (!googleApiKey) {
      return NextResponse.json(
        { error: "Missing Google API key" },
        { status: 400 }
      );
    }

    const agent = createSmartAIAgent(googleApiKey, clerkId || "guest");

    // Use agent.stream() without the invalid 'version' config
    const stream = await agent.stream({
      messages: messages.map((msg: VercelChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
    },{streamMode: "values"});

    // Pipe through the transformer specific to .stream() output
    const customStream = stream.pipeThrough(createStreamOutputTransformer());

    // Encode the string stream back to Uint8Array for the Response body
    const encoder = new TextEncoder();
    const encodedStream = customStream.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(encoder.encode(chunk));
        },
      })
    );

    return new Response(encodedStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error in API route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `An error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}
