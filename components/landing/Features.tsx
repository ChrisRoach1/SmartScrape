import { Zap, Shield, FileText, Sparkles, MousePointerClick, Globe } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Intelligent Synthesis',
    description: 'Advanced language models distill pages of content into their essential meaning.',
    accent: true,
  },
  {
    icon: FileText,
    title: 'Structured Output',
    description: 'Receive clean Markdown, JSON, or CSV—ready for your workflow.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Optimized processing delivers summaries in seconds, not minutes.',
  },
  {
    icon: Shield,
    title: 'Respectful Crawling',
    description: 'Built-in rate limiting and ethical scraping practices.',
  },
  {
    icon: MousePointerClick,
    title: 'One-Click Simplicity',
    description: "Paste a URL. Get insights. That's it.",
  },
  {
    icon: Globe,
    title: 'Universal Compatibility',
    description: 'Works with articles, documentation, research papers, and more.',
  },
];

export function Features() {
  return (
    <section id='features' className='py-32 bg-secondary/20 grain'>
      <div className='container mx-auto px-6 lg:px-12'>
        {/* Section header */}
        <div className='max-w-3xl mb-20'>
          <span className='inline-block text-sm tracking-[0.2em] uppercase text-muted-foreground font-medium mb-4 animate-fade-up'>
            Capabilities
          </span>
          <h2 className='font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] animate-fade-up delay-100'>
            Everything essential.
            <br />
            <span className='text-muted-foreground'>Nothing superfluous.</span>
          </h2>
        </div>

        {/* Magazine-style asymmetric grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border'>
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              accent={feature.accent}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent?: boolean;
  index: number;
}) {
  return (
    <div
      className={`group relative bg-background p-8 lg:p-10 transition-colors duration-500 hover:bg-card animate-fade-up ${
        accent ? 'lg:row-span-1' : ''
      }`}
      style={{ animationDelay: `${200 + index * 100}ms` }}
    >
      {/* Corner accent on hover */}
      <div className='absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-transparent transition-all duration-300 group-hover:w-8 group-hover:h-8 group-hover:border-primary' />

      <div className='relative z-10'>
        <div
          className={`inline-flex items-center justify-center w-12 h-12 mb-6 transition-colors duration-300 ${
            accent
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground'
          }`}
        >
          <Icon className='w-5 h-5' />
        </div>

        <h3 className='text-xl font-medium mb-3 tracking-tight'>{title}</h3>
        <p className='text-muted-foreground leading-relaxed'>{description}</p>
      </div>

      {/* Subtle index number */}
      <span className='absolute bottom-4 right-4 font-serif text-6xl text-muted/30 select-none'>
        {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  );
}
