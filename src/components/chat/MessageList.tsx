import { cn } from "@/lib/utils";
import { Message } from "./types";
import MarkdownRenderer from "./MarkdownRenderer";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MessageListProps {
  messages: Message[];
  onRetry?: (content: string) => void;
}

export default function MessageList({ messages, onRetry }: MessageListProps) {
  // Check if a message is an error message
  const isErrorMessage = (content: string) => {
    return (
      content.includes("error") ||
      content.includes("problem") ||
      content.includes("failed")
    );
  };

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
            // The class 'h-8' sets the height of the div to 2rem (32 pixels), and 'w-8' sets the width to 2rem (32 pixels).
            // If you reduce these pixel values, the size of the div will decrease accordingly.
            // The 'width={64}' and 'height={64}' in the Image component set the image dimensions to 64 pixels each.
            // Reducing these values will also decrease the image size, which can impact the data size if the image is being resized on the server or client-side.
            <div className='h-5 w-5 rounded-full bg-primary flex-shrink-0'>
              <Image
                src='/web-app-manifest-192x192.svg'
                alt='SmartSearch Logo'
                width={20} // This sets the width of the image to 20 pixels
                height={20} // This sets the height of the image to 20 pixels
                className='mb-4 rounded-xl'
              />
            </div>
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
                <div>
                  <MarkdownRenderer content={message.content} />
                  {onRetry &&
                    isErrorMessage(message.content) &&
                    index > 0 &&
                    messages[index - 1].role === "user" && (
                      <div className='mt-2 flex justify-end'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex items-center gap-1 text-xs'
                          onClick={() => onRetry(messages[index - 1].content)}
                        >
                          <RefreshCw className='h-3 w-3' />
                          Retry
                        </Button>
                      </div>
                    )}
                </div>
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
