---
name: ui-design-system
description: Design doctrine for every generated interface or HTML page, from internal tools and dashboards to customer-facing forms, templates, and landing pages, covering hierarchy, layout, spacing, color and theme tokens, typography, component choice, states, and copy.
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

Applies to every generated interface: React pages built on the UI builder's runtime kit, and
self-contained HTML pages such as forms, templates, and dashboards created in chat. It says how to
compose a page that looks deliberately designed rather than assembled. The kit names below
(`UI`, `Charts`, `Icons`) apply when the system prompt provides the runtime kit; without it, follow
"Self-contained HTML pages" at the end.

## Who the pages are for

- Work screens (queues, approvals, dashboards) serve operators and managers who use them every
  day. Optimize for scanning, comparison, and fast repeated actions. No hero banners, stock
  taglines, or decorative gradients on work screens.
- Customer-facing pages (feedback forms, surveys, sign-ups, templates) serve people who see the
  page once. Optimize for clarity and trust: a short intro saying why the page exists and how long
  it takes, one focused column, generous spacing, and a single clear call to action.

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

## Self-contained HTML pages

When there is no runtime kit, deliver one HTML document with all CSS in an inline `<style>` and
any behavior in inline `<script>` blocks of plain JavaScript. Never write React, JSX, TypeScript, or
anything that needs a build step. Load a library only when it earns its place, only from
cdn.jsdelivr.net, unpkg.com, or cdnjs.cloudflare.com, and always with an exact version; load fonts
only from Google Fonts. Use inline SVG or `data:` URIs instead of external images. The preview
blocks network requests and form submission, so never call `fetch` or post a form to a server.

- Define the theme as CSS custom properties on `:root` (`--background`, `--foreground`, `--card`,
  `--muted`, `--muted-foreground`, `--primary`, `--primary-foreground`, `--border`, `--success`,
  `--warning`, `--destructive`, `--radius`) and redefine them under
  `@media (prefers-color-scheme: dark)`. Style everything through the variables.
- Use a system font stack, a type scale of at most four sizes, and a spacing scale in multiples of
  4px. Constrain reading width (`max-width` around 40rem for forms, wider for dashboards) and make
  the layout work at 360px wide with no horizontal scroll.
- Use semantic structure: `header`, `main`, `section`, `form`, `fieldset`/`legend` for grouped
  questions, `<label for>` on every control, and `<button>` for every action.
- Give controls visible focus styles, a 44px minimum touch target, and hover and disabled states.
  Rating scales are radio groups styled with `:checked`, not bare clickable icons.
- Prefer CSS for state that CSS can express: `:checked` and `:has()` for selection, `:focus-within`
  for active groups, `<details>` for disclosure, and `:user-invalid` for validation hints.
- Use script for what CSS cannot do. A form handles `submit` with `preventDefault()`, validates,
  moves focus to the first invalid field, and replaces itself with a confirmation state that
  summarizes what was sent, announced through an `aria-live` region. The page must still render
  and read correctly before any script runs.
