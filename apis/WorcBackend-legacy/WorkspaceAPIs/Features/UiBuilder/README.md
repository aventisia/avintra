# UI Builder

Lets a user turn a plain-language prompt into a custom web page and keep every attempt.

## What it stores

- A **project** is the named entry the user creates from the workspace UI Builder table
  (a name plus an optional description). Projects are scoped to a tenant and a space,
  and can be made visible tenant-wide.
- A **version** is one full HTML document produced by a prompt. Versions are append-only:
  each new generation adds a row with the next version number for its project, and the
  newest version is the one the builder shows.
- **Dual-format storage.** A version also records its output format: `html` (a single
  standalone document) or `framework` (React JSX). A `framework` version keeps the JSX
  **source** in a separate column, while the built standalone document is stored in the
  same HTML field every version uses. That field is always the page that gets rendered, so
  viewers do not need to know which format a version came from.

## Rules that are easy to get wrong

- **Insert guards.** An empty format is stored as `html`; an unknown format is rejected, and
  a `framework` version without a non-empty source is rejected. An `html` version always
  stores a null source.
- **Restore copies the format too.** Restoring a version copies its document, format, and
  source, so a restored version renders and behaves exactly like the original.
- **The new columns are additive and rollback safe.** Dropping them leaves `GeneratedHtml`
  renderable, because a framework version already stores a full standalone page there.
- **Restore never rewrites history.** Restoring an older version creates a *new* version
  that copies that document and becomes the current head.
- **Version numbers are per project.** The next number is calculated inside one database
  transaction so two near-simultaneous prompts do not collide.
- **Deleting a project deletes its versions** (cascade).
- **Attribution.** Every generation records `ref_type = "UiBuilder"`,
  `action = "UiBuilderGeneration"`, and `ref_id = <projectId>` for credit reporting.

## Boundaries (v1)

- There is no archive and no server-side HTML sanitizer. The generated page is only ever rendered
  inside a sandboxed iframe.
- **Publishing pins the current version.** The owner can publish a project once it has at least
  one version; publishing again pins the newer version. **Disable** hides a published project
  instead of un-publishing it.
- **Assigned users see the pinned version.** A published project is shared with individual users,
  or with all tenant members, and those users see the pinned version read-only in Assist under
  **User Interfaces**. Saving a new version changes nothing for them until the owner publishes
  again.
- **Disable hides and blocks.** Disabling removes the project from Published and blocks assigned
  access, while keeping the assignments; enabling restores both without re-assigning.
- **Assigned-view access is separate from tenant-wide builder sharing**, and viewing a published
  interface is free.
