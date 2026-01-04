import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { api } from './_generated/api';

export const createLogRecord = mutation({
  args: {
    urls: v.array(v.string()),
    title: v.optional(v.string()),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    const log = await ctx.db.insert('scrapeLog', { urls: args.urls, title: args.title, status: 'processing', userId: userID });
    ctx.scheduler.runAfter(0, api.firecrawlActions.startScrape, { id: log, urls: args.urls, instructions: args.instructions });
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

export const updateLogRecordStructuredInsights = mutation({
  args: {
    id: v.id('scrapeLog'),
    structuredInsights: v.object({
      keyFindings: v.array(v.string()),
      companiesMentioned: v.array(v.string()),
      actionItems: v.array(v.string()),
      sentiment: v.union(v.literal('positive'), v.literal('negative'), v.literal('neutral'), v.literal('mixed')),
      topicsIdentified: v.array(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { structuredInsights: args.structuredInsights });
    return null;
  },
});

export const getScrapeLog = query({
  args: {
    id: v.id('scrapeLog'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    const log = await ctx.db
      .query('scrapeLog')
      .withIndex('by_id', (q) => q.eq('_id', args.id))
      .first();

    if (log?.userId !== userID) {
      return undefined;
    }

    return log;
  },
});

export const getAllLogs = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    return await ctx.db
      .query('scrapeLog')
      .withIndex('by_userId', (q) => q.eq('userId', userID))
      .order('desc')
      .collect();
  },
});
