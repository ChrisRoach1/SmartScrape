'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, XIcon, Loader2, Copy } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import MarkdownPreview from '@uiw/react-markdown-preview';

const formSchema = z.object({
  link: z.union([z.literal(''), z.url()]),
  instructions: z.string().optional(),
});

export default function SummarizePage() {
  const [links, updateLinks] = useState<string[] | null>(null);
  const [scrapeLogId, updateScrapeLogId] = useState<Id<'scrapeLog'> | null>(null);
  const createCrawlLog = useMutation(api.scrapeLog.createLogRecord);
  const crawlLog = useQuery(api.scrapeLog.getScrapeLog, scrapeLogId ? { id: scrapeLogId } : 'skip');

  const linkForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: '',
      instructions: '',
    },
  });

  function removeLink(link: string) {
    updateLinks(links?.filter((item) => item !== link) ?? null);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (links) {
      const id = await createCrawlLog({ urls: links, instructions: values.instructions });
      updateScrapeLogId(id);
    }

    linkForm.reset();
  }

  function handleLinkAdd() {
    console.log(linkForm.getValues());
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

      linkForm.setValue('link', '');
    }
  }

  async function handleCopy() {
    try {
      if (crawlLog?.summarizedMarkdown) {
        await navigator.clipboard.writeText(crawlLog?.summarizedMarkdown);
        toast('Copied to clipboard!');
      }
    } catch (err) {
      toast('Failed to copy');
    }
  }

  return (
    <div>
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
                </FormItem>
              )}
            />
            <Button disabled={crawlLog !== undefined} variant={'outline'} size='icon' type='button' onClick={() => handleLinkAdd()}>
              <PlusIcon />
            </Button>
          </div>

          <hr className='mt-2 mb-2 text-gray-300' />

          <div className='grid w-full gap-2'>
            <FormField
              control={linkForm.control}
              name='instructions'
              disabled={crawlLog !== null}
              render={({ field }) => (
                <FormItem className=''>
                  <FormControl>
                    <Textarea className='h-44' placeholder='Enter additional instructions for summarization...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={links === null || crawlLog !== undefined} type='submit'>
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
          <div className='flex flex-row-reverse'>
            <Button onClick={handleCopy} variant='outline' className='mb-3'>
              <Copy className='h-4 w-4' />
            </Button>
          </div>

          <MarkdownPreview
            source={crawlLog?.summarizedMarkdown}
            style={{ padding: 16, background: 'white', color: 'black', outline: 'solid', outlineColor: 'lightgray' }}
          />
        </div>
      )}
    </div>
  );
}
