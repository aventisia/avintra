import { Button } from "@avplatform/ui/buttons";
import { useCallback, useEffect, useRef, useState } from "react";

import { useRunnerProvisioning } from "../hooks/useRunnerProvisioning";
import { RunnerProgress } from "./RunnerProgress";

interface GetRunnerAppProps {
  appBaseUrl: string;
  onComplete: () => void;
}

/**
 * First-run install flow for the Desktop Runner.
 *
 * The runner check already happened in App.tsx; this component only needs to
 * download. It shows a minimal progress view and redirects to the service
 * login page once complete. On failure a retry button is shown.
 */
export function GetRunnerApp({ appBaseUrl, onComplete }: GetRunnerAppProps) {
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
    } catch {
      // Error surfaced via the hook.
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
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <RunnerProgress heading="Setting up the Desktop Runner" progress={progress} error={error} />
      {error && (
        <Button type="button" onClick={handleRetry} className="h-11 text-md">
          Retry
        </Button>
      )}
    </div>
  );
}
