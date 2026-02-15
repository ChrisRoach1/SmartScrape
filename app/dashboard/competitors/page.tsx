'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ScrapeLogViewer } from '@/components/scrape-log-viewer';
import { DataTable } from '../data-table';
import { competitorColumns } from './columns';
import { useAuth } from '@clerk/clerk-react';
import { ProUpgradeFallback } from '@/components/pro-upgrade-fallback';

const competitorFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  frequency: z.union([z.literal('w'), z.literal('m')]),
});

const COMPETITOR_LIMIT = 5;

export default function CompetitorsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<'competitors'> | null>(null);
  const [viewingId, setViewingId] = useState<Id<'competitors'> | null>(null);
  const [isViewSummariesOpen, setIsViewSummariesOpen] = useState(false);
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { has } = useAuth();
  const hasPremiumAccess = has?.({ plan: 'pro' }) ?? false;

  const competitors = useQuery(api.competitor.getAll);
  const usage = useQuery(api.usage.getUsage);

  const competitorCount = usage?.competitorCount ?? 0;
  const hasReachedLimit = !hasPremiumAccess && competitorCount >= COMPETITOR_LIMIT;
  const createCompetitor = useMutation(api.competitor.create);
  const updateCompetitor = useMutation(api.competitor.update);
  const removeCompetitor = useMutation(api.competitor.remove);
  const getAnalysis = useQuery(api.competitor.getAnalysisByCompetitorId, viewingId ? { id: viewingId } : 'skip');

  useEffect(() => {
    scrollRef?.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentAnalysisIndex]);

  const handleNavigateAnalysis = (index: number) => {
    setCurrentAnalysisIndex((prev) => prev + index);
  };

  const form = useForm<z.infer<typeof competitorFormSchema>>({
    resolver: zodResolver(competitorFormSchema),
    defaultValues: {
      name: '',
      frequency: 'm',
    },
  });

  if (competitors === undefined) {
    return (
      <div className='container mx-auto'>
        <div className='flex mb-6 flex-row-reverse'>
          <Skeleton className='h-10 w-[150px]' />
        </div>
        <div className='border rounded-lg'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Name</th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Scan Frequency</th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Last Scanned</th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Created At</th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className='border-b'>
                  <td className='p-4'>
                    <Skeleton className='h-4 w-[120px]' />
                  </td>
                  <td className='p-4'>
                    <Skeleton className='h-6 w-[70px] rounded-full' />
                  </td>
                  <td className='p-4'>
                    <Skeleton className='h-4 w-[100px]' />
                  </td>
                  <td className='p-4'>
                    <Skeleton className='h-4 w-[100px]' />
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
    );
  }

  function resetForm() {
    form.reset({ name: '', frequency: 'm' });
    setEditingId(null);
  }

  async function handleCreate(values: z.infer<typeof competitorFormSchema>) {
    try {
      await createCompetitor({
        name: values.name,
        scanFrequency: values.frequency,
      });

      toast.success('Competitor created successfully');
      setIsCreateOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to create competitor');
    }
  }

  async function handleUpdate(values: z.infer<typeof competitorFormSchema>) {
    if (!editingId) return;

    try {
      await updateCompetitor({
        id: editingId,
        name: values.name,
        scanFrequency: values.frequency,
      });

      toast.success('Competitor updated successfully');
      setIsEditOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to update competitor');
    }
  }

  async function handleDelete(id: Id<'competitors'>) {
    try {
      await removeCompetitor({ id });
      toast.success('Competitor deleted successfully');
    } catch {
      toast.error('Failed to delete competitor');
    }
  }

  function handleLoadAnalysis(id: Id<'competitors'>) {
    setViewingId(id);
    setCurrentAnalysisIndex(0);
    setIsViewSummariesOpen(true);
  }

  function handleEdit(competitor: Doc<'competitors'>) {
    setEditingId(competitor._id);

    form.reset({
      name: competitor.name,
      frequency: competitor.scanFrequency,
    });

    setIsEditOpen(true);
  }

  function handleCloseCreate() {
    setIsCreateOpen(false);
    resetForm();
  }

  function handleCloseEdit() {
    setIsEditOpen(false);
    resetForm();
  }

  return (
    <div className='container mx-auto animate-fade-up'>
      {!hasPremiumAccess && (
        <div className='mb-4'>
          <p className='text-sm text-muted-foreground'>
            {competitorCount}/{COMPETITOR_LIMIT} competitor analyses used this month
          </p>
          {hasReachedLimit && (
            <div className='mt-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800'>
              You have reached your monthly limit of {COMPETITOR_LIMIT} competitor analyses.{' '}
              <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
                <DialogTrigger asChild>
                  <button type='button' className='font-medium underline hover:no-underline'>
                    Upgrade to Pro
                  </button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                  <DialogTitle>Upgrade</DialogTitle>
                  <ProUpgradeFallback featureName='Competitor Tracking' description='Upgrade to Pro for unlimited competitor analyses.' />
                </DialogContent>
              </Dialog>{' '}
              for unlimited competitor tracking.
            </div>
          )}
        </div>
      )}
      <div className='flex mb-6 flex-row-reverse'>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button disabled={hasReachedLimit}>
              <Plus className='h-4 w-4 mr-2' />
              New Competitor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Competitor</DialogTitle>
              <DialogDescription>Add a new competitor to track and analyze.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., Acme Corp' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='frequency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scan Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select frequency' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='w'>Weekly</SelectItem>
                          <SelectItem value='m'>Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type='button' variant='outline' onClick={handleCloseCreate}>
                    Cancel
                  </Button>
                  <Button type='submit' disabled={!form.formState.isValid}>
                    Add Competitor
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {competitors.length === 0 ? (
        <div className='text-center py-12 border rounded-lg'>
          <h3 className='text-lg font-medium mb-2'>No competitors yet</h3>
          <p className='text-muted-foreground mb-4'>Add your first competitor to start tracking and analyzing them.</p>
          <Button onClick={() => setIsCreateOpen(true)} disabled={hasReachedLimit}>
            <Plus className='h-4 w-4 mr-2' />
            Add Your First Competitor
          </Button>
        </div>
      ) : (
        <DataTable
          columns={competitorColumns({
            onEdit: (competitor) => handleEdit(competitor),
            onDelete: (id) => handleDelete(id),
            onView: (id) => handleLoadAnalysis(id),
          })}
          data={competitors}
        />
      )}

      <Dialog
        open={isViewSummariesOpen}
        onOpenChange={(open) => {
          setIsViewSummariesOpen(open);
          if (!open) {
            setViewingId(null);
            setCurrentAnalysisIndex(0);
          }
        }}
      >
        <DialogContent ref={scrollRef} className='lg:max-w-1/2 max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Competitor Analyses</DialogTitle>
            <DialogDescription>
              {getAnalysis && getAnalysis.length > 0
                ? `Viewing analysis ${currentAnalysisIndex + 1} of ${getAnalysis.length}`
                : 'No analyses available'}
            </DialogDescription>
          </DialogHeader>

          {getAnalysis === undefined ? (
            <div className='flex-1 flex items-center justify-center py-12'>
              <Skeleton className='h-64 w-full' />
            </div>
          ) : getAnalysis.length === 0 ? (
            <div className='flex-1 flex flex-col items-center justify-center py-12 text-center'>
              <p className='text-muted-foreground mb-2'>No analyses yet for this competitor.</p>
              <p className='text-sm text-muted-foreground'>Analyses are generated automatically based on the scan frequency.</p>
            </div>
          ) : (
            <>
              <p className='text-sm text-muted-foreground'>
                Generated on{' '}
                {new Date(getAnalysis[currentAnalysisIndex]?._creationTime).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
              <div className='flex-1 overflow-y-auto min-h-0'>
                <ScrapeLogViewer summarizedMarkdown={getAnalysis[currentAnalysisIndex]?.analysis} structuredInsights={null} />
              </div>

              {getAnalysis.length > 1 && (
                <div className='flex items-center justify-between pt-4 border-t'>
                  <Button variant='outline' size='sm' onClick={() => handleNavigateAnalysis(-1)} disabled={currentAnalysisIndex === 0}>
                    <ChevronLeft className='h-4 w-4 mr-1' />
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleNavigateAnalysis(1)}
                    disabled={currentAnalysisIndex === getAnalysis.length - 1}
                  >
                    Next
                    <ChevronRight className='h-4 w-4 ml-1' />
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Competitor</DialogTitle>
            <DialogDescription>Update this competitors details.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., Acme Corp' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='frequency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scan Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select frequency' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='w'>Weekly</SelectItem>
                        <SelectItem value='m'>Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type='button' variant='outline' onClick={handleCloseEdit}>
                  Cancel
                </Button>
                <Button type='submit' disabled={!form.formState.isValid}>
                  Update Competitor
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
