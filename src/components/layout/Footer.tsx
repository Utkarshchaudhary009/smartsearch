import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className='border-t py-4 px-6'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
        <p className='text-xs text-muted-foreground text-center md:text-left'>
          &copy; {new Date().getFullYear()} Smart Search. All rights reserved.
        </p>
        <div className='flex items-center gap-4'>
          <a
            href='#'
            className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1'
            target='_blank'
            rel='noopener noreferrer'
          >
            About <ExternalLink className='h-3 w-3' />
          </a>
          <a
            href='#'
            className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1'
            target='_blank'
            rel='noopener noreferrer'
          >
            Privacy <ExternalLink className='h-3 w-3' />
          </a>
          <a
            href='#'
            className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1'
            target='_blank'
            rel='noopener noreferrer'
          >
            Terms <ExternalLink className='h-3 w-3' />
          </a>
        </div>
      </div>
    </footer>
  );
}
