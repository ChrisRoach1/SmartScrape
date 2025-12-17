import { v } from 'convex/values';
import { query, mutation, action } from './_generated/server';
import { api } from './_generated/api';

export const createLogRecord = mutation({
  args: {
    urls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const log = await ctx.db.insert('scrapeLog', { urls: args.urls, status: 'processing' });
    ctx.scheduler.runAfter(0, api.firecrawlActions.startScrape, { id: log, urls: args.urls });
    return log;
  },
});

export const updateLogRecordStatus = mutation({
  args: {
    id: v.id('scrapeLog'),
    status: v.union(v.literal('processing'), v.literal('completed'), v.literal('failed')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateLogRecordSummarziedMarkdown = mutation({
  args: {
    id: v.id('scrapeLog'),
    summarizedMarkdown: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { summarizedMarkdown: args.summarizedMarkdown });
  },
});

export const getCrawlLog = query({
  args: {
    id: v.id('scrapeLog'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('scrapeLog')
      .withIndex('by_id', (q) => q.eq('_id', args.id))
      .first();
  },
});
