import Link from 'next/link';

export function Footer() {
  return (
    <footer className='border-t border-border bg-background'>
      <div className='container mx-auto px-6 lg:px-12 py-16'>
        <div className='grid md:grid-cols-12 gap-12 md:gap-8'>
          {/* Brand column */}
          <div className='md:col-span-5'>
            <Link href='/' className='inline-block group'>
              <span className='font-serif text-2xl tracking-tight'>
                Smart<span className='text-primary'>Scrape</span>
              </span>
            </Link>
            <p className='mt-4 text-muted-foreground leading-relaxed max-w-sm'>
              Transform how you consume web content.
              Read smarter, not harder.
            </p>
          </div>

          {/* Links columns */}
          <div className='md:col-span-7'>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-8'>
              <div>
                <h4 className='text-sm tracking-widest uppercase text-muted-foreground font-medium mb-4'>
                  Product
                </h4>
                <ul className='space-y-3'>
                  <FooterLink href='#features'>Features</FooterLink>
                  <FooterLink href='#pricing'>Pricing</FooterLink>
                  <FooterLink href='#how-it-works'>How It Works</FooterLink>
                </ul>
              </div>
              {/* <div>
                <h4 className='text-sm tracking-widest uppercase text-muted-foreground font-medium mb-4'>
                  Company
                </h4>
                <ul className='space-y-3'>
                  <FooterLink href='/about'>About</FooterLink>
                  <FooterLink href='/blog'>Blog</FooterLink>
                  <FooterLink href='/contact'>Contact</FooterLink>
                </ul>
              </div>
              <div>
                <h4 className='text-sm tracking-widest uppercase text-muted-foreground font-medium mb-4'>
                  Legal
                </h4>
                <ul className='space-y-3'>
                  <FooterLink href='/privacy'>Privacy</FooterLink>
                  <FooterLink href='/terms'>Terms</FooterLink>
                </ul>
              </div> */}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='mt-16 pt-8 border-t border-border'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <p className='text-sm text-muted-foreground'>
              &copy; {new Date().getFullYear()} SmartScrape. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className='text-sm text-muted-foreground hover:text-foreground transition-colors editorial-underline'
      >
        {children}
      </Link>
    </li>
  );
}
