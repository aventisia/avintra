import { type RunnerProgress as RunnerProgressType } from "../hooks/useRunnerProvisioning";

interface RunnerProgressProps {
  /** Heading shown on the left of the status row. */
  heading: string;
  /** Current progress state from the runner provisioning hook. */
  progress: RunnerProgressType | null;
  /** Optional error message. */
  error?: string | null;
}

const STATUS_LABELS: Record<RunnerProgressType["status"], string> = {
  CHECKING: "Checking...",
  DOWNLOADING: "Downloading...",
  EXTRACTING: "Installing...",
  DONE: "Finishing up...",
  ERROR: "Failed",
};

/**
 * Minimal, title-less progress view for the Desktop Runner install/update flow.
 * Shows a long progress bar with a status label and byte count that remain
 * visible across all phases.
 */
export function RunnerProgress({ heading, progress, error }: RunnerProgressProps) {
  const status = progress?.status ?? "CHECKING";
  const percentage = progress?.percentage ?? 0;
  const downloaded = progress?.downloaded ?? 0;
  const total = progress?.total;

  const statusLabel = error ? "Failed" : STATUS_LABELS[status];

  return (
    <main className="flex flex-1 items-center justify-center bg-background p-6">
      <div className="w-full max-w-xl">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{heading}</span>
          <span className="text-muted-foreground">{statusLabel}</span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-50">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage.toFixed(0)}%</span>
          <span>{`${formatBytes(downloaded)} / ${total ? formatBytes(total) : "..."}`}</span>
        </div>
      </div>
    </main>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
