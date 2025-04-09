"use client";

import { useEffect, useState } from "react";
import { serialize } from "next-mdx-remote/serialize";
import MDXRenderer from "./components/mdx/MDXRenderer";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

const mdxContent = `
# MDX Renderer Testing

This is a simple test for our MDX Renderer component.

## File Display Component Test

<FileDisplay type="pdf" filename="document.pdf" size="2.5MB" />

## Dropdown Test

<Dropdown trigger={<Button>Open Menu</Button>}>
  <DropdownItem>Option 1</DropdownItem>
  <DropdownItem>Option 2</DropdownItem>
</Dropdown>

## Card Test

<Card className="p-4">
  <h3>Card Component</h3>
  <p>This is content inside a card.</p>
</Card>
`;

export default function TestMDXRenderer() {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const compileMDX = async () => {
      try {
        const serialized = await serialize(mdxContent);
        setMdxSource(serialized);
        setLoading(false);
      } catch (error) {
        console.error("Error serializing MDX:", error);
        setLoading(false);
      }
    };

    compileMDX();
  }, []);

  if (loading) {
    return <div>Loading MDX content...</div>;
  }

  if (!mdxSource) {
    return <div>Failed to load MDX content.</div>;
  }

  return (
    <div className='container mx-auto p-6'>
      <MDXRenderer content={mdxSource} />
      <div className='mt-8 p-4 border rounded'>
        <h2 className='text-xl font-bold'>Test Results</h2>
        <p>MDX content loaded and rendered successfully.</p>
      </div>
    </div>
  );
}
