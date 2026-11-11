# Frontend engineering conventions

## Scope

- Governs every app and package in `clients/web-apps` (`apps/*`, `packages/*`).
- `studio` still carries legacy patterns; adopt these conventions there incrementally.
- `desktop-app` runs both inside the Tauri shell (`src-tauri/`) and in a plain browser. Guard every Tauri `invoke()` call with a `__TAURI_INTERNALS__` check (as in `src/TauriAppFooter.tsx` and `src/lib/setupStore.ts`) so browser use never crashes. Provision the runner (`check_runner_app`, `download_runner_app`) when the desktop app opens; launch it only during flow execution.
- Shared UI comes from `@avplatform/*` workspace packages; confirm an export exists in the package before importing it.
- Shared `packages/*` are source-only TypeScript with no build step; apps import the raw TS through Vite.

## Incremental adoption

- Most existing code predates these rules (legacy `-apis.ts` and `-dto.ts` filenames, `interface` outside DTOs). Apply the rules to files you create or touch, keep the rest of the change scope consistent, and leave untouched files alone.
- New files follow these rules even when neighbouring files use the legacy form.
- Touched modules that keep a pre-existing name because renaming would churn every importer: `dynamic-config-panel/constants/model-providers.ts`, `workspace/.../knowledge-base/constants/model-providers.ts`, `voice-client/src/lib/voice-events.ts`, `voice-client/src/lib/voice-session-client.ts`.

## Feature layout

- Features live in `src/features/<feature>/` with `apis/`, `dtos/`, `hooks/`, `stores/`, `constants/`, `types/`, `enums/`, `utils/`, and `components/` subfolders as needed.
- Keep feature utilities in the feature's `utils/` folder; move one to a shared/package `utils/` only when multiple features reuse it.
- Before modifying a feature, read its `README.md` when one exists; it records domain boundaries and exceptions.
- Import from outside a feature through its `index.ts`. Inside the feature, import relatively when that avoids circular references. Keep `index.ts` to explicit named exports.

## File naming

Every non-component feature module uses a dot suffix. Components, `index.ts` barrels, and framework/tool-required config or declaration files keep their required names.

| Kind      | Suffix         | Example                            |
| --------- | -------------- | ---------------------------------- |
| Store     | `.store.ts`    | `jobs-table.store.ts`              |
| Hook      | `.hook.ts`     | `useFetchJobs.hook.ts`             |
| DTO       | `.dto.ts`      | `create-job.dto.ts`                |
| Constant  | `.constant.ts` | `common-display-names.constant.ts` |
| API       | `.apis.ts`     | `jobs-table.apis.ts`               |
| Enum      | `.enum.ts`     | `job-status.enum.ts`               |
| Utility   | `.util.ts`     | `date-range-selector.util.ts`      |
| Type      | `.type.ts`     | `machine-filter.type.ts`           |
| Component | none           | `JobsTable.tsx`                    |

## API files (`.apis.ts`)

- Mirror the backend controller: same actions, same order, same request/response contracts. Convert C# PascalCase names to lower camelCase.
- Map CRUD actions as follows; convert every other action name to lower camelCase without renaming its meaning or inventing a CRUD alias.

  | Backend action             | Frontend method            |
  | -------------------------- | -------------------------- |
  | `Get[Entities]`            | `get[Entities]`            |
  | `Get[Entity]`              | `get[Entity]`              |
  | `Insert[Entity]`           | `create[Entity]`           |
  | `Update[Entity]`           | `update[Entity]`           |
  | `Delete[Entity]`           | `delete[Entity]`           |
  | `DeleteMultiple[Entities]` | `deleteMultiple[Entities]` |

- Type responses as `IHttpResponse<T>` from `@avplatform/ui/dtos`. It mirrors the backend `ServiceResponse<T>`: `{ data, statusCode, message }`. Success is signalled by HTTP status (axios rejects non-2xx), so read `data` and `message` from resolved responses and handle failures in the rejection path.
- Make requests through `axiosInstance` from `@avplatform/ui/lib`, which handles auth refresh.
- Give every exported API method a one-sentence JSDoc derived from the backend `/// <summary>`.

## DTOs and type mapping

- Create DTOs as `interface`s in `dtos/` folders, one backend C# DTO per interface. Use `type` aliases for every other data shape.
- Preserve the backend DTO's fields, property order, requiredness, and type meaning; convert PascalCase properties to camelCase.
- Match enum names and members to the backend definitions.
- Convert C# types as:
  - `Guid`, `string` → `string`
  - `int`, `long`, `float`, `double`, `decimal` → `number`
  - `DateTime` → `string` (ISO 8601)
  - `bool` → `boolean`
  - `List<T>`, `IEnumerable<T>`, `T[]` → `T[]`
- Name parameters as camelCase variable + PascalCase type: `createMachineDto: CreateMachineDto`.

## Validation

- Translate backend validation attributes (`[StringLength]`, `[RequiredGuid]`, `required`) into form validation. Use Zod in apps that depend on it; elsewhere, use reusable validation helpers.

## Components and hooks

- Keep API fetching and mutations in custom hooks; components only render.
- Break complex logic into small, precisely named blocks.

## Forms and display

- Give form inputs short, realistic placeholders (email → `example@company.com`).
- Reuse one form for create and edit.
- When an entity has `Id` and `IsDisabled`, hide them on create and show them on edit.
- For an optional `IpAddress`, default to `0.0.0.0` and label the field `(optional)`.
- In display views, show `-` for empty dates and the sentinel date `01 Jan 0001`.
- In display views, show `-` for IP `0.0.0.0`; mask any other IP with `maskIP` from `@avplatform/ui`.

## Review checklist

Apply every item to each touched file:

1. `.apis.ts` method order and names match the backend controller per the CRUD mapping.
2. Exported API methods have one-sentence JSDoc; internal functions are undocumented.
3. Responses are typed `IHttpResponse<T>` and handled per the API files section.
4. DTO property order, casing, requiredness, and types match the backend.
5. Form validation matches backend constraints.
6. API logic lives in hooks, separate from UI.
7. Non-trivial logic is decomposed and self-documenting; the only inline comments are `IMPORTANT NOTE:`s.
8. New or touched non-component modules use the dot suffixes.
9. `interface` appears only in `.dto.ts` files; `type` everywhere else.

## Artifact contents

These formats apply inside reports and explicitly requested standalone output; agent returns follow `AGENT-LOOP.md`.

- Code review: findings first, ordered by severity, each with file and line; then open questions or assumptions; then a concise change summary.
- Code generation: complete, compilable code for every affected file, with backend/frontend naming and ordering kept in sync.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
