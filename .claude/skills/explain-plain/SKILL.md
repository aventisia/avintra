---
name: explain-plain
argument-hint: "Feature, flow, or Gitea issue to explain"
description: "Explain how an existing feature works in plain, non-technical language. Use when the user wants a non-technical or high-level explanation of existing logic."
---

# Explain Plain

Explain how an existing feature works so a non-technical reader can follow it. Speak at the level of intent and architecture. Entity names (Queue, Agent, Flow) and screen or dialog names (the Assign Agents dialog) are the whole vocabulary.

## Gather

Read the source, and the issue itself for a Gitea issue (`tea issues --repo . <number>`; see [`../GITEA.md`](../GITEA.md) for URLs and other repositories). Read as much as it takes to stay factual. What you read stays out of the answer.

## Answer

Answer in this order, one short paragraph or list each:

1. **Purpose**: the problem the feature solves, in one sentence.
2. **Pieces**: the main entities and what links to what.
3. **User flow**: where the action lives, what the user sees, and what saving changes.
4. **Rules**: who may do it, what is blocked, and what happens at runtime when the rule applies.
5. **Comparison**, only when the user asks about several entities: one line per entity on whether it already follows this pattern.

Done when the answer reads in under a minute (about 200 words), has no sections beyond these, and contains no code vocabulary: no file paths, line numbers, method or class names, DTOs, controllers, services, migrations, or snippets.
