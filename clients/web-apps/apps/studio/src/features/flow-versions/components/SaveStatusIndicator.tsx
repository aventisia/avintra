import { cn } from "@avplatform/ui/lib";
import { CheckIcon, CircleNotchIcon } from "@phosphor-icons/react";

import { type SaveStatus } from "../hooks/useUpdateCurrentAgent.hook";

const STATUS_TEXT: Record<SaveStatus, string> = { idle: "", saving: "Saving…", saved: "Saved" };

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  /** Shows the status text beside the icon; otherwise it is announced only. */
  showLabel?: boolean;
  className?: string;
}

/**
 * Inline save feedback: a spinner while saving that settles into a brief green check.
 */
export const SaveStatusIndicator = ({ status, showLabel, className }: SaveStatusIndicatorProps) => (
  <span
    role="status"
    className={cn(
      "inline-flex shrink-0 items-center gap-1 text-hint",
      status === "saved" ? "text-ok" : "text-muted-foreground",
      className,
    )}
  >
    {status === "saving" ? (
      <CircleNotchIcon
        aria-hidden="true"
        className="size-3.5 animate-spin motion-reduce:animate-none"
      />
    ) : null}
    {status === "saved" ? (
      <CheckIcon
        aria-hidden="true"
        weight="bold"
        className="size-3.5 duration-200 animate-in fade-in-0 zoom-in-50 motion-reduce:animate-none"
      />
    ) : null}
    <span className={showLabel ? undefined : "sr-only"}>{STATUS_TEXT[status]}</span>
  </span>
);
