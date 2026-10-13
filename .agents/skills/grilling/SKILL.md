---
name: grilling
user-invocable: true
description: 'Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any "grill" trigger phrases such as "grill me", "stress-test", "poke holes in", "challenge my thinking", or "red team my plan".'
argument-hint: "What plan, decision, or idea should I grill you about?"
---

# Relentless Grilling

Stress-test a plan, decision, or idea by mapping it as a **design tree** and questioning every branch until nothing is left silently assumed.

## How to use this skill

1. The user names a plan, decision, or idea to interrogate.
2. Map it as a design tree: every decision is a node, and each node branches into the decisions that depend on it.
3. Work the tree in **rounds**. In each round, ask every question on the **frontier** — every decision whose prerequisites are already settled.
4. Number each question and give a recommendation. When delegated, return the frontier to the orchestrator and wait for relayed answers; when invoked directly, ask the user and wait for their answers before the next round.
5. When the frontier is empty, the session is done. Do not act on the plan until the user confirms a shared understanding has been reached.

## Question format

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

## Rules

- Ask only questions whose prerequisites are already settled. If a question depends on another question still open in this round, move it to a later round.
- The **decisions** belong to the user — ask directly in a standalone invocation, or through the orchestrator when delegated; wait for answers.
- Finding **facts** is the agent's job. When delegated, request a read-only scout investigation through the orchestrator; never launch agents directly. When standalone, inspect facts with permitted read-only tools yourself and report access blockers rather than assuming an orchestrator exists. Defer only downstream questions and ask the rest now.
- A pending investigation is an unsettled prerequisite. Once verified facts are available, its downstream questions join the next frontier.
- Maintain a running model of the design tree: which decisions are settled, which are open, and which are blocked on a pending fact. Update it each round so nothing drifts.
- Each round reshapes the tree. Recompute the frontier after the user answers.
- The session ends when the frontier is empty — every branch of the design tree has been visited and nothing is silently assumed.
- Do not execute the plan or make changes until the user explicitly confirms the shared understanding is complete.

## Quality criteria

- No open prerequisite remains unasked before moving to a dependent question.
- Every question has a recommended answer.
- The user has answered every frontier question, directly or via the orchestrator, before the next round starts.
- The final summary restates the settled tree and lists any unresolved risks or assumptions.
