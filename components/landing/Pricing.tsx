import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export function Pricing() {
  return (
    <section className='py-24 md:py-32'>
      <div className='container px-4 md:px-6'>
        <div className='mb-16 text-center'>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'>Simple pricing</h2>
          <p className='mt-4 text-lg text-muted-foreground'>Start for free. Upgrade as you scale.</p>
        </div>

        <div className='grid gap-8 md:grid-cols-3'>
          {/* Free Tier */}
          <PricingCard
            title='Starter'
            price='Free'
            description='Perfect for individuals.'
            features={['5 summaries / day', 'Basic AI models', 'Standard support', '7-day history']}
          />

          {/* Pro Tier */}
          <PricingCard
            title='Pro'
            price='$19'
            period='/month'
            description='For power users and researchers.'
            highlighted
            features={['Unlimited summaries', 'Advanced AI models (GPT-4)', 'Priority support', 'Unlimited history', 'API Access']}
          />

          {/* Team Tier */}
          <PricingCard
            title='Team'
            price='$49'
            period='/month'
            description='For collaborative teams.'
            features={['Everything in Pro', 'Shared workspace', 'Team billing', 'SSO & Admin controls', 'Custom export formats']}
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  title,
  price,
  period,
  description,
  features,
  highlighted = false,
}: {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-3xl border p-8 shadow-sm transition-all hover:shadow-lg ${
        highlighted ? 'border-primary ring-1 ring-primary' : 'bg-card'
      }`}
    >
      <h3 className='text-2xl font-bold'>{title}</h3>
      <div className='my-4 flex items-baseline'>
        <span className='text-4xl font-extrabold tracking-tight'>{price}</span>
        {period && <span className='ml-1 text-muted-foreground'>{period}</span>}
      </div>
      <p className='mb-6 text-muted-foreground'>{description}</p>
      <ul className='mb-8 space-y-4 flex-1'>
        {features.map((feature) => (
          <li key={feature} className='flex items-center gap-3'>
            <Check className='h-4 w-4 text-primary' />
            <span className='text-sm'>{feature}</span>
          </li>
        ))}
      </ul>
      <SignedOut>
        <SignUpButton mode='modal'>
          <Button className='w-full rounded-full' variant={highlighted ? 'default' : 'outline'} size='lg'>
            Get Started
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Button asChild className='w-full rounded-full' variant={highlighted ? 'default' : 'outline'} size='lg'>
          <Link href='/dashboard'>Get Started</Link>
        </Button>
      </SignedIn>
    </div>
  );
}
