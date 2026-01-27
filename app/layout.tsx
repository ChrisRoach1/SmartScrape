import type { Metadata } from 'next';
import './globals.css';
import ConvexClientProvider from '@/components/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: {
    template: '%s | SmartScrape',
    default: 'SmartScrape - AI-Powered Web Summarizer for Business',
  },
  description:
    'Turn any website into clear, actionable summaries using AI. Extract data, analyze content, and get insights faster. Perfect for business intelligence and research.',
  keywords: [
    'AI website summarizer',
    'web scraping tool',
    'content analysis',
    'extract data from websites',
    'business intelligence tool',
    'automated research',
    'content summarization',
  ],
  authors: [{ name: 'SmartScrape' }],
  creator: 'SmartScrape',
  metadataBase: new URL('https://smartscrape.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://smartscrape.dev',
    title: 'SmartScrape - AI-Powered Web Summarizer for Business',
    description: 'Turn any website into clear, actionable summaries using AI. Extract data, analyze content, and get insights faster.',
    siteName: 'SmartScrape',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SmartScrape - AI-Powered Web Summarizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartScrape - AI-Powered Web Summarizer for Business',
    description: 'Turn any website into clear, actionable summaries using AI. Extract data, analyze content, and get insights faster.',
    images: ['/og-image-twitter.png'],
    creator: '@smartscrape',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'theme-color': '#e67e22',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <ClerkProvider dynamic afterSignOutUrl='/'>
          <ConvexClientProvider>
            <div className='flex min-h-screen flex-col'>
              <div>{children}</div>
              <Toaster />
            </div>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
