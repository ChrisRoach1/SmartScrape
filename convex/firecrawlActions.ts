'use node';

import { v } from 'convex/values';
import { action } from './_generated/server';
import { api } from './_generated/api';
import Firecrawl from '@mendable/firecrawl-js';

export const startScrape = action({
  args: {
    id: v.id('scrapeLog'),
    urls: v.array(v.string()),
  },

  handler: async (ctx, args) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    const scrapedResults = new Array<string>();

    for (const url of args.urls) {
      const scrapeResult = await firecrawl.scrape(url, { formats: ['markdown', 'html'] });

      if (scrapeResult.markdown) {
        scrapedResults.push(scrapeResult.markdown);
      }
    }

    await ctx.runMutation(api.crawlLog.updateLogRecordStatus, { id: args.id, status: 'completed' });
    await ctx.runMutation(api.crawlLog.updateLogRecordSummarziedMarkdown, { id: args.id, summarizedMarkdown: scrapedResults[0] });
    console.log('scrapeResult:', scrapedResults);
  },
});
