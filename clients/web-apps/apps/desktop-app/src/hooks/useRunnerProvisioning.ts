import { Channel, invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

/**
 * The phase of the runner provisioning lifecycle.
 * IMPORTANT: These names must exactly match the Rust `RunnerStatus` enum
 * (serde `rename_all = "UPPERCASE"`).
 */
export type RunnerStatus = "CHECKING" | "DOWNLOADING" | "EXTRACTING" | "DONE" | "ERROR";

/** Progress streamed from the Rust `download_runner_app` command. */
export interface RunnerProgress {
  downloaded: number;
  total?: number;
  percentage: number;
  status: RunnerStatus;
}

/** Result of the `check_runner_app` command. */
export interface RunnerCheckResult {
  installed: boolean;
  installed_version: string;
  latest_version: string;
  update_available: boolean;
}

interface UseRunnerProvisioningReturn {
  // State
  checking: boolean;
  downloading: boolean;
  checkResult: RunnerCheckResult | null;
  progress: RunnerProgress | null;
  error: string | null;

  // Actions
  check: (appBaseUrl: string) => Promise<RunnerCheckResult>;
  download: (appBaseUrl: string) => Promise<string>;
  clearError: () => void;
}

/**
 * Bridges the React UI with the Rust backend commands that provision the
 * Avintra Desktop Runner. Handles: Check -> Download (with progress) -> Extract.
 */
export function useRunnerProvisioning(): UseRunnerProvisioningReturn {
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [checkResult, setCheckResult] = useState<RunnerCheckResult | null>(null);
  const [progress, setProgress] = useState<RunnerProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Queries the backend for the latest runner version and compares it with the
   * locally installed version.
   */
  const check = useCallback(async (appBaseUrl: string): Promise<RunnerCheckResult> => {
    setChecking(true);
    setError(null);
    try {
      const result = await invoke<RunnerCheckResult>("check_runner_app", {
        appBaseUrl,
      });
      setCheckResult(result);
      return result;
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to check runner";
      setError(message);
      throw new Error(message);
    } finally {
      setChecking(false);
    }
  }, []);

  /**
   * Downloads and extracts the latest runner, streaming progress via a channel.
   * Resolves with the installed version on success.
   */
  const download = useCallback(
    async (appBaseUrl: string): Promise<string> => {
      if (downloading) throw new Error("Runner download already in progress");
      setDownloading(true);
      setError(null);
      setProgress({ downloaded: 0, percentage: 0, status: "CHECKING" });

      try {
        const onProgress = new Channel<RunnerProgress>();
        onProgress.onmessage = (data) => {
          setProgress(data);
          if (data.status === "ERROR") {
            setError("Runner download failed");
          }
        };

        const version = await invoke<string>("download_runner_app", {
          appBaseUrl,
          onProgress,
        });
        return version;
      } catch (err) {
        const message = typeof err === "string" ? err : "Failed to download runner";
        setError(message);
        throw new Error(message);
      } finally {
        setDownloading(false);
      }
    },
    [downloading],
  );

  return {
    checking,
    downloading,
    checkResult,
    progress,
    error,
    check,
    download,
    clearError,
  };
}
