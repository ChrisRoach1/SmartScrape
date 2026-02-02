'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import z from 'zod/v4';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';




export default function SettingsPage() {
  const settings = useQuery(api.userSettings.get);
  const upsertSettings = useMutation(api.userSettings.upsert);
  const [isSaving, setIsSaving] = useState(false);

  const settingsFormSchema = z.object({
    systemPrompt: z.string().min(1),
  });

  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      systemPrompt: "",
    },
  });

    
  useEffect(() =>{
    form.setValue("systemPrompt", settings?.systemPrompt ?? "")
  }, [settings,form])
  
  if (settings === undefined) {
    return (
      <div className='min-h-[80vh] flex items-center justify-center'>
        <div className='w-full max-w-2xl px-6'>
          <div className='space-y-8'>
            <div className='space-y-3'>
              <Skeleton className='h-8 w-32' />
              <Skeleton className='h-5 w-64' />
            </div>
            <Skeleton className='h-64 w-full rounded-xl' />
            <Skeleton className='h-11 w-28' />
          </div>
        </div>
      </div>
    );
  }

  async function handleSave(values: z.infer<typeof settingsFormSchema>) {
    setIsSaving(true);
    try {
      await upsertSettings({ systemPrompt: values.systemPrompt || undefined });
      toast.success('Mission saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges = settings?.systemPrompt !== (settings?.systemPrompt ?? '');

  return (
    <div className='min-h-[80vh] flex items-center justify-center py-12'>
      <div className='w-full max-w-2xl px-6'>
        {/* Header */}
        <div className='mb-10'>
          <div className='flex items-center gap-3 mb-3'>
            <h1 className='font-display text-3xl font-semibold tracking-tight'>
              Your Mission
            </h1>
          </div>
          <p className='text-muted-foreground text-lg leading-relaxed max-w-xl'>
            Define the purpose that guides every analysis. This context shapes how AI interprets and prioritizes information for you.
          </p>
        </div>

        {/* Mission Card */}
        <div>
          <div className='relative group'>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)}>
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='systemPrompt'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder='We are a B2B SaaS company helping small businesses streamline their operations. Our focus is on identifying market trends, 
                          competitor movements, and emerging technologies in the SMB space...' 
                          className='w-full px-6 py-5 bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none text-[15px] leading-relaxed'
                          rows={10}
                          {...field}                    
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <DialogFooter>
                <Button
                  size='lg'
                  className='min-w-[120px] transition-all duration-200'
                >
                  {isSaving ? (
                    <span className='flex items-center gap-2'>
                      <span className='w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin' />
                      Saving
                    </span>
                  ) : 'Save Mission'}
                </Button>
                </DialogFooter>
              </div>
              </form>
            </Form>   
          </div>
        </div>
      </div>
    </div>
  );
}
