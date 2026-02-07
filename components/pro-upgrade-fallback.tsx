'use client';

import { Crown, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingTable } from '@clerk/nextjs';

interface ProUpgradeFallbackProps {
  title?: string;
  description?: string;
  featureName?: string;
}

export function ProUpgradeFallback({
  title = 'Unlock Pro Features',
  description = 'Upgrade to Pro to access premium features and tools.',
  featureName,
}: ProUpgradeFallbackProps) {
  return (
    <div className='container mx-auto flex flex-col items-center justify-center py-12 animate-fade-up'>
      <Card className='w-full max-w-2xl'>
        <CardContent className='flex flex-col items-center text-center gap-6 pt-2'>
          {/* Icon + Badge */}
          <div className='flex flex-col items-center gap-3'>
            <Badge variant='outline' className='text-xs font-medium tracking-wide uppercase'>
              Pro Plan
            </Badge>
          </div>

          {/* Headline */}
          <div className='space-y-2'>
            <h2 className='font-serif text-3xl font-light tracking-tight'>{featureName ? `Unlock ${featureName}` : title}</h2>
            <p className='text-muted-foreground max-w-md mx-auto'>{description}</p>
          </div>

          {/* Clerk Pricing Table */}
          <div className='w-full pt-2'>
            <PricingTable />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
