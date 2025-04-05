"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight, rehypeSlug]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className='text-2xl font-bold mt-6 mb-4'
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className='text-xl font-bold mt-5 mb-3'
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className='text-lg font-bold mt-4 mb-2'
              {...props}
            />
          ),
          h4: ({ ...props }) => (
            <h4
              className='text-base font-bold mt-3 mb-1'
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p
              className='mb-4'
              {...props}
            />
          ),
          a: ({ href, ...props }) => (
            <a
              href={href}
              className='text-blue-500 hover:text-blue-700 underline'
              target='_blank'
              rel='noopener noreferrer'
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              className='list-disc pl-6 mb-4'
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className='list-decimal pl-6 mb-4'
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li
              className='mb-1'
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className='border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 italic mb-4'
              {...props}
            />
          ),
          code: ({ ...props }) => (
            <code
              className='block bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto my-4'
              {...props}
            />
          ),
          pre: ({ ...props }) => (
            <pre
              className='bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto my-4'
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className='overflow-x-auto my-4'>
              <table
                className='min-w-full divide-y divide-gray-300 dark:divide-gray-600'
                {...props}
              />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead
              className='bg-gray-100 dark:bg-gray-800'
              {...props}
            />
          ),
          tbody: ({ ...props }) => (
            <tbody
              className='divide-y divide-gray-200 dark:divide-gray-700'
              {...props}
            />
          ),
          tr: ({ ...props }) => (
            <tr
              className='hover:bg-gray-50 dark:hover:bg-gray-800'
              {...props}
            />
          ),
          th: ({ ...props }) => (
            <th
              className='px-3 py-2 text-left text-sm font-medium'
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className='px-3 py-2 text-sm'
              {...props}
            />
          ),
          img: ({ alt, src }: React.ComponentPropsWithoutRef<"img">) => {
            if (!src) return null;

            return (
              <AspectRatio
                ratio={16 / 9}
                className='max-w-full h-auto my-2' // Reduced rounding and margin
              >
                <Image
                  src={src}
                  alt={alt || "image"}
                  className='max-w-full h-auto rounded-md my-4'
                  width={800}
                  height={450}
                />
              </AspectRatio>
            );
          },
          hr: () => (
            <hr className='my-6 border-t border-gray-300 dark:border-gray-600' />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
