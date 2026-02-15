'use client';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from './data-table';
import { createColumns } from './columns';
import { ScrapeLogDialog } from '@/components/scrape-log-dialog';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { debounce } from '@tanstack/pacer';

export default function DashboardPage() {
  const [selectedLog, setSelectedLog] = useState<Doc<'scrapeLog'> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const logs = useQuery(api.scrapeLog.searchLogs, { searchTerm: searchTerm });

  const handleViewLog = (scrapeLog: Doc<'scrapeLog'>) => {
    setSelectedLog(scrapeLog);
    setIsDialogOpen(true);
  };

  const debouncedSearch = debounce((searchTerm: string) => setSearchTerm(searchTerm), {
    wait: 500,
  });

  const columns = createColumns(handleViewLog);

  return (
    <div className='container mx-auto animate-fade-up'>
      <div className='flex flex-row-reverse'>
        <Link href='/dashboard/summarize'>
          <Button>
            <Plus className='h-4 w-4 mr-2' />
            New Summary
          </Button>
        </Link>
      </div>
      <div className='container mx-auto py-6'>
        <div className='flex flex-col gap-4 mb-6 sm:flex-row sm:items-center'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input placeholder='Search summaries...' onChange={(e) => debouncedSearch(e.target.value)} className='pl-9' />
          </div>
        </div>

        {logs === undefined ? (
          <div className='container mx-auto'>
            <div className='container mx-auto py-6'>
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
        ) : (
          <DataTable columns={columns} data={logs} />
        )}
      </div>

      <ScrapeLogDialog scrapeLog={selectedLog} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
