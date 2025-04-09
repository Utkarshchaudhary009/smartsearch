import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Path to the MDX file
    const mdxFilePath = path.join(process.cwd(), "src", "content", "sample.mdx");
    
    // Read the MDX file content
    const mdxContent = fs.readFileSync(mdxFilePath, "utf-8");
    
    // Return the MDX content as JSON
    return NextResponse.json({ content: mdxContent });
  } catch (error) {
    console.error("Error reading MDX file:", error);
    return NextResponse.json(
      { error: "Failed to load MDX content" },
      { status: 500 }
    );
  }
} 