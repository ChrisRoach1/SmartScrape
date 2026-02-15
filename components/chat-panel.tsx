'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload, SlidersHorizontal, MoreVertical, Send, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function ChatPanel() {
  const [message, setMessage] = useState('');

  return (
    <div className='animate-fade-up delay-100 flex h-full flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      {/* Header */}
      <div className='flex h-14 items-center justify-between border-b border-border px-5'>
        <h2 className='  text-base font-semibold tracking-tight text-foreground'>Chat</h2>
        <div className='flex items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='icon-sm' className='size-8 text-muted-foreground transition-colors hover:text-foreground'>
                <SlidersHorizontal className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chat settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='icon-sm' className='size-8 text-muted-foreground transition-colors hover:text-foreground'>
                <MoreVertical className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>More options</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Chat Body - Empty State with grain */}
      <div className='grain relative flex flex-1 flex-col items-center justify-center px-6'>
        {/* Subtle radial gradient backdrop */}
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/3 via-transparent to-transparent' />

        <div className='animate-fade-up delay-200 relative flex flex-col items-center text-center'>
          <h3 className='  text-xl font-semibold tracking-tight text-foreground'>Begin your research</h3>
          <p className='mt-2 max-w-md text-sm leading-relaxed text-muted-foreground'>
            Upload documents, paste URLs, or add text — then ask questions and get insights from your sources.
          </p>
        </div>
      </div>

      {/* Bottom Input Bar */}
      <div className='border-t border-border bg-card/80 px-4 py-3 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-3xl items-center gap-3'>
          <div className='relative flex-1'>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Add a source to start chatting...'
              className='h-10 pr-24 text-sm'
              disabled
            />
            <div className='absolute right-3 top-1/2 -translate-y-1/2'>
              <Badge variant='secondary' className='text-[10px] font-normal text-muted-foreground'>
                0 sources
              </Badge>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size='icon' className='shrink-0 transition-all' disabled>
                <ArrowRight className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
