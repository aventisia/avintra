import { Banner } from "@avplatform/layout";
import { SubmitButton } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { relaunch } from "@tauri-apps/plugin-process";
import { LazyStore } from "@tauri-apps/plugin-store";
import { check } from "@tauri-apps/plugin-updater";
import { useState } from "react";

import { TAURI_RELAUNCH_URL_KEY, TAURI_UPDATE_STORE, killBinaries } from "..";

// Create a lazy store instance to manage the update state
const tauriUpdateStore = new LazyStore(TAURI_UPDATE_STORE);

export function UpdateBanner() {
  // Local state to manage installation progress
  const [progress, setProgress] = useState(0);

  // Function to install the update and restart the app
  const installUpdate = async () => {
    try {
      // Check for updates
      const update = await check();

      // If no update is available
      if (!update) {
        setProgress(0);
        return;
      }

      // Save the current url to the store
      await tauriUpdateStore.set(TAURI_RELAUNCH_URL_KEY, window.location.href);
      await tauriUpdateStore.save();

      // Kill UIInspector and NodeExecutor processes
      // TODO: We can improve this by checking if these processes are running before attempting to kill them
      // TODO: We can also improve this by checking if the user has any unsaved changes in UIInsector before killing the processes
      // TODO: We can reopen UIInspector after the update is complete just like we are opening the url on relaunch
      if (!(await killBinaries())) {
        setProgress(0);
        return;
      }

      // Download the update
      let downloaded = 0;
      let contentLength = 0;
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength ?? 0;
            break;
          case "Progress": {
            downloaded += event.data.chunkLength;
            setProgress(Math.round((downloaded / contentLength) * 100) || 0);
            break;
          }
          case "Finished":
            toast.success(`Avintra v${update.version} downloaded successfully. Restarting app...`);
            setProgress(0);
            break;
        }
      });

      // Restart the app to apply the update.
      // Note: On Windows the application is automatically exited when the install step is executed due to a limitation of Windows installers.
      await relaunch();
    } catch (error) {
      // Delete the stored relaunch URL in case of an error
      await tauriUpdateStore.delete(TAURI_RELAUNCH_URL_KEY);
      await tauriUpdateStore.save();

      // Notify the user about the error
      toast.error("Failed to update. Please try again later.");
      console.error("New version update failed:", error);
    } finally {
      setProgress(0);
    }
  };

  return (
    <Banner isClosable={false}>
      <div className="flex w-full gap-2 md:items-center">
        <div className="flex grow gap-3 md:items-center md:justify-center">
          <p className="flex items-center justify-center gap-3 text-sm text-secondary-foreground">
            🚀 A new version is available! Update now for the latest features and improvements.
            <SubmitButton
              size="xs"
              type="button"
              primaryText="Update Now"
              secondaryText={`Updating...${"\u00A0".repeat(2)}${progress}%`}
              className={cn("w-fit", progress > 0 && "min-w-36")}
              isPending={progress > 0}
              disabled={progress > 0}
              onClick={installUpdate}
            />
          </p>
        </div>
      </div>
    </Banner>
  );
}
