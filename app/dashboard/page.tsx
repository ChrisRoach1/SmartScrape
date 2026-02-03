'use client';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from './data-table';
import { createColumns } from './columns';
import { ScrapeLogDialog } from '@/components/scrape-log-dialog';
import { useState, useCallback } from 'react';
import { LogFilters, StatusFilter, SentimentFilter } from '@/components/log-filters';

export default function DashboardPage() {
  const [selectedLog, setSelectedLog] = useState<Doc<'scrapeLog'> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');

  // Build query args
  const queryArgs = {
    searchTerm: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sentiment: sentimentFilter !== 'all' ? sentimentFilter : undefined,
  };

  const logs = useQuery(api.scrapeLog.searchLogs, queryArgs);

  const handleViewLog = (scrapeLog: Doc<'scrapeLog'>) => {
    setSelectedLog(scrapeLog);
    setIsDialogOpen(true);
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleStatusChange = useCallback((value: StatusFilter) => {
    setStatusFilter(value);
  }, []);

  const handleSentimentChange = useCallback((value: SentimentFilter) => {
    setSentimentFilter(value);
  }, []);

  const columns = createColumns(handleViewLog);

  if (logs === undefined) {
    return (
      <div className='container mx-auto'>
        <div className='flex flex-row-reverse'>
          <Skeleton className='h-10 w-[140px]' />
        </div>
        <div className='container mx-auto py-6'>
          <div className='mb-6'>
            <Skeleton className='h-10 w-full max-w-sm' />
          </div>
          <div className='border rounded-lg'>
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Title</th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Created At</th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Status</th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Sentiment</th>
                  <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className='border-b'>
                    <td className='p-4'>
                      <Skeleton className='h-4 w-[150px]' />
                    </td>
                    <td className='p-4'>
                      <Skeleton className='h-4 w-[180px]' />
                    </td>
                    <td className='p-4'>
                      <Skeleton className='h-6 w-[100px] rounded-full' />
                    </td>
                    <td className='p-4'>
                      <Skeleton className='h-6 w-[90px] rounded-full' />
                    </td>
                    <td className='p-4'>
                      <Skeleton className='h-8 w-8 rounded-md' />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || sentimentFilter !== 'all';

  return (
    <div className='container mx-auto'>
      <div className='flex flex-row-reverse'>
        <Link href='/dashboard/summarize'>
          <Button>
            <Plus className='h-4 w-4 mr-2' />
            New Summary
          </Button>
        </Link>
      </div>
      <div className='container mx-auto py-6'>
        <LogFilters
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onSentimentChange={handleSentimentChange}
          searchValue={searchTerm}
          statusValue={statusFilter}
          sentimentValue={sentimentFilter}
        />

        {logs.length === 0 && hasActiveFilters ? (
          <div className='border rounded-lg p-8 text-center'>
            <p className='text-muted-foreground'>No results match your filters.</p>
            <Button
              variant='link'
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSentimentFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <DataTable columns={columns} data={logs} />
        )}
      </div>

      <ScrapeLogDialog scrapeLog={selectedLog} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
