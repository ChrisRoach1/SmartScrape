import { SiteHeader } from '@/components/SiteHeader';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { Benefits } from '@/components/landing/Benefits';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';

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

export default async function Home() {
  const {isAuthenticated} = await auth();

  return (
    <div className='flex min-h-screen flex-col'>
      <SiteHeader />
      <main className='flex-1'>
        <Hero />
        <Features />
        <HowItWorks />
        {!isAuthenticated ? (<InteractiveDemo />) : (<></>)}

        <Benefits />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
