'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AddSourceDialog } from '@/components/add-source-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Search, StickyNote } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { debounce } from '@tanstack/pacer';

export function SourcesPanel() {
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const sources = useQuery(api.source.getSources, { searchTerm: searchTerm });

  const debouncedSearch = debounce((searchTerm: string) => setSearchTerm(searchTerm), {
    wait: 500,
  });

  return (
    <div className='animate-fade-up flex h-full w-[280px] min-w-[280px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      {/* Header */}
      <div className='flex h-14 items-center border-b border-border px-5'>
        <h2 className='  text-base font-semibold tracking-tight text-foreground'>Sources</h2>
        <Badge variant='secondary' className='ml-auto text-[10px] font-normal text-muted-foreground'>
          {sources === undefined ? <Skeleton className='h-3 w-6' /> : `${sources.length} added`}
        </Badge>
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col gap-3 p-4'>
        {/* Add Sources Button */}
        <Button
          variant='outline'
          className='w-full justify-center gap-2 border-dashed transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
          size='sm'
          onClick={() => setAddSourceOpen(true)}
        >
          <Plus className='size-4' />
          Add sources
        </Button>

        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground' />
          <Input placeholder='Search for sources...' className='h-9 pl-9 text-xs' onChange={(e) => debouncedSearch(e.target.value)} />
        </div>

        {/* Sources List / Loading / Empty State */}
        {sources === undefined ? (
          <div className='flex flex-1 flex-col gap-0.5 overflow-y-auto'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2 px-3 py-2'>
                <Skeleton className='size-3.5 shrink-0 rounded' />
                <Skeleton className='h-3 rounded' style={{ width: `${60 + ((i * 17) % 30)}%` }} />
              </div>
            ))}
          </div>
        ) : sources.length > 0 ? (
          <div className='flex flex-1 flex-col gap-0.5 overflow-y-auto'>
            {sources.map((source) => (
              <div
                key={source._id}
                className='flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted/50'
              >
                {source.isFile ? (
                  <FileText className='size-3.5 shrink-0 text-blue-500' />
                ) : (
                  <StickyNote className='size-3.5 shrink-0 text-muted-foreground' />
                )}
                <span className='truncate'>{source.isFile ? source.fileName : source.nonFileContent}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className='animate-fade-in delay-300 flex flex-1 flex-col items-center justify-center px-4 text-center'>
            <p className='text-sm font-semibold tracking-tight text-foreground'>No sources yet</p>
            <p className='mt-1.5 text-[11px] leading-relaxed text-muted-foreground'>
              Add PDFs, websites, text, videos, or audio to build your research library.
            </p>
          </div>
        )}
      </div>

      {/* Add Source Dialog */}
      <AddSourceDialog open={addSourceOpen} onOpenChange={setAddSourceOpen} />
    </div>
  );
}
