'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type StatusFilter = 'all' | 'processing' | 'completed' | 'failed';
export type SentimentFilter = 'all' | 'positive' | 'negative' | 'neutral' | 'mixed';

interface LogFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSentimentChange: (value: SentimentFilter) => void;
  searchValue: string;
  statusValue: StatusFilter;
  sentimentValue: SentimentFilter;
}

export function LogFilters({
  onSearchChange,
  onStatusChange,
  onSentimentChange,
  searchValue,
  statusValue,
  sentimentValue,
}: LogFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Sync external changes
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const hasFilters = searchValue !== '' || statusValue !== 'all' || sentimentValue !== 'all';

  const clearFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onStatusChange('all');
    onSentimentChange('all');
  };

  return (
    <div className='flex flex-col gap-4 mb-6 sm:flex-row sm:items-center'>
      <div className='relative flex-1 max-w-sm'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input placeholder='Search summaries...' value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className='pl-9' />
      </div>

      <div className='flex gap-2 flex-wrap'>
        <Select value={statusValue} onValueChange={(value) => onStatusChange(value as StatusFilter)}>
          <SelectTrigger className='w-[130px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='processing'>Processing</SelectItem>
            <SelectItem value='failed'>Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sentimentValue} onValueChange={(value) => onSentimentChange(value as SentimentFilter)}>
          <SelectTrigger className='w-[170px]'>
            <SelectValue placeholder='Sentiment' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Sentiment</SelectItem>
            <SelectItem value='positive'>Positive</SelectItem>
            <SelectItem value='negative'>Negative</SelectItem>
            <SelectItem value='neutral'>Neutral</SelectItem>
            <SelectItem value='mixed'>Mixed</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant='ghost' size='icon' onClick={clearFilters} title='Clear filters'>
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
}
