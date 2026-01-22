import { useEffect } from "react";

import { IS_TAURI } from "@/constants/constants";

import { useAppUpdater } from "./useAppUpdater";

export const useCheckForUpdate = () => {
  const { checkForUpdates } = useAppUpdater(window.location.origin);

  useEffect(() => {
    // Not a tauri app, skip update logic
    if (!IS_TAURI) return;

    // Function to check for updates and perform silent update
    const checkUpdate = async () => {
      try {
        // Check for updates
        const update = await checkForUpdates();

        // If an update is available
        if (update) {
          // Log the update information
          console.log(
            `Found update v${update.version} from ${update.date} with notes ${update.notes}`,
          );
        }
      } catch (error) {
        console.error("New version update failed:", error);
      }
    };

    // Perform initial silent update check
    checkUpdate();

    // Check for updates every hour
    const interval = setInterval(checkUpdate, 60 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);
};
