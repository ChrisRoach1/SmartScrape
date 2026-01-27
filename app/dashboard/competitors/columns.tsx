'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

type CompetitorColumnHandlers = {
  onEdit: (competitor: Doc<'competitors'>) => void;
  onDelete: (id: Id<'competitors'>) => void;
};

export const competitorColumns = (handlers: CompetitorColumnHandlers): ColumnDef<Doc<'competitors'>>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'scanFrequency',
      header: 'Scan Frequency',
      cell: ({ row }) => {
        const frequency = row.getValue('scanFrequency') as 'w' | 'm';
        return <Badge variant='secondary'>{frequency === 'w' ? 'Weekly' : 'Monthly'}</Badge>;
      },
    },
    {
      accessorKey: 'lastScannedOn',
      header: 'Last Scanned',
      cell: ({ row }) => {
        const timestamp = row.getValue('lastScannedOn') as number | undefined;
        if (!timestamp) {
          return <span className='text-muted-foreground'>Never</span>;
        }
        return (
          <div>
            {new Date(timestamp).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        );
      },
    },
    {
      accessorKey: '_creationTime',
      header: 'Created At',
      cell: ({ row }) => {
        const timestamp = new Date(row.getValue('_creationTime')).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
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
