'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Doc } from '@/convex/_generated/dataModel';
import { ColumnDef } from '@tanstack/react-table';
import { CircleAlert, CircleCheck, LoaderIcon, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

async function handleCopy(markdown: string) {
  try {
    await navigator.clipboard.writeText(markdown);
    toast('Copied to clipboard!');
  } catch {
    toast('Failed to copy');
  }
}

export const columns: ColumnDef<Doc<'scrapeLog'>>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: '_creationTime',
    header: () => <div>Created At</div>,
    cell: ({ row }) => {
      const timestamp = new Date(row.getValue('_creationTime')).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return <div>{timestamp}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant='outline' className='text-muted-foreground px-1.5'>
        {row.original.status === 'completed' ? (
          <CircleCheck className='fill-green-500 dark:fill-green-400' />
        ) : row.original.status === 'processing' ? (
          <LoaderIcon />
        ) : (
          <CircleAlert className='fill-red-500 dark:fill-red-400' />
        )}
        {row.original.status}
      </Badge>
    ),
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleCopy(row.original.summarizedMarkdown ?? '')}>Copy Markdown</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
