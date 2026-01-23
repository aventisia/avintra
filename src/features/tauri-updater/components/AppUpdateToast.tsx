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

  const toastIdRef = useRef<string | number | null>(null);
  const [hasIgnored, setHasIgnored] = useState(false);
  const isShowingProgressRef = useRef(false);

  // Check for updates on mount
  useEffect(() => {
    if (!IS_TAURI) return;
    if (autoCheck) {
      checkForUpdates().catch(console.error);
    }
  }, [autoCheck, checkForUpdates]);

  // Set up periodic checking
  useEffect(() => {
    if (!checkInterval) return;

    const interval = setInterval(() => {
      if (!installing && !hasIgnored) {
        checkForUpdates().catch(console.error);
      }
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval, installing, hasIgnored, checkForUpdates]);

  // Show update available toast
  useEffect(() => {
    if (!updateInfo?.available || hasIgnored || installing) {
      return;
    }

    // Don't create duplicate toasts
    if (toastIdRef.current) {
      return;
    }

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
              handleIgnore();
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

  // Show installation progress toast - ONLY when installing starts
  useEffect(() => {
    if (installing && !isShowingProgressRef.current) {
      console.log("[ui][updater] install started, will show progress updates");
      isShowingProgressRef.current = true;

      // Dismiss update available toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }

    if (!installing && isShowingProgressRef.current) {
      console.log("[ui][updater] install finished");
      isShowingProgressRef.current = false;
      toastIdRef.current = null;
    }
  }, [installing]);

  // Update progress toast content ONLY when progress changes
  useEffect(() => {
    if (!installing || !progress || !isShowingProgressRef.current) {
      return;
    }

    console.log("[ui][updater] progress update:", {
      status: progress.status,
      percentage: progress.percentage,
      downloaded: progress.downloaded,
      total: progress.total,
    });

    // Dismiss old toast and create new one with updated content
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

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
      if (progress.status === "DOWNLOADED") {
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      }
      return <DownloadIcon className="h-2 w-2" />;
    };

    const showProgress =
      progress.status === "DOWNLOADING" || progress.status === "PENDING";

    const showCancelbutton =
      progress.status === "DOWNLOADING" || progress.status === "PENDING";

    const id = toast.info(
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
              {progress.total && progress.total > 0 ? (
                <span>
                  {(progress.downloaded / 1024 / 1024).toFixed(1)} MB /{" "}
                  {(progress.total / 1024 / 1024).toFixed(1)} MB
                </span>
              ) : null}
            </div>
          </>
        )}

        {progress.status === "DOWNLOADED" && (
          <p className="text-xs text-muted-foreground">
            Starting installation...
          </p>
        )}

        {progress.status === "INSTALLING" && (
          <p className="text-xs text-muted-foreground">
            Please wait while the update is being installed...
          </p>
        )}

        {progress.status === "INSTALLED" && (
          <p className="text-xs font-medium text-green-600">
            The application will restart shortly.
          </p>
        )}

        {progress.status === "ERROR" && error && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-red-500">{error.message}</p>
            <p className="text-xs text-muted-foreground">
              Error Code: {error.code}
            </p>
          </div>
        )}

        {showCancelbutton && (
          <div className="flex justify-end gap-2">
            <Button
              size="xs"
              variant="outline"
              className="text-secondary"
              onClick={() => {
                console.log("[ui][updater] canceling update");
                cancelUpdate();
                dismissToast();
                isShowingProgressRef.current = false;
              }}
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          </div>
        )}
      </div>,
      {
        duration:
          progress.status === "INSTALLED" || progress.status === "ERROR"
            ? 5000
            : Infinity,
        className: "w-96 py-2",
      },
    );

    toastIdRef.current = id;
  }, [progress, error, installing, cancelUpdate]);

  const dismissToast = () => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  };

  const handleInstall = async () => {
    try {
      console.log("[ui][updater] starting install");
      await installUpdate();
    } catch (err) {
      console.error("[ui][updater] failed to install update:", err);
    }
  };

  const handleIgnore = () => {
    console.log("[ui][updater] update ignored");
    setHasIgnored(true);
    dismissToast();
  };

  return null; // This component only manages toasts
}
