'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Doc } from '@/convex/_generated/dataModel';
import { ColumnDef } from '@tanstack/react-table';
import { CircleAlert, CircleCheck, LoaderIcon, MoreHorizontal, TrendingUp, TrendingDown, Minus, Shuffle, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';

async function handleCopy(markdown: string) {
  try {
    await navigator.clipboard.writeText(markdown);
    toast('Copied to clipboard!');
  } catch {
    toast('Failed to copy');
  }
}

export function createColumns(onViewLog?: (id: Doc<'scrapeLog'>) => void): ColumnDef<Doc<'scrapeLog'>>[] {
  return [
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
      id: 'sentiment',
      header: 'Sentiment',
      cell: ({ row }) => {
        const sentiment = row.original.structuredInsights?.sentiment;
        if (!sentiment) {
          return <span className='text-muted-foreground text-sm'>-</span>;
        }

        const sentimentConfig = {
          positive: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
          negative: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
          neutral: { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-50' },
          mixed: { icon: Shuffle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        };

        const config = sentimentConfig[sentiment];
        const Icon = config.icon;

        return (
          <Badge variant='outline' className={`${config.color} ${config.bg} capitalize gap-1`}>
            <Icon className='h-3 w-3' />
            {sentiment}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const isCompleted = row.original.status === 'completed';

        if (isCompleted) {
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
                {isCompleted && onViewLog && (
                  <DropdownMenuItem onClick={() => onViewLog(row.original)}>
                    <Eye className='h-4 w-4 mr-2' />
                    View Summary
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleCopy(row.original.summarizedMarkdown ?? '')}>
                  <Copy className='h-4 w-4 mr-2' />
                  Copy Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        } else {
          return <></>;
        }
      },
    },
  ];
}
