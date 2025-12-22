'use client';

import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { DataTable } from './data-table';
import { columns } from './columns';

export default function DashboardPage() {
  const { userId } = useAuth();

  const logs = useQuery(api.scrapeLog.getAllLogs);

  if (!userId) {
    return <RedirectToSignIn />;
  }

  if (logs === undefined) {
    return (
      <div className='container mx-auto py-8'>
        <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>
        <p>Loading logs...</p>
      </div>
    );
  }

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
        <DataTable columns={columns} data={logs} />
      </div>
    </div>
  );
}
