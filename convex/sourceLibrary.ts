import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    urls: v.array(v.string()),
  },
  returns: v.id('sourceLibrary'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    return await ctx.db.insert('sourceLibrary', {
      name: args.name,
      description: args.description,
      urls: args.urls,
      userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('sourceLibrary'),
    name: v.string(),
    description: v.optional(v.string()),
    urls: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];
    const existing = await ctx.db.get(args.id);

    if (!existing || existing.userId !== userId) {
      throw new Error('Source not found or access denied');
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      urls: args.urls,
    });

    return null;
  },
});

export const remove = mutation({
  args: {
    id: v.id('sourceLibrary'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];
    const existing = await ctx.db.get(args.id);

    if (!existing || existing.userId !== userId) {
      throw new Error('Source not found or access denied');
    }

    await ctx.db.delete(args.id);

    return null;
  },
});

export const getAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('sourceLibrary'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      urls: v.array(v.string()),
      userId: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    return await ctx.db
      .query('sourceLibrary')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id('sourceLibrary'),
  },
  returns: v.union(
    v.object({
      _id: v.id('sourceLibrary'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      urls: v.array(v.string()),
      userId: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];
    const source = await ctx.db.get(args.id);

    if (!source || source.userId !== userId) {
      return null;
    }

    return source;
  },
});
