# Web apps

- Run one app: `npx turbo run dev --filter=<accounts|workspace|studio|atlas>`.
- Run `npm run pregit` (format + eslint --fix + tsc -b) before handing work back.
- Shared `packages/*` are source-only TypeScript with no build step; apps import the raw TS through Vite.
- `desktop-app` can run in a plain browser; Tauri `invoke()` calls must stay guarded so they don't crash outside the Tauri shell.
- **API conventions** (detail in `AGENTS.md` here): API files use `.apis.ts`, DTOs use `.dto.ts` and must be `interface`, not `type`; methods mirror backend controller order; responses are typed `IHttpResponse<T>` (`{ data, statusCode, message }`, mirroring `ServiceResponse<T>`). Prefer Zod for validation.
