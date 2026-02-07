import { PricingTable } from '@clerk/nextjs';

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
          <p className='text-lg text-muted-foreground animate-fade-up delay-200'>Start free. Scale when you're ready.</p>
        </div>

        {/* Pricing cards */}
        <div>
          <PricingTable />
        </div>
      </div>
    </section>
  );
}
