import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    message: v.string(),
    contact: v.optional(v.string()),
    command: v.optional(v.string()),
    version: v.string(),
    platform: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("feedback", args);
  },
});
