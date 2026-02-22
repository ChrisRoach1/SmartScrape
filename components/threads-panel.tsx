'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export type Thread = {
  _id: string;
  _creationTime: number;
  title?: string;
  summary?: string;
  userId?: string;
  status: 'active' | 'archived';
};

type Props = {
  selectedThread: Thread | null;
  handleSetSelectedThread: (thread: Thread | null) => void;
};

export function ThreadsPanel({ selectedThread, handleSetSelectedThread }: Props) {
  const threads = useQuery(api.agent.listThreads, {});

  const toggleSelectedThread = (thread: Thread) => {
    if (selectedThread?._id === thread._id) {
      handleSetSelectedThread(null);
    } else {
      handleSetSelectedThread(thread);
    }
  };

  return (
    <div className='animate-fade-up flex h-full w-[280px] min-w-[280px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      {/* Header */}
      <div className='flex h-14 items-center border-b border-border px-5'>
        <h2 className='text-base font-semibold tracking-tight text-foreground'>Threads</h2>
        <Badge variant='secondary' className='ml-auto text-[10px] font-normal text-muted-foreground'>
          {threads === undefined ? <Skeleton className='h-3 w-6' /> : `${threads.length} total`}
        </Badge>
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col gap-3 p-4'>
        {/* Threads List / Loading / Empty State */}
        {threads === undefined ? (
          <div className='flex flex-1 flex-col gap-0.5 overflow-y-auto'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2 px-3 py-2'>
                <Skeleton className='size-3.5 shrink-0 rounded' />
                <Skeleton className='h-3 rounded' style={{ width: `${60 + ((i * 17) % 30)}%` }} />
              </div>
            ))}
          </div>
        ) : threads.length > 0 ? (
          <div className='flex flex-1 flex-col gap-0.5 overflow-y-auto'>
            {threads.map((thread) => {
              const isSelected = selectedThread?._id === thread._id;
              const displayTitle = thread.title ?? 'Untitled';

              return (
                <button
                  key={thread._id}
                  onClick={() => toggleSelectedThread(thread)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-muted/50 ${
                    isSelected ? 'bg-muted/60 font-medium' : ''
                  }`}
                >
                  <MessageSquare className={`size-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className='truncate'>{displayTitle}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className='animate-fade-in delay-300 flex flex-1 flex-col items-center justify-center px-4 text-center'>
            <p className='text-sm font-semibold tracking-tight text-foreground'>No threads yet</p>
            <p className='mt-1.5 text-[11px] leading-relaxed text-muted-foreground'>Start a conversation to create your first thread.</p>
          </div>
        )}
      </div>
    </div>
  );
}
