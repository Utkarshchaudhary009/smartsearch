import type { MDXComponents } from "mdx/types";
import { FileDisplay } from "@/components/mdx/MDXRenderer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// This type is used to define the available components in MDX files
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Use the components already provided
    ...components,
    // Add custom components
    FileDisplay,
    AspectRatio,
    Button,
    Card,
    Dropdown: ({
      children,
      trigger,
    }: {
      children: React.ReactNode;
      trigger: React.ReactNode;
    }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent>{children}</DropdownMenuContent>
      </DropdownMenu>
    ),
    DropdownItem: DropdownMenuItem,
  };
}
