import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import {
  X,
  CheckCircle2,
  AlertCircle,
  InfoIcon,
  DownloadIcon,
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

export function AppUpdateToast({
  domain,
  autoCheck = true,
  checkInterval,
}: AppUpdateToastProps) {
  const {
    installing,
    updateInfo,
    progress,
    error,
    checkForUpdates,
    installUpdate,
    cancelUpdate,
  } = useAppUpdater(domain);

  /**
   * Stores the toast id for the entire update lifecycle.
   * This allows us to update the same toast instead of
   * destroying and recreating it on every progress change.
   */
  const toastIdRef = useRef<string | number | null>(null);

  /**
   * Once a user ignores an update, we avoid showing
   * the "update available" toast again in this session.
   */
  const [hasIgnored, setHasIgnored] = useState(false);

  /**
   * Safely dismisses the current toast and
   * resets the stored toast id.
   */
  const dismissToast = () => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  };

  /**
   * Triggers update installation from the Rust side.
   */
  const handleInstall = async () => {
    await installUpdate();
  };

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
      if (!installing && !hasIgnored) {
        checkForUpdates().catch(console.error);
      }
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval, installing, hasIgnored, checkForUpdates]);

  /**
   * Shows the "Update available" toast.
   * This toast is displayed only once and is removed
   * as soon as installation starts or user ignores it.
   */
  useEffect(() => {
    if (!updateInfo?.available || hasIgnored || installing) return;

    // Prevent duplicate update-available toasts
    if (toastIdRef.current) return;

    const id = toast.info(
      <div className="w-full space-y-3">
        <p className="flex items-center gap-2 text-sm">
          <InfoIcon className="h-3 w-3" />
          <span className="text-secondary">
            There's an update available: WorcDesktopApp {updateInfo.version}
          </span>
        </p>

        <div className="flex justify-end gap-2">
          <Button
            size="xs"
            onClick={() => {
              handleInstall();
              dismissToast();
            }}
          >
            Update
          </Button>
          <Button
            size="xs"
            variant="outline"
            className="text-secondary"
            onClick={() => {
              setHasIgnored(true);
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
      },
    );

    toastIdRef.current = id;
  }, [updateInfo?.available, hasIgnored, installing]);

  /**
   * Creates the progress toast exactly once when
   * installation starts.
   *
   * From this point onward, we only update the content
   * of this toast using the same toast id.
   */
  useEffect(() => {
    if (!installing || toastIdRef.current) return;

    toastIdRef.current = toast.info(
      <div className="w-full space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <DownloadIcon className="h-3 w-3" />
          <span className="text-secondary">Preparing update…</span>
        </div>
      </div>,
      {
        duration: Infinity,
        className: "w-96 py-2",
      },
    );
  }, [installing]);

  /**
   * Updates the existing progress toast whenever
   * progress data changes.
   *
   * Important:
   * - We reuse the same toast id
   * - No dismiss + recreate (prevents flicker)
   * - UI stays smooth even with frequent progress events
   */
  useEffect(() => {
    if (!installing || !progress || !toastIdRef.current) return;

    const getStatusText = () => {
      switch (progress.status) {
        case "PENDING":
          return "Preparing download...";
        case "DOWNLOADING":
          return "Downloading update...";
        case "DOWNLOADED":
          return "Download complete";
        case "INSTALLING":
          return "Installing update...";
        case "INSTALLED":
          return "Update installed successfully";
        case "ERROR":
          return "Installation failed";
        default:
          return "Processing...";
      }
    };

    const getIcon = () => {
      if (progress.status === "INSTALLED") {
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      }
      if (progress.status === "ERROR") {
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      }
      return <DownloadIcon className="h-2 w-2" />;
    };

    const showProgress =
      progress.status === "PENDING" || progress.status === "DOWNLOADING";

    toast.info(
      <div className="w-full space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {getIcon()}
          <span className="text-secondary">{getStatusText()}</span>
        </div>

        {showProgress && (
          <>
            <Progress
              value={progress.percentage}
              className="!w-full bg-accent"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.percentage}%</span>
              {progress.total ? (
                <span>
                  {(progress.downloaded / 1024 / 1024).toFixed(1)} MB /{" "}
                  {(progress.total / 1024 / 1024).toFixed(1)} MB
                </span>
              ) : null}
            </div>
          </>
        )}

        {progress.status === "INSTALLING" && (
          <p className="text-xs text-muted-foreground">
            Installing… the app will restart automatically.
          </p>
        )}

        {progress.status === "ERROR" && error && (
          <p className="text-xs text-red-500">{error.message}</p>
        )}

        {(progress.status === "DOWNLOADING" ||
          progress.status === "PENDING") && (
          <div className="flex justify-end">
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                cancelUpdate();
                dismissToast();
              }}
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          </div>
        )}
      </div>,
      {
        id: toastIdRef.current,
        duration:
          progress.status === "INSTALLED" || progress.status === "ERROR"
            ? 5000
            : Infinity,
        className: "w-96 py-2",
      },
    );
  }, [progress, installing, error, cancelUpdate]);

  /**
   * Cleanup after installation finishes.
   * Allows future update checks/toasts to work correctly.
   */
  useEffect(() => {
    if (!installing && toastIdRef.current) {
      toastIdRef.current = null;
    }
  }, [installing]);

  return null; // This component only manages toasts
}
