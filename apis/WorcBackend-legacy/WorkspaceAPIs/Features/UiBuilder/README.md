# UI Builder

Lets a user turn a plain-language prompt into a custom web page and keep every attempt.

## What it stores

- A **project** is the named entry the user creates from the workspace UI Builder table
  (a name plus an optional description). Projects are scoped to a tenant and a space,
  and can be made visible tenant-wide.
- A **version** is one full HTML document produced by a prompt. Versions are append-only:
  each new generation adds a row with the next version number for its project, and the
  newest version is the one the builder shows.

## Rules that are easy to get wrong

- **Restore never rewrites history.** Restoring an older version creates a *new* version
  that copies that document and becomes the current head.
- **Version numbers are per project.** The next number is calculated inside one database
  transaction so two near-simultaneous prompts do not collide.
- **Deleting a project deletes its versions** (cascade).
- **Attribution.** Every generation records `ref_type = "UiBuilder"`,
  `action = "UiBuilderGeneration"`, and `ref_id = <projectId>` for credit reporting.

## Boundaries (v1)

No sharing, no archive, no publish flow, and no server-side HTML sanitizer. The generated
page is only ever rendered inside a sandboxed iframe.
