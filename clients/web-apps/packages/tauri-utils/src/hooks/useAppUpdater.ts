import { Channel, invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export interface UpdateMetadata {
  available: boolean;
  downloaded: boolean;
  version: string;
  current_version: string;
  notes?: string;
  date?: string;
  download_url?: string;
}

export interface DownloadProgress {
  downloaded: number;
  total?: number;
  percentage: number;
  status: "PENDING" | "DOWNLOADING" | "DOWNLOADED" | "INSTALLING" | "INSTALLED" | "ERROR";
}

export interface UpdateError {
  code: string;
  message: string;
}

interface UseAppUpdaterReturn {
  // State
  checking: boolean;
  downloading: boolean;
  installing: boolean;
  updateInfo: UpdateMetadata | null;
  progress: DownloadProgress | null;
  error: UpdateError | null;

  // Actions
  checkForUpdates: () => Promise<UpdateMetadata>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => Promise<void>;
  cancelDownload: () => Promise<void>;
  getAppVersion: () => Promise<string | null>;
  clearError: () => void;
}

/**
 * Custom hook to manage the full lifecycle of the app updater.
 * * Bridges the React UI with the Rust backend commands.
 * Handles: Checking -> Downloading (with progress) -> Installing.
 */
export function useAppUpdater(domain: string): UseAppUpdaterReturn {
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [installing, setInstalling] = useState(false);

  const [updateInfo, setUpdateInfo] = useState<UpdateMetadata | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<UpdateError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Checks for updates.
   * If the server reports the update is already downloaded (persisted in Rust memory),
   * we update the progress state to "DOWNLOADED" immediately.
   */
  const checkForUpdates = useCallback(async (): Promise<UpdateMetadata> => {
    setChecking(true);
    setError(null);
    try {
      const result = await invoke<UpdateMetadata>("check_update_for_domain", {
        domain,
      });
      setUpdateInfo(result);

      if (result.downloaded) {
        setProgress({
          downloaded: 0,
          total: 0,
          percentage: 100,
          status: "DOWNLOADED",
        });
      }
      return result;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const updateError = {
        code: err.code || "UNKNOWN",
        message: err.message || "Failed check",
      };
      setError(updateError);
      throw updateError;
    } finally {
      setChecking(false);
    }
  }, [domain]);

  /**
   * Starts the download process.
   * Listens to the 'onProgress' channel for real-time updates.
   * * Transition: PENDING -> DOWNLOADING -> DOWNLOADED
   */
  const downloadUpdate = useCallback(async (): Promise<void> => {
    if (downloading) return;
    setDownloading(true);
    setError(null);
    setProgress({ downloaded: 0, percentage: 0, status: "PENDING" });

    try {
      const onProgress = new Channel<DownloadProgress>();
      onProgress.onmessage = (data) => {
        setProgress(data);

        // Critical: When download finishes, we unset 'downloading' state
        // This allows the UI to switch from "Progress Bar" to "Install Button"
        if (data.status === "DOWNLOADED") {
          setDownloading(false);
          setUpdateInfo((prev) => (prev ? { ...prev, downloaded: true } : null));
        } else if (data.status === "ERROR") {
          setDownloading(false);
          setError({ code: "DL_ERR", message: "Download failed" });
        }
      };

      await invoke("download_update", { onProgress });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError({ code: "DL_START", message: err.message });
      setDownloading(false);
    }
  }, [downloading]);

  /**
   * Installs the downloaded update.
   * This will eventually restart the application.
   */
  const installUpdate = useCallback(async (): Promise<void> => {
    setInstalling(true);
    setError(null);
    try {
      const onProgress = new Channel<DownloadProgress>();
      onProgress.onmessage = (data) => {
        setProgress(data);
        if (data.status === "INSTALLED" || data.status === "ERROR") {
          setInstalling(false);
        }
      };
      await invoke("install_update", { onProgress });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError({ code: "INST_ERR", message: err.message });
      setInstalling(false);
    }
  }, []);

  /**
   * Cancels the active download and cleans up state.
   */
  const cancelDownload = useCallback(async (): Promise<void> => {
    try {
      await invoke("cancel_download");
      setDownloading(false);
      setProgress(null);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getAppVersion = useCallback(async () => {
    try {
      return await invoke<string>("get_app_version");
    } catch {
      return null;
    }
  }, []);

  return {
    checking,
    downloading,
    installing,
    updateInfo,
    progress,
    error,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    cancelDownload,
    getAppVersion,
    clearError,
  };
}
