import { SiteHeader } from '@/components/SiteHeader';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Benefits } from '@/components/landing/Benefits';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SmartScrape - Read the Internet. Faster.',
  description:
    'Turn any website into clear, actionable summaries using AI. Extract data from websites, analyze content, and get insights faster. Perfect for business intelligence, market research, and content analysis.',
  openGraph: {
    title: 'SmartScrape - Read the Internet. Faster.',
    description:
      'Turn any website into clear, actionable summaries using AI. Extract data from websites, analyze content, and get insights faster.',
    url: 'https://smartscrape.dev',
  },
  twitter: {
    title: 'SmartScrape - Read the Internet. Faster.',
    description:
      'Turn any website into clear, actionable summaries using AI. Extract data from websites, analyze content, and get insights faster.',
  },
};

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col'>
      <SiteHeader />
      <main className='flex-1'>
        <Hero />
        <Features />
        <HowItWorks />
        <Benefits />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
