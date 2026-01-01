import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className='border-t border-border/40 bg-background py-12'>
      <div className='container flex flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Sparkles className='h-4 w-4' />
          </div>
          <span className='text-lg font-bold'>SmartScrape</span>
        </div>

        <p className='text-sm text-muted-foreground'>© {new Date().getFullYear()} SmartScrape. All rights reserved.</p>
      </div>
    </footer>
  );
}
