# UI builder evaluation

Measures how good the custom UI builder's first drafts are, so prompt, skill, and kit changes can
be compared run to run. Each run sends the 20 fixed prompts in `prompts.json` to the LLM pipeline
with the builder's real React system prompt and skills, then builds, checks, renders, and screenshots
every result in headless Chromium using the studio's own build and validation code.

## What it reports

`outputs/<run>/report.md` and `results.json`, plus `<id>.jsx` and desktop/mobile screenshots per prompt:

- **First-pass valid** — no blocking static rule, unknown kit member or icon, unknown-class threshold,
  runtime error, or accessibility violation before any repair pass.
- Accessibility violations and runtime errors across the run.
- Non-blocking notes (a few unknown classes, inline SVG, hand-built tables) and built document size.

Repair passes, planning, and visual review are not part of the score: it measures the draft.

## Setup

```sh
cd tests/ui-builder-eval
npm install
```

Chromium: the runner uses `UI_EVAL_CHROMIUM`, or the newest Playwright Chromium in
`~/.cache/ms-playwright` (`npx playwright-core install chromium` installs one).

## Run

The runner logs in with your account and uses the first tenant model that has a vault credential
(the same list the builder's model picker shows), billed to that credential.

```sh
export UI_EVAL_EMAIL="you@company.com"
read -s -p "Password: " UI_EVAL_PWD && export UI_EVAL_PWD && echo
npm run eval -- --run baseline
```

- `UI_EVAL_MODEL=<part of a model id>` picks a specific tenant model.
- `UI_EVAL_PROVIDER` + `UI_EVAL_MODEL` (+ `UI_EVAL_CREDENTIAL`) skip the model lookup.
- Accounts with two-factor login: pass a session instead, for example
  `UI_EVAL_HEADERS='{"Cookie":"AccessToken=<token>"}'`.
- Defaults target the local reverse proxy (`https://local-avintra.aventisia.com`), like Bruno's
  `local` environment; override with `UI_EVAL_ACCOUNTS_URL`, `UI_EVAL_WORKSPACE_URL`, and
  `UI_EVAL_LLM_URL`.
- `--only id1,id2` runs a subset of prompts.
- `--score-only --run <name>` re-scores saved `.jsx` files without calling the model (use it after
  changing the kit, validator, or build).

Compare `report.md` between runs before and after a change to the system prompt, skills, or kit.
