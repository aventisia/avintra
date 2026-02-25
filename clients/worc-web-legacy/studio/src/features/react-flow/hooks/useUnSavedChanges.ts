import { useEffect, useRef } from "react";
import { IS_TAURI } from "@/constants";

const useUnsavedChanges = ({ isDirty }: { isDirty: boolean }): void => {
  // 1. Keep the latest dirty state inside the listeners without re-binding
  const isDirtyRef = useRef(isDirty);
  const lastBlockedAtRef = useRef<number | null>(null);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    // --- WEB BROWSER TABS ---
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        // Cancels the event as specified by the standard.
        event.preventDefault();
        // Chrome requires returnValue to be set.
        event.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // --- TAURI DESKTOP APP ---
    let unlistenTauri: (() => void) | null = null;

    const setupTauriListener = async () => {
      if (!IS_TAURI) return;

      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const appWindow = getCurrentWindow();

        unlistenTauri = await appWindow.onCloseRequested(async (event) => {
          if (!isDirtyRef.current) return;

          const now = Date.now();

          // Block duplicate close events for the same click
          if (
            lastBlockedAtRef.current &&
            now - lastBlockedAtRef.current < 500
          ) {
            event.preventDefault();
            return;
          }

          lastBlockedAtRef.current = now;
          event.preventDefault(); // Stop the OS window from closing immediately

          // Prompt the user
          const userWantsToExit = window.confirm(
            "You have unsaved changes. Are you sure you want to discard them and exit?",
          );

          if (userWantsToExit) {
            // Bypass the lock so the app can actually close on the next attempt
            isDirtyRef.current = false;
            await appWindow.close();
          }
        });
      } catch (error) {
        console.error("Failed to setup Tauri close listener:", error);
      }
    };

    setupTauriListener();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (unlistenTauri) unlistenTauri();
    };
  }, []);
};

export default useUnsavedChanges;
