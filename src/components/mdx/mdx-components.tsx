import type { MDXComponents } from "mdx/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, ImageIcon, FileTextIcon, DownloadIcon } from "lucide-react";
import Link from "next/link";   
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
interface FileDisplayProps {
  type: string;
  filename: string;
  size: string;
  link: string;
}

export const FileDisplay = ({ type, filename, size,link }: FileDisplayProps) => {
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
          <div className='text-sm text-muted-foreground'>
            ({filename})
          </div>
          <div className='text-sm text-muted-foreground'>
            ({size})
          </div>
        </div>
      </div>
      <Link href={link} target='_blank'>
      <Button
        variant='ghost'
        size='sm'
      >
        <DownloadIcon className='h-4 w-4' />
      </Button>
      </Link>
    </Card>
  );
};

// This type is used to define the available components in MDX files
export function AddMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    // Use the components already provided
    ...components,
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
    // Add custom components
    FileDisplay,
    AspectRatio,
    Button,
    Card,
    ScrollArea,
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
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Alert: ({
      trigger,
      title,
      description,
      children,
      cancelText = "Cancel",
      confirmText = "Continue",
    }: {
      trigger: React.ReactNode;
      title: string;
      description: string;
      children?: React.ReactNode;
      cancelText?: string;
      confirmText?: string;
    }) => (
      <AlertDialog>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          {children && <div className='py-4'>{children}</div>}
          <AlertDialogFooter>
            <AlertDialogCancel>{cancelText}</AlertDialogCancel>
            <AlertDialogAction>{confirmText}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    BarChart,
    LineChart,
    PieChart,
  };
}
