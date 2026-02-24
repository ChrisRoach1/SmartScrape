'use client';

import { useMemo, useReducer } from 'react';
import { ArrowRight, Loader2, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SignUpButton } from '@clerk/nextjs';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { ScrapeLogViewer } from '@/components/scrape-log-viewer';

type DemoState = 'idle' | 'loading' | 'done' | 'error' | 'used';

type DemoInsights = {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  topicsIdentified: string[];
  keyFindings: string[];
  actionItems: string[];
  companiesMentioned: string[];
};

type DemoViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'used' }
  | { status: 'error'; errorMsg: string }
  | { status: 'done'; summary: string; scrapedUrl: string; insight: DemoInsights | null };

type DemoViewAction =
  | { type: 'start' }
  | { type: 'markUsed' }
  | { type: 'markError'; errorMsg: string }
  | { type: 'markDone'; summary: string; scrapedUrl: string; insight: DemoInsights | null }
  | { type: 'reset' };

const DEMO_RANDOM_ID_STORAGE_KEY = 'smartscrape-demo-random-id';

const demoFormSchema = z.object({
  url: z.string().url('Please enter a valid URL.'),
});

const EXAMPLE_URLS = [
  { label: 'Hacker News', url: 'https://news.ycombinator.com' },
  { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Artificial_intelligence' },
  { label: 'GitHub Blog', url: 'https://github.blog' },
];

function demoViewReducer(_state: DemoViewState, action: DemoViewAction): DemoViewState {
  switch (action.type) {
    case 'start':
      return { status: 'loading' };
    case 'markUsed':
      return { status: 'used' };
    case 'markError':
      return { status: 'error', errorMsg: action.errorMsg };
    case 'markDone':
      return {
        status: 'done',
        summary: action.summary,
        scrapedUrl: action.scrapedUrl,
        insight: action.insight,
      };
    case 'reset':
      return { status: 'idle' };
    default:
      return _state;
  }
}

export function InteractiveDemo() {
  const [viewState, dispatch] = useReducer(demoViewReducer, { status: 'idle' });
  const randomId = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    const storedId = localStorage.getItem(DEMO_RANDOM_ID_STORAGE_KEY);
    if (storedId) {
      return storedId;
    }

    const newRandomId = crypto.randomUUID();
    localStorage.setItem(DEMO_RANDOM_ID_STORAGE_KEY, newRandomId);
    return newRandomId;
  }, []);

  const runDemo = useAction(api.demo.runDemo);
  const demoForm = useForm<z.infer<typeof demoFormSchema>>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      url: '',
    },
  });

  const status: DemoState = viewState.status;
  const errorMessage = viewState.status === 'error' ? viewState.errorMsg : '';

  function getOrCreateRandomId(): string {
    if (randomId) {
      return randomId;
    }

    const storedId = localStorage.getItem(DEMO_RANDOM_ID_STORAGE_KEY);
    if (storedId) {
      return storedId;
    }

    const newRandomId = crypto.randomUUID();
    localStorage.setItem(DEMO_RANDOM_ID_STORAGE_KEY, newRandomId);
    return newRandomId;
  }

  async function onSubmit(values: z.infer<typeof demoFormSchema>) {
    if (status === 'loading') return;
    const normalizedUrl = values.url.trim();
    dispatch({ type: 'start' });

    try {
      const randomId = getOrCreateRandomId();
      const result = await runDemo({ url: normalizedUrl, randomId });

      if (!result.success) {
        if (result.alreadyUsed) {
          dispatch({ type: 'markUsed' });
        } else {
          dispatch({ type: 'markError', errorMsg: 'Unable to run demo right now. Please try again.' });
        }
        return;
      }

      dispatch({
        type: 'markDone',
        summary: result.summary,
        scrapedUrl: normalizedUrl,
        insight: result.insight ?? null,
      });
    } catch {
      dispatch({ type: 'markError', errorMsg: 'Something went wrong. Please try again.' });
    }
  }

  function handleReset() {
    demoForm.reset({ url: '' });
    dispatch({ type: 'reset' });
  }

  return (
    <section id='demo' className='py-32 bg-secondary/20 grain'>
      <div className='container mx-auto px-6 lg:px-12'>
        {/* Section header */}
        <div className='max-w-3xl mb-16'>
          <span className='inline-block text-sm tracking-[0.2em] uppercase text-muted-foreground font-medium mb-4 animate-fade-up'>
            Try It Now
          </span>
          <h2 className='font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] animate-fade-up delay-100'>
            See it in action.
            <br />
            <span className='text-muted-foreground'>No signup required.</span>
          </h2>
        </div>

        <div className='grid lg:grid-cols-12 gap-8 items-start'>
          {/* Left: input panel */}
          <div className='lg:col-span-5 space-y-6 animate-fade-up delay-200'>
            <div className='bg-background border border-border p-8 relative'>
              <div className='absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-primary' />

              {status !== 'used' ? (
                <>
                  <Form {...demoForm}>
                    <form onSubmit={demoForm.handleSubmit(onSubmit)} className='space-y-4'>
                      <Controller
                        name='url'
                        control={demoForm.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className='text-xs tracking-widest uppercase text-muted-foreground mb-3'>
                              Enter any URL
                            </FieldLabel>
                            <div className='flex gap-3'>
                              <Input
                                {...field}
                                id={field.name}
                                type='url'
                                placeholder='https://example.com/article'
                                aria-invalid={fieldState.invalid}
                                disabled={status === 'loading' || status === 'done'}
                                className='flex-1'
                              />
                              <Button
                                type='submit'
                                disabled={!field.value?.trim() || status === 'loading' || status === 'done'}
                                className='group bg-foreground text-background hover:bg-foreground/90 shrink-0'
                              >
                                {status === 'loading' ? (
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                  <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5' />
                                )}
                              </Button>
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </form>
                  </Form>

                  {/* Example URLs */}
                  {status === 'idle' && (
                    <div className='pt-2'>
                      <p className='text-xs text-muted-foreground mb-3 tracking-wide'>Or try one of these:</p>
                      <div className='flex flex-wrap gap-2'>
                        {EXAMPLE_URLS.map((ex) => (
                          <button
                            key={ex.url}
                            type='button'
                            onClick={() =>
                              demoForm.setValue('url', ex.url, {
                                shouldValidate: true,
                                shouldDirty: true,
                                shouldTouch: true,
                              })
                            }
                            className='text-xs px-3 py-1.5 border border-border hover:border-primary hover:text-primary transition-colors duration-200 bg-background'
                          >
                            {ex.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {status === 'done' && (                    
                    <div className='pt-2 border-t border-border'>
                      <p className='text-xs text-muted-foreground mb-3'>Want to analyze more pages?</p>
                      <div className='flex flex-col gap-2'>
                        <SignUpButton mode='modal'>
                          <Button size='sm' className='w-full bg-foreground text-background hover:bg-foreground/90'>
                            <Sparkles className='h-3.5 w-3.5 mr-2' />
                            Sign up free — unlimited scrapes
                          </Button>
                        </SignUpButton>
                      </div>
                    </div>
                  )}

                  {viewState.status === 'error' && (
                    <div className='pt-2'>
                      <p className='text-sm text-destructive'>{errorMessage}</p>
                      <button
                        type='button'
                        onClick={handleReset}
                        className='text-xs text-muted-foreground hover:text-foreground transition-colors mt-2 block'
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className='text-center py-4 space-y-4'>
                  <div className='inline-flex items-center justify-center w-12 h-12 bg-secondary'>
                    <Lock className='w-5 h-5 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='font-medium mb-1'>Demo limit reached</p>
                    <p className='text-sm text-muted-foreground'>Create a free account to continue analyzing pages.</p>
                  </div>
                  <SignUpButton mode='modal'>
                    <Button className='w-full bg-foreground text-background hover:bg-foreground/90'>
                      <Sparkles className='h-4 w-4 mr-2' />
                      Get started free
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </div>

            <p className='text-xs text-muted-foreground leading-relaxed'>
              One free demo per visitor. Sign up for unlimited summaries, custom instructions, and structured insights.
            </p>
          </div>

          {/* Right: output panel */}
          <div className='lg:col-span-7 animate-fade-up delay-300'>
            <div className='relative bg-background border border-border min-h-[400px] p-8'>
              <div className='absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-primary' />

              <div className='flex items-center gap-3 pb-6 border-b border-border mb-6'>
                <div className='w-2 h-2 rounded-full bg-primary' />
                <span className='text-xs tracking-widest uppercase text-muted-foreground'>
                  {status === 'done' ? 'Summary Output' : 'Output Preview'}
                </span>
                {status === 'done' &&
                  viewState.status === 'done' &&
                  viewState.scrapedUrl && (
                    <span className='ml-auto text-xs text-muted-foreground truncate max-w-[200px]' title={viewState.scrapedUrl}>
                      {viewState.scrapedUrl}
                    </span>
                  )}
              </div>

              {status === 'idle' && (
                <div className='relative flex items-center justify-center h-64'>
                  <div className='w-full space-y-3 opacity-20'>
                    <div className='h-4 bg-foreground/30 w-3/4 mx-auto' />
                    <div className='h-3 bg-foreground/20 w-full' />
                    <div className='h-3 bg-foreground/20 w-11/12' />
                    <div className='h-3 bg-foreground/20 w-4/5' />
                    <div className='mt-4 h-3 bg-foreground/20 w-1/2' />
                    <div className='h-3 bg-foreground/20 w-3/4' />
                  </div>
                  <p className='text-sm text-muted-foreground absolute'>Your summary will appear here</p>
                </div>
              )}

              {status === 'loading' && (
                <div className='flex flex-col items-center justify-center h-64 space-y-6'>
                  <div className='w-full space-y-3'>
                    <div className='h-3 bg-primary/20 w-3/4 animate-pulse' />
                    <div className='h-3 bg-primary/10 w-full animate-pulse delay-75' />
                    <div className='h-3 bg-primary/10 w-11/12 animate-pulse delay-150' />
                    <div className='h-3 bg-primary/10 w-4/5 animate-pulse delay-200' />
                  </div>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Loader2 className='h-4 w-4 animate-spin text-primary' />
                    <span>Scraping and summarizing...</span>
                  </div>
                </div>
              )}

              {(status === 'error' || status === 'used') && (
                <div className='flex items-center justify-center h-64'>
                  <p className='text-sm text-muted-foreground text-center max-w-sm'>
                    {status === 'used' ? 'Sign up to continue — your first 10 summaries are free.' : errorMessage}
                  </p>
                </div>
              )}

              {status === 'done' && viewState.status === 'done' && (
                <div className='overflow-y-auto max-h-[600px]'>
                  <ScrapeLogViewer summarizedMarkdown={viewState.summary} structuredInsights={viewState.insight} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
