'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, XIcon, Library, Info } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@clerk/clerk-react';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProUpgradeFallback } from '@/components/pro-upgrade-fallback';

const formSchema = z.object({
  link: z.union([z.literal(''), z.url()]),
  title: z.string().min(1),
  instructions: z.string().optional(),
  modelToUse: z.string().optional(),
});

const MAX_LINKS = 10;
const SUMMARY_LIMIT = 10;

export default function SummarizePage() {
  const [links, updateLinks] = useState<string[] | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const { has } = useAuth();
  let hasPremiumAccess = false;

  if (has) {
    hasPremiumAccess = has({ plan: 'pro' });
  }

  const createCrawlLog = useMutation(api.scrapeLog.createLogRecord);
  const sources = useQuery(api.sourceLibrary.getAll);
  const models = useQuery(api.models.getAllModels);
  const usage = useQuery(api.usage.getUsage);

  const summaryCount = usage?.summaryCount ?? 0;
  const hasReachedLimit = !hasPremiumAccess && summaryCount >= SUMMARY_LIMIT;

  const linkForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: '',
      title: '',
      instructions: '',
    },
  });

  // Check for loaded source URLs from sessionStorage on mount
  const hasLoadedFromSession = useRef(false);
  useEffect(() => {
    if (hasLoadedFromSession.current) return;

    const loadedUrls = sessionStorage.getItem('loadedSourceUrls');
    if (loadedUrls) {
      hasLoadedFromSession.current = true;
      sessionStorage.removeItem('loadedSourceUrls');

      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        try {
          const urls = JSON.parse(loadedUrls) as string[];
          updateLinks(urls);
          toast.success('URLs loaded from source');
        } catch {
          // Ignore parse errors
        }
      }, 0);
    }
  }, []);

  function removeLink(link: string) {
    updateLinks(links?.filter((item) => item !== link) ?? null);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (links) {
      const id = await createCrawlLog({
        urls: links,
        title: values.title,
        instructions: values.instructions,
        isPro: hasPremiumAccess,
        modelToRun: hasPremiumAccess ? values.modelToUse : undefined,
      });
    }

    toast.success("You're summary is generating check the home page to see the status!");
    linkForm.reset();
    updateLinks([]);
  }

  function handleLinkAdd() {
    console.log(linkForm.formState);
    const link = linkForm.getValues().link;

    if (link) {
      if (links && links?.indexOf(link) > -1) {
        linkForm.reset();
        toast('Link has already been added!');
        return;
      }

      if (links === null) {
        updateLinks([link]);
      } else {
        updateLinks([...links, link]);
      }

      if (links && links.length >= MAX_LINKS - 1) {
        toast(`Maximum of ${MAX_LINKS} links reached!`);
      }

      linkForm.setValue('link', '');
    }
  }

  function handleLoadSource(sourceId: string) {
    const source = sources?.find((s) => s._id === sourceId);
    if (source) {
      updateLinks(source.urls);
      toast.success(`Loaded ${source.urls.length} URLs from "${source.name}"`);
    }
  }

  return (
    <div>
      {/* Load from Sources dropdown */}
      {sources && sources.length > 0 && (
        <div className='mb-4'>
          <div className='flex items-center gap-2'>
            <Library className='h-4 w-4 text-muted-foreground' />
            <Select onValueChange={handleLoadSource}>
              <SelectTrigger className='w-[250px]'>
                <SelectValue placeholder='Load from saved sources...' />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source._id} value={source._id}>
                    {source.name} ({source.urls.length} URLs)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className='mb-5'>
        {links?.map((item) => (
          <Badge key={item} className='gap-1' variant={'secondary'}>
            {item}
            <Button variant={'secondary'} className='h-3 w-3 cursor-pointer hover:text-destructive' onClick={() => removeLink(item)}>
              <XIcon />
            </Button>
          </Badge>
        ))}
      </div>

      <Form {...linkForm}>
        <form onSubmit={linkForm.handleSubmit(onSubmit)}>
          <div className='space-x-8 flex flex-row'>
            <Controller
              name='link'
              control={linkForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder='https://google.com' />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  <p className='text-xs text-gray-400'>
                    {links?.length ?? 0}/{MAX_LINKS}
                  </p>
                </Field>
              )}
            />
            <Button
              disabled={links !== null && links.length >= MAX_LINKS}
              variant={'outline'}
              size='icon'
              type='button'
              onClick={() => handleLinkAdd()}
            >
              <PlusIcon />
            </Button>
          </div>

          <hr className='mt-2 mb-2 text-gray-300' />

          <div className='grid w-full gap-2'>
            <Controller
              name='title'
              control={linkForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder='Enter title for this scrape...' />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name='instructions'
              control={linkForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Instructions</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className='h-44'
                    placeholder='Enter additional instructions for summarization... (optional)'
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {hasPremiumAccess && (
              <div className='space-y-1'>
                <Controller
                  name='modelToUse'
                  control={linkForm.control}
                  render={({ field, fieldState }) => (
                    <Field orientation='responsive' data-invalid={fieldState.invalid}>
                      <FieldContent>
                        <FieldLabel htmlFor='form-rhf-select-language'>Model</FieldLabel>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </FieldContent>
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id='form-rhf-select-language' aria-invalid={fieldState.invalid} className='min-w-[120px]'>
                          <SelectValue placeholder='Select a model...' />
                        </SelectTrigger>
                        <SelectContent position='item-aligned'>
                          {models?.map((model) => (
                            <SelectItem key={model.code} value={model.code}>
                              <div className='flex items-center gap-2'>
                                <span>{model.displayName}</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant='ghost' size='icon-sm'>
                                      <Info className='h-3.5 w-3.5 text-muted-foreground' />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{model.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              </div>
            )}
            {!hasPremiumAccess && (
              <p className='text-sm text-muted-foreground'>
                {summaryCount}/{SUMMARY_LIMIT} summaries used this month
              </p>
            )}
            {hasReachedLimit && (
              <div className='rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800'>
                You have reached your monthly limit of {SUMMARY_LIMIT} summaries.{' '}
                <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
                  <DialogTrigger asChild>
                    <button type='button' className='font-medium underline hover:no-underline'>
                      Upgrade to Pro
                    </button>
                  </DialogTrigger>
                  <DialogTitle>Upgrade</DialogTitle>
                  <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                    <ProUpgradeFallback
                      featureName='Summaries'
                      description='Upgrade to Pro for unlimited summaries.'
                    />
                  </DialogContent>
                </Dialog>{' '}
                for unlimited summaries.
              </div>
            )}
            <Button disabled={!links || links.length === 0 || !linkForm.watch('title') || hasReachedLimit} type='submit'>
              Generate
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
