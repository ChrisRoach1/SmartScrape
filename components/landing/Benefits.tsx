import { Check } from 'lucide-react';

export function Benefits() {
  return (
    <section className='py-24 md:py-32'>
      <div className='container px-4 md:px-6'>
        <div className='grid gap-12 lg:grid-cols-2 lg:gap-24'>
          <div className='flex flex-col justify-center'>
            <h2 className='mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'>
              Stop drowning in tabs. <br />
              Start understanding.
            </h2>
            <p className='mb-8 text-lg text-muted-foreground'>
              SmartScrape isn&apos;t just a tool; it&apos;s your research assistant. We handle the information overload so you can focus on the insights.
            </p>
            <ul className='space-y-4'>
              <BenefitItem text='Eliminate ads and popups' />
              <BenefitItem text='Standardize inconsistent formats' />
              <BenefitItem text='Archive content permanently' />
              <BenefitItem text='Share clean summaries with your team' />
            </ul>
          </div>
          <div className='relative flex items-center justify-center rounded-3xl border bg-secondary/20 p-8 lg:p-12'>
            <div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent' />
            {/* Abstract visual representation of order from chaos */}
            <div className='relative grid gap-4 opacity-80'>
              <div className='h-4 w-64 rounded-full bg-foreground/10' />
              <div className='h-4 w-48 rounded-full bg-foreground/10' />
              <div className='h-4 w-56 rounded-full bg-foreground/10' />
              <div className='my-4 border-t border-dashed border-foreground/20' />
              <div className='h-4 w-full rounded-full bg-primary/20' />
              <div className='h-4 w-3/4 rounded-full bg-primary/20' />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className='flex items-center gap-3'>
      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10'>
        <Check className='h-3.5 w-3.5 text-primary' />
      </div>
      <span className='font-medium'>{text}</span>
    </li>
  );
}
