import { IS_TAURI } from "@/constants/constants";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";

/**
 * Prevent window close while a agent is executing or has unsaved changes.
 */
export const usePreventClose = ({
  isProcessing,
}: {
  isProcessing?: boolean;
}) => {
  // Keeps latest processing state inside the Tauri listener
  const isProcessingRef = useRef(isProcessing);

  // Prevents duplicate alerts from multiple close events
  const isPromptingRef = useRef(false);
  const forceCloseRef = useRef(false);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    if (!IS_TAURI) return;
    const appWindow = getCurrentWindow();
    let unlisten: (() => void) | null = null;

    const setup = async () => {
      unlisten = await appWindow.onCloseRequested((event) => {
        // 1. Allow forced programmatic closes to pass immediately
        if (forceCloseRef.current) return;

        // 2. If a dialog is already open, strictly block any new events
        if (isPromptingRef.current) {
          event.preventDefault();
          return;
        }

        // CASE 1: Hard Block - Agent executing
        if (isProcessingRef.current) {
          // Prevent default IMMEDIATELY before doing anything else
          event.preventDefault();

          isPromptingRef.current = true;

          // Defer the alert so IPC can tell Rust the close is prevented
          setTimeout(() => {
            window.alert(
              "Agent execution in progress. Please stop the execution or wait for it to complete before closing the app.",
            );
            isPromptingRef.current = false;
          }, 50);

          return;
        }
      });
    };

    setup();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);
};
