import { toast } from "@aventisia/ui/sonner";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { useEffect } from "react";

export const useUpdateDesktopApp = () => {
  useEffect(() => {
    // Not a tauri app, skip update logic
    if ("isTauri" in window === false) return;

    // Function to check for updates and perform silent update
    const performSilentUpdate = async () => {
      try {
        // Check for updates
        const update = await check();

        // If an update is available
        if (update) {
          // Log the update information
          console.log("Silent update available:", update.version);
          toast.info(`Downloading update v${update.version}...`, {
            duration: 3000,
          });

          // Download and install the update
          await update.downloadAndInstall();

          // Notify the user about the successful update
          console.log("Update downloaded and installed successfully");
          toast.success("Update installed! App will restart in 5 seconds", {
            duration: 5000,
          });

          // Relaunch the app after a delay to ensure the update is applied
          setTimeout(async () => {
            try {
              await relaunch();
            } catch (error) {
              console.error("Failed to relaunch app:", error);
              toast.error("Please restart manually to complete update");
            }
          }, 5000);
        }
      } catch (error) {
        console.error("Silent update failed:", error);
      }
    };

    // Perform initial silent update check
    performSilentUpdate();

    // Check for updates every hour
    const interval = setInterval(performSilentUpdate, 60 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);
};
