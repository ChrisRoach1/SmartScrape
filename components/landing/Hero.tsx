'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section id='Hero' className='relative min-h-[90vh] flex items-center grain overflow-hidden'>
      {/* Subtle geometric background */}
      <div className='absolute inset-0 -z-10'>
        <div className='absolute top-0 right-0 w-1/2 h-full bg-secondary/30' />
        <div className='absolute bottom-0 left-1/4 w-px h-1/2 bg-border' />
        <div className='absolute top-1/4 right-1/3 w-px h-1/3 bg-border' />
        <div className='absolute top-1/3 left-0 w-1/4 h-px bg-border' />
      </div>

      <div className='container mx-auto px-6 lg:px-12 py-24'>
        <div className='grid lg:grid-cols-12 gap-12 lg:gap-8 items-center'>
          {/* Left column - Main content */}
          <div className='lg:col-span-7 space-y-8'>
            <div className='animate-fade-up'>
              <span className='inline-block text-sm tracking-[0.2em] uppercase text-muted-foreground font-medium mb-6'>
                Web Intelligence Platform
              </span>
            </div>

            <h1 className='animate-fade-up delay-100'>
              <span className='block font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight leading-[0.95]'>
                Read the web.
              </span>
              <span className='block font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight leading-[0.95] mt-2'>
                <em className='text-primary'>Understand</em> it.
              </span>
            </h1>

            <p className='animate-fade-up delay-200 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed'>
              Transform sprawling web pages into distilled insights.
              No noise, no clutter—just the signal you need.
            </p>

            <div className='animate-fade-up delay-300 flex flex-col sm:flex-row items-start gap-4 pt-4'>
              <SignedOut>
                <SignUpButton mode='modal'>
                  <Button
                    size='lg'
                    className='group h-14 px-8 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-300'
                  >
                    Start Reading Smarter
                    <ArrowRight className='ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button
                  asChild
                  size='lg'
                  className='group h-14 px-8 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-300'
                >
                  <Link href='/dashboard'>
                    Go to Dashboard
                    <ArrowRight className='ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                  </Link>
                </Button>
              </SignedIn>

              <span className='text-sm text-muted-foreground self-center hidden sm:block'>
                Free to start. No credit card.
              </span>
            </div>
          </div>

          {/* Right column - Visual element */}
          <div className='lg:col-span-5 animate-fade-up delay-400'>
            <div className='relative'>
              {/* Abstract document visualization */}
              <div className='relative bg-card border border-border p-8 shadow-lg'>
                <div className='absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-primary' />
                <div className='absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-primary' />

                {/* Simulated content being distilled */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-3 pb-4 border-b border-border'>
                    <div className='w-2 h-2 rounded-full bg-primary' />
                    <span className='text-xs tracking-widest uppercase text-muted-foreground'>Source Analysis</span>
                  </div>

                  {/* "Chaotic" input */}
                  <div className='space-y-2 opacity-40'>
                    <div className='h-2 bg-muted-foreground/20 w-full' />
                    <div className='h-2 bg-muted-foreground/20 w-11/12' />
                    <div className='h-2 bg-muted-foreground/20 w-full' />
                    <div className='h-2 bg-muted-foreground/20 w-4/5' />
                    <div className='h-2 bg-muted-foreground/20 w-full' />
                    <div className='h-2 bg-muted-foreground/20 w-3/4' />
                  </div>

                  {/* Arrow indicator */}
                  <div className='flex justify-center py-4'>
                    <div className='flex flex-col items-center gap-1 text-primary'>
                      <div className='w-px h-6 bg-primary/40' />
                      <ArrowRight className='h-4 w-4 rotate-90' />
                    </div>
                  </div>

                  {/* Clean output */}
                  <div className='space-y-3 p-4 bg-secondary/50 border-l-2 border-primary'>
                    <div className='h-3 bg-foreground/80 w-3/4' />
                    <div className='h-2 bg-foreground/40 w-full' />
                    <div className='h-2 bg-foreground/40 w-5/6' />
                  </div>
                </div>
              </div>

              {/* Floating accent element */}
              <div className='absolute -z-10 top-8 -right-8 w-32 h-32 bg-primary/10' />
            </div>
          </div>
        </div>

        {/* Bottom stats/social proof */}
        <div className='mt-24 pt-12 border-t border-border animate-fade-up delay-500'>
          <div className='flex flex-wrap items-center gap-8 lg:gap-16 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <span className='font-serif text-2xl text-foreground'>10k+</span>
              <span>pages summarized</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-serif text-2xl text-foreground'>50+</span>
              <span>hours saved weekly</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-serif text-2xl text-foreground'>4.9</span>
              <span>average rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
