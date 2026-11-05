---
name: implement-issue
disable-model-invocation: true
argument-hint: "Issue number or URL whose approved brief routes it Light"
description: "Implement a Light-route GitHub issue in one session: plan from its approved brief, change, review, validate in the browser, and hand over UI test steps."
---

# Implement a Light Issue

Take an issue whose approved brief routes it **Light** to a reviewed, browser-validated, uncommitted change the user tests by hand, in one session. **Full loop** briefs go through the `orchestrator` agent instead.

Read [`../GITHUB.md`](../GITHUB.md) and [`../BRIEF.md`](../BRIEF.md) first. `GITHUB.md` governs target resolution and request scoping; `BRIEF.md` defines the brief and when it is current.

## Steps

1. **Fetch** the issue resolved per `GITHUB.md` and its comments, and save the description to `local-issues/<n>/brief.md`:

   ```bash
   gh api "repos/$REPO/issues/$ID"
   gh api "repos/$REPO/issues/$ID/comments" --paginate
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

8. **Validate in the browser** every AC a person would otherwise check by hand, front end or back end, on the user's running `dekit` stack and logged-in Orca browser.
   1. Ready the local stack as Implementation step 8 in `.claude/agents/coder.md` describes.
   2. Load the `orca-cli` skill and walk each AC in a tab you open, as its user would, following Test surface and Rules of engagement in `.claude/agents/pilot.md`.
   3. At each AC checkpoint, save a screenshot as `local-issues/<n>/ui-<AC>-<k>.png`, plus any console or network entry that proves what the screen cannot show.
   4. Write `local-issues/<n>/evidence.md`: one section per walked AC headed by the AC's checklist sentence, stating what was walked, the result, and each screenshot embedded (`![](ui-<AC>-<k>.png)`) so it renders in a Markdown preview. ACs with no screenshot state why.

   Fix a failure that stays inside the brief, then rerun the step 6 checks and the failed walk; ask about anything beyond the brief as in step 7. Done when every such AC is `PASS` with its screenshot embedded in `evidence.md`, or `FAIL` or `UNVERIFIED` with the reason recorded there.

9. **Hand off**, leaving the change uncommitted:
   - Per AC, UI test steps in the product's vocabulary: where to start, what to do, what to expect. For an AC with no screen, how to observe it, such as a Bruno request in `tests/bruno/`.
   - Checks run with their results, each AC's browser result with its evidence paths, and anything unverified.
   - Review findings fixed, and any left open with why.
   - Next steps once the user's test passes: `/commit`, push, `/create-pr`.
