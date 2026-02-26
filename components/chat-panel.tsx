'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect, memo, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { optimisticallySendMessage, UIMessage, useUIMessages } from '@convex-dev/agent/react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import { Thread } from '@/components/threads-panel';

const chatFormSchema = z.object({
  message: z.string().min(1),
});
type ChatFormValues = z.infer<typeof chatFormSchema>;

type props = {
  selectedSources: Id<'sources'>[] | null;
  selectedThread?: Thread | null;
};

export function ChatPanel(props: props) {
  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: '' },
  });

  const [isExistingThread, setIsExistingThread] = useState<boolean>(props.selectedThread?._id ? true : false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(props.selectedThread?._id ?? null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const createThread = useMutation(api.agent.startThread);
  const sendMessage = useMutation(api.agent.sendMessage).withOptimisticUpdate((store, args) => {
    optimisticallySendMessage(api.agent.listThreadMessages)(store, {
      threadId: currentThreadId ?? '',
      prompt: args.prompt,
    });
  });

  const { results, status, loadMore } = useUIMessages(
    api.agent.listThreadMessages,
    currentThreadId ? { threadId: currentThreadId } : 'skip',
    { initialNumItems: 25, stream: true },
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [results]);

  useEffect(() => {
    if (results.some((x) => x.status === 'pending' && x.role !== 'user')) {
      scrollToBottom();
    }
  }, [results]);

  useEffect(() => {
    setCurrentThreadId(props.selectedThread?._id ?? null);
  }, [props.selectedThread?._id]);

  const loadMoreMessages = async () => {
    if (status === 'CanLoadMore' && !isLoadingMore) {
      setIsLoadingMore(true);
      try {
        await loadMore(50);
      } catch {
        toast.error('Failed to load message please try again later.');
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const handleSendMessage = async (values: ChatFormValues) => {
    if (currentThreadId) {
      await sendMessage({ prompt: values.message, threadId: currentThreadId, sourceIds: props.selectedSources ?? [] });
    } else {
      const threadId = await createThread({ prompt: values.message, sourceIds: [] });
      setCurrentThreadId(threadId);
      await sendMessage({ prompt: values.message, threadId, sourceIds: props.selectedSources ?? [] });
    }
    form.reset();
  };

  return (
    <div className='animate-fade-up delay-100 flex h-full flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      {/* Header */}
      <div className='flex h-14 items-center justify-between border-b border-border px-5'>
        <h2 className='  text-base font-semibold tracking-tight text-foreground'>Chat</h2>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-hidden min-w-0'>
        <ScrollArea className='h-full'>
          <div className='w-full max-w-4xl mx-auto p-4 space-y-6'>
            {results.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-[60vh] text-center px-4'>
                <p className='mt-2 max-w-md text-sm leading-relaxed text-muted-foreground'>
                  Upload documents, paste URLs, or add text — then ask questions and get insights from your sources.
                </p>
              </div>
            ) : (
              <>
                {/* Load More Button */}
                {status === 'CanLoadMore' && (
                  <div className='flex justify-center pb-4'>
                    <Button variant='outline' onClick={loadMoreMessages} disabled={isLoadingMore} className='text-sm'>
                      {isLoadingMore ? 'Loading...' : 'Load More Messages'}
                    </Button>
                  </div>
                )}

                {results.map((message, i) => (
                  <MemoizedMessageItem key={message.id || `temp-${i}-${message.text?.slice(0, 10) || 'empty'}`} message={message} />
                ))}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Input Bar */}
      <div className='border-t border-border bg-card/80 px-4 py-3 backdrop-blur-sm'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSendMessage)} className='mx-auto flex max-w-3xl items-center gap-3'>
            <FormField
              control={form.control}
              name='message'
              render={({ field }) => (
                <FormItem className='relative flex-1'>
                  <FormControl>
                    <Input
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(handleSendMessage)();
                        }
                      }}
                      placeholder={props.selectedThread ? 'Continue the conversation...' : 'Add a source to start chatting...'}
                      className='h-10 pr-24 text-sm'
                      disabled={!props.selectedThread && !props.selectedSources?.length}
                    />
                  </FormControl>

                  {!props.selectedThread?._id ? (
                    <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                      <Badge variant='secondary' className='text-[10px] font-normal text-muted-foreground'>
                        {props.selectedSources?.length ?? 0} sources
                      </Badge>
                    </div>
                  ) : (
                    <></>
                  )}
                </FormItem>
              )}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='submit'
                  size='icon'
                  className='shrink-0 transition-all'
                  disabled={!form.formState.isValid || (!props.selectedThread && !props.selectedSources?.length)}
                >
                  <ArrowRight className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </form>
        </Form>
      </div>
    </div>
  );
}

const MemoizedMessageItem = memo(
  function MessageItem({ message }: { message: UIMessage }) {
    return (
      <div className={`flex gap-3 ${message?.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`group max-w-[85%] sm:max-w-[80%] min-w-0 ${message?.role === 'user' ? 'order-1' : 'order-2'}`}>
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm transition-shadow duration-200 min-w-0 ${
              message?.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-card border'
            }`}
          >
            <div className='whitespace-pre-wrap break-words min-w-0'>
              <div key={`${message.id}`} className='leading-relaxed'>
                {(message.status === 'pending' || message.status === 'streaming') && message.role !== 'user' && !message.text ? (
                  <div className='flex gap-3 justify-start'>
                    <div className='group max-w-[85%] sm:max-w-[80%] order-2'>
                      <div className='rounded-2xl px-2 py-1'>
                        <div className='flex items-center gap-2'>
                          <div className='flex space-x-1'>
                            <div className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                            <div className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                            <div className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce'></div>
                          </div>
                          <span className='text-sm text-muted-foreground'>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <MemoizedMessageContent text={message.text || ''} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prev, next) => prev.message.text === next.message.text && prev.message.status === next.message.status,
);

const MemoizedMessageContent = memo(function MessageContent({ text }: { text: string }) {
  const parsedParts = useMemo(() => {
    type MessagePart = {
      type: 'text' | 'code';
      content: string;
      language?: string;
      key: string;
    };

    const parseMessageText = (text: string): MessagePart[] => {
      const parts: MessagePart[] = [];
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          const textContent = text.slice(lastIndex, match.index);
          if (textContent.trim()) {
            parts.push({
              type: 'text',
              content: textContent,
              key: `text-${lastIndex}`,
            });
          }
        }

        const language = match[1] || 'text';
        const code = match[2] || '';
        parts.push({
          type: 'code',
          content: code,
          language,
          key: `code-${match.index}`,
        });

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        const textContent = text.slice(lastIndex);
        if (textContent.trim()) {
          parts.push({
            type: 'text',
            content: textContent,
            key: `text-${lastIndex}`,
          });
        }
      }

      return parts.length > 0 ? parts : [{ type: 'text', content: text, key: 'text-0' }];
    };

    return parseMessageText(text);
  }, [text]);

  return (
    <div className='space-y-3 min-w-0'>
      {parsedParts.map((part) => {
        return (
          <div key={part.key} className='prose prose-sm max-w-none prose-neutral dark:prose-invert min-w-0'>
            <div className='whitespace-pre-wrap leading-relaxed break-words'>
              <Markdown>{part.content}</Markdown>
            </div>
          </div>
        );
      })}
    </div>
  );
});
