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

Applied to every framework generation and fix pass. The build blocks a version when one of
these checks fails, so raise and fix the issues before finishing.

## Checklist

- **Images.** Every `<img>` needs a non-empty `alt` describing the image.
- **Buttons.** Every `<button>` needs a non-empty accessible name: visible text or an
  `aria-label`.
- **Form controls.** Every `<input>`, `<select>`, and `<textarea>` needs a matching
  `<label for>`/`id` pair or an `aria-label`.
- **Landmarks.** The page needs at least one of `header`, `main`, `nav`, or `footer`.
- **Keyboard order.** Never use a positive `tabindex`.
- **Focus.** Interactive controls keep a visible focus state, such as a focus-visible ring.
- **Contrast.** Use the design-system tokens so text and surfaces keep sufficient contrast.

## Reporting

Fix every issue in the same response and return the full component source again.
