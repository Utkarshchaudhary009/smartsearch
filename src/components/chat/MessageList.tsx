import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Message } from "./types";
import MarkdownRenderer from "./MarkdownRenderer";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 p-3 p-md-4">
      <div className="space-y-4 max-w-[800px] mx-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-2 max-w-[95%] md:max-w-[85%]",
              message.role === "user" && "ml-auto"
            )}
          >
            {message.role === "agent" && (
              <div className="h-8 w-8 rounded-full bg-primary flex-shrink-0" />
            )}
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {message.role === "agent" ? "smartSearch" : "You"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp}
                </span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                {message.role === "agent" ? (
                  <MarkdownRenderer content={message.content} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
              </div>
              {message.role === "agent" && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
