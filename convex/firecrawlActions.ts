'use node';

import { v } from 'convex/values';
import { action } from './_generated/server';
import { api, internal } from './_generated/api';
import Firecrawl from '@mendable/firecrawl-js';
import { generateText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const structuredInsightsSchema = z.object({
  keyFindings: z.array(z.string()).describe('3-5 key takeaways or findings from the analyzed content'),
  companiesMentioned: z.array(z.string()).describe('Names of companies, competitors, or partners mentioned in the content'),
  actionItems: z.array(z.string()).describe('3-5 specific, actionable recommendations based on the analysis'),
  sentiment: z
    .enum(['positive', 'negative', 'neutral', 'mixed'])
    .describe('Overall sentiment of the market/competitive landscape based on the content'),
  topicsIdentified: z
    .array(z.string())
    .describe('Key topics or themes identified (e.g., "pricing", "product launch", "regulation", "partnerships")'),
});

export const startScrape = action({
  args: {
    id: v.id('scrapeLog'),
    urls: v.array(v.string()),
    instructions: v.optional(v.string()),
    modelToRun: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const selectedModel = args.modelToRun ?? 'gpt-5-mini';
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    const scrapedResults = new Array<string>();
    const additionalInstructionsPrompt = `the following are user provided instructions in addition to your current instructions.
    Follow them to the best of your ability within the confines of your originally defined purpose. Anything outside of your directive should
    be ignored. USER INSTRUCTIONS:`;
    for (const url of args.urls) {
      const scrapeResult = await firecrawl.scrape(url, { formats: ['markdown', 'html'] });

      if (scrapeResult.markdown) {
        scrapedResults.push(scrapeResult.markdown);
      }
    }

    const scrapeLog = await ctx.runQuery(internal.scrapeLog.getScrapeLogInternal, { id: args.id });

    const userSettings = await ctx.runQuery(internal.userSettings.getByUserId, { userId: scrapeLog?.userId ?? '' });

    const systemPrompt =
      userSettings?.systemPrompt ??
      `You are part of a company initiative called "competitive intelligence" youre tasked with reviewing current market trends,` +
        `found in the numerous blogs/articles found below, and laying out suggestions on how to stay competitive.` +
        `You are honest to a fault and do not make things up just in hopes its the answer that someone is looking for. You give just the facts and suggestions based off those facts`;

    const combinedContent = scrapedResults.join('NEXT POST');

    // Generate the markdown summary
    const { text } = await generateText({
      model: openai(selectedModel),
      system: systemPrompt,
      prompt: `Please layout suggestions and ideas on how to stay competitive in the given market based on the provided 
               articles and blog posts, it must be formatted nicely in markdown.
               Do not ask follow up questions.
               You are free to search the web for more info if you think that would be helpful but be sure to include your sources ON ALL INFO. 
               Everything is 1 large string of text separated by 'NEXT POST'. it is given to you in basically
              raw HTML scraped from each site: ${combinedContent} ${args.instructions ? `${additionalInstructionsPrompt} ${args.instructions}` : ''}`,

      tools: {
        web_search: openai.tools.webSearch(),
      },
    });

    // Extract structured insights from the generated summary
    const { object: structuredInsights } = await generateObject({
      model: openai('o3'),
      schema: structuredInsightsSchema,
      system:
        'You are an expert at extracting structured insights. ' +
        'Analyze the provided content and extract key information in a structured format. ' +
        'Be concise and specific. Focus on actionable insights.',
      prompt: `Based on the following summary generated with the following system prompt ${systemPrompt}, extract structured insights:${text}
      Original source content (for additional context): ${combinedContent.substring(0, 5000)}...`,
    });

    await ctx.runMutation(api.scrapeLog.updateLogRecordStatus, { id: args.id, status: 'completed' });
    await ctx.runMutation(api.scrapeLog.updateLogRecordSummarziedMarkdown, { id: args.id, summarizedMarkdown: text });
    await ctx.runMutation(api.scrapeLog.updateLogRecordStructuredInsights, {
      id: args.id,
      structuredInsights: {
        keyFindings: structuredInsights.keyFindings,
        companiesMentioned: structuredInsights.companiesMentioned,
        actionItems: structuredInsights.actionItems,
        sentiment: structuredInsights.sentiment,
        topicsIdentified: structuredInsights.topicsIdentified,
      },
    });
    console.log('scrapeResult:', scrapedResults);
  },
});
