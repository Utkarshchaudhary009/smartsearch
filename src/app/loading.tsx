import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-4 space-y-4">
        {/* Loading skeleton for messages */}
        <div className="flex gap-2 max-w-[80%]">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 max-w-[80%] ml-auto">
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
        
        <div className="flex gap-2 max-w-[80%]">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading skeleton for input area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Skeleton className="h-[44px] w-full rounded-md" />
          <Skeleton className="h-[44px] w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
} 