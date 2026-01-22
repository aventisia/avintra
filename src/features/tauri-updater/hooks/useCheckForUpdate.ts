import { useBaseLayoutStore } from "@aventisia/ui/stores";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { IS_TAURI } from "@/constants/constants";

import { useAppUpdater } from "./useAppUpdater";

export const useCheckForUpdate = () => {
  // Access the setAppBanner function from the base layout store
  const { setAppBanner } = useBaseLayoutStore(
    useShallow((state) => ({
      setAppBanner: state.setAppBanner,
    })),
  );

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

          // Notify the user about the new update
          setAppBanner("update");
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
