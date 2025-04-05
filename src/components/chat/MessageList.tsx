import { cn } from "@/lib/utils";
import { Message } from "./types";
import MarkdownRenderer from "./MarkdownRenderer";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className='space-y-4 max-w-[800px] mx-auto p-4'>
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex gap-2 max-w-[95%] md:max-w-[85%]",
            message.role === "user" && "ml-auto"
          )}
        >
          {message.role === "agent" && (
            <div className='h-8 w-8 rounded-full bg-primary flex-shrink-0' />
          )}
          <div className='space-y-2 w-full'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>
                {message.role === "agent" ? "smartSearch" : "You"}
              </span>
            </div>
            <div className='p-3 bg-muted/50 rounded-lg'>
              {message.isLoading ? (
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-[90%]' />
                  <Skeleton className='h-4 w-[80%]' />
                  <Skeleton className='h-4 w-[60%]' />
                </div>
              ) : message.role === "agent" ? (
                <MarkdownRenderer content={message.content} />
              ) : (
                <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
