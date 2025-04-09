import { createSmartAIAgent } from "@/app/api/smartai/utils/Agent";
import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";

export const runtime = "edge";

// Function to create a transform stream that extracts message content
function createParser(): TransformStream<Uint8Array, string> {
  const decoder = new TextDecoder();
  let previous = "";

  return new TransformStream({
    transform(chunk, controller) {
      // Decode the chunk and prepend the previous partial chunk
      const text = previous + decoder.decode(chunk, { stream: true });
      previous = ""; // Reset previous

      // Process lines
      const lines = text.split("\n");
      lines.slice(0, -1).forEach((line) => {
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.substring(6));
            // Look for message content within the LangGraph event structure
            // This structure might vary based on LangGraph version and agent setup
            if (
              json.event === "on_chat_model_stream" &&
              json.data?.chunk?.content
            ) {
              controller.enqueue(json.data.chunk.content);
            } else if (json.event === "on_tool_end" && json.data?.output) {
              // Optionally include tool output in the stream if needed
              // controller.enqueue(`\nTool Output: ${json.data.output}\n`);
            }
          } catch (error) {
            // Ignore lines that are not valid JSON or don't match expected structure
            console.warn("Failed to parse stream chunk:", line, error);
          }
        }
      });

      // Keep the last partial line for the next chunk
      previous = lines[lines.length - 1];
    },
    flush(controller) {
      // Handle any remaining text if needed, though typically LangGraph streams end cleanly
      if (previous.startsWith("data: ")) {
        try {
          const json = JSON.parse(previous.substring(6));
          if (
            json.event === "on_chat_model_stream" &&
            json.data?.chunk?.content
          ) {
            controller.enqueue(json.data.chunk.content);
          }
        } catch (error) {
          console.warn("Failed to parse final stream chunk:", previous, error);
        }
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

    // Get the LangGraph stream using streamEvents
    const stream = await agent.streamEvents(
      {
        messages: messages.map((msg: VercelChatMessage) => ({
          role: msg.role,
          content: msg.content,
        })),
      },
      { version: "v1" } // Use streamEvents v1 format
    );

    // Create a new ReadableStream that processes LangGraph events
    const customStream = stream.pipeThrough(createParser());

    // Return a standard streaming response
    return new Response(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error in API route:", error);
    // Determine if error is an object with a message property
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `An error occurred: ${errorMessage}` },
      { status: 500 }
    );
  }
}
