---
name: implement-issue
disable-model-invocation: true
argument-hint: "Issue number or URL whose approved brief routes it Light"
description: "Implement a Light-route Gitea issue in one session: plan from its approved brief, change, review, and hand over UI test steps."
---

# Implement a Light Issue

Take an issue whose approved brief routes it **Light** to a reviewed, uncommitted change the user tests by hand, in one session. **Full loop** briefs go through the `orchestrator` agent instead.

Read [`../GITEA.md`](../GITEA.md) and [`../BRIEF.md`](../BRIEF.md) first. `GITEA.md` governs target resolution and request scoping; `BRIEF.md` defines the brief and when it is current.

## Steps

1. **Fetch** the issue resolved per `GITEA.md` and its comments, and save the description to `local-issues/<n>/brief.md`:

   ```bash
   tea api --repo "$REPO" "/repos/{owner}/{repo}/issues/$ID"
   tea api --repo "$REPO" "/repos/{owner}/{repo}/issues/$ID/comments"
   ```

   On a tool error, report it and stop rather than reconstructing issue contents.

2. **Gate on the brief.** Continue only when the description is a brief whose Route is **Light** and the first two conditions of Reuse in the agent loop in `BRIEF.md` hold; step 4 checks the third. Otherwise stop and say why: no brief or a stale one → `/refine-issue <n>`; **Full loop** → the `orchestrator` agent.

3. **Branch.** On a clean tree apart from `local-issues/`, create or reuse the issue branch per steps 2–6 of Branch preparation in `.claude/agents/coder.md`, skipping every push; the user pushes when ready.

4. **Scout.** Read every path the pointers cite and trace its callers and consumers. Done when every AC maps to the files that deliver it and How it works today matches the code. A mismatch means the brief is stale; a risky surface listed in `AGENT-LOOP.md`, a contract, schema, or migration change, or an open design choice means the work belongs in the full loop. Either way, stop and suggest `/refine-issue <n>`.

5. **Plan.** Show, per AC, the files to change, the change, and the check that proves it, then continue. A plan item beyond the brief waits for the user's approval.

6. **Implement** the plan with the smallest change per AC, following the area `AGENTS.md` files. Run the brief's Verify with commands and the root `AGENTS.md` build checks for every touched area until they pass.

7. **Review** in two passes, each in a fresh subagent (`general-purpose` in Claude Code, `general` in OpenCode) given the issue number, `local-issues/<n>/brief.md`, and the change: `git diff $(git merge-base HEAD origin/main)` plus the new untracked files.
   1. `ponytail-review` when the ponytail plugin is installed; otherwise note that it was skipped.
   2. `code-review`, with the focus: flag every AC the change misses and every change outside the brief.

   After each pass, fix the findings whose fix stays inside the brief, and ask the user about a fix that goes beyond the brief or a judgement call, with your recommendation. Rerun the checks and that pass once more after fixing; findings left after the second run go into the hand-off. Done when both passes are clean or every remaining finding is listed.

8. **Hand off**, leaving the change uncommitted:
   - Per AC, UI test steps in the product's vocabulary: where to start, what to do, what to expect. For an AC with no screen, how to observe it, such as a Bruno request in `tests/bruno/`.
   - Checks run with their results, and anything unverified.
   - Review findings fixed, and any left open with why.
   - Next steps once the user's test passes: `/commit`, push, `/create-pr`.
