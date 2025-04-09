"use client";

import React from "react";
import { MDXRemote } from "next-mdx-remote";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileIcon, ImageIcon, FileTextIcon, DownloadIcon } from "lucide-react";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

interface FileDisplayProps {
  type: string;
  filename: string;
  size: string;
}

export const FileDisplay = ({ type, filename, size }: FileDisplayProps) => {
  const getFileIcon = () => {
    switch (type.toLowerCase()) {
      case "image":
        return <ImageIcon className='h-4 w-4 mr-2' />;
      case "pdf":
        return <FileTextIcon className='h-4 w-4 mr-2' />;
      default:
        return <FileIcon className='h-4 w-4 mr-2' />;
    }
  };

  return (
    <Card className='flex items-center p-3 mb-4'>
      <div className='flex-1 flex items-center'>
        {getFileIcon()}
        <div>
          <div className='font-medium'>[{type}]</div>
          <div className='text-sm text-muted-foreground'>
            ({filename}, {size})
          </div>
        </div>
      </div>
      <Button
        variant='ghost'
        size='sm'
      >
        <DownloadIcon className='h-4 w-4' />
      </Button>
    </Card>
  );
};

interface MDXRendererProps {
  content: MDXRemoteSerializeResult;
  className?: string;
}

const components = {
  h1: ({ ...props }) => (
    <h1
      className='text-2xl font-bold mt-6 mb-4 text-wrap'
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className='text-xl font-bold mt-5 mb-3 text-wrap'
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3
      className='text-lg font-bold mt-4 mb-2 text-wrap'
      {...props}
    />
  ),
  h4: ({ ...props }) => (
    <h4
      className='text-base font-bold mt-3 mb-1 text-wrap'
      {...props}
    />
  ),
  p: ({ ...props }) => (
    <p
      className='mb-4 text-wrap'
      {...props}
    />
  ),
  a: ({ href, ...props }) => (
    <a
      href={href}
      className='text-blue-500 hover:text-blue-700 underline text-wrap'
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
      className='mb-1 text-wrap'
      {...props}
    />
  ),
  blockquote: ({ ...props }) => (
    <blockquote
      className='border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 italic mb-4 text-wrap'
      {...props}
    />
  ),
  code: ({ ...props }) => (
    <code
      className='block text-wrap bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto my-4'
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
  img: ({ alt, src, ...props }) => {
    if (!src) return null;

    return (
      <AspectRatio
        ratio={16 / 9}
        className='max-w-full h-auto my-2'
      >
        <Image
          src={src}
          alt={alt || "image"}
          className='max-w-full h-auto rounded-md my-4'
          width={800}
          height={450}
          {...props}
        />
      </AspectRatio>
    );
  },
  hr: () => <Separator className='my-6' />,
  FileDisplay,
  AspectRatio,
  Dropdown: ({ children, trigger }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  ),
  DropdownItem: DropdownMenuItem,
  Button,
  Card,
  ScrollArea,
};

export default function MDXRenderer({ content, className }: MDXRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert [@media(max-width:768px)]:max-w-[90%] max-w-none text-wrap",
        className
      )}
    >
      <MDXRemote
        {...content}
        components={components}
      />
    </div>
  );
}
