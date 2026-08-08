import { Button } from "@avplatform/ui/buttons";
import Lucide from "@avplatform/ui/components/Lucide";
import { useEffect, useState } from "react";

import { useRunnerProvisioning } from "../hooks/useRunnerProvisioning";
import { RunnerProgress } from "./RunnerProgress";
import { SetupCard } from "./SetupCard";

interface UpdateRunnerAppProps {
  appBaseUrl: string;
  currentVersion: string;
  latestVersion: string;
  onSkip: () => void;
  onComplete: () => void;
}

/**
 * Update flow for the Desktop Runner.
 *
 * Starts with a confirmation card showing the current and latest versions.
 * If the user confirms, it switches to a minimal progress view and downloads
 * the update. Skipping sends the user straight to the service login page.
 * On failure a retry button is shown.
 */
export function UpdateRunnerApp({
  appBaseUrl,
  currentVersion,
  latestVersion,
  onSkip,
  onComplete,
}: UpdateRunnerAppProps) {
  const { progress, error, download, clearError } = useRunnerProvisioning();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (progress?.status === "DONE") onComplete();
  }, [progress, onComplete]);

  const handleUpdate = async () => {
    setHasStarted(true);
    try {
      await download(appBaseUrl);
      // The Rust command sends DONE before returning, but also complete here so
      // we never get stuck if that channel message is dropped.
      onComplete();
    } catch {
      // Error surfaced via the hook.
    }
  };

  const handleRetry = () => {
    clearError();
    setHasStarted(true);
    void handleUpdate();
  };

  if (hasStarted || error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <RunnerProgress heading="Updating the Desktop Runner" progress={progress} error={error} />
        {error && (
          <Button type="button" onClick={handleRetry} className="h-11 text-md">
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <SetupCard
      title="Update available"
      subtitle="A newer version of the Desktop Runner is available. Update now to get the latest features and improvements."
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-slate-50/60 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current version</span>
            <span className="font-medium text-foreground">
              {currentVersion ? `v${currentVersion}` : "Unknown"}
            </span>
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Latest version</span>
            <span className="font-medium text-foreground">{`v${latestVersion}`}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button type="button" onClick={handleUpdate} className="w-full h-11 text-md">
            <span className="inline-flex items-center gap-1.5">
              Update Now
              <Lucide icon="ArrowRight" className="h-4 w-4" />
            </span>
          </Button>
          <Button type="button" variant="outline" onClick={onSkip} className="w-full h-11 text-md">
            Skip for now
          </Button>
        </div>
      </div>
    </SetupCard>
  );
}
