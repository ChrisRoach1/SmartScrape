'use node';

import { v } from 'convex/values';
import { action } from './_generated/server';
import { api } from './_generated/api';
import Firecrawl from '@mendable/firecrawl-js';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const startScrape = action({
  args: {
    id: v.id('scrapeLog'),
    urls: v.array(v.string()),
    instructions: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
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

    const { text } = await generateText({
      model: openai('gpt-5-mini'),
      system:
        'You are part of a company initiative called "competitive intelligence" youre tasked with reviewing current ' +
        'market trends, found in the numerous blogs/articles found below, and laying out suggestions on how to stay competitive' +
        'the company you work for is Medpace, a global CRO. You are honest to a fault and do not make things up just in hopes its the' +
        ' answer that someone is looking for. You give just the facts and suggestions based off those facts',

      prompt: `Please layout suggestions and ideas on how to stay competitive in the given market based on the provided 
               articles and blog posts, it must be formatted nicely in markdown.
               Do not ask follow up questions.
               You are free to search the web for more info if you think that would be helpful but be sure to include your sources ON ALL INFO. 
               Everything is 1 large string of text separated by 'NEXT POST'. it is given to you in basically
              raw HTML scraped from each site: ${scrapedResults.join('NEXT POST')} ${args.instructions ? `${additionalInstructionsPrompt} ${args.instructions}` : ''}`,

      tools: {
        web_search: openai.tools.webSearch(),
      },
    });

    await ctx.runMutation(api.scrapeLog.updateLogRecordStatus, { id: args.id, status: 'completed' });
    await ctx.runMutation(api.scrapeLog.updateLogRecordSummarziedMarkdown, { id: args.id, summarizedMarkdown: text });
    console.log('scrapeResult:', scrapedResults);
  },
});
