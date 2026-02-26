import { components, internal } from './_generated/api';
import { Agent, listUIMessages, saveMessage, syncStreams, vStreamArgs } from '@convex-dev/agent';
import { openai } from '@ai-sdk/openai';
import { internalAction, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { createThread } from '@convex-dev/agent';
import { paginationOptsValidator } from 'convex/server';
import { Id } from './_generated/dataModel';

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

export const deleteThread = mutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    await agent.deleteThreadAsync(ctx, { threadId: args.threadId });
  },
});

export const sendMessage = mutation({
  args: {
    threadId: v.string(),
    prompt: v.string(),
    sourceIds: v.array(v.id('sources')),
  },
  handler: async (ctx, { threadId, prompt, sourceIds }) => {
    const files: { type: 'file'; data: string; mimeType: string }[] = [];

    for (const id of sourceIds) {
      const source = await ctx.db.get(id);

      if (source?.storageId) {
        const fileUrl = await ctx.storage.getUrl(source?.storageId as Id<'_storage'>);
        const file = await ctx.db.system
          .query('_storage')
          .withIndex('by_id', (e) => e.eq('_id', source?.storageId as Id<'_storage'>))
          .first();
        if (fileUrl) {
          files.push({
            type: 'file' as const,
            data: fileUrl,
            mimeType: file?.contentType ?? '',
          });
        }
      }
    }

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      message: {
        role: 'user',
        content: [...files, { type: 'text', text: prompt }],
      },
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
