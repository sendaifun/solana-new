---
name: submit-to-hackathon
description: Prepare and optimize a hackathon submission for a Solana project. Use when a user says "submit to hackathon", "prepare my submission", "hackathon entry", "write project description", "demo video", or "help me win the hackathon". Reads all prior phase context if available.
---

# Submit to Hackathon

## Overview

Prepare a complete, optimized hackathon submission. Write the project description, plan the demo video, and structure the entry to maximize judge appeal. Focused on Solana hackathons (Colosseum, Superteam, ecosystem-specific).

## Workflow

1. Check for `.solana-new/idea-context.json` and `.solana-new/build-context.json`. Use all available context.
2. If no context, interview: What did you build? What hackathon? Which track/prize?
3. Read [references/hackathon-submission-guide.md](references/hackathon-submission-guide.md) for formatting and requirements.
4. Read [references/judging-criteria.md](references/judging-criteria.md) to optimize for what judges look for.
5. Draft the project description, optimized for the specific hackathon.
6. Create a demo script using [references/demo-video-script.md](references/demo-video-script.md).
7. Write a submission HTML artifact with all content ready to copy-paste.

## Dependency Gate (Required)

Hackathon submissions depend on prior phase outputs.

1. Preferred prerequisites:
   - `idea-context.json` from `solana-new copilot start`
   - `build-context.json` from `scaffold-project` and `build-with-claude`
2. If missing, give the user exact order first:
   - `solana-new copilot start "your idea"`
   - `scaffold-project`
   - `build-with-claude`
   - `review-and-iterate`
   - `submit-to-hackathon`
3. If user proceeds without context, continue via interview but label unknowns as `TBD`.

## Non-Negotiables

- The submission must have a working demo link. No exceptions.
- Project description must be scannable — judges read 100+ submissions.
- Lead with what the project DOES, not how it works technically.
- Include clear setup instructions (judges will try to run it).
- Demo video script must be under 3 minutes.
- Do not exaggerate traction or features. Judges verify.
- Always write a local HTML artifact with the complete submission.
- Never fabricate deployment status, traction, or judges-track alignment when context is missing.

## Resources

### references/

- [references/hackathon-submission-guide.md](references/hackathon-submission-guide.md)
- [references/demo-video-script.md](references/demo-video-script.md)
- [references/judging-criteria.md](references/judging-criteria.md)
