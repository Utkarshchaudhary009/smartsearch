import { createSmartAIAgent } from "@/app/api/smartai/utils/Agent";
import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";
import type { StreamEvent } from "@langchain/core/tracers/log_stream";

export const runtime = "edge";

// Updated parser to handle StreamEvent objects directly
function createEventStreamTransformer(): TransformStream<StreamEvent, string> {
  return new TransformStream({
    transform(chunk: StreamEvent, controller) {
      if (
        chunk.event === "on_chat_model_stream" &&
        chunk.data?.chunk?.content
      ) {
        // Enqueue the string content directly
        controller.enqueue(chunk.data.chunk.content);
      } else if (chunk.event === "on_tool_end" && chunk.data?.output) {
         // Optionally handle tool output if needed in the future
         // controller.enqueue(`\nTool Output: ${chunk.data.output}\n`);
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

    const stream = await agent.streamEvents(
      {
        messages: messages.map((msg: VercelChatMessage) => ({
          role: msg.role,
          content: msg.content,
        })),
      },
      { version: "v1" }
    );

    // Pipe through the updated transformer
    const customStream = stream.pipeThrough(createEventStreamTransformer());

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
