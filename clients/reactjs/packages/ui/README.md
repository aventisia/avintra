# @worc/ui

Reusable React UI components for the Worc platform monorepo.

## Features

- Internal-only package for shared UI components
- Built with React, Tailwind CSS, and TypeScript
- No build step required—import TS/TSX directly
- Consistent design and utility functions

## Usage

Import components in your app:

```tsx
import { Button } from "@worc/ui/buttons";
import { SubmitButton } from "@worc/ui/buttons";
import { LoadingSpinner } from "@worc/ui/components";
```

## Project Structure

- `src/components/` — Main UI components
  - `buttons/` — Button variants and related components
  - `LoadingSpinner.tsx` — Loading spinner component
- `src/lib/` — Utility functions (e.g., `cn`)

## Development

- Use relative imports or the `@/ui/*` alias within this package
- Use `@worc/ui` (and subpaths) to import from apps
- Tailwind and PostCSS configs are present for local development
- Dependencies like `clsx`, `tailwind-merge`, and `class-variance-authority` etc are hoisted to the monorepo root

## Notes

- This package is not published externally and is intended for internal use only
- For new components, add them to `src/components/` or their respective folder and export via the appropriate `index.ts`
