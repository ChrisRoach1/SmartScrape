'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DataTable } from '../data-table';
import { sourceColumns } from './columns';

const sourceFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  urlInput: z.union([z.literal(''), z.url('Please enter a valid URL')]),
});

export default function SourcesPage() {
  const router = useRouter();
  const sources = useQuery(api.sourceLibrary.getAll);
  const createSource = useMutation(api.sourceLibrary.create);
  const updateSource = useMutation(api.sourceLibrary.update);
  const removeSource = useMutation(api.sourceLibrary.remove);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<'sourceLibrary'> | null>(null);
  const [urls, setUrls] = useState<string[]>([]);

  const form = useForm<z.infer<typeof sourceFormSchema>>({
    resolver: zodResolver(sourceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      urlInput: '',
    },
  });

  if (sources === undefined) {
    return (
      <div className='container mx-auto'>
        <div className='flex mb-6 flex-row-reverse'>
          <Skeleton className='h-10 w-[130px]' />
        </div>
        <div className='border rounded-lg'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Name</th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Description</th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>URLs</th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>Created At</th>
                <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className='border-b'>
                  <td className='p-4'>
                    <Skeleton className='h-4 w-[120px]' />
                  </td>
                  <td className='p-4'>
                    <Skeleton className='h-4 w-[200px]' />
                  </td>
                  <td className='p-4'>
                    <Skeleton className='h-6 w-[40px] rounded-full' />
                  </td>
                  <td className='p-4'>
                    <Skeleton className='h-4 w-[180px]' />
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
    form.reset({ name: '', description: '', urlInput: '' });
    setUrls([]);
    setEditingId(null);
  }

  function handleAddUrl() {
    const urlInput = form.getValues('urlInput');
    if (!urlInput) return;

    if (urls.includes(urlInput)) {
      toast.error('URL already added');
      return;
    }

    setUrls([...urls, urlInput]);
    form.setValue('urlInput', '');
    form.clearErrors('urlInput');
  }

  function handleRemoveUrl(url: string) {
    setUrls(urls.filter((u) => u !== url));
  }

  async function handleCreate(values: z.infer<typeof sourceFormSchema>) {
    const isValid = await form.trigger(['name']);
    if (!isValid) return;

    if (urls.length === 0) {
      toast.error('At least one URL is required');
      return;
    }

    try {
      await createSource({
        name: values.name,
        description: values.description || undefined,
        urls: urls,
      });
      toast.success('Source created successfully');
      setIsCreateOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to create source');
    }
  }

  async function handleUpdate() {
    if (!editingId) return;

    const isValid = await form.trigger(['name']);
    if (!isValid) return;

    if (urls.length === 0) {
      toast.error('At least one URL is required');
      return;
    }

    const values = form.getValues();
    try {
      await updateSource({
        id: editingId,
        name: values.name,
        description: values.description || undefined,
        urls: urls,
      });
      toast.success('Source updated successfully');
      setIsEditOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to update source');
    }
  }

  async function handleDelete(id: Id<'sourceLibrary'>) {
    try {
      await removeSource({ id });
      toast.success('Source deleted successfully');
    } catch {
      toast.error('Failed to delete source');
    }
  }

  function handleEdit(source: NonNullable<typeof sources>[number]) {
    setEditingId(source._id);
    form.reset({
      name: source.name,
      description: source.description || '',
      urlInput: '',
    });
    setUrls(source.urls);
    setIsEditOpen(true);
  }

  function handleStartAnalysis(sourceUrls: string[]) {
    sessionStorage.setItem('loadedSourceUrls', JSON.stringify(sourceUrls));
    router.push('/dashboard/summarize');
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
      <div className='flex mb-6 flex-row-reverse'>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              New Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Source</DialogTitle>
              <DialogDescription>Create a new source set with URLs you want to analyze together.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)}>
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g., Competitor X Blog' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder='Notes about this source set...' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='urlInput'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URLs</FormLabel>
                        <div className='flex gap-2'>
                          <FormControl>
                            <Input
                              placeholder='https://example.com/blog'
                              {...field}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddUrl();
                                }
                              }}
                            />
                          </FormControl>
                          <Button type='button' variant='outline' size='icon' onClick={handleAddUrl}>
                            <Plus className='h-4 w-4' />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='flex flex-wrap gap-1'>
                    {urls.map((url) => (
                      <Badge key={url} variant='secondary' className='gap-1 max-w-full'>
                        <span className='truncate max-w-[200px]'>{url}</span>
                        <button type='button' className='hover:text-destructive' onClick={() => handleRemoveUrl(url)}>
                          <XIcon className='h-3 w-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className='text-xs text-muted-foreground'>{urls.length} URL(s) added</p>
                </div>
                <DialogFooter>
                  <Button variant='outline' onClick={handleCloseCreate}>
                    Cancel
                  </Button>
                  <Button disabled={!form.formState.isValid || urls.length === 0}>Create Source</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {sources.length === 0 ? (
        <div className='text-center py-12 border rounded-lg'>
          <h3 className='text-lg font-medium mb-2'>No sources yet</h3>
          <p className='text-muted-foreground mb-4'>Create your first source set to quickly run analyses on saved URLs.</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Create Your First Source
          </Button>
        </div>
      ) : (
        <DataTable
          columns={sourceColumns({
            onStartAnalysis: (urls) => handleStartAnalysis(urls),
            onEdit: (source) => handleEdit(source),
            onDelete: (id) => handleDelete(id),
          })}
          data={sources}
        />
      )}

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
            <DialogTitle>Edit Source</DialogTitle>
            <DialogDescription>Update this source set&apos;s details and URLs.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)}>
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., Competitor X Blog' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder='Notes about this source set...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='urlInput'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URLs</FormLabel>
                      <div className='flex gap-2'>
                        <FormControl>
                          <Input
                            placeholder='https://example.com/blog'
                            {...field}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddUrl();
                              }
                            }}
                          />
                        </FormControl>
                        <Button type='button' variant='outline' size='icon' onClick={handleAddUrl}>
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex flex-wrap gap-1'>
                  {urls.map((url) => (
                    <Badge key={url} variant='secondary' className='gap-1 max-w-full'>
                      <span className='truncate max-w-[200px]'>{url}</span>
                      <button type='button' className='hover:text-destructive' onClick={() => handleRemoveUrl(url)}>
                        <XIcon className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className='text-xs text-muted-foreground'>{urls.length} URL(s) added</p>
              </div>
              <DialogFooter>
                <Button variant='outline' onClick={handleCloseEdit}>
                  Cancel
                </Button>
                <Button disabled={!form.formState.isValid || urls.length === 0}>Update Source</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
