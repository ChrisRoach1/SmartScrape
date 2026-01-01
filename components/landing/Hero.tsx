'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className='relative flex flex-col items-center justify-center overflow-hidden py-24 md:py-32 lg:py-40'>
      {/* Background gradients */}
      <div className='absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute left-1/2 top-0 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 opacity-50 blur-3xl' />
        <div className='absolute bottom-0 right-0 h-[800px] w-[800px] translate-x-1/3 translate-y-1/3 rounded-full bg-primary/10 opacity-30 blur-3xl' />
      </div>

      <div className='container relative z-10 flex flex-col items-center px-4 text-center md:px-6'>
        <h1 className='max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl'>
          Read the internet. <br className='hidden md:inline' />
          <span className='bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>Faster.</span>
        </h1>

        <p className='mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl'>
          Turn any website into clear, actionable summaries using AI. <br className='hidden sm:inline' />
          No noise, just signal.
        </p>

        <div className='mt-10 flex flex-wrap items-center justify-center gap-4'>
          <SignedOut>
            <SignUpButton mode='modal'>
              <Button size='lg' className='h-12 rounded-full px-8 text-base shadow-lg transition-all hover:scale-105'>
                Start Summarizing
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button asChild size='lg' className='h-12 rounded-full px-8 text-base shadow-lg transition-all hover:scale-105'>
              <Link href='/dashboard'>
                Go to Dashboard
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}
