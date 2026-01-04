'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PlusIcon,
  XIcon,
  Loader2,
  Copy,
  Library,
  Save,
  Lightbulb,
  Building2,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Shuffle,
  Tag,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  link: z.union([z.literal(''), z.url()]),
  title: z.string(),
  instructions: z.string().optional(),
});

const MAX_LINKS = 10;

export default function SummarizePage() {
  const { userId } = useAuth();

  const [links, updateLinks] = useState<string[] | null>(null);
  const [scrapeLogId, updateScrapeLogId] = useState<Id<'scrapeLog'> | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveSourceName, setSaveSourceName] = useState('');
  const [saveSourceDescription, setSaveSourceDescription] = useState('');

  const createCrawlLog = useMutation(api.scrapeLog.createLogRecord);
  const crawlLog = useQuery(api.scrapeLog.getScrapeLog, scrapeLogId ? { id: scrapeLogId } : 'skip');
  const sources = useQuery(api.sourceLibrary.getAll);
  const createSource = useMutation(api.sourceLibrary.create);

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
      const id = await createCrawlLog({ urls: links, title: values.title, instructions: values.instructions });
      updateScrapeLogId(id);
    }

    linkForm.reset();
  }

  function handleLinkAdd() {
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

  async function handleCopy() {
    try {
      if (crawlLog?.summarizedMarkdown) {
        await navigator.clipboard.writeText(crawlLog?.summarizedMarkdown);
        toast('Copied to clipboard!');
      }
    } catch {
      toast('Failed to copy');
    }
  }

  function handleLoadSource(sourceId: string) {
    const source = sources?.find((s) => s._id === sourceId);
    if (source) {
      updateLinks(source.urls);
      toast.success(`Loaded ${source.urls.length} URLs from "${source.name}"`);
    }
  }

  async function handleSaveSource() {
    if (!saveSourceName.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!crawlLog?.urls || crawlLog.urls.length === 0) {
      toast.error('No URLs to save');
      return;
    }

    try {
      await createSource({
        name: saveSourceName,
        description: saveSourceDescription || undefined,
        urls: crawlLog.urls,
      });
      toast.success('Source saved successfully');
      setIsSaveDialogOpen(false);
      setSaveSourceName('');
      setSaveSourceDescription('');
    } catch {
      toast.error('Failed to save source');
    }
  }

  if (!userId) {
    return <RedirectToSignIn />;
  }

  return (
    <div>
      {/* Load from Sources dropdown */}
      {sources && sources.length > 0 && !crawlLog && (
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
            <Button
              disabled={crawlLog !== undefined}
              variant={'secondary'}
              className='h-3 w-3 cursor-pointer hover:text-destructive'
              onClick={() => removeLink(item)}
            >
              <XIcon />
            </Button>
          </Badge>
        ))}
      </div>

      <Form {...linkForm}>
        <form onSubmit={linkForm.handleSubmit(onSubmit)}>
          <div className='space-x-8 flex flex-row'>
            <FormField
              control={linkForm.control}
              name='link'
              disabled={crawlLog !== undefined}
              render={({ field }) => (
                <FormItem className='flex-2'>
                  <FormControl>
                    <Input placeholder='https://google.com' {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className='text-xs text-gray-400'>
                    {links?.length ?? 0}/{MAX_LINKS}
                  </p>
                </FormItem>
              )}
            />
            <Button
              disabled={crawlLog !== undefined || (links !== null && links.length >= MAX_LINKS)}
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
            <FormField
              control={linkForm.control}
              name='title'
              disabled={crawlLog !== undefined}
              render={({ field }) => (
                <FormItem className=''>
                  <FormControl>
                    <Input placeholder='Enter title for this scrape...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={linkForm.control}
              name='instructions'
              disabled={crawlLog !== undefined}
              render={({ field }) => (
                <FormItem className=''>
                  <FormControl>
                    <Textarea className='h-44' placeholder='Enter additional instructions for summarization... (optional)' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={links === null || crawlLog !== undefined || !linkForm.formState.isValid} type='submit'>
              Generate
            </Button>
          </div>
        </form>
      </Form>

      {crawlLog && crawlLog.status === 'processing' && (
        <div className='mt-4 flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      )}

      {crawlLog && crawlLog.status === 'completed' && (
        <div className='mt-4'>
          <div className='flex flex-row-reverse gap-2 mb-3'>
            <Button onClick={handleCopy} variant='outline'>
              <Copy className='h-4 w-4' />
            </Button>
            <Button onClick={() => setIsSaveDialogOpen(true)} variant='outline'>
              <Save className='h-4 w-4 mr-2' />
              Save as Source
            </Button>
          </div>

          <Tabs defaultValue='summary' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='summary'>Summary</TabsTrigger>
              <TabsTrigger value='insights'>Insights</TabsTrigger>
            </TabsList>

            <TabsContent value='summary' className='mt-4'>
              <MarkdownPreview
                source={crawlLog?.summarizedMarkdown}
                style={{ padding: 16, background: 'white', color: 'black', outline: 'solid', outlineColor: 'lightgray' }}
              />
            </TabsContent>

            <TabsContent value='insights' className='mt-4'>
              {crawlLog.structuredInsights ? (
                <div className='grid gap-4 md:grid-cols-2'>
                  {/* Sentiment Card */}
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium flex items-center gap-2'>
                        {crawlLog.structuredInsights.sentiment === 'positive' && <TrendingUp className='h-4 w-4 text-green-500' />}
                        {crawlLog.structuredInsights.sentiment === 'negative' && <TrendingDown className='h-4 w-4 text-red-500' />}
                        {crawlLog.structuredInsights.sentiment === 'neutral' && <Minus className='h-4 w-4 text-gray-500' />}
                        {crawlLog.structuredInsights.sentiment === 'mixed' && <Shuffle className='h-4 w-4 text-yellow-500' />}
                        Market Sentiment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        variant={
                          crawlLog.structuredInsights.sentiment === 'positive'
                            ? 'default'
                            : crawlLog.structuredInsights.sentiment === 'negative'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className='capitalize'
                      >
                        {crawlLog.structuredInsights.sentiment}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Topics Card */}
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium flex items-center gap-2'>
                        <Tag className='h-4 w-4' />
                        Topics Identified
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-1'>
                        {crawlLog.structuredInsights.topicsIdentified.map((topic, i) => (
                          <Badge key={i} variant='outline'>
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Findings Card */}
                  <Card className='md:col-span-2'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium flex items-center gap-2'>
                        <Lightbulb className='h-4 w-4' />
                        Key Findings
                      </CardTitle>
                      <CardDescription>Top takeaways from the analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className='space-y-2'>
                        {crawlLog.structuredInsights.keyFindings.map((finding, i) => (
                          <li key={i} className='flex items-start gap-2'>
                            <span className='text-primary font-bold'>{i + 1}.</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Action Items Card */}
                  <Card className='md:col-span-2'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium flex items-center gap-2'>
                        <CheckSquare className='h-4 w-4' />
                        Recommended Actions
                      </CardTitle>
                      <CardDescription>Actionable next steps based on the analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className='space-y-2'>
                        {crawlLog.structuredInsights.actionItems.map((action, i) => (
                          <li key={i} className='flex items-start gap-2'>
                            <CheckSquare className='h-4 w-4 text-muted-foreground mt-0.5 shrink-0' />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Companies Mentioned Card */}
                  {crawlLog.structuredInsights.companiesMentioned.length > 0 && (
                    <Card className='md:col-span-2'>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium flex items-center gap-2'>
                          <Building2 className='h-4 w-4' />
                          Companies Mentioned
                        </CardTitle>
                        <CardDescription>Competitors and partners identified in the content</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='flex flex-wrap gap-2'>
                          {crawlLog.structuredInsights.companiesMentioned.map((company, i) => (
                            <Badge key={i} variant='secondary'>
                              {company}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  <p>Structured insights are not available for this analysis.</p>
                  <p className='text-sm'>This may be an older analysis created before insights extraction was added.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Save as Source Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Source</DialogTitle>
            <DialogDescription>Save these URLs as a source set for quick reuse in future analyses.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>Name</label>
              <Input
                placeholder='e.g., Q4 Competitor Analysis'
                value={saveSourceName}
                onChange={(e) => setSaveSourceName(e.target.value)}
              />
            </div>
            <div>
              <label className='text-sm font-medium'>Description (optional)</label>
              <Textarea
                placeholder='Notes about this source set...'
                value={saveSourceDescription}
                onChange={(e) => setSaveSourceDescription(e.target.value)}
              />
            </div>
            <div className='text-sm text-muted-foreground'>{crawlLog?.urls.length} URL(s) will be saved</div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSource}>Save Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
