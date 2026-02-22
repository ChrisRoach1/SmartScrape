import { components, internal } from './_generated/api';
import { Agent, listUIMessages, saveMessage, syncStreams, vStreamArgs } from '@convex-dev/agent';
import { openai } from '@ai-sdk/openai';
import { action, internalAction, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { createThread } from '@convex-dev/agent';
import { paginationOptsValidator } from 'convex/server';

const agent = new Agent(components.agent, {
  name: 'Source Review Agent',
  languageModel: openai.chat('gpt-5-mini-2025-08-07'),
  instructions:
    'You are a skilled analysist who, given any form of data (PDFs, links, text) can review as a whole unit and come back able to answer any questions asked.',
  tools: { web_search: openai.tools.webSearch() },
});

export const startThread = mutation({
  args: {
    prompt: v.string(),
    sourceIds: v.array(v.id('sources')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    const threadId = await createThread(ctx, components.agent, { userId: userId, title: args.prompt.substring(0, 15) });
    return threadId;
  },
});

export const sendMessage = mutation({
  args: { threadId: v.string(), prompt: v.string() },
  handler: async (ctx, { threadId, prompt }) => {
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      prompt,
    });
    await ctx.scheduler.runAfter(0, internal.agent.generateResponseAsync, {
      threadId,
      promptMessageId: messageId,
    });
  },
});

export const generateResponseAsync = internalAction({
  args: { threadId: v.string(), promptMessageId: v.string() },
  handler: async (ctx, { threadId, promptMessageId }) => {
    await agent.streamText(ctx, { threadId }, { promptMessageId }, { saveStreamDeltas: true });
  },
});

export const listThreads = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.string(),
      _creationTime: v.number(),
      title: v.optional(v.string()),
      summary: v.optional(v.string()),
      userId: v.optional(v.string()),
      status: v.union(v.literal('active'), v.literal('archived')),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return [];
    }
    const userId = identity.tokenIdentifier.split('|')[1];
    const result = await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
      userId,
      order: 'desc',
    });
    return result.page;
  },
});

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const paginated = await listUIMessages(ctx, components.agent, args);

    const streams = await syncStreams(ctx, components.agent, args);

    return { ...paginated, streams };
  },
});
