import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className='container mx-auto px-4 pt-24 pb-12'>
      <div className='h-10 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8' />

      {/* Stats Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCardSkeleton
          icon={
            <Package className='h-8 w-8 text-gray-300 dark:text-gray-600' />
          }
        />
        <StatCardSkeleton
          icon={<Users className='h-8 w-8 text-gray-300 dark:text-gray-600' />}
        />
        <StatCardSkeleton
          icon={
            <ShoppingBag className='h-8 w-8 text-gray-300 dark:text-gray-600' />
          }
        />
        <StatCardSkeleton
          icon={
            <TrendingUp className='h-8 w-8 text-gray-300 dark:text-gray-600' />
          }
        />
      </div>

      {/* Dashboard Cards Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'
          >
            <div className='h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4' />
            <div className='h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCardSkeleton({ icon }: { icon: React.ReactNode }) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
      <div className='flex justify-between items-start'>
        <div>
          <div className='h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
          <div className='h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2' />
        </div>
        {icon}
      </div>
    </div>
  );
}
