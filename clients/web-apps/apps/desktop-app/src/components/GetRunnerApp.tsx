import { useCallback, useEffect, useRef, useState } from "react";

import { useRunnerProvisioning } from "../hooks/useRunnerProvisioning";
import { RunnerProgress } from "./RunnerProgress";

interface GetRunnerAppProps {
  appBaseUrl: string;
  /** The latest available Runner App version, shown in the heading. */
  latestVersion: string;
  /** Called when the user chooses to continue without installing the Runner. */
  onSkip: () => void;
  onComplete: () => void;
}

/**
 * First-run install flow for the Runner App.
 *
 * The runner check already happened in App.tsx; this component only needs to
 * download. It shows a minimal progress view and redirects to the service
 * login page once complete. On failure a retry button is shown.
 */
export function GetRunnerApp({ appBaseUrl, latestVersion, onSkip, onComplete }: GetRunnerAppProps) {
  const { progress, error, download, clearError } = useRunnerProvisioning();
  const [attempt, setAttempt] = useState(0);
  // Guards against React StrictMode double-invoking the effect (which would
  // otherwise trigger the "already in progress" guard in `download`).
  const startedRef = useRef(false);

  const runDownload = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    try {
      await download(appBaseUrl);
      // The Rust command sends DONE before returning, but also complete here so
      // we never get stuck if that channel message is dropped.
      onComplete();
    } catch (err) {
      // Error is surfaced via the hook; log it for dev builds.
      console.error("Runner download failed:", err);
    }
  }, [appBaseUrl, download, onComplete]);

  useEffect(() => {
    runDownload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  useEffect(() => {
    if (progress?.status === "DONE") onComplete();
  }, [progress, onComplete]);

  const handleRetry = () => {
    startedRef.current = false;
    clearError();
    setAttempt((n) => n + 1);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full flex-col items-center gap-4">
        <RunnerProgress
          heading={`Setting up Runner App v${latestVersion}`}
          progress={progress}
          error={error}
          onRetry={handleRetry}
          onContinueAnyway={onSkip}
        />
      </div>
    </div>
  );
}
