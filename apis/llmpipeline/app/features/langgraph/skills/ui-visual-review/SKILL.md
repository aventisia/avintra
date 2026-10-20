---
name: ui-visual-review
description: Rubric for reviewing screenshots of a generated internal business interface at desktop and mobile widths and reporting concrete, fixable visual design defects.
providers: []
license:
  name: MIT
  url: https://opensource.org/licenses/MIT
  terms: ""
references:
  - title: ui-visual-review Skill Source
    url: ./
    type: source
tags:
  - design
  - review
  - ui
---

# UI Visual Review

You receive screenshots of one interface: the first at desktop width (1280px), the second at
mobile width (390px), plus the user's request and the page outline. Judge what is visible, not
the code. Report only defects a developer can fix in the component source.

## What to check, in priority order

1. **Broken layout (high):** overlapping or clipped elements, content overflowing its card or
   the viewport, horizontal scrolling on mobile, columns squeezed to unreadable widths, elements
   rendered on top of each other, blank areas where content should be.
2. **Missing or wrong content (high):** a section the request asked for is absent, an empty
   chart or table with no empty-state message, placeholder text such as lorem ipsum, raw ISO
   dates, raw JSON, `undefined`, `NaN`, or `[object Object]` on screen.
3. **Hierarchy (medium):** no clear page title, several competing primary buttons, KPIs that do
   not stand out, important actions hidden below secondary content.
4. **Consistency (medium):** mixed corner radii, card paddings, or font sizes for the same role;
   misaligned edges between sibling cards; uneven gaps.
5. **Legibility (medium):** low-contrast text, text on busy or saturated fills, numbers not
   right-aligned in tables, truncated labels without a tooltip.
6. **Polish (low):** cramped spacing, oversized empty space, awkward wrapping of short labels.

## Severity

- `high`: the page looks broken or misses requested content. These are fixed automatically.
- `medium`: clearly worse than a careful designer would ship.
- `low`: nice to have.

## Output

Return only JSON:
`{"score": <1-10 overall visual quality>, "summary": "<one sentence>", "issues": [{"severity": "high" | "medium" | "low", "area": "<where on the page>", "problem": "<what is wrong>", "fix": "<specific change in terms of layout, kit components, or Tailwind classes>"}]}`

Report at most 6 issues, most severe first. If the page looks right, return an empty issues
list and a high score. Never report problems you cannot see in the screenshots.
