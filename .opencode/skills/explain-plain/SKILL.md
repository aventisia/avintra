---
name: explain-plain
user-invocable: true
argument-hint: "Feature, flow, or Gitea issue to explain in plain language"
description: "Explain existing logic from architecture and logic perspective in plain non-technical language without file paths or method details."
---

# Explain Plain

Explain how an existing feature works so a non-technical reader can follow the logic. Stay at architecture and intent level, never implementation detail.

## When to Use

- The user invokes `/explain-plain <topic>` or asks for a non-technical explanation.
- The user wants to understand current behavior before planning changes for other entities.
- The user explicitly says not to go into technical details.

## Rules

- Mention only simple entity names and important UI names (for example: Queue, Agent, Assign Agents dialog).
- Never mention file paths, line numbers, method names, DTOs, controllers, services, migrations, or code snippets.
- Keep it short and concise. Plain words only.
- Inspect source only as needed to stay factual; do not surface what you inspected.

## Procedure

1. Identify the problem the feature solves in one sentence.
2. Name the main pieces and how they link — what links to what.
3. Describe the user-visible flow — where the action lives, what the dialog shows, what save does (add new links, remove unselected ones).
4. Describe enforcement and gating — who can do it, what is blocked, what happens at runtime for unassigned items.
5. If comparing entities, state per entity in one line whether it already has this pattern or lacks it.

## Quality Criteria

- No file paths, method names, or code terms appear.
- Follows the five-step structure without extra sections.
- Short enough to read in under a minute.
