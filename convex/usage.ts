import { v } from 'convex/values';
import { internalMutation, internalQuery, query } from './_generated/server';

export const getUsage = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id('usage'),
      _creationTime: v.number(),
      userId: v.string(),
      month: v.string(),
      summaryCount: v.number(),
      competitorCount: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    const date = new Date();
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthlyCount = await ctx.db
      .query('usage')
      .withIndex('by_userId_and_month', (q) => q.eq('userId', userID).eq('month', month))
      .first();

    return monthlyCount;
  },
});

export const getUsageInternal = internalQuery({
  args: {
    userId: v.string()
  },
  returns: v.union(
    v.object({
      _id: v.id('usage'),
      _creationTime: v.number(),
      userId: v.string(),
      month: v.string(),
      summaryCount: v.number(),
      competitorCount: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const date = new Date();
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthlyCount = await ctx.db
      .query('usage')
      .withIndex('by_userId_and_month', (q) => q.eq('userId', args.userId).eq('month', month))
      .first();

    return monthlyCount;
  },
});

export const incrementSummaryCount = internalMutation({
  args: {
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const date = new Date();
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthlyCount = await ctx.db
      .query('usage')
      .withIndex('by_userId_and_month', (q) => q.eq('userId', args.userId).eq('month', month))
      .first();

    if (monthlyCount) {
      await ctx.db.patch(monthlyCount._id, { summaryCount: monthlyCount.summaryCount + 1 });
    } else {
      await ctx.db.insert('usage', { userId: args.userId, month: month, summaryCount: 1, competitorCount: 0 });
    }
    return null;
  },
});

export const incrementAnalysisCount = internalMutation({
  args: {
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const date = new Date();
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthlyCount = await ctx.db
      .query('usage')
      .withIndex('by_userId_and_month', (q) => q.eq('userId', args.userId).eq('month', month))
      .first();

    if (monthlyCount) {
      await ctx.db.patch(monthlyCount._id, { competitorCount: monthlyCount.competitorCount + 1 });
    } else {
      await ctx.db.insert('usage', { userId: args.userId, month: month, summaryCount: 0, competitorCount: 1 });
    }
    return null;
  },
});
