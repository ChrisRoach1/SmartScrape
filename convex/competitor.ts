import { v } from 'convex/values';
import { query, mutation, internalQuery, internalAction, internalMutation } from './_generated/server';
import { api, internal } from './_generated/api';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { text } from 'stream/consumers';

export const create = mutation({
  args: {
    name: v.string(),
    scanFrequency: v.union(v.literal('w'), v.literal('m')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    return await ctx.db.insert('competitors', {
      name: args.name,
      scanFrequency: args.scanFrequency,
      userId: userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('competitors'),
    name: v.string(),
    scanFrequency: v.union(v.literal('w'), v.literal('m')),
  },
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
      scanFrequency: args.scanFrequency,
    });

    return null;
  },
});

export const remove = mutation({
  args: {
    id: v.id('competitors'),
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
      throw new Error('competitor not found or access denied');
    }

    await ctx.db.delete(args.id);

    return null;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    return await ctx.db
      .query('competitors')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id('competitors'),
  },
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

export const getAnalysisByCompetitorId = query({
  args: {
    id: v.id('competitors'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    return ctx.db
      .query('competitorAnalysis')
      .withIndex('by_competitorId', (q) => q.eq('competitorId', args.id))
      .order('desc')
      .collect();
  },
});

export const executeScan = internalAction({
  args: {
    scanFrequency: v.union(v.literal('w'), v.literal('m')),
  },
  handler: async (ctx, args) => {
    const competitors = await ctx.runQuery(internal.competitor.getByFrequency, { scanFrequency: args.scanFrequency });

    await Promise.all(
      competitors.map(async (competitor) => {
        const { text } = await generateText({
          model: openai('gpt-5-mini'),
          system:
            'You are part of a company initiative called "competitive intelligence" youre tasked with reviewing current ' +
            'market trends, found in the numerous blogs/articles found below, and laying out suggestions on how to stay competitive' +
            'You are honest to a fault and do not make things up just in hopes its the' +
            ' answer that someone is looking for. You give just the facts and suggestions based off those facts',

          prompt: `Please layout suggestions and ideas on how to stay competitive in the given market based on the following company. 
                       It must be formatted nicely in markdown.
                       Do not ask follow up questions.
                       You are free to search the web for more info if but be sure to include your sources ON ALL INFO. 
                       Company name: ${competitor.name}. ${competitor.lastScannedOn ? 'The info must also be newer than' + competitor.lastScannedOn : ''}`,
          tools: {
            web_search: openai.tools.webSearch(),
          },
        });

        await ctx.runMutation(internal.competitor.createNewCompetitorAnalysis, { competitorId: competitor._id, text });

        await ctx.runMutation(internal.competitor.updateLastScannedDate, { competitorId: competitor._id, date: Date.now() });
      }),
    );
  },
});

export const getByFrequency = internalQuery({
  args: {
    scanFrequency: v.union(v.literal('w'), v.literal('m')),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('competitors')
      .filter((q) => q.eq(q.field('scanFrequency'), args.scanFrequency))
      .order('desc')
      .collect();
  },
});

export const createNewCompetitorAnalysis = internalMutation({
  args: {
    competitorId: v.id('competitors'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    ctx.db.insert('competitorAnalysis', { competitorId: args.competitorId, analysis: args.text });
  },
});

export const updateLastScannedDate = internalMutation({
  args: {
    competitorId: v.id('competitors'),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    ctx.db.patch(args.competitorId, { lastScannedOn: args.date });
  },
});
