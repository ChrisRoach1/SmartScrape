import { v } from 'convex/values';
import { query, mutation, internalQuery } from './_generated/server';

export const get = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id('userSettings'),
      _creationTime: v.number(),
      userId: v.string(),
      systemPrompt: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    return settings;
  },
});

export const getByUserId = internalQuery({
  args: {
    userId: v.string()
  },
  handler: async (ctx,args) => {

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    return settings;
  },
});

export const upsert = mutation({
  args: {
    systemPrompt: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        systemPrompt: args.systemPrompt,
      });
    } else {
      await ctx.db.insert('userSettings', {
        userId,
        systemPrompt: args.systemPrompt,
      });
    }

    return null;
  },
});
