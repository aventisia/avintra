import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import { Download, X, CheckCircle2, AlertCircle, InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";

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
    // checking,
    installing,
    updateInfo,
    progress,
    error,
    checkForUpdates,
    installUpdate,
    cancelUpdate,
    // clearError,
  } = useAppUpdater(domain);

  const [currentToastId, setCurrentToastId] = useState<string | number | null>(
    null,
  );
  const [hasIgnored, setHasIgnored] = useState(false);

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
    if (updateInfo?.available && !hasIgnored && !installing) {
      // Dismiss any existing toast
      if (currentToastId) {
        toast.dismiss(currentToastId);
      }

      const id = toast.info(
        <div className="w-full space-y-3">
          <p className="flex items-center gap-2 text-sm">
            <InfoIcon className="h-3 w-3" />
            There's an update available: WorcDesktopApp {updateInfo.version}
          </p>

          <div className="flex justify-end gap-2">
            <Button
              size="xs"
              onClick={() => {
                handleInstall();
                toast.dismiss(id);
              }}
            >
              Install Update
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="hover:text-info-text/80"
              onClick={() => {
                handleIgnore();
                toast.dismiss(id);
              }}
            >
              Ignore
            </Button>
          </div>
        </div>,
        {
          duration: Infinity, // Don't auto-dismiss
          className: "w-96 py-3",
        },
      );

      setCurrentToastId(id);
    }
  }, [updateInfo, hasIgnored, installing]);

  // Show installation progress toast
  useEffect(() => {
    if (installing && progress) {
      // Dismiss previous toast
      if (currentToastId) {
        toast.dismiss(currentToastId);
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
        return <Download className="h-3 w-3 animate-pulse" />;
      };

      const id = toast.info(
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {getIcon()}
            <span>{getStatusText()}</span>
          </div>

          {(progress.status === "DOWNLOADING" ||
            progress.status === "PENDING") && (
            <>
              <Progress
                value={progress.percentage}
                className="!w-full bg-accent"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress.percentage)}%</span>
                {progress.total && (
                  <span>
                    {(progress.downloaded / 1024 / 1024).toFixed(1)} MB /
                    {(progress.total / 1024 / 1024).toFixed(1)} MB
                  </span>
                )}
              </div>
            </>
          )}

          {progress.status === "INSTALLING" && (
            <p className="text-sm text-muted-foreground">
              Please wait while the update is being installed...
            </p>
          )}

          {progress.status === "INSTALLED" && (
            <p className="text-sm text-muted-foreground">
              The application will restart shortly.
            </p>
          )}

          {progress.status === "ERROR" && error && (
            <p className="text-sm text-red-500">{error.message}</p>
          )}

          {(progress.status === "DOWNLOADING" ||
            progress.status === "PENDING") && (
            <div className="flex justify-end gap-2">
              <Button
                size="xs"
                variant="outline"
                className="hover:text-info-text"
                onClick={() => {
                  cancelUpdate();
                  toast.dismiss(id);
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

      setCurrentToastId(id);
    }
  }, [installing, progress, error]);

  const handleInstall = async () => {
    try {
      await installUpdate();
    } catch (err) {
      console.error("Failed to install update:", err);
    }
  };

  const handleIgnore = () => {
    setHasIgnored(true);
    if (currentToastId) {
      toast.dismiss(currentToastId);
      setCurrentToastId(null);
    }
  };

  return null; // This component only manages toasts
}
