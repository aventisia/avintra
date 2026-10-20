---
name: ui-a11y-review
description: Review a generated interface for accessibility, covering image alt text, control labels, headings and landmarks, focus states, and keyboard order.
providers: []
license:
  name: MIT
  url: https://opensource.org/licenses/MIT
  terms: ""
references:
  - title: UI Accessibility Review Skill Source
    url: ./
    type: source
tags:
  - accessibility
  - review
---

# UI Accessibility Review

Applied to every framework generation and repair pass. The build renders the page in a sandbox and
blocks a version when one of these checks fails, so get them right the first time.

## Checklist

- **Images.** Every `<img>` needs a non-empty `alt` describing the image.
- **Buttons.** Every button needs an accessible name: visible text, or `aria-label` on icon-only
  buttons (`<UI.Button size="icon" icon="Trash2" aria-label="Delete claim" />`).
- **Form controls.** Use the kit's form components, which render the label for you. A raw
  `<input>`, `<select>`, or `<textarea>` needs a `<label htmlFor>`/`id` pair or an `aria-label`.
- **Landmarks.** The page needs a `main` or `header` landmark; `UI.AppShell` and `UI.Page` inside
  a `<main>` provide them.
- **Headings.** Exactly one h1 (`UI.PageHeader`), then h2/h3 in order without skipping levels.
- **Keyboard.** Never use a positive `tabIndex`. Anything clickable is a button or link; clickable
  table rows use DataTable `onRowClick`, which adds keyboard support.
- **Focus.** Keep the kit's visible focus rings; never remove outlines without a replacement.
- **Contrast.** Use theme tokens for text on surfaces; never put `text-muted-foreground` on
  colored fills.
- **Charts.** Give each chart a title in its card and an `ariaLabel` when the title is not
  descriptive; the kit adds a screen-reader data table.

## Reporting

Fix every issue in the same response.
