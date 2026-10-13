# Frontend engineering conventions

## Scope

- This file scopes conventions to descendants of `frontend/`; it does not automatically govern `clients/web-apps`. That monorepo and its apps/packages are absent here; verify deployment paths before relocating instructions or applying package-specific rules.
- Deployment convention: `studio` (`apps/studio`) inherits legacy conventions; adopt these incrementally. The intended shared UI package is `@avplatform/ui`, not `@aventisia/ui`; verify installed dependencies before importing.
- Deployment convention: `desktop-app` (`apps/desktop-app`), ported from `clients/desktop-app`, keeps `src-tauri/` and uses `@avplatform/ui` + `@avplatform/tauri-utils`. Verify these paths/contracts when present. Preserve Tauri guards around `invoke()` (`launch_runner_app`, `get_user_metadata`) for browser use; provision the runner when opening the desktop app, and only launch it during flow execution.

## Application boundaries

- Apply these conventions only within the assigned role and scope; read-only reviewers report defects and do not generate repository edits.
- Keep method naming, method order, request/response contracts, and DTO structure aligned with backend source.
- Prefer small, targeted changes that preserve project architecture, existing conventions, and behavior.

## Hard Constraints

- Preserve the exact action order and semantic contract from ASP.NET Controller methods in `.apis.ts` files. Convert C# PascalCase names to TypeScript lower camelCase and apply the CRUD mapping below; do not require cross-language spelling to be identical.
- Use standard CRUD naming patterns in API files:
  - `get[Entities]`
  - `get[Entity]`
  - `create[Entity]`
  - `update[Entity]`
  - `delete[Entity]`
  - `deleteMultiple[Entities]`
- Map backend CRUD actions as follows: `Get[Entities]` → `get[Entities]`, `Get[Entity]` → `get[Entity]`, `Insert[Entity]` → `create[Entity]`, `Update[Entity]` → `update[Entity]`, `Delete[Entity]` → `delete[Entity]`, and `DeleteMultiple[Entities]` → `deleteMultiple[Entities]`.
- For non-CRUD controller actions, convert the backend method name to lower camelCase without changing its meaning or order; do not invent a CRUD alias.
- Convert backend XML docs (`/// <summary>`) into TypeScript JSDoc (`/** ... */`) for every exported API method, keeping each summary to one short sentence.
- For APIs verified to use `ServiceResponse<T>`, preserve the wrapper instead of treating the payload as raw data; verify each backend contract first.

## API Integration Rules (`.apis.ts`)

- Keep frontend API methods in the same order as backend controller actions.
- Parse and return response envelopes consistently as:
  - `success` boolean status flag
  - `message` text
  - typed `data` payload
- Centralize envelope handling where possible so components consume stable typed results.
- If current project patterns conflict, follow existing repository conventions and document the mismatch.

## DTOs and Type Mapping

- Ensure DTO interfaces preserve the fields, requiredness, property order, and type meaning of their C# backend equivalents. TypeScript property names use the camelCase mapping below.
- Ensure enum names and their members match backend definitions.
- Create TypeScript interfaces in `dtos` folders that mirror backend C# DTOs.
- Keep property order identical to the backend DTO source order.
- Convert C# to TypeScript types strictly:
  - `Guid` -> `string`
  - `int`, `float`, `decimal`, `double` -> `number`
  - `DateTime` -> `string` (ISO 8601)
  - `bool` -> `boolean`
- Convert C# `PascalCase` DTO properties to `camelCase` for TypeScript interfaces while preserving the corresponding backend contract.
- Use parameter naming pattern: `camelCase` variable + `PascalCase` type (example: `createMachineDto: CreateMachineDto`).
- Use `interface` only for `.dto.ts` files.
- For all other TypeScript data shapes, use `type` aliases instead of `interface`.

## File Naming Conventions

- Every non-component feature source module must use a suffix-based filename convention.
- Components, feature barrel files named `index.ts`, and framework/tool-required configuration or declaration files are exceptions and should keep their required names.
- Required suffixes:
  - Store files: `.store.ts`
  - Hook files: `.hook.ts`
  - DTO files: `.dto.ts`
  - Constant files: `.constant.ts`
  - API files: `.apis.ts`
  - Enum files: `.enum.ts`
  - Utility files: `.util.ts`
  - Type files: `.type.ts`

## Example Filenames

- Store: `jobs-table.store.ts`
- Hook: `useFetchJobs.hook.ts`
- DTO: `create-job.dto.ts`
- Constant: `common-display-names.constant.ts`
- API: `jobs-table.apis.ts`
- Enum: `job-status.enum.ts`
- Utility: `date-range-selector.util.ts`
- Type: `machine-filter.type.ts`
- Component (no enforced suffix): `JobsTable.tsx`

## Incremental Adoption Policy

- Do not mass-rename or rewrite the entire codebase in one go.
- Apply naming and `interface`/`type` rules incrementally whenever reviewing, fixing, or refactoring touched files.
- For mixed legacy areas, prioritize consistency within the current change scope and avoid unrelated churn.

## Documentation and Comments

- Enforce the root `AGENTS.md` "Documentation and Code Style Boundaries" rules in all frontend code.
- Document only exported/public APIs and complex type definitions with short JSDoc; never document internal functions or variables.
- Do not add inline comments that restate code; use precise names and small components instead.
- The only permitted inline comments are `IMPORTANT NOTE:` warnings about external constraints, race conditions, or required hacks.
- Before modifying a feature, read that feature's local `README.md` when it exists; it records domain boundaries and exceptions.

## Feature Index Import Policy

- Use the feature `index.ts` for imports coming from outside the feature.
- Inside the same feature, allow direct relative imports when needed to avoid circular references.
- Keep `index.ts` explicit with named exports only, and avoid wildcard re-exports if the feature is complex.

## Validation Mapping

- Translate backend validation attributes into frontend form validation.
- Prefer Zod as the default validation stack.
- If no validation framework is present, implement clear inline React validation with reusable helpers.

## Component and Hook Structure

- Separate UI rendering from API fetching/mutation logic.
- Prefer custom hooks for data access and mutations.
- Break complex logic into small isolated blocks.
- Make non-trivial logic scannable through precise naming and decomposition, not inline comments.

## Feature Utilities

- If a utility function is required for a feature, keep it inside that feature's `utils/` folder.
- Name the file to match its purpose and use the `.util.ts` suffix (for example, `decode-prefilled-option.util.ts`).
- Only place utilities in shared/package-level `utils/` folders when they are genuinely reused across multiple features.

## Form and Display Rules

- Keep feature utility functions in that feature's `utils` folder whenever possible.
- Add short, realistic placeholders for form inputs (for example, email -> `example@company.com`).
- Reuse one form for create and edit flows when possible.
- If an entity has `Id` and `IsDisabled`, hide them on create and show them on edit.
- For optional `IpAddress`: default to `0.0.0.0`, and label the field with `(optional)`.
- In display views, show `-` for optional/empty dates and for sentinel date `01 Jan 0001`.
- In display views, show `-` for IP `0.0.0.0`; otherwise mask via `maskIP` from `@avplatform/ui`.

## Review Checklist

1. Verify `.apis.ts` method order and CRUD/non-CRUD name mapping match backend controllers.
2. Verify CRUD naming patterns are consistent.
3. Verify every exported API method has short JSDoc derived from backend summaries where available, and internal functions are undocumented.
4. Verify `ServiceResponse<T>` envelope handling is correct and typed.
5. Verify DTO interface property order, casing, and type mappings.
6. Verify validation parity with backend constraints.
7. Verify API logic is separated from UI, ideally via hooks.
8. Verify non-trivial logic is decomposed and self-documenting, with no implementation comments.
9. Verify non-component feature source modules follow suffix naming conventions, honoring the explicit `index.ts` and tool-required-file exceptions.
10. Verify `interface` is used only in `.dto.ts` files and `type` is used elsewhere.
11. Verify the only inline comments are `IMPORTANT NOTE:` warnings about external constraints, race conditions, or required hacks.

## Artifact contents

- The root shared handoff controls agent returns; these formats describe report contents or explicitly requested standalone code output, not additional role authority.

- For code review:
  - Findings first, ordered by severity, each with file and line references.
  - Then open questions or assumptions.
  - Then a concise change summary.
- For code generation:
  - Produce complete, compilable snippets for all affected files.
  - Keep backend/ frontend naming and ordering synchronized.
  - Include documentation only on exported/public boundaries; never add implementation comments.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
