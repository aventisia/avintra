---
name: ui-design-system
description: Design doctrine for UI builder interfaces built on the runtime kit, covering hierarchy, density, layout, theme tokens, component choice, states, and copy for internal business tools.
providers: []
license:
  name: MIT
  url: https://opensource.org/licenses/MIT
  terms: ""
references:
  - title: UI Design System Skill Source
    url: ./
    type: source
tags:
  - design
  - ui
---

# UI Design System

Applies to every React (framework) generation, edit, and repair pass of the custom UI builder.
The system prompt carries the runtime kit API (`UI`, `Charts`, `Icons`); this skill says how to
compose it into an interface that looks deliberately designed rather than assembled.

## Who the pages are for

Internal operators, reviewers, and managers who use the page every day: claims handlers,
approvers, operations leads. Optimize for scanning, comparison, and fast repeated actions over
marketing polish. No hero banners, stock taglines, or decorative gradients on work screens.

## Composition

- Start from `UI.Page` (or `UI.AppShell` when the request implies several views), then
  `UI.PageHeader` with a specific title, one-line description, and the page's primary action.
- Order sections by decision value: KPIs first, then the trend or breakdown that explains
  them, then the actionable list. Each `UI.Section` or `UI.Card` has one job.
- Use a 12-column mental grid: `grid gap-4 lg:grid-cols-3` with a `lg:col-span-2` chart beside a
  narrow breakdown is the default dashboard row. Stack everything on small screens.
- Keep consistent rhythm: `space-y-6` between sections, `gap-4` inside grids, card padding from
  the kit. Do not mix ad-hoc margins.
- Put filters where they act: page-wide filters in the header actions, table filters in the
  DataTable `toolbar`.

## Component choice

- Tables of records → `UI.DataTable` (never a hand-built `<table>`). Status columns use
  `UI.StatusBadge`; money and counts are right-aligned with `UI.format`.
- Record details → `UI.Sheet` from a row click; confirmations and short forms → `UI.Dialog`.
- KPIs → `UI.Stat` inside `UI.StatGrid`, with `delta`, `icon`, and `formula` when known.
- Charts → `Charts.*` only; one idea per chart, titled with what it answers.
- Option pickers: up to 4 options → `UI.Segmented`; more → `UI.Select`; on/off → `UI.Switch`.
- Icons → `Icons.<LucideName>` or the components' `icon="Name"` prop. Never draw SVG icons.

## Theme and color

- Color comes from the theme tokens: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`,
  `text-muted-foreground`, `bg-primary`, `text-primary`, `border-border`, and the status tokens
  `text-success`, `text-warning`, `text-destructive`, `text-info`. Use opacity modifiers
  (`bg-primary/10`) for tints. Avoid raw palette colors (`bg-indigo-600`) on themed surfaces so the
  project theme and dark mode apply.
- One primary action per view. Destructive actions use `variant="destructive"` and confirm.
- Color is never the only signal: pair status colors with text or icons.

## Typography and numbers

- One h1 (from `UI.PageHeader`), section titles as h2, card titles as h3.
- Body text `text-sm`; secondary text `text-muted-foreground`; at most three sizes per block.
- Numbers use `tabular-nums` and `UI.format` (currency, compact, percent, dates, relative time).
  Never show raw ISO dates, raw ids as primary labels, or unformatted floats.

## States

Every data-driven region shows loading (kit `loading` props or `UI.Skeleton`), empty
(`UI.EmptyState` with a next step), and error (`UI.Alert tone="danger"` or DataTable `error` with
`onRetry`). Actions show progress (`loading` on the button) and outcome (`UI.toast`).

## Copy

Real, domain-specific copy in sentence case: "Approve claim", not "Submit"; "No claims waiting
for review", not "No data". No lorem ipsum, no placeholder names like "John Doe" when realistic
names fit, no exclamation marks.

## Tailwind

Any standard Tailwind v4 utility works, including arbitrary values when needed. The build
compiles exactly the classes the source uses; a class that is not a real utility renders
unstyled and is reported back, so do not invent class names.
