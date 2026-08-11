import { type DownloadProgress, useAppUpdater } from "@avplatform/tauri-utils/hooks";
import { Button } from "@avplatform/ui/buttons";
import { useEffect, useState } from "react";

import { RunnerProgress } from "./RunnerProgress";
import { SetupCard } from "./SetupCard";

interface UpdateDesktopAppProps {
  /** Service domain/origin used to check for the desktop-app update. */
  domain: string;
  /** Called when the update is installed and the app is about to restart. */
  onInstall: () => void;
  /** Called when the user chooses to skip the update. */
  onSkip: () => void;
}

/**
 * Desktop-app self-update screen shown during initial setup.
 *
 * The hook expects a full domain (origin). The flow is:
 * 1. Check for update on mount (spinner).
 * 2. If no update is available, immediately call onSkip to continue.
 * 3. If an update is available, show the update card with Update Now / Skip.
 * 4. Update Now starts download directly (no confirmation step).
 * 5. Download + install streams progress through RunnerProgress.
 * 6. Installing uses a spinner fallback if no real progress is available.
 * 7. Errors show a unified UI with compact inline Retry / Continue anyway.
 */
export function UpdateDesktopApp({ domain, onInstall, onSkip }: UpdateDesktopAppProps) {
  const {
    checking,
    downloading,
    installing,
    updateInfo,
    progress,
    error,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    clearError,
  } = useAppUpdater(domain);

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    checkForUpdates()
      .then((result) => {
        if (!result.available) {
          onSkip();
        }
      })
      .catch(() => {
        // Failed checks are left on the error screen so the user can retry
        // or continue. The error state is surfaced by the hook.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (progress?.status === "INSTALLED") {
      onInstall();
    }
  }, [progress, onInstall]);

  const handleUpdate = async () => {
    setHasStarted(true);
    clearError();
    try {
      await downloadUpdate();
      await installUpdate();
    } catch {
      // Error surfaced via the hook.
    }
  };

  const handleRetry = () => {
    clearError();
    void handleUpdate();
  };

  const versionHeading = updateInfo?.version
    ? `Updating Desktop App v${updateInfo.version}...`
    : "Updating Desktop App...";

  // 1. Checking: spinner
  if (checking) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex items-center gap-3 text-foreground">
          <LoadingSpinner />
          <span className="text-base font-medium">Checking for updates...</span>
        </div>
      </div>
    );
  }

  // 2. Error: unified error UI with compact inline buttons
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <RunnerProgress
          heading={versionHeading}
          progress={null}
          error={error.message}
          onRetry={handleRetry}
          onContinueAnyway={onSkip}
        />
      </div>
    );
  }

  // 3. Download / install progress
  if (hasStarted || downloading || installing) {
    // Installing with no real progress → spinner fallback
    if (installing && (!progress || progress.status === "INSTALLING")) {
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex items-center gap-3 text-foreground">
            <LoadingSpinner />
            <span className="text-base font-medium">
              Updating Desktop App v{updateInfo?.version ?? "..."}...
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <RunnerProgress
          heading={versionHeading}
          progress={progress ? mapToRunnerProgress(progress) : null}
        />
      </div>
    );
  }

  // 4. Update available card (no confirmation step)
  return (
    <SetupCard
      title="Desktop App update available"
      subtitle="A newer version of the Avintra Desktop App is available. We recommend updating to the latest version for the best experience."
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-slate-50/60 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current version</span>
            <span className="font-medium text-foreground">
              {updateInfo?.current_version ? `v${updateInfo.current_version}` : "Unknown"}
            </span>
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Latest version</span>
            <span className="font-medium text-foreground">
              {updateInfo?.version ? `v${updateInfo.version}` : "Unknown"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button type="button" onClick={handleUpdate} className="w-full h-11 text-md">
            Update Now
          </Button>
          <Button type="button" variant="outline" onClick={onSkip} className="w-full h-11 text-md">
            Skip for now
          </Button>
        </div>
      </div>
    </SetupCard>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function mapToRunnerProgress(progress: DownloadProgress): {
  downloaded: number;
  total?: number;
  percentage: number;
  status: "CHECKING" | "DOWNLOADING" | "EXTRACTING" | "DONE" | "ERROR";
} {
  const statusMap: Record<string, "CHECKING" | "DOWNLOADING" | "EXTRACTING" | "DONE" | "ERROR"> = {
    PENDING: "DOWNLOADING",
    DOWNLOADING: "DOWNLOADING",
    DOWNLOADED: "DONE",
    INSTALLING: "EXTRACTING",
    INSTALLED: "DONE",
    ERROR: "ERROR",
  };

  return {
    downloaded: progress.downloaded,
    total: progress.total,
    percentage: progress.percentage,
    status: statusMap[progress.status] ?? "DOWNLOADING",
  };
}
