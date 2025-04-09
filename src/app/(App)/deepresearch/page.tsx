"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useChat } from "@ai-sdk/react";
import { Loader2, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import { AgentThinking } from "@/components/ui/agent-thinking";
import { parseAgentOutput } from "@/lib/agent-utils";
import { AgentAction } from "@/types/agent";

export default function DeepResearch() {
  const { user } = useUser();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agentActions, setAgentActions] = useState<AgentAction[]>([]);

  // Get the Google API key - in a production app, you'd handle this with proper auth

  const clerkId = user?.id || "guest";

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/smartai/deepresearch",
    body: {
      clerkId,
    },
    onResponse: () => {
      setIsLoading(false);
    },
    onFinish: (message) => {
      // Parse agent output to extract actions
      if (message.content) {
        const actions = parseAgentOutput(message.content);
        setAgentActions(actions);
      }
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "") return;

    setIsLoading(true);
    setAgentActions([]);
    handleSubmit(e);
  };

  return (
    <div className='flex flex-col h-screen max-h-screen p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-bold'>
          Deep Research Assistant - {status}
        </h1>
      </div>

      <Card className='flex-1 flex flex-col overflow-hidden mb-4'>
        <ScrollArea className='flex-1 p-4'>
          {messages.length === 0 ? (
            <div className='flex items-center justify-center h-full'>
              <p className='text-muted-foreground text-center'>
                Ask a complex research question to get started.
                <br />
                <span className='text-sm'>
                  Example: &quot;What are the latest advancements in quantum
                  computing and their potential applications?&quot;
                </span>
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3/4 p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p>{message.content}</p>
                    ) : (
                      <div className='prose dark:prose-invert'>
                        <MarkdownRenderer content={message.content} />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Show agent reasoning after the last message */}
              {agentActions.length > 0 && (
                <AgentThinking actions={agentActions} />
              )}

              <div ref={messageEndRef} />
            </div>
          )}
        </ScrollArea>

        <Separator />

        <form
          onSubmit={onFormSubmit}
          className='p-4'
        >
          <div className='flex gap-2'>
            <Input
              ref={inputRef}
              placeholder='Type your research question...'
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              className='flex-1'
            />
            <Button
              type='submit'
              disabled={isLoading || input.trim() === ""}
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <SendIcon className='h-4 w-4' />
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card className='p-4'>
        <Accordion
          type='single'
          collapsible
        >
          <AccordionItem value='about'>
            <AccordionTrigger>About Deep Research</AccordionTrigger>
            <AccordionContent>
              <p>
                The Deep Research assistant uses advanced AI to help with
                complex research questions. It searches the web for information
                and generates comprehensive answers with proper citations.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}
