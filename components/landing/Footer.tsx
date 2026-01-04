export function Footer() {
  return (
    <footer className='border-t border-border/40 bg-background py-12'>
      <div className='container mx-auto flex flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6'>
        <div className='flex items-center gap-2'>
          <span className='text-lg font-bold tracking-tight'>
            Smart<span className='text-primary'>Scrape</span>
          </span>
        </div>

        <p className='text-sm text-muted-foreground'>© {new Date().getFullYear()} SmartScrape. All rights reserved.</p>
      </div>
    </footer>
  );
}
