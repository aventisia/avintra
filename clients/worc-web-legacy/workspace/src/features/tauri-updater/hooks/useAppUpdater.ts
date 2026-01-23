import { invoke, Channel } from "@tauri-apps/api/core";
import { useState, useCallback } from "react";

export interface UpdateMetadata {
  available: boolean;
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
  status:
    | "PENDING"
    | "DOWNLOADING"
    | "DOWNLOADED"
    | "INSTALLING"
    | "INSTALLED"
    | "ERROR";
}

export interface UpdateError {
  code: string;
  message: string;
}

interface UseAppUpdaterReturn {
  // State
  checking: boolean;
  installing: boolean;
  updateInfo: UpdateMetadata | null;
  progress: DownloadProgress | null;
  error: UpdateError | null;

  // Actions
  checkForUpdates: () => Promise<UpdateMetadata>;
  installUpdate: () => Promise<void>;
  cancelUpdate: () => Promise<void>;
  getAppVersion: () => Promise<string | null>;
  hasPendingUpdate: () => Promise<boolean>;
  clearError: () => void;
}

export function useAppUpdater(domain: string): UseAppUpdaterReturn {
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateMetadata | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<UpdateError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkForUpdates = useCallback(async (): Promise<UpdateMetadata> => {
    setChecking(true);
    setError(null);

    try {
      const result = await invoke<UpdateMetadata>("check_update_for_domain", {
        domain,
      });

      setUpdateInfo(result);
      return result;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const updateError: UpdateError = {
        code: err.code || "UNKNOWN_ERROR",
        message: err.message || "Failed to check for updates",
      };
      setError(updateError);
      throw updateError;
    } finally {
      setChecking(false);
    }
  }, [domain]);

  const installUpdate = useCallback(async (): Promise<void> => {
    setInstalling(true);
    setError(null);
    setProgress({
      downloaded: 0,
      total: undefined,
      percentage: 0,
      status: "PENDING",
    });

    try {
      const onProgress = new Channel<DownloadProgress>();

      onProgress.onmessage = (progressData) => {
        setProgress(progressData);
      };

      await invoke("install_pending_update", {
        onProgress,
      });

      // App will restart after successful installation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const updateError: UpdateError = {
        code: err.code || "INSTALL_ERROR",
        message: err.message || "Failed to install update",
      };
      setError(updateError);
      setProgress((prev) => (prev ? { ...prev, status: "ERROR" } : null));
      throw updateError;
    } finally {
      setInstalling(false);
    }
  }, []);

  const cancelUpdate = useCallback(async (): Promise<void> => {
    try {
      await invoke("cancel_pending_update");
      setUpdateInfo(null);
      setProgress(null);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to cancel update:", err);
      throw err;
    }
  }, []);

  const getAppVersion = useCallback(async (): Promise<string | null> => {
    try {
      return await invoke<string>("get_app_version");
    } catch (err) {
      console.error("Failed to get app version:", err);
      return null;
    }
  }, []);

  const hasPendingUpdate = useCallback(async (): Promise<boolean> => {
    try {
      return await invoke<boolean>("has_pending_update");
    } catch (err) {
      console.error("Failed to check pending update:", err);
      return false;
    }
  }, []);

  return {
    // State
    checking,
    installing,
    updateInfo,
    progress,
    error,

    // Actions
    checkForUpdates,
    installUpdate,
    cancelUpdate,
    getAppVersion,
    hasPendingUpdate,
    clearError,
  };
}
