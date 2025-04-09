"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AgentToolCall = {
  tool: string;
  input: string;
  output?: string;
};

type AgentAction = {
  type: "thinking" | "tool_call" | "final_answer";
  content: string;
  toolCall?: AgentToolCall;
};

interface AgentThinkingProps {
  actions: AgentAction[];
}

export function AgentThinking({ actions }: AgentThinkingProps) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <Card className='p-4 mt-4 bg-secondary/10'>
      <div className='flex items-center mb-2'>
        <div className='bg-secondary/20 mr-2'>Agent Reasoning</div>
      </div>

      <div className='space-y-3'>
        {actions.map((action, index) => (
          <div
            key={index}
            className='text-sm'
          >
            {action.type === "thinking" && (
              <ThinkingStep content={action.content} />
            )}

            {action.type === "tool_call" && action.toolCall && (
              <ToolCallStep
                tool={action.toolCall.tool}
                input={action.toolCall.input}
                output={action.toolCall.output}
              />
            )}

            {action.type === "final_answer" && (
              <FinalAnswerStep content={action.content} />
            )}

            {index < actions.length - 1 && <Separator className='my-2' />}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ThinkingStep({ content }: { content: string }) {
  return (
    <div>
      <div className='mb-1'>Thinking</div>
      <p className='text-muted-foreground'>{content}</p>
    </div>
  );
}

function ToolCallStep({
  tool,
  input,
  output,
}: {
  tool: string;
  input: string;
  output?: string;
}) {
  return (
    <div>
      <div className='mb-1'>Using Tool: {tool}</div>
      <div className='pl-2 border-l-2 border-muted'>
        <p className='text-sm font-mono mb-1'>Input: {input}</p>
        {output && (
          <p className='text-sm font-mono text-muted-foreground'>
            Output:{" "}
            {output.length > 200 ? `${output.substring(0, 200)}...` : output}
          </p>
        )}
      </div>
    </div>
  );
}

function FinalAnswerStep({ content }: { content: string }) {
  return (
    <div>
      <div
        className='mb-1'
      >
        Final Answer
      </div>
      <p>{content}</p>
    </div>
  );
}
