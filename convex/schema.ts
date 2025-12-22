import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  scrapeLog: defineTable({
    title: v.optional(v.string()),
    userId: v.string(),
    urls: v.array(v.string()),
    status: v.union(v.literal('processing'), v.literal('completed'), v.literal('failed')),
    summarizedMarkdown: v.optional(v.string()),
  }).index('by_userId', ['userId']),
});
