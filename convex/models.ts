import { query } from './_generated/server';

export const getAllModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('models').collect();
  },
});
