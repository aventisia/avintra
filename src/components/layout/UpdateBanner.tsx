import { SubmitButton } from "@aventisia/ui/buttons";
import { Banner } from "@aventisia/ui/layout";
import { toast } from "@aventisia/ui/sonner";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { useState } from "react";

export function UpdateBanner() {
  // Local state to manage installation progress
  const [isInstalling, setIsInstalling] = useState(false);

  // Function to install the update and restart the app
  const installUpdate = async () => {
    try {
      // Check for updates
      const update = await check();

      // If an update is available
      if (update) {
        // Log the update information
        console.log(`Downloading Worc v${update.version}...`);

        // Download the update
        let downloadedMB = 0;
        let lastLoggedMB = 0;
        let contentLengthMB = 0;
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              contentLengthMB = event.data.contentLength
                ? Math.floor(event.data.contentLength / (1024 * 1024))
                : 0; // Convert to MB
              console.log(
                `Worc v${update.version} started downloading ${contentLengthMB} MB`,
              );
              setIsInstalling(true);
              break;
            case "Progress": {
              downloadedMB += event.data.chunkLength / (1024 * 1024);
              const currentWholeMB = Math.floor(downloadedMB);
              if (currentWholeMB > lastLoggedMB) {
                lastLoggedMB = currentWholeMB;
                console.log(
                  `Worc v${update.version} downloaded ${currentWholeMB} of ${contentLengthMB} MB`,
                );
              }
              break;
            }
            case "Finished":
              console.log(`Worc v${update.version} download finished`);
              break;
          }
        });

        // Notify the user about the successful update
        console.log(
          `Worc v${update.version} downloaded and installed successfully. Restart is required.`,
        );
        toast.success(
          `Worc v${update.version} downloaded successfully. Restarting app...`,
        );

        // Restart the app to apply the update.
        // Note: On Windows the application is automatically exited when the install step is executed due to a limitation of Windows installers.
        await relaunch();
        setIsInstalling(false);
      }
    } catch (error) {
      console.error("New version update failed:", error);
    }
  };

  return (
    <Banner isClosable={false}>
      <div className="flex w-full gap-2 md:items-center">
        <div className="flex grow gap-3 md:items-center md:justify-center">
          <p className="flex items-center justify-center gap-3 text-sm text-secondary-foreground">
            🚀 A new version is available! Update now for the latest features
            and improvements.
            <SubmitButton
              size="xs"
              type="button"
              primaryText="Update Now"
              secondaryText="Updating..."
              isPending={isInstalling}
              disabled={isInstalling}
              onClick={installUpdate}
            />
          </p>
        </div>
      </div>
    </Banner>
  );
}
