import { LoadingSpinner } from "@avplatform/ui";
import { useState } from "react";

import { type RunnerProgress as RunnerProgressType } from "../hooks/useRunnerProvisioning";

interface RunnerProgressProps {
  /** Heading shown on the left of the status row. */
  heading: string;
  /** Current progress state from the runner provisioning hook. */
  progress: RunnerProgressType | null;
  /** Optional error message. */
  error?: string | null;
  /** Called when the user clicks the inline Retry button. */
  onRetry?: () => void;
  /** Called when the user clicks the inline Continue anyway button. */
  onContinueAnyway?: () => void;
}

const STATUS_LABELS: Record<RunnerProgressType["status"], string> = {
  CHECKING: "Checking...",
  DOWNLOADING: "Downloading...",
  EXTRACTING: "Installing...",
  DONE: "Finishing up...",
  ERROR: "Failed",
};

/**
 * Minimal, title-less progress view for the Runner App install/update flow.
 * Shows a long progress bar with a status label and byte count that remain
 * visible across all phases.
 *
 * Feedback states:
 * - The CHECKING phase (no progress yet) shows a spinner so the UI never looks
 *   frozen while the backend resolves.
 * - Clicking "Continue anyway" switches to a "Redirecting..." state with a
 *   spinner, because navigating to the login page can take a moment.
 */
export function RunnerProgress({
  heading,
  progress,
  error,
  onRetry,
  onContinueAnyway,
}: RunnerProgressProps) {
  const [redirecting, setRedirecting] = useState(false);

  const status = progress?.status ?? "CHECKING";
  const percentage = error ? 0 : (progress?.percentage ?? 0);
  const downloaded = error ? 0 : (progress?.downloaded ?? 0);
  const total = error ? undefined : progress?.total;

  const statusLabel = error ? "Failed" : STATUS_LABELS[status];
  const statusColor = error ? "text-destructive" : "text-muted-foreground";

  const handleContinueAnyway = () => {
    setRedirecting(true);
    onContinueAnyway?.();
  };

  // Redirecting to the login page can take a moment; show clear feedback.
  if (redirecting) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="flex items-center gap-3 text-foreground">
          <LoadingSpinner />
          <span className="text-base font-medium">Redirecting to login...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-background p-6">
      <div className="w-[85vw] max-w-xl">
        <div className="mb-4 flex items-center justify-between gap-4 text-sm">
          <span className="min-w-0 truncate font-medium text-foreground">{heading}</span>
          <span className={`shrink-0 text-right ${statusColor}`}>{statusLabel}</span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-200 ${error ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex w-12 items-center gap-1">
            {status === "CHECKING" && !error && <LoadingSpinner className="h-3.5 w-3.5" />}
            {percentage.toFixed(0)}%
          </span>
          <span className="text-right">
            {!error &&
              status !== "EXTRACTING" &&
              `${formatBytes(downloaded)} / ${total ? formatBytes(total) : "..."}`}
          </span>
        </div>

        {error && (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-left text-xs text-destructive">{error}</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={handleContinueAnyway}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Continue anyway
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
