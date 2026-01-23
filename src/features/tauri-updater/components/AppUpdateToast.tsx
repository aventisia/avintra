import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import {
  X,
  AlertCircle,
  InfoIcon,
  DownloadIcon,
  RefreshCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { IS_TAURI } from "@/constants/constants";
import { Progress } from "@/features/tenant/shared/Progress";

import { useAppUpdater } from "../hooks/useAppUpdater";

interface AppUpdateToastProps {
  domain: string;
  // Check for updates on mount or manually
  autoCheck?: boolean;
  // Check interval in milliseconds (optional)
  checkInterval?: number;
}

/**
 * Toast manager component for App Updates.
 * Enforces a strict "One Toast" policy.
 */
export function AppUpdateToast({
  domain,
  autoCheck = true,
  checkInterval,
}: AppUpdateToastProps) {
  const {
    downloading,
    installing,
    updateInfo,
    progress,
    error,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    cancelDownload,
  } = useAppUpdater(domain);

  /**
   * Tracks the active toast ID to prevent duplicates.
   */
  const toastIdRef = useRef<string | number | null>(null);
  const [hasIgnored, setHasIgnored] = useState(false);

  // Derived state: Is the binary downloaded and ready for install?
  const isReadyToInstall = updateInfo?.downloaded ?? false;

  /**
   * Dismisses the current toast immediately.
   * Uses global dismiss to ensure no visual overlapping occurs.
   */
  const dismissToast = () => {
    // Dismiss ALL toasts to enforce "only one toast seen" rule
    toast.dismiss();
    toastIdRef.current = null;
  };

  /* LIFECYCLE: CHECKS */

  /**
   * Automatically check for updates when the app loads.
   * This only runs inside the Tauri environment.
   */
  useEffect(() => {
    if (!IS_TAURI) return;
    if (autoCheck) {
      checkForUpdates().catch(console.error);
    }
  }, [autoCheck, checkForUpdates]);

  /**
   * Optional periodic update check.
   * Runs only when:
   * - no update is currently installing
   * - user has not ignored the update
   */
  useEffect(() => {
    if (!checkInterval) return;
    const interval = setInterval(() => {
      if (!downloading && !installing && !hasIgnored) {
        checkForUpdates().catch(console.error);
      }
    }, checkInterval);
    return () => clearInterval(interval);
  }, [checkInterval, downloading, installing, hasIgnored, checkForUpdates]);

  /* LIFECYCLE: TOAST LOGIC */

  /**
   * 1. HANDOVER LOGIC (CRITICAL)
   * Detects when download finishes (status: DOWNLOADED).
   * We MUST dismiss the "Progress" toast here so the "Install" toast can appear
   * in the next effect.
   */
  useEffect(() => {
    if (
      !downloading &&
      progress?.status === "DOWNLOADED" &&
      toastIdRef.current
    ) {
      dismissToast();
    }
  }, [downloading, progress?.status]);

  /**
   * 2. MAIN ACTION TOAST (Download / Install)
   * Shows only if we are NOT downloading/installing and NOT ignored.
   */
  useEffect(() => {
    // Block if busy, ignored, or if a toast is already actively tracked
    if (!updateInfo?.available || hasIgnored || downloading || installing)
      return;
    if (toastIdRef.current) return;

    const id = toast.info(
      <div className="w-full space-y-3">
        <p className="flex items-center gap-2 text-sm">
          <InfoIcon className="h-3 w-3" />
          <span className="text-secondary">
            {isReadyToInstall
              ? `Update ready: v${updateInfo.version}`
              : `New version available: v${updateInfo.version}`}
          </span>
        </p>

        <div className="flex justify-end gap-2">
          {isReadyToInstall ? (
            <Button
              size="xs"
              onClick={() => {
                dismissToast(); // Clear "Ready" toast -> Show "Install Progress" toast
                installUpdate();
              }}
            >
              <RefreshCcw className="mr-2 h-3 w-3" />
              Update
            </Button>
          ) : (
            <Button
              size="xs"
              onClick={() => {
                dismissToast(); // Clear "Available" toast -> Show "Download Progress" toast
                downloadUpdate();
              }}
            >
              <DownloadIcon className="mr-2 h-3 w-3" />
              Download
            </Button>
          )}

          <Button
            size="xs"
            variant="outline"
            className="text-secondary"
            onClick={() => {
              setHasIgnored(true); // "Later" -> Close and don't show again
              dismissToast();
            }}
          >
            Later
          </Button>
        </div>
      </div>,
      {
        duration: Infinity,
        className: "w-96 py-3",
        onDismiss: () => {
          toastIdRef.current = null;
        },
      },
    );

    toastIdRef.current = id;
  }, [updateInfo, hasIgnored, downloading, installing, isReadyToInstall]);

  /**
   * 3. PROGRESS TOAST (Downloading / Installing)
   */
  useEffect(() => {
    // Only run if active
    if ((!downloading && !installing) || !progress) return;

    // Create toast if one doesn't exist
    if (!toastIdRef.current) {
      toastIdRef.current = toast.info("Preparing...", {
        duration: Infinity,
        className: "w-96 py-2",
      });
    }

    const getStatusText = () => {
      switch (progress.status) {
        case "PENDING":
          return "Preparing...";
        case "DOWNLOADING":
          return "Downloading update...";
        case "DOWNLOADED":
          return "Download complete!";
        case "INSTALLING":
          return "Installing update...";
        case "INSTALLED":
          return "Success! Restarting...";
        case "ERROR":
          return "Error occurred";
        default:
          return "Processing...";
      }
    };

    const isError = progress.status === "ERROR";
    // Allow cancel only during download phase
    const canCancel =
      downloading &&
      (progress.status === "PENDING" || progress.status === "DOWNLOADING");

    toast.info(
      <div className="w-full space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {isError ? (
            <AlertCircle className="h-3 w-3 text-red-500" />
          ) : (
            <DownloadIcon className="h-3 w-3" />
          )}
          <span className="text-secondary">{getStatusText()}</span>
        </div>

        {!isError && (
          <>
            <Progress
              value={progress.percentage}
              className="!w-full bg-accent"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.percentage}%</span>
              {progress.total && (
                <span>
                  {(progress.downloaded / 1024 / 1024).toFixed(1)} MB /{" "}
                  {(progress.total / 1024 / 1024).toFixed(1)} MB
                </span>
              )}
            </div>
          </>
        )}

        {isError && error && (
          <p className="text-xs text-red-500">{error.message}</p>
        )}

        {canCancel && (
          <div className="flex justify-end">
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                cancelDownload();
                // Treat cancel as "Ignore for now" so the Main Toast doesn't pop back up instantly
                setHasIgnored(true);
                dismissToast();
              }}
              className="text-secondary"
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          </div>
        )}
      </div>,
      {
        id: toastIdRef.current,
        duration: isError ? 5000 : Infinity,
      },
    );
  }, [progress, downloading, installing, error, cancelDownload]);

  return null;
}
