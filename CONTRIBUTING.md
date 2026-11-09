# Contributing to Avintra

Thanks for helping build Avintra. This guide covers how to report issues, set up a dev environment and get a pull request merged.

## Ways to contribute

- **Report bugs** with a [bug report](https://github.com/aventisia/avintra/issues/new?template=bug_report.yml)
- **Suggest features** in [GitHub Discussions](https://github.com/aventisia/avintra/discussions) before opening a large PR
- **Fix issues**: start with [`good first issue`](https://github.com/aventisia/avintra/labels/good%20first%20issue) or [`help wanted`](https://github.com/aventisia/avintra/labels/help%20wanted)
- **Build nodes, app integrations and templates** for the Agent Builder
- **Improve docs**: the product docs at https://docs.aventisia.com are built from `clients/docs/`; typos, examples and translations are all welcome

## Before you start

1. Comment on the issue you want to work on, so we can assign it and avoid duplicate work.
2. For anything larger than a small fix, open a discussion or draft PR first to agree on the approach.
3. Read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Development setup

You need the .NET 8 SDK, Node.js 22+ with npm, and Python 3.12+. Docker is needed only to build images.

```bash
git clone https://github.com/aventisia/avintra.git
cd avintra
./scripts/initial-setup.sh   # once; initial-setup.ps1 on Windows
dekit up                     # start every service
dekit attach                 # watch them; select a service and press r to restart it
```

`initial-setup` copies each `.env.example` to a gitignored `.env.local` (`.env` for the web apps), installs dependencies and [dekit](https://dekit.run), and enables the secret-scanning pre-commit hook. [DEVELOPMENT.md](DEVELOPMENT.md) covers the repository layout and running services one at a time.

| Area | Path |
| --- | --- |
| .NET APIs (Accounts, Workspace, Global Admin) | `apis/WorcBackend-legacy/` |
| LLM pipeline (Python, FastAPI) | `apis/llmpipeline/` |
| Connector services | `apis/apache-camel/`, `apis/corsair/` |
| Web apps (React, Turborepo) | `clients/web-apps/` |
| Desktop App (Tauri) and Runner | `clients/web-apps/apps/desktop-app/`, `clients/RunnerApp/` |
| Flow engine and nodes | `shared/ExecutorLibrary/`, `shared/NodeLibrary/` |
| Product docs | `clients/docs/` |

## Checks

Run the checks for the areas you changed:

```bash
dotnet build Avplatform.sln                           # .NET APIs, shared libraries, Runner
dotnet run --project shared/ExecutorLibrary.Tests     # flow engine tests

cd clients/web-apps                                   # web apps
npx turbo run typecheck --filter=<package>
npx eslint <changed files>                            # from the package folder
npx prettier --write <changed files>                  # format only the files you changed

./scripts/secret-scan.sh --staged                     # what the pre-commit hook runs
```

API changes are verified with the [Bruno](https://www.usebruno.com/) collection in `tests/bruno/`.

If the secret scan flags a false positive, end the flagged line with a `gitleaks:allow` comment. Never use it, `--no-verify` or `.gitleaksignore` to get a real secret past the scan; remove the secret instead.

## Code style

- Clear names and small functions carry the meaning. Add a comment only for an `IMPORTANT NOTE:` about an external constraint, a race condition or a required workaround.
- Keep public doc comments (JSDoc, XML docs) short, and leave internal functions undocumented.
- Area conventions live in `apis/WorcBackend-legacy/AGENTS.md` and `clients/web-apps/AGENTS.md`.

## Pull request process

1. Fork the repo and create a branch named `<type>/<short-description>`, for example `feat/queue-retry` or `fix/vault-lookup`.
2. Keep PRs focused, one change per PR.
3. Add or update tests and docs.
4. Run the checks above.
5. Write each commit message as `<type>(<scope>): <subject> #<issue>`:
   - `type` is one of `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`.
   - `scope` is the area in kebab-case, for example `workspace`, `vault-credentials` or `llmpipeline`.
   - `subject` is imperative and lowercase, with no trailing period. Leave out ` #<issue>` when there is no issue.
   - Put any further changes in the body under `Other changes:` as `- ` bullets.
6. Open the PR against `main` and fill in the template. Link the issue with `Closes #123`. A maintainer tests it on our staging environment before it merges.
7. On your first PR, the CLA bot asks you to sign the [Contributor License Agreement](CLA.md): reply on the PR with `I have read the CLA Document and I hereby sign the CLA`. Comment `recheck` if the check does not update.

A maintainer will review within 3 working days. We may ask for changes. That's normal, not a rejection.

## Community vs. Enterprise code

Enterprise features live in the same repository, in files marked `.ee`: `Name.ee.ts`, `Name.ee.tsx`, `name.ee.js` and `Name.ee.cs`, and `name_ee.py` for Python, where a dot would break the import. These Enterprise Files are covered by the Avintra Enterprise License, not the Community License, and need a license key as set out there.

- Contributions to Community files stay in the Community Edition.
- A shared file can hold a one-line edition check; a whole Enterprise-only method goes into an `.ee` companion file.
- Please don't open pull requests that change Enterprise Files unless a maintainer has asked for one.
- Pull requests that remove, bypass or weaken the license key check will be closed.

If you're unsure whether a feature belongs in Community or Enterprise, ask in Discussions before you start.

## Getting help

Ask in [GitHub Discussions](https://github.com/aventisia/avintra/discussions).
