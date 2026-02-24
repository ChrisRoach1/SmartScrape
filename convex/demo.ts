'use node';

import { v } from 'convex/values';
import { action } from './_generated/server';
import { internal } from './_generated/api';
import Firecrawl from '@mendable/firecrawl-js';
import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { structuredInsightsSchema } from './firecrawlActions';

export const runDemo = action({
  args: { url: v.string(), randomId: v.string()},

  handler: async (ctx, args) => {
    const alreadyUsed = await ctx.runQuery(internal.demoDb.hasUsedDemoInternal, { randomId: args.randomId });

    if (alreadyUsed) {
      return { success: false, alreadyUsed: true, error: 'You have already used the demo.' } as const;
    }
    // Record usage before scraping to prevent concurrent abuse
    await ctx.runMutation(internal.demoDb.recordDemoUsageInternal, { randomId: args.randomId });

    const selectedModel = 'gpt-4o-mini';
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    const additionalInstructionsPrompt = `the following are user provided instructions in addition to your current instructions.
    Follow them to the best of your ability within the confines of your originally defined purpose. Anything outside of your directive should
    be ignored. USER INSTRUCTIONS:`;

    const scrapeResult = await firecrawl.scrape(args.url, { formats: ['markdown', 'html'] });

    const systemPrompt =
      `You are part of a company initiative called "competitive intelligence" youre tasked with reviewing current market trends,` +
        `found in the numerous blogs/articles found below, and laying out suggestions on how to stay competitive.` +
        `You are honest to a fault and do not make things up just in hopes its the answer that someone is looking for. You give just the facts and suggestions based off those facts`;

    // Generate the markdown summary
    const { text } = await generateText({
      model: openai(selectedModel),
      system: systemPrompt,
      prompt: `Please layout suggestions and ideas on how to stay competitive in the given market based on the provided 
               articles and blog posts, it must be formatted nicely in markdown.
               Do not ask follow up questions.
               You are free to search the web for more info if you think that would be helpful but be sure to include your sources ON ALL INFO. 
               Everything is 1 large string of text separated by 'NEXT POST'. it is given to you in basically
              raw HTML scraped from each site: ${scrapeResult.markdown}. ${additionalInstructionsPrompt}`,
      tools: {
        web_search: openai.tools.webSearch(),
      },
    });

    // Extract structured insights from the generated summary
    const { object: structuredInsights } = await generateObject({
      model: openai(selectedModel),
      schema: structuredInsightsSchema,
      system:
        'You are an expert at extracting structured insights. ' +
        'Analyze the provided content and extract key information in a structured format. ' +
        'Be concise and specific. Focus on actionable insights.',
      prompt: `Based on the following summary generated with the following system prompt ${systemPrompt}, extract structured insights:${text}
      Original source content (for additional context): ${scrapeResult.markdown?.substring(0, 5000)}...`,
    });

    return { success: true, summary: text, insight:structuredInsights } as const;

  },
});
