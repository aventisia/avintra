---
name: ui-design-system
description: Ground a generated interface in the platform design system, covering the token palette, type scale, spacing, radii, component states, responsive layout, and real copy.
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

Guides the custom UI builder toward a composed, on-brand interface instead of a plain
document. It applies to every framework generation and fix pass.

## Output contract

- Return one React function component: `export default function <Name>() { ... }`.
- No import or export-from statements, no `require`, and no dynamic imports. React and
  its hooks are available on the `React` namespace (`React.useState`, `React.useMemo`).
- Use `className` with Tailwind utility classes only, drawn from the families below.
- No external references: no URLs, no `<link>`, no `@import`, no network images, and no
  parent-page access.

## Token doctrine

- Primary `rgb(79, 70, 229)`, secondary `rgb(30, 27, 75)`, white background, near-black
  slate foreground, light slate muted surfaces, and light slate borders.
- Radius: `0.5rem` for cards and inputs, full for pills and avatars.
- Type: Inter throughout, with one clear scale per page. Do not mix more than three text
  sizes inside one block.
- Spacing: a 4px-based scale with consistent section padding.
- Contrast: text on a colored surface uses the matching foreground token.

## Component anatomy

- Cards: rounded corners, a 1px border, a small shadow, and generous internal padding.
- Buttons: one primary action per view, secondary or ghost for the rest, and visible hover
  and focus states.
- Forms: a visible label per field, helper text where useful, and an obvious submit.
- Lists and tables: clear row separation, aligned numbers, and readable empty states.

## Composition

- Start from a landmark structure: `header`, `main`, `footer`, and optionally `nav`.
- Lead with a strong hero or page title, then one-purpose sections.
- Use real, specific copy. Never use lorem ipsum or placeholder text.
- Provide the common states: default, hover, focus-visible, disabled, and empty.
- Stay responsive: stack columns on small screens and widen on `sm`/`md`/`lg`.

## Utility families

- Layout and display: `mx-auto`, `block`, `flex`, `grid`, `hidden`.
- Flex and grid: `flex-col`, `items-center`, `justify-between`, `gap-4`,
  `grid-cols-2`, `md:grid-cols-3`.
- Spacing: `p-4`, `px-6`, `py-8`, `mt-4`, `mb-6`, `space-y-4`.
- Typography: `text-sm`, `text-lg`, `text-3xl`, `font-semibold`, `leading-tight`.
- Color: `bg-primary`, `text-primary-foreground`, `bg-muted`, `text-muted-foreground`,
  `border-border`.
- Radius and shadow: `rounded-lg`, `rounded-full`, `shadow-sm`, `shadow-md`.
- States: `hover:bg-primary`, `transition-colors`, `focus-visible:ring-2`,
  `disabled:opacity-50`.

Never use a utility outside this set: the browser build validates every class name and
blocks a version that uses an unknown class.
