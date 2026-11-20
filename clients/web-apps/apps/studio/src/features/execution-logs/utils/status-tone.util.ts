import type { JobStatusTone } from "@avplatform/ui/constants";

/** Tone to text colour for Studio's run log surfaces; the tones come from `STATUS_DISPLAY`. */
export const STATUS_TONE_TEXT_CLASS: Record<JobStatusTone, string> = {
  ok: "text-ok",
  live: "text-live",
  warn: "text-warn",
  bad: "text-bad",
  neutral: "text-muted-foreground",
};
