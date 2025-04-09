import { AgentAction, AgentToolCall } from "@/types/agent";

/**
 * Parses the raw agent output to extract thinking steps, tool calls, and final answer
 */
export function parseAgentOutput(output: string): AgentAction[] {
  const actions: AgentAction[] = [];
  const lines = output.split("\n");

  let currentThinking = "";
  let collectingThinking = false;
  let collectingToolAction = false;
  let collectingToolInput = false;
  

  let currentToolCall: Partial<AgentToolCall> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect Thinking
    if (line.startsWith("Thought:")) {
      // If we were collecting a thinking block, save it
      if (collectingThinking && currentThinking) {
        actions.push({
          type: "thinking",
          content: currentThinking.trim(),
        });
        currentThinking = "";
      }

      // Start a new thinking block
      collectingThinking = true;
      collectingToolAction = false;
      collectingToolInput = false;
      
      currentThinking = line.replace("Thought:", "").trim();
    }
    // Continue collecting thinking
    else if (
      collectingThinking &&
      !line.startsWith("Action:") &&
      !line.startsWith("Final Answer:")
    ) {
      currentThinking += " " + line;
    }

    // Detect Action
    else if (line.startsWith("Action:")) {
      // Save the previous thinking block
      if (collectingThinking && currentThinking) {
        actions.push({
          type: "thinking",
          content: currentThinking.trim(),
        });
        currentThinking = "";
      }

      // Start collecting a tool action
      collectingThinking = false;
      collectingToolAction = true;
      collectingToolInput = false;
      

      currentToolCall = {
        tool: line.replace("Action:", "").trim(),
        input: "",
      };
    }

    // Detect Action Input (typically follows Action)
    else if (
      line.startsWith("Action Input:") ||
      (collectingToolAction && line.startsWith("```"))
    ) {
      collectingToolInput = true;
      collectingToolAction = false;

      // In some formats, the action input is JSON within a code block
      if (line.includes("```")) {
        // Skip the opening code fence
        continue;
      }

      currentToolCall.input = line.replace("Action Input:", "").trim();
    }

    // Continue collecting tool input
    else if (collectingToolInput) {
      // Skip the closing code fence
      if (line === "```") {
        collectingToolInput = false;

        // Save the tool call
        actions.push({
          type: "tool_call",
          content: "",
          toolCall: currentToolCall as AgentToolCall,
        });

        currentToolCall = {};
        continue;
      }

      currentToolCall.input += " " + line;
    }

    // Detect Final Answer
    else if (line.startsWith("Final Answer:")) {
      // Save any previous thinking
      if (collectingThinking && currentThinking) {
        actions.push({
          type: "thinking",
          content: currentThinking.trim(),
        });
        currentThinking = "";
      }

      // Start collecting the final answer
      collectingThinking = false;
      collectingToolAction = false;
      collectingToolInput = false;

      let finalAnswer = line.replace("Final Answer:", "").trim();

      // Collect the rest of the final answer (may span multiple lines)
      for (let j = i + 1; j < lines.length; j++) {
        finalAnswer += " " + lines[j].trim();
        i = j; // Skip these lines in the outer loop
      }

      // Save the final answer
      actions.push({
        type: "final_answer",
        content: finalAnswer.trim() || "No final answer provided",
      });
    }
  }

  // Save any remaining thinking content
  if (collectingThinking && currentThinking) {
    actions.push({
      type: "thinking",
      content: currentThinking.trim(),
    });
  }

  return actions;
}

/**
 * Extracts tool calls from agent actions
 */
export function extractToolCalls(actions: AgentAction[]): AgentToolCall[] {
  return actions
    .filter((action) => action.type === "tool_call" && action.toolCall)
    .map((action) => action.toolCall as AgentToolCall);
}

/**
 * Gets the final answer from agent actions
 */
export function getFinalAnswer(actions: AgentAction[]): string | null {
  const finalAnswer = actions.find((action) => action.type === "final_answer");
  return finalAnswer ? finalAnswer.content : null;
}
