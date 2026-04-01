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

  // Telemetry — skill usage tracking (gstack-style, privacy-first)
  telemetry: defineTable({
    // What happened
    skill: v.string(),                          // skill name (e.g. "scaffold-project")
    phase: v.optional(v.string()),              // "idea" | "build" | "launch"
    command: v.optional(v.string()),            // CLI command (e.g. "ship", "init")
    status: v.string(),                         // "success" | "failure" | "unknown"
    durationMs: v.optional(v.number()),         // execution time in ms
    errorClass: v.optional(v.string()),         // error type if failed

    // Context (no PII, no code, no file paths)
    version: v.string(),                        // CLI version
    platform: v.string(),                       // "darwin-arm64", "linux-x64", etc.
    agentCli: v.optional(v.string()),           // "codex" | "claude" | null
    timestamp: v.number(),                      // epoch ms

    // Privacy tier
    installationId: v.optional(v.string()),     // random UUID, only in "community" tier
  }).index("by_timestamp", ["timestamp"])
    .index("by_skill", ["skill"]),
});
