import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendfile = mutation({
  args: {
    storageId: v.id('_storage'),
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    await ctx.db.insert('sources', {
      storageId: args.storageId,
      userId: userId,
      fileName: args.fileName,
      isFile: true,
      fileSize: args.fileSize,
    });
  },
});

export const createNonFileSource = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];

    await ctx.db.insert('sources', {
      userId: userId,
      isFile: false,
      nonFileContent: args.content,
    });
  },
});

export const getSources = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const userId = identity.tokenIdentifier.split('|')[1];
    let results;

    if (args.searchTerm === '') {
      results = await ctx.db
        .query('sources')
        .withIndex('by_userId', (e) => e.eq('userId', userId))
        .collect();
    } else {
      const contentSearchResults = await ctx.db
        .query('sources')
        .withSearchIndex('search_content', (q) => q.search('nonFileContent', args.searchTerm!).eq('userId', userId))
        .collect();

      const nonFileContentSearchResults = await ctx.db
        .query('sources')
        .withSearchIndex('search_fileNames', (q) => q.search('fileName', args.searchTerm!).eq('userId', userId))
        .collect();

      results = [...contentSearchResults, ...nonFileContentSearchResults];
    }

    return results;
  },
});
