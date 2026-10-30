/** The navigation section a help guide belongs to. */
export type HelpSection = "global-admin";

/** Metadata describing a single help guide. */
export type HelpGuide = {
  /** Stable identifier used to open the guide from anywhere in the app. */
  id: string;
  /** Human-readable guide title (shown in lists, dialogs, headers). */
  title: string;
  /** One-to-two sentence summary shown in lists and onboarding pointers. */
  summary: string;
  /** Which section the guide belongs to. */
  section: HelpSection;
  /** Optional external link to the full docs site page (hybrid linking). */
  docsSiteUrl?: string;
  /** Optional list of related guide ids for cross-linking. */
  related?: string[];
};

/** A full help guide including its rendered Markdown body. */
export type HelpGuideContent = HelpGuide & {
  /** Raw Markdown body of the guide. */
  content: string;
};
