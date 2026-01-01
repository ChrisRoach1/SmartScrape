import { Zap, Shield, FileJson, Brain, MousePointerClick, Globe } from 'lucide-react';

export function Features() {
  return (
    <section className='py-24 md:py-32'>
      <div className='container px-4 md:px-6'>
        <div className='mb-16 text-center'>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'>
            Everything you need. <br />
            <span className='text-muted-foreground'>Nothing you don&apos;t.</span>
          </h2>
          <p className='mt-4 text-lg text-muted-foreground'>
            Built for efficiency. Designed for clarity.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <FeatureCard
            icon={<Brain className='h-6 w-6 text-primary' />}
            title='AI Synthesis'
            description='Our advanced models read and understand content, extracting key insights automatically.'
          />
          <FeatureCard
            icon={<FileJson className='h-6 w-6 text-primary' />}
            title='Structured Data'
            description='Get clean Markdown, JSON, or CSV outputs ready for your workflow.'
          />
          <FeatureCard
            icon={<Zap className='h-6 w-6 text-primary' />}
            title='Lightning Fast'
            description='Optimized scraping engine ensures you get results in seconds, not minutes.'
          />
          <FeatureCard
            icon={<Shield className='h-6 w-6 text-primary' />}
            title='Enterprise Grade'
            description='Secure handling of data with built-in rate limiting and respectful crawling.'
          />
          <FeatureCard
            icon={<MousePointerClick className='h-6 w-6 text-primary' />}
            title='One-Click Summary'
            description='Just paste a URL. We handle the parsing, cleaning, and summarization.'
          />
          <FeatureCard
            icon={<Globe className='h-6 w-6 text-primary' />}
            title='Universal Access'
            description='Works on blogs, news sites, documentation, and technical papers.'
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className='group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 transition-all hover:border-border hover:shadow-lg'>
      <div className='mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 transition-colors group-hover:bg-primary/10'>
        {icon}
      </div>
      <h3 className='mb-3 text-xl font-bold'>{title}</h3>
      <p className='text-muted-foreground'>{description}</p>
    </div>
  );
}
