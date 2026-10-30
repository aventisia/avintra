# Aventisia WORC Platform — Agent Guide

## Repo facts

- The active .NET backend is `apis/WorcBackend-legacy/`, not the `apis/WorcBackend/` that `README.md` describes.
- Feature PRs target `uat` (deploys to `avuat.aventisia.com`); `main` is production (`avweb1.aventisia.com`). The tracker is Gitea, not GitHub. Jenkins (root `Jenkinsfile`) is the only CI, and there are no pre-commit hooks.
- Local stack: from the checkout or worktree root, `dekit up`, then `dekit restart <service>` after a change, `dekit screen <service>` for output, `dekit down` to stop; `dekit.yaml` lists the services. Ports come from each service's env files, so a worktree made by `scripts/create-worktree.sh` runs on its own.
- Env files: `scripts/setup.sh` (or `.ps1`) copies each committed `.env.example` to the gitignored `.env.local` (`.env` for the web apps and `tests/bruno`). For the .NET APIs and llmpipeline (under `ENV=local`), `.env.local` overrides the OS environment, so templates keep secrets commented out.
- Builds: `dotnet build Avplatform.sln` covers the legacy APIs, shared libs, and RunnerApp (alone: `clients/RunnerApp/RunnerApp.slnx`). Web apps (`clients/web-apps`, npm workspaces + Turborepo) check with `npx turbo run typecheck --filter=<package>` and `npx eslint <changed files>` from the package, formatting only changed files with prettier; `npm run pregit` fails (no root ESLint config) after its prettier pass reformats unrelated files. Corsair (`apis/corsair`) installs with `npm ci --force`; read its `README.md` before changing the Workspace↔Corsair boundary.
- Checks: there is no xUnit/NUnit suite. Verify with the Bruno collection in `tests/bruno/`, `dotnet run --project shared/ExecutorLibrary.Tests`, or the Windows-only `dotnet run --project tests/NodeLibrary.WindowsInterop.Tests -- <n|A>` (one test or all).
- Desktop and Runner apps take the version of the latest `vX.Y.Z` git tag; `scripts/release-version.sh` (or `.ps1`) writes it into their manifests, and desktop publish scripts run it.
- `local-*` directories are gitignored scratch and context, not source.
- Agent definitions in `.claude/agents/` and `.opencode/agents/` share one body under tool-specific frontmatter; edit both together. Skills live only in `.claude/skills/`, which OpenCode also reads.

## Where conventions live

- Agent loop (orchestrator and its subagents): `AGENT-LOOP.md`
- Backend, including build and EF migration gotchas: `apis/WorcBackend-legacy/AGENTS.md`
- Frontend: `clients/web-apps/AGENTS.md`
- Full setup, Docker commands, custom HTTP headers: `README.md`

## EE file marking

Mark a source file `.ee` when only Commercial/Enterprise paths reach it; shared and Community-visible files keep plain names. Builds still include `.ee` files, so marking never changes behaviour.
- TypeScript/JavaScript: `Name.ee.ts`, `Name.ee.tsx`, `name.ee.js`. C#: `Name.ee.cs`, `partial`-class companions included, with no project edits. Python: `name_ee.py`, since a dot makes a module unimportable.
- Java and Rust (the Tauri shell) keep plain names because their filenames are load-bearing; mark commercial-only Java by package or comment.
- `index.ts` barrels and configuration or tooling files (framework configs, project/solution files, migrations shared by all editions, generated artifacts) keep their names.
- Move a whole commercial method into an `.ee` companion; an inline edition-gate one-liner stays in the shared file.

## Documentation and code style boundaries

- Precise names and decomposition carry the meaning. The only internal comments are `IMPORTANT NOTE:` warnings for external constraints, race conditions, or required hacks.
- Public JSDoc/XML and complex public-type docs stay short; internal functions stay undocumented.

## Lifecycle operations

`commit`, `create-issue`, `add-comment`, `create-pr`, `merge-pr`, and `close-issue` are user-invoked: run one only in a primary session with explicit authorization for that exact mutation, keeping its confirmations and the repository/login identity.
