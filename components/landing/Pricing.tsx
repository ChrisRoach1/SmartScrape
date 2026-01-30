import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: null,
    description: 'For curious minds exploring the tool.',
    features: ['5 summaries per day', 'Standard processing', 'Community support', '7-day history'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For researchers and power users.',
    features: ['Unlimited summaries', 'Priority processing', 'Advanced AI models', 'Unlimited history', 'API access'],
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    description: 'For collaborative teams.',
    features: ['Everything in Pro', 'Shared workspace', 'Team billing', 'Admin controls', 'Custom integrations'],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id='pricing' className='py-32 grain'>
      <div className='container mx-auto px-6 lg:px-12'>
        {/* Section header */}
        <div className='max-w-3xl mx-auto text-center mb-20'>
          <span className='inline-block text-sm tracking-[0.2em] uppercase text-muted-foreground font-medium mb-4 animate-fade-up'>
            Pricing
          </span>
          <h2 className='font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-6 animate-fade-up delay-100'>
            Simple, transparent
            <br />
            <span className='text-muted-foreground'>pricing.</span>
          </h2>
          <p className='text-lg text-muted-foreground animate-fade-up delay-200'>
            Start free. Scale when you're ready.
          </p>
        </div>

        {/* Pricing cards */}
        <div className='grid md:grid-cols-3 gap-px bg-border max-w-5xl mx-auto'>
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        {/* Bottom note */}
        <p className='text-center text-sm text-muted-foreground mt-12 animate-fade-up delay-600'>
          All plans include SSL encryption and GDPR compliance.
        </p>
      </div>
    </section>
  );
}

function PricingCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
  return (
    <div
      className={`relative bg-background p-8 lg:p-10 animate-fade-up ${
        plan.highlighted ? 'bg-card' : ''
      }`}
      style={{ animationDelay: `${300 + index * 100}ms` }}
    >
      {/* Highlighted indicator */}
      {plan.highlighted && (
        <div className='absolute top-0 left-0 right-0 h-1 bg-primary' />
      )}

      <div className='mb-8'>
        <h3 className='text-sm tracking-[0.15em] uppercase text-muted-foreground font-medium mb-4'>
          {plan.name}
        </h3>
        <div className='flex items-baseline gap-1'>
          <span className='font-serif text-5xl lg:text-6xl font-light tracking-tight'>
            {plan.price}
          </span>
          {plan.period && (
            <span className='text-muted-foreground'>{plan.period}</span>
          )}
        </div>
        <p className='mt-4 text-muted-foreground'>{plan.description}</p>
      </div>

      {/* Features */}
      <ul className='space-y-4 mb-10'>
        {plan.features.map((feature) => (
          <li key={feature} className='flex items-start gap-3 text-sm'>
            <span className='w-1.5 h-1.5 mt-1.5 bg-primary flex-shrink-0' />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <SignedOut>
        <SignUpButton mode='modal'>
          <Button
            className={`w-full h-12 font-medium transition-all duration-300 ${
              plan.highlighted
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'bg-transparent border border-border text-foreground hover:bg-secondary'
            }`}
          >
            Get Started
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Button
          asChild
          className={`w-full h-12 font-medium transition-all duration-300 ${
            plan.highlighted
              ? 'bg-foreground text-background hover:bg-foreground/90'
              : 'bg-transparent border border-border text-foreground hover:bg-secondary'
          }`}
        >
          <Link href='/dashboard'>
            Get Started
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </SignedIn>
    </div>
  );
}
