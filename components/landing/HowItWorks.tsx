import { Link2, Wand2, FileOutput } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    number: '01',
    title: 'Paste',
    subtitle: 'Any URL',
    description: 'Drop in the link to any article, documentation, research paper, or web page you want to understand.',
  },
  {
    icon: Wand2,
    number: '02',
    title: 'Process',
    subtitle: 'Intelligently',
    description: 'Our system extracts the content, removes noise, and applies advanced language models to find meaning.',
  },
  {
    icon: FileOutput,
    number: '03',
    title: 'Receive',
    subtitle: 'Clarity',
    description: 'Get a structured summary that captures the essence—ready to read, share, or export.',
  },
];

export function HowItWorks() {
  return (
    <section id='how-it-works' className='py-32 grain'>
      <div className='container mx-auto px-6 lg:px-12'>
        {/* Section header */}
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20'>
          <div className='max-w-2xl'>
            <span className='inline-block text-sm tracking-[0.2em] uppercase text-muted-foreground font-medium mb-4 animate-fade-up'>
              How It Works
            </span>
            <h2 className='font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] animate-fade-up delay-100'>
              Three steps to
              <br />
              <span className='text-primary'>understanding.</span>
            </h2>
          </div>
          <p className='max-w-md text-muted-foreground leading-relaxed animate-fade-up delay-200'>
            We've refined the process to its simplest form.
            No setup, no configuration—just results.
          </p>
        </div>

        {/* Steps grid */}
        <div className='grid lg:grid-cols-3 gap-0'>
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              icon={step.icon}
              number={step.number}
              title={step.title}
              subtitle={step.subtitle}
              description={step.description}
              isLast={index === steps.length - 1}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  icon: Icon,
  number,
  title,
  subtitle,
  description,
  isLast,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  isLast: boolean;
  index: number;
}) {
  return (
    <div
      className={`relative p-8 lg:p-12 border-t border-border animate-fade-up ${
        !isLast ? 'lg:border-r' : ''
      }`}
      style={{ animationDelay: `${300 + index * 150}ms` }}
    >
      {/* Step number */}
      <span className='absolute top-8 lg:top-12 right-8 lg:right-12 font-serif text-7xl lg:text-8xl text-muted/20 select-none'>
        {number}
      </span>

      <div className='relative z-10'>
        {/* Icon */}
        <div className='inline-flex items-center justify-center w-14 h-14 mb-8 border border-border bg-background'>
          <Icon className='w-6 h-6 text-foreground' />
        </div>

        {/* Title block */}
        <div className='mb-6'>
          <h3 className='font-serif text-3xl lg:text-4xl font-light tracking-tight'>
            {title}
          </h3>
          <span className='text-primary font-medium'>{subtitle}</span>
        </div>

        {/* Description */}
        <p className='text-muted-foreground leading-relaxed max-w-sm'>
          {description}
        </p>
      </div>

      {/* Connector line (visible on desktop) */}
      {!isLast && (
        <div className='hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-border'>
          <div className='absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rotate-45' />
        </div>
      )}
    </div>
  );
}
