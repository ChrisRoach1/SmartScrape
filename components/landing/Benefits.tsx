import { Minus } from 'lucide-react';

const benefits = [
  {
    title: 'Cut through the noise',
    description: 'Ads, popups, sidebars—gone. Just the content that matters.',
  },
  {
    title: 'Standardize chaos',
    description: 'Different sites, different formats. One consistent output.',
  },
  {
    title: 'Build your archive',
    description: 'Save summaries permanently. Reference them anytime.',
  },
  {
    title: 'Share with confidence',
    description: 'Send clean, professional summaries to your team.',
  },
];

export function Benefits() {
  return (
    <section className='py-32 bg-foreground text-background grain'>
      <div className='container mx-auto px-6 lg:px-12'>
        <div className='grid lg:grid-cols-2 gap-16 lg:gap-24'>
          {/* Left column - Text content */}
          <div className='lg:sticky lg:top-32 lg:self-start'>
            <span className='inline-block text-sm tracking-[0.2em] uppercase text-background/60 font-medium mb-4 animate-fade-up'>
              The Problem We Solve
            </span>
            <h2 className='font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-8 animate-fade-up delay-100'>
              Stop drowning
              <br />
              in browser tabs.
            </h2>
            <p className='text-lg text-background/70 leading-relaxed max-w-md animate-fade-up delay-200'>
              The internet is overwhelming. Every research task opens dozens of tabs,
              each competing for your attention. SmartScrape brings order to the chaos.
            </p>

            {/* Visual element */}
            <div className='mt-16 animate-fade-up delay-300'>
              <div className='flex items-center gap-4'>
                <div className='flex -space-x-2'>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className='w-8 h-10 border border-background/20 bg-background/5 backdrop-blur-sm'
                      style={{ transform: `rotate(${(i - 2) * 3}deg)` }}
                    />
                  ))}
                </div>
                <span className='text-sm text-background/50'>becomes</span>
                <div className='w-12 h-10 border-2 border-primary bg-primary/20' />
              </div>
            </div>
          </div>

          {/* Right column - Benefits list */}
          <div className='space-y-0'>
            {benefits.map((benefit, index) => (
              <BenefitItem
                key={benefit.title}
                title={benefit.title}
                description={benefit.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitItem({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div
      className='group py-8 border-t border-background/10 animate-fade-up'
      style={{ animationDelay: `${300 + index * 100}ms` }}
    >
      <div className='flex items-start gap-6'>
        <div className='flex-shrink-0 mt-2'>
          <Minus className='w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-x-150 origin-left' />
        </div>
        <div>
          <h3 className='text-xl font-medium mb-2 tracking-tight'>{title}</h3>
          <p className='text-background/60 leading-relaxed'>{description}</p>
        </div>
      </div>
    </div>
  );
}
