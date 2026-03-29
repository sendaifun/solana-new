import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  feedback: defineTable({
    message: v.string(),
    contact: v.optional(v.string()),
    command: v.optional(v.string()),
    version: v.string(),
    platform: v.string(),
    timestamp: v.number(),
  }),
});
