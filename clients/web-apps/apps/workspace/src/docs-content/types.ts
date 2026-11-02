/**
 * Types for the in-app documentation content.
 *
 * Content is authored as standalone Markdown files (`.md`) inside
 * `src/docs-content/guides/` and registered in `registry.ts`. Each guide is
 * rendered with the existing `MarkdownViewer` component and can also link out
 * to the external docs site via `docsSiteUrl`.
 */

/** The main navigation sections of the Workspace app. */
export type HelpSection =
  | "build"
  | "configure"
  | "orchestrator"
  | "assist"
  | "tenant-admin"
  | "super-admin"
  | "global-admin";

/** Metadata describing a single help guide. */
export interface HelpGuide {
  /** Stable identifier used to open the guide from anywhere in the app. */
  id: string;
  /** Human-readable guide title (shown in lists, dialogs, headers). */
  title: string;
  /** One-to-two sentence summary shown in lists and onboarding pointers. */
  summary: string;
  /** Which sidebar section the guide belongs to. */
  section: HelpSection;
  /** Pages the guide explains; the help panel opens it on these routes and their sub-pages. */
  routes?: string[];
  /** Optional external link to the full docs site page (hybrid linking). */
  docsSiteUrl?: string;
  /** Optional list of related guide ids for cross-linking. */
  related?: string[];
}

/** A full help guide including its rendered Markdown body. */
export interface HelpGuideContent extends HelpGuide {
  /** Raw Markdown body of the guide. */
  content: string;
}
