# Issue Brief

Shared reference for `refine-issue`, `create-issue`, and the agent loop. A **brief** is an issue body the user approves before work starts: plain-English requirements on top, verified implementation pointers folded below them, and the reporter's words at the end. Implementation starts from it without re-investigating.

## One problem per brief

A brief covers one issue's problem, so the reviewer decides with full focus. Other issues with the same problem go under Related issues, where the brief proposes how to handle each.

## Related issues

Search open and closed issues, one keyword search per distinct term for the problem (the entity, screen, symptom, and likely synonyms), and read the body of each plausible match:

```bash
tea issues list --repo "$REPO" --state all --keyword "<term>" --fields index,state,title,labels,url --output simple
tea api --repo "$REPO" "/repos/{owner}/{repo}/issues/<n>"
```

Issues the user names are matches too. Propose one handling for each open match that shares the problem:

- **Combine**: this brief covers it. Its report joins Original report, and it closes as `Reviewed/Duplicate` once the brief is posted.
- **Fix first**: this work depends on it, so it lands first.
- **Fix after**: it builds on this work, so it lands afterwards.

A closed match is context: cite it where it explains current behavior, such as a regression of an earlier fix. Issues that only touch the same area stay out.

## Investigate

Source, Git, and Gitea stay read-only; the draft file is your only write.

1. Find related issues per Related issues, unless the skill has already searched.
2. Read the area `AGENTS.md` and feature `README.md` files for the likely areas, and the `IMPORTANT NOTE:` comments in the code you trace.
3. Trace a narrow problem, one whose location the issue makes obvious, yourself. For a broad one (several layers, or location unknown), send each sweep to an explore subagent (`Explore` in Claude Code, `explore` in OpenCode) with one precise question and keep its conclusions.
4. Follow callers, contracts, data flow, and tests across every layer the problem touches: backend, frontend, shared packages, runner.
5. Read every path and symbol you will cite at the current HEAD. Record HEAD's SHA and branch, whether HEAD is on `origin/main`, and any uncommitted changes in cited paths.

Questions the code or docs settle are yours to answer. A question that changes what gets built becomes an open question with your suggested answer.

Done when every requirement and reported symptom, combined issues' included, maps to verified code or an open question, and the pointers name every file the change reaches.

## Draft

Write the brief to `local-issues/<key>/brief.md`. `<key>` is the issue number, or a kebab-case slug before an issue exists. The file holds exactly the issue body to post. Track its revision in the conversation, starting at rev 1.

Everything above the pointers block speaks the product's vocabulary: entities (Queue, Flow, Agent, Tool), screen and dialog names, and what people see and do. Describe backend-only work by its visible effect: who can do what, what gets blocked, what happens when something runs. File paths, symbols, endpoints, tables, and commands appear only inside the pointers block.

Size each section to the problem: a one-line fix gets a few lines. Drop an optional section that has nothing to say.

```md
## Problem

<Who is affected, what is missing or wrong today, and why it matters.>

## How it works today

1. <Where the user starts, what they see, what the system does, what changes as a result.>

## How it will work

1. <The same flow after the change; each new or changed step starts with **New:** or **Changed:**.>

## Rules and exceptions

<Optional. Restrictions, edge cases, and known gaps this work keeps, changes, or depends on.>

## Out of scope

<Optional. What this work leaves alone, including related follow-ups.>

## Related issues

<Optional. One line per issue: #<number>, how it shares the problem, then **Combine**, **Fix first**, or **Fix after**.>

## Open questions

1. <Drafts only. The question, then your suggested answer.>

## Checklist

- [ ] **AC1** <One outcome a person can check by using the product or watching what it does.>

## Route

**Light** | **Full loop**: <one line why.>

<details>
<summary>Implementation pointers</summary>

Verified at `<sha>` on `<branch>`. <Say so here when HEAD is not on `origin/main` or a cited path has uncommitted changes.>

- `<path>`: `<symbol>`, <why it matters>.

Verify with: <existing commands that check the behavior: typecheck, lint, build, Bruno request, harness>.

</details>

## Original report

> <The reporter's text verbatim, every line block-quoted.>
```

- **Checklist**: AC IDs stay stable across revisions; strike a dropped item through (`~~AC3~~`) rather than renumbering.
- **Route**: **Full loop** (start the `orchestrator` agent on the issue) when the change reaches a risky surface listed in `AGENT-LOOP.md`, changes a contract, schema, or migration, or leaves real design alternatives open. **Light** otherwise: `/implement-issue` takes it to a reviewed change in one session.
- **Original report**: each combined issue adds a `### #<number> <title>` subsection after the main report.

## Review

1. Re-read the file, since the user may edit it directly, then show the complete brief with its path and revision.
2. Apply each change request in place, keeping wording the user wrote into the file, and fold each answered question into the section it settles. Investigate any code a change reaches that you have not traced. Bump the revision and show the brief again.
3. The brief is **approved** when the user explicitly approves the revision last shown and its Open questions section is gone. With questions still open, the user answers them or accepts your suggestions; fold those in and show the new revision. A reply that approves and also asks for changes is a change request.
4. Re-read the file after approval; a change since you last showed it needs a fresh approval.

Approving a revision authorizes posting exactly that file and closing the Combine issues it lists. Post its contents unchanged.

## Post

After the skill writes the approved file into the issue description:

1. **Record the approval** on the issue. The fingerprint comes from the description as Gitea stored it, so any later edit to the description breaks the match:

   ```bash
   FINGERPRINT=$(tea api --repo "$REPO" "/repos/{owner}/{repo}/issues/$ID" | jq -r .body | git hash-object --stdin)
   tea comments add --repo "$REPO" "$ID" "Brief approved (rev <N>). Fingerprint: $FINGERPRINT"
   ```

2. **Close each Combine issue**:

   ```bash
   tea comments add --repo "$REPO" "$OTHER" "Combined into #$ID; the approved brief there covers this report."
   tea issues edit --repo "$REPO" "$OTHER" --add-labels "Reviewed/Duplicate"
   tea issues close --repo "$REPO" "$OTHER"
   ```

## Reuse in the agent loop

Scout checks an issue whose description is a brief. The brief is **current** when every condition holds:

- The latest `Brief approved` comment's fingerprint equals the description's, computed as in Post, and no later comment adds or changes a requirement.
- The verified commit exists locally, the Verified line notes no uncommitted changes, and no cited path changed since that commit: `git diff --quiet <sha> HEAD -- <cited paths>`.
- The current behavior scout traces matches How it works today.

A current brief stands as the loop's approved brief. A **stale** one is revised from what changed, and the user approves the new revision.
