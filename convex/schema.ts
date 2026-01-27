import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  scrapeLog: defineTable({
    title: v.optional(v.string()),
    userId: v.string(),
    urls: v.array(v.string()),
    status: v.union(v.literal('processing'), v.literal('completed'), v.literal('failed')),
    summarizedMarkdown: v.optional(v.string()),
    structuredInsights: v.optional(
      v.object({
        keyFindings: v.array(v.string()),
        companiesMentioned: v.array(v.string()),
        actionItems: v.array(v.string()),
        sentiment: v.union(v.literal('positive'), v.literal('negative'), v.literal('neutral'), v.literal('mixed')),
        topicsIdentified: v.array(v.string()),
      }),
    ),
  }).index('by_userId', ['userId']),

  sourceLibrary: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    urls: v.array(v.string()),
    userId: v.string(),
  }).index('by_userId', ['userId']),

  competitors: defineTable({
    name: v.string(),
    userId: v.string(),
    scanFrequency: v.union(v.literal('w'), v.literal('m')),
    lastScannedOn: v.optional(v.number()),
  }).index('by_userId', ['userId']),

  competitorAnalysis: defineTable({
    competitorId: v.id('competitors'),
    analysis: v.string(),
  }).index('competitorId', ['competitorId']),
});
