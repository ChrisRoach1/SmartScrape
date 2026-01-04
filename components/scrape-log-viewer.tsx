'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Building2, CheckSquare, TrendingUp, TrendingDown, Minus, Shuffle, Tag } from 'lucide-react';
import MarkdownPreview from '@uiw/react-markdown-preview';

interface StructuredInsights {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  topicsIdentified: string[];
  keyFindings: string[];
  actionItems: string[];
  companiesMentioned: string[];
}

interface ScrapeLogViewerProps {
  summarizedMarkdown?: string;
  structuredInsights?: StructuredInsights | null;
}

export function ScrapeLogViewer({ summarizedMarkdown, structuredInsights }: ScrapeLogViewerProps) {
  return (
    <Tabs defaultValue='summary' className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='summary'>Summary</TabsTrigger>
        <TabsTrigger value='insights'>Insights</TabsTrigger>
      </TabsList>

      <TabsContent value='summary' className='mt-4'>
        <MarkdownPreview
          source={summarizedMarkdown}
          style={{ padding: 16, background: 'white', color: 'black', outline: 'solid', outlineColor: 'lightgray' }}
        />
      </TabsContent>

      <TabsContent value='insights' className='mt-4'>
        {structuredInsights ? (
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Sentiment Card */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  {structuredInsights.sentiment === 'positive' && <TrendingUp className='h-4 w-4 text-green-500' />}
                  {structuredInsights.sentiment === 'negative' && <TrendingDown className='h-4 w-4 text-red-500' />}
                  {structuredInsights.sentiment === 'neutral' && <Minus className='h-4 w-4 text-gray-500' />}
                  {structuredInsights.sentiment === 'mixed' && <Shuffle className='h-4 w-4 text-yellow-500' />}
                  Market Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    structuredInsights.sentiment === 'positive'
                      ? 'default'
                      : structuredInsights.sentiment === 'negative'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className='capitalize'
                >
                  {structuredInsights.sentiment}
                </Badge>
              </CardContent>
            </Card>

            {/* Topics Card */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <Tag className='h-4 w-4' />
                  Topics Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-1'>
                  {structuredInsights.topicsIdentified.map((topic, i) => (
                    <Badge key={i} variant='outline'>
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Findings Card */}
            <Card className='md:col-span-2'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <Lightbulb className='h-4 w-4' />
                  Key Findings
                </CardTitle>
                <CardDescription>Top takeaways from the analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  {structuredInsights.keyFindings.map((finding, i) => (
                    <li key={i} className='flex items-start gap-2'>
                      <span className='text-primary font-bold'>{i + 1}.</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Action Items Card */}
            <Card className='md:col-span-2'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <CheckSquare className='h-4 w-4' />
                  Recommended Actions
                </CardTitle>
                <CardDescription>Actionable next steps based on the analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  {structuredInsights.actionItems.map((action, i) => (
                    <li key={i} className='flex items-start gap-2'>
                      <CheckSquare className='h-4 w-4 text-muted-foreground mt-0.5 shrink-0' />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Companies Mentioned Card */}
            {structuredInsights.companiesMentioned.length > 0 && (
              <Card className='md:col-span-2'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <Building2 className='h-4 w-4' />
                    Companies Mentioned
                  </CardTitle>
                  <CardDescription>Competitors and partners identified in the content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {structuredInsights.companiesMentioned.map((company, i) => (
                      <Badge key={i} variant='secondary'>
                        {company}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            <p>Structured insights are not available for this analysis.</p>
            <p className='text-sm'>This may be an older analysis created before insights extraction was added.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
