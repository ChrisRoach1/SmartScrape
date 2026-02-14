import { v } from 'convex/values';
import { query, mutation, internalQuery } from './_generated/server';
import { api } from './_generated/api';

export const createLogRecord = mutation({
  args: {
    urls: v.array(v.string()),
    title: v.optional(v.string()),
    instructions: v.optional(v.string()),
    isPro: v.boolean(),
    modelToRun: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userID = identity.tokenIdentifier.split('|')[1];
    const log = await ctx.db.insert('scrapeLog', {
      urls: args.urls,
      title: args.title,
      status: 'processing',
      userId: userID,
      modelToRun: args.modelToRun,
    });

    if (!args.isPro) {
      const date = new Date();
      const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthlyCount = await ctx.db
        .query('usage')
        .withIndex('by_userId_and_month', (q) => q.eq('userId', userID).eq('month', month))
        .first();

      if (monthlyCount) {
        await ctx.db.patch(monthlyCount._id, { summaryCount: monthlyCount.summaryCount + 1 });
      } else {
        await ctx.db.insert('usage', { userId: userID, month: month, summaryCount: 1, competitorCount: 0 });
      }
    }

    ctx.scheduler.runAfter(0, api.firecrawlActions.startScrape, {
      id: log,
      urls: args.urls,
      instructions: args.instructions,
      modelToRun: args.modelToRun,
    });
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

export const getScrapeLogInternal = internalQuery({
  args: {
    id: v.id('scrapeLog'),
  },
  handler: async (ctx, args) => {
    const log = await ctx.db
      .query('scrapeLog')
      .withIndex('by_id', (q) => q.eq('_id', args.id))
      .first();

    return log;
  },
});

export const getAllLogs = query({
  args: {},
  handler: async (ctx) => {
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

const statusValidator = v.union(v.literal('processing'), v.literal('completed'), v.literal('failed'));
const sentimentValidator = v.union(v.literal('positive'), v.literal('negative'), v.literal('neutral'), v.literal('mixed'));

export const searchLogs = query({
  args: {
    searchTerm: v.optional(v.string()),
    status: v.optional(statusValidator),
    sentiment: v.optional(sentimentValidator),
  },
  returns: v.array(
    v.object({
      _id: v.id('scrapeLog'),
      _creationTime: v.number(),
      title: v.optional(v.string()),
      userId: v.string(),
      urls: v.array(v.string()),
      modelToRun: v.optional(v.string()),
      status: statusValidator,
      summarizedMarkdown: v.optional(v.string()),
      structuredInsights: v.optional(
        v.object({
          keyFindings: v.array(v.string()),
          companiesMentioned: v.array(v.string()),
          actionItems: v.array(v.string()),
          sentiment: sentimentValidator,
          topicsIdentified: v.array(v.string()),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    let results;

    // Use search index if search term provided, otherwise use regular index
    if (args.searchTerm && args.searchTerm.trim() !== '') {
      results = await ctx.db
        .query('scrapeLog')
        .withSearchIndex('search_content', (q) => q.search('summarizedMarkdown', args.searchTerm!).eq('userId', userId))
        .collect();
    } else {
      results = await ctx.db
        .query('scrapeLog')
        .withIndex('by_userId', (q) => q.eq('userId', userId))
        .order('desc')
        .collect();
    }

    // Apply additional filters
    if (args.status) {
      results = results.filter((r) => r.status === args.status);
    }
    if (args.sentiment) {
      results = results.filter((r) => r.structuredInsights?.sentiment === args.sentiment);
    }

    // Sort by creation time descending (search results may not be ordered)
    return results.sort((a, b) => b._creationTime - a._creationTime);
  },
});
