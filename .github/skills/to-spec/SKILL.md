---
name: to-spec
disable-model-invocation: true
argument-hint: "What feature or work should I turn into a spec?"
description: "Turn the current conversation into a spec and publish it to the project issue tracker — no interview, just synthesis of what you have already discussed."
---

# Conversation to Spec

Take everything already discussed in this conversation plus your understanding of the codebase and produce a written spec, then publish it to the project's issue tracker. **Do not interview the user** — synthesize what you already know. If a decision is genuinely unresolved and blocks the spec, note it in _Further Notes_ rather than asking.

## Context

- Issue tracker: **Gitea issues** on this repo's host (e.g. `gitea.aventisia.com`).
- Triage label vocabulary: apply the single label `ready-for-agent` to the published issue. No additional triage labels are defined.
- Domain glossary: this repo does not currently ship a glossary document. Use the project's domain terminology as found in the codebase and docs (`clients/docs`). If a glossary or ADR document is present under `docs/`, `docs/agents/`, or similar, consult it; otherwise proceed with plain, consistent domain terms.
- Test seams: prefer existing seams. This repo has no unit test suites; the primary API-level verification is the Bruno collection under `tests/bruno/`.

## Process

1. **Explore the repo** to understand the current state of the codebase, if you haven't already. Use the project's domain vocabulary throughout the spec, and respect any ADRs in the area you're touching (best-effort — none are known to exist yet).

2. **Sketch the seams** at which the feature will be tested. Existing seams should be preferred over new ones; use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better — the ideal number is one. In this repo, treat API contracts and the Bruno collections as the seams to prefer and propose.

   Check with the user that these seams match their expectations before writing the final spec.

3. **Write the spec** using the template below, then **publish it** to the Gitea issue tracker and apply the `ready-for-agent` label — no need for additional triage.

   Publishing order of preference:
   - If a Gitea token is available (e.g. `GITEA_TOKEN` env var), create the issue via the Gitea REST API (`POST /api/v1/repos/{owner}/{repo}/issues`) with `labels: ["ready-for-agent"]`, and report the resulting issue URL.
   - Otherwise, print the full spec and give the user the exact steps to create the issue and apply the `ready-for-agent` label themselves.

## Spec template

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

</spec-template>

## Quality criteria

- No interview: the spec is synthesized from the existing conversation and codebase.
- User stories cover all aspects and are extensive.
- The spec uses the project's domain vocabulary consistently.
- The chosen test seams are the highest and fewest reasonable ones, and were confirmed with the user.
- Implementation decisions contain no fragile file paths or code snippets (except decision-encoding prototypes).
- The spec is published to the issue tracker with the `ready-for-agent` label, or the user is handed exact publish steps.
