import { IS_TAURI } from "@/constants/constants";
import { Progress } from "@/features/05-tenant-admin/tenant/shared/Progress";

import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

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

    const id = toast(
      <div className="w-full space-y-3">
        <p className="flex items-center gap-1 text-sm text-foreground">
          <InformationCircleIcon className="!size-4 stroke-[1.5]" />
          {isReadyToInstall ? "Update ready: " : "New version available: "}
          <span className="font-medium">v{updateInfo.version}</span>
        </p>
        <div className="flex justify-end gap-2">
          {isReadyToInstall ? (
            <Button
              size="xs"
              className="gap-2"
              onClick={() => {
                dismissToast(); // Clear "Ready" toast -> Show "Install Progress" toast
                installUpdate();
              }}
            >
              <ArrowPathIcon className="!size-4 stroke-[1.7]" />
              Update
            </Button>
          ) : (
            <Button
              size="xs"
              className="gap-2"
              onClick={() => {
                dismissToast(); // Clear "Available" toast -> Show "Download Progress" toast
                downloadUpdate();
              }}
            >
              <ArrowDownTrayIcon className="!size-4 stroke-[1.8]" />
              Download
            </Button>
          )}

          <Button
            size="xs"
            variant="outline"
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
        className: "w-96 p-3 bg-accent border",
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
      toastIdRef.current = toast("Preparing...", {
        duration: Infinity,
        className: "w-96 p-3 bg-accent border",
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

    toast(
      <div className="w-full space-y-2 px-1">
        <div className="flex items-center gap-1.5">
          {isError ? (
            <ExclamationCircleIcon className="!size-4 stroke-[1.8] text-destructive" />
          ) : (
            <ArrowDownTrayIcon className="!size-4 stroke-[1.8]" />
          )}
          <div className="flex w-full justify-between text-sm text-foreground">
            <div className="space-x-1">
              <span>{getStatusText()}</span>
              {!isError && (
                <span className="font-medium">{progress.percentage}%</span>
              )}
            </div>
            {!isError && progress.total && (
              <span className="text-xs font-medium text-muted-foreground">
                {(progress.downloaded / 1024 / 1024).toFixed(1)}mb of{" "}
                {(progress.total / 1024 / 1024).toFixed(1)}mb
              </span>
            )}
          </div>
        </div>

        {!isError && (
          <div className="flex items-center gap-1">
            <Progress value={progress.percentage} className="bg-primary-100" />
            {canCancel && (
              <Button
                size="icon6"
                variant="ghost"
                className="group size-6 !min-w-6 rounded-full hover:bg-destructive focus-visible:bg-destructive"
                onClick={() => {
                  cancelDownload();
                  // Treat cancel as "Ignore for now" so the Main Toast doesn't pop back up instantly
                  setHasIgnored(true);
                  dismissToast();
                }}
              >
                <XMarkIcon className="!size-4 stroke-[2] text-destructive group-hover:text-white" />
              </Button>
            )}
          </div>
        )}

        {isError && error && (
          <p className="text-xs text-destructive">{error.message}</p>
        )}
      </div>,
      {
        id: toastIdRef.current,
        className: "w-96 p-3 bg-accent border",
        duration: isError ? 5000 : Infinity,
      },
    );
  }, [progress, downloading, installing, error, cancelDownload]);

  return null;
}
