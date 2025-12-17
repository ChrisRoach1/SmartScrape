'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
  link: z.url(),
});

export default function SummarizePage() {
  const [links, updateLinks] = useState<string[] | null>(null);
  const [scrapeLogId, updateScrapeLogId] = useState<Id<'scrapeLog'> | null>(null);
  const createCrawlLog = useMutation(api.crawlLog.createLogRecord);
  const crawlLog = useQuery(api.crawlLog.getCrawlLog, scrapeLogId ? { id: scrapeLogId } : 'skip');

  const linkForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: '',
    },
  });

  function removeLink(link: string) {
    updateLinks(links?.filter((item) => item !== link) ?? null);
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (links && links?.indexOf(values.link) > -1) {
      linkForm.reset();
      toast('Link has already been added!');
      return;
    }

    if (links === null) {
      updateLinks([values.link]);
    } else {
      updateLinks([...links, values.link]);
    }

    linkForm.reset();
    console.log(links);
  }

  async function handlCreateCrawlLog() {
    if (links) {
      console.log(links);
      const id = await createCrawlLog({ urls: links });
      updateScrapeLogId(id);
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
          <Badge key={item} className='gap-1'>
            {item}
            <Button className='h-3 w-3 cursor-pointer hover:text-destructive' onClick={() => removeLink(item)}>
              <XIcon />
            </Button>
          </Badge>
        ))}
      </div>

      <Form {...linkForm}>
        <form onSubmit={linkForm.handleSubmit(onSubmit)} className='space-x-8 flex flex-row'>
          <FormField
            control={linkForm.control}
            name='link'
            render={({ field }) => (
              <FormItem className='flex-2'>
                <FormControl>
                  <Input placeholder='https://google.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant='default' size='icon' aria-label='Submit'>
            <PlusIcon />
          </Button>
        </form>
      </Form>

      <hr className='mt-2 mb-2 text-gray-300' />

      <Button disabled={links === null} onClick={() => handlCreateCrawlLog()}>
        Generate
      </Button>

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
