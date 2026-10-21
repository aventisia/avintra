---
name: grilling
description: 'Grill the user relentlessly about a plan, decision, or idea until every branch is settled. Use when the user asks to be grilled, or to stress-test, poke holes in, or red-team their thinking.'
argument-hint: "What plan, decision, or idea should I grill you about?"
---

# Relentless Grilling

Stress-test a plan, decision, or idea by mapping it as a **design tree** and questioning every branch until nothing is silently assumed.

## Rounds

1. Map the plan as a design tree: every decision is a node, and its children are the decisions that depend on it.
2. Each **round**, ask every question on the **frontier**: the open decisions whose prerequisites are all settled. A question that depends on another question still open this round waits for a later round.
3. Number each question and give your recommended answer, in the format below.
4. Collect the answers. Standalone, ask the user directly. Delegated, return the frontier to the orchestrator and wait for relayed answers. Every frontier question is answered before the next round starts.
5. Update the tree, marking each decision settled, open, or blocked on a pending fact, and recompute the frontier.
6. When the frontier is empty, restate the settled tree and list any unresolved risks or assumptions. The plan stays unexecuted until the user confirms this shared understanding.

## Decisions and Facts

- **Decisions** belong to the user.
- **Facts** about the code, filesystem, tools, or data are yours to find, never the user's to answer. Standalone, inspect them with read-only tools and report any access blocker. Delegated, request a read-only scout investigation through the orchestrator rather than launching agents yourself.
- A pending fact is an unsettled prerequisite. Defer only the questions downstream of it and ask the rest of the frontier now. Once the fact is verified, its downstream questions join the next frontier.

## Question Format

```
❓ **Q1** - **<question title>**: <question body, possibly several paragraphs, including the choices>

➡️ <your recommended answer>
```
