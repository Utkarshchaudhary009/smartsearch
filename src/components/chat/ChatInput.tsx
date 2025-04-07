"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  ButtonText?: string;
  TextareaPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSendMessage,
  ButtonText = "Send",
  TextareaPlaceholder = "Message SmartSearch",
  isLoading = false,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim() && !isLoading && !disabled) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='p-2 sm:p-4 border-t'>
      <div className='flex gap-2'>
        <Textarea
          placeholder={TextareaPlaceholder}
          value={input}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setInput(e.target.value)
          }
          onKeyDown={handleKeyDown}
          className='min-h-[36px] sm:min-h-[44px] max-h-32'
          disabled={isLoading || disabled}
        />
        <Button
          className='px-4 sm:px-8'
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading || disabled}
        >
          {ButtonText}
        </Button>
      </div>
    </div>
  );
}
