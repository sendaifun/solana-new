import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const track = mutation({
  args: {
    skill: v.string(),
    phase: v.optional(v.string()),
    command: v.optional(v.string()),
    status: v.string(),
    durationMs: v.optional(v.number()),
    errorClass: v.optional(v.string()),
    version: v.string(),
    platform: v.string(),
    agentCli: v.optional(v.string()),
    timestamp: v.number(),
    installationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("telemetry", args);
  },
});

export const recentBySkill = query({
  args: { skill: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("telemetry")
      .withIndex("by_skill", (q) => q.eq("skill", args.skill))
      .order("desc")
      .take(args.limit ?? 50);
  },
});
