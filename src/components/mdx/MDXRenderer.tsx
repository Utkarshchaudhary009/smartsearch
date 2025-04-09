"use client";

import React from "react";
import { MDXRemote } from "next-mdx-remote";
import { cn } from "@/lib/utils";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { AddMDXComponents } from "./mdx-components";
interface MDXRendererProps {
  content: MDXRemoteSerializeResult;
  className?: string;
}

export const MFXComponents = AddMDXComponents();

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
        components={MFXComponents}
      />
    </div>
  );
}
