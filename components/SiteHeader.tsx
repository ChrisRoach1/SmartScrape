'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className='sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/50'>
      <div className='container mx-auto flex h-20 items-center justify-between px-6 lg:px-12'>
        {/* Logo / Brand */}
        <Link href='/' className='group flex items-center gap-2'>
          <span className='font-serif text-xl tracking-tight'>
            Smart<span className='text-primary'>Scrape</span>
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className='hidden md:flex items-center gap-8'>
          <NavLink href='#features'>Features</NavLink>
          <NavLink href='#how-it-works'>How It Works</NavLink>
          <NavLink href='#pricing'>Pricing</NavLink>
        </nav>

        {/* Actions */}
        <div className='flex items-center gap-4'>
          <SignedIn>
            <Button
              asChild
              variant='ghost'
              className='hidden sm:inline-flex h-10 px-5 font-medium hover:bg-secondary'
            >
              <Link href='/dashboard'>Dashboard</Link>
            </Button>
            <div className='flex h-10 w-10 items-center justify-center'>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                  },
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button className='group h-10 px-6 font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-300'>
                Sign In
                <ArrowRight className='ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5' />
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors editorial-underline'
    >
      {children}
    </a>
  );
}
