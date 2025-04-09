export type AgentToolCall = {
  tool: string;
  input: string;
  output?: string;
};

export type AgentAction = {
  type: "thinking" | "tool_call" | "final_answer";
  content: string;
  toolCall?: AgentToolCall;
};

export type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  actions?: AgentAction[];
  timestamp: number;
};

export type AgentResponse = {
  content: string;
  actions?: AgentAction[];
};

export type StreamingAgentResponse = {
  type: "thinking" | "tool_call" | "tool_result" | "answer";
  content: string;
  toolName?: string;
  toolInput?: string;
  toolOutput?: string;
};
