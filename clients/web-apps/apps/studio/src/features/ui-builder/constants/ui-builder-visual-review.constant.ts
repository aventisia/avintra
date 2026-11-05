/** One defect reported by the visual review pass. */
export type UiBuilderVisualIssue = {
  severity: "high" | "medium" | "low";
  area: string;
  problem: string;
  fix: string;
};

/** Result of the visual review pass. */
export type UiBuilderVisualReview = {
  score: number;
  summary: string;
  issues: UiBuilderVisualIssue[];
};

/** Platform skill holding the visual review rubric. */
export const UI_BUILDER_VISUAL_REVIEW_SKILL_NAME = "ui-visual-review";

/** Output cap for the visual review call. */
export const UI_BUILDER_VISUAL_REVIEW_OUTPUT_TOKENS = 1500;

/** System prompt for the visual review pass. */
export const UI_BUILDER_VISUAL_REVIEW_SYSTEM_PROMPT = [
  "You are a meticulous product designer reviewing screenshots of an internal business interface built with React, Tailwind, and a component kit.",
  "Follow the visual review rubric and return only the JSON it describes.",
].join("\n");

/** Builds the visual review request text that accompanies the screenshots. */
export const buildUiBuilderVisualReviewContent = (prompt: string, outline: string) =>
  [
    "The first image is the page at 1280px wide; the second is the same page at 390px wide.",
    "The user asked for:",
    prompt.slice(0, 1500),
    "",
    "Page outline:",
    outline || "(outline unavailable)",
  ].join("\n");

const SEVERITIES = ["high", "medium", "low"] as const;

/** Normalizes the visual review output, or returns null when it is unusable. */
export const normalizeUiBuilderVisualReview = (value: unknown): UiBuilderVisualReview | null => {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const text = (input: unknown) => (typeof input === "string" ? input.trim() : "");
  const score = Number(raw.score);
  const issues = Array.isArray(raw.issues)
    ? raw.issues
        .map((entry) => {
          const issue = (entry ?? {}) as Record<string, unknown>;
          const severity = SEVERITIES.find((level) => level === issue.severity) ?? "low";
          return {
            severity,
            area: text(issue.area),
            problem: text(issue.problem),
            fix: text(issue.fix),
          };
        })
        .filter((issue) => issue.problem)
        .slice(0, 6)
    : [];
  if (!Number.isFinite(score) && issues.length === 0) return null;

  return {
    score: Number.isFinite(score) ? Math.max(1, Math.min(10, Math.round(score))) : 0,
    summary: text(raw.summary),
    issues,
  };
};

/** Formats a visual issue as a repair instruction. */
export const describeUiBuilderVisualIssue = (issue: UiBuilderVisualIssue) =>
  `${issue.area ? `${issue.area}: ` : ""}${issue.problem}${issue.fix ? ` Fix: ${issue.fix}` : ""}`;
