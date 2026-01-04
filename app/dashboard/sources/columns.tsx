'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Play, Trash2 } from 'lucide-react';

type SourceColumnHandlers = {
  onStartAnalysis: (urls: string[]) => void;
  onEdit: (source: Doc<'sourceLibrary'>) => void;
  onDelete: (id: Id<'sourceLibrary'>) => void;
};

export const sourceColumns = (handlers: SourceColumnHandlers): ColumnDef<Doc<'sourceLibrary'>>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      id: 'urls',
      header: 'URLs',
      cell: ({ row }) => {
        return <Badge variant='secondary'>{row.original.urls.length}</Badge>;
      },
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
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handlers.onStartAnalysis(row.original.urls)}>
                <Play className='h-4 w-4 mr-2' />
                Start Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers.onEdit(row.original)}>
                <Pencil className='h-4 w-4 mr-2' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className='text-destructive' onClick={() => handlers.onDelete(row.original._id)}>
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
