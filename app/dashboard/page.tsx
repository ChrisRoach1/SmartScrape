'use client';

import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DashboardPage() {
  const logs = useQuery(api.scrapeLog.getAllLogs);

  async function handleCopy(markdown: string) {
    try {
      await navigator.clipboard.writeText(markdown);
      toast('Copied to clipboard!');
    } catch {
      toast('Failed to copy');
    }
  }

  if (logs === undefined) {
    return (
      <div className='container mx-auto py-8'>
        <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>
        <p>Loading logs...</p>
      </div>
    );
  }

  if (logs === null || logs.length === 0) {
    return (
      <div className='container mx-auto py-8'>
        <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>
        <p>No logs found.</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Summaries</h1>
        <Link href='/summarize'>
          <Button>
            <Plus className='h-4 w-4 mr-2' />
            New Summary
          </Button>
        </Link>
      </div>
      <div className='space-y-4'>
        {logs.map((log) => {
          const timestamp = new Date(log._creationTime).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          const statusVariant = log.status === 'completed' ? 'success' : log.status === 'processing' ? 'secondary' : 'destructive';

          return (
            <div key={log._id} className='border border-secondary rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'>
              <div className='flex justify-between items-start mb-2'>
                <h2 className='text-xl font-semibold'>{timestamp}</h2>
                {log.summarizedMarkdown && (
                  <Button onClick={() => handleCopy(log.summarizedMarkdown!)} variant='outline' size='icon'>
                    <Copy className='h-4 w-4' />
                  </Button>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>Status:</span>
                  <Badge variant={statusVariant as 'success' | 'secondary' | 'destructive'}>{log.status}</Badge>
                </div>
                <div>
                  <span className='text-sm font-medium'>URLs:</span>
                  <ul className='list-disc list-inside ml-4 text-sm'>
                    {log.urls.map((url, index) => (
                      <li key={index} className='truncate'>
                        {url}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
