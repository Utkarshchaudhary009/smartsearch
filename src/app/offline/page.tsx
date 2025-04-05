import { Button } from "@/components/ui/button";
import { Wifi, WifiOff } from "lucide-react";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Offline | Smart Search Chat",
  description: "You are currently offline",
  url: "/offline",
  noIndex: true,
});

export default function OfflinePage() {
  return (
    <div className='h-full flex flex-col items-center justify-center p-5 text-center'>
      <div className='w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4'>
        <WifiOff className='h-8 w-8 text-yellow-600 dark:text-yellow-300' />
      </div>
      <h1 className='text-2xl font-bold mb-2'>You&apos;re offline</h1>
      <p className='text-muted-foreground mb-8 max-w-md'>
        It looks like you&apos;re not connected to the internet. Check your
        connection and try again.
      </p>
      <Button
        onClick={() => window.location.reload()}
        className='flex items-center gap-2'
      >
        <Wifi className='h-4 w-4' />
        Try again
      </Button>
    </div>
  );
}
