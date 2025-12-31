import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";

import { IS_TAURI } from "@/constants/constants";

/**
 * Prevent window close while a process is running.
 */
export const usePreventClose = (isProcessing: boolean) => {
  // Keeps latest processing state inside the Tauri listener
  const isProcessingRef = useRef(isProcessing);

  // Prevents duplicate alerts from multiple close events
  const lastBlockedAtRef = useRef<number | null>(null);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    if (import.meta.env.MODE === "production") return;

    if (!IS_TAURI) return;

    const appWindow = getCurrentWindow();
    let unlisten: (() => void) | null = null;

    const setupListener = async () => {
      unlisten = await appWindow.onCloseRequested((event) => {
        // Allow close if nothing is running
        if (!isProcessingRef.current) return;

        const now = Date.now();

        // Block duplicate close events for the same click
        if (lastBlockedAtRef.current && now - lastBlockedAtRef.current < 500) {
          event.preventDefault();
          return;
        }

        lastBlockedAtRef.current = now;
        event.preventDefault();

        window.alert(
          "An agent execution is running. Please stop it before closing the app.",
        );
      });
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);
};
