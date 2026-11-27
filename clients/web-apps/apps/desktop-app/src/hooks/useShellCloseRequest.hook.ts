import { IS_TAURI } from "@avplatform/ui/constants";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";

/**
 * Lets the shell window close itself.
 *
 * IMPORTANT NOTE: Tauri hands a close request to the JS page that registered a close listener and
 * leaves the actual close to it. A page replaced by a full-page navigation (logout, expiry) cannot
 * answer that request, so the shell must answer for itself.
 */
export function useShellCloseRequest() {
  useEffect(() => {
    if (!IS_TAURI) return;

    const appWindow = getCurrentWindow();
    let unlisten: (() => void) | undefined;

    void appWindow
      .onCloseRequested((event) => {
        event.preventDefault();
        void appWindow.destroy();
      })
      .then((stop) => {
        unlisten = stop;
      });

    return () => unlisten?.();
  }, []);
}
