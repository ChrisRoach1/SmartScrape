'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AddSourceDialog } from '@/components/add-source-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Search, StickyNote } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { debounce } from '@tanstack/pacer';
import { Doc } from '@/convex/_generated/dataModel';

type props = {
  selectedSources: Doc<"sources">[] | null;
  handleSetSelectedSources: Dispatch<SetStateAction<Doc<"sources">[] | null>>;
}

export function SourcesPanel(props: props) {
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const sources = useQuery(api.source.getSources, { searchTerm: searchTerm });
  const selectedSourceIds = new Set((props.selectedSources ?? []).map((source) => source._id));

  const debouncedSearch = debounce((searchTerm: string) => setSearchTerm(searchTerm), {
    wait: 500,
  });

  const toggleSelectedSource = (source: Doc<'sources'>) => {
    props.handleSetSelectedSources((prevSelectedSources) => {
      const currentSelection = prevSelectedSources ?? [];
      const isAlreadySelected = currentSelection.some((selectedSource) => selectedSource._id === source._id);

      if (isAlreadySelected) {
        const nextSelection = currentSelection.filter((selectedSource) => selectedSource._id !== source._id);
        return nextSelection.length > 0 ? nextSelection : null;
      }

      return [...currentSelection, source];
    });
  };

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
            {sources.map((source) => {
              const isSelected = selectedSourceIds.has(source._id);
              const checkboxId = `source-${source._id}`;

              return (
                <label
                  key={source._id}
                  htmlFor={checkboxId}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted/50 ${
                    isSelected ? 'bg-muted/60' : ''
                  }`}
                >
                  <input
                    id={checkboxId}
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => toggleSelectedSource(source)}
                    className='size-3.5 shrink-0 cursor-pointer rounded border-border accent-primary'
                    aria-label={`Select ${source.isFile ? source.fileName : source.nonFileContent}`}
                  />
                  {source.isFile ? (
                    <FileText className='size-3.5 shrink-0 text-blue-500' />
                  ) : (
                    <StickyNote className='size-3.5 shrink-0 text-muted-foreground' />
                  )}
                  <span className='truncate'>{source.isFile ? source.fileName : source.nonFileContent}</span>
                </label>
              );
            })}
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
