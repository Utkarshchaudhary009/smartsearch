"use client";

import { useState, useEffect } from "react";
import { serialize } from "next-mdx-remote/serialize";
import MDXRenderer from "@/components/mdx/MDXRenderer";
import { Card } from "@/components/ui/card";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

export default function MDXTestPage() {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMDX = async () => {
      try {
        const response = await fetch('/api/mdx-content');
        const data = await response.json();
        
        const mdxSource = await serialize(data.content);
        setMdxSource(mdxSource);
        setLoading(false);
      } catch (error) {
        console.error("Error loading MDX content:", error);
        setLoading(false);
      }
    };

    fetchMDX();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading MDX content...</div>;
  }

  if (!mdxSource) {
    return <div className="flex justify-center items-center min-h-screen">Failed to load MDX content.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-6">MDX Renderer Test</h1>
        <MDXRenderer content={mdxSource} />
      </Card>
    </div>
  );
} 