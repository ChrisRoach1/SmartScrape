import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';

export const hasUsedDemoInternal = internalQuery({
  args: { randomId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('demoUsage')
      .withIndex('by_randomId', (q) => q.eq('randomId', args.randomId))
      .first();
    return existing !== null;
  },
});

export const recordDemoUsageInternal = internalMutation({
  args: { randomId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert('demoUsage', { randomId: args.randomId, usedAt: Date.now() });
    return null;
  },
});
